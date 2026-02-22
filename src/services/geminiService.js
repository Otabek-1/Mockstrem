const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const getKeyEndpoint = () =>
  `${import.meta.env.VITE_API_URL || 'https://english-server-p7y6.onrender.com'}/key`
const getKeyPassword = () => import.meta.env.VITE_GEMINI_KEY_PASSWORD || ''

let geminiKeyPromise = null

const defaultGenerationConfig = {
  temperature: 0.5,
  maxOutputTokens: 8192
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to convert blob to base64'))
        return
      }
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function getGeminiApiKey() {
  if (!geminiKeyPromise) {
    const password = getKeyPassword()
    if (!password) {
      geminiKeyPromise = Promise.reject(new Error('VITE_GEMINI_KEY_PASSWORD is not set'))
    } else {
      geminiKeyPromise = fetch(getKeyEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text().catch(() => '')
            throw new Error(`Failed to fetch Gemini key (${response.status}): ${text}`)
          }
          const data = await response.json()
          if (!data?.key) {
            throw new Error('Gemini key response is missing "key" field')
          }
          return data.key
        })
        .catch((error) => {
          geminiKeyPromise = null
          throw error
        })
    }
  }

  return geminiKeyPromise
}

export function clearGeminiApiKeyCache() {
  geminiKeyPromise = null
}

export async function callGemini({ parts, generationConfig = defaultGenerationConfig, model = GEMINI_MODEL }) {
  const key = await getGeminiApiKey()
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig
    })
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function transcribeAudioWithGemini(audioBlob, mimeType = 'audio/webm') {
  const base64Audio = await blobToBase64(audioBlob)

  const text = await callGemini({
    parts: [
      {
        text: 'Transcribe this audio recording exactly as spoken. Return ONLY the transcription text, nothing else. If no speech is detected, return "[No speech detected]".'
      },
      {
        inline_data: { mime_type: mimeType, data: base64Audio }
      }
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
  })

  return (text || '[No speech detected]').trim()
}

export function buildSpeakingAnalysisPrompt({ transcriptions, questionTexts = [], candidateName = 'Candidate' }) {
  let prompt = `You are an expert examiner for the UZBEKISTANI NATIONAL FOREIGN LANGUAGE ASSESSMENT (Multilevel Speaking Exam).

CANDIDATE: ${candidateName}

===============================================================================
                    UZBEKISTANI SPEAKING ASSESSMENT SYSTEM
===============================================================================

TEST STRUCTURE:
• Part 1.1 (Q1-3): Simple questions -> scored 0-5 points (A2 target level)
• Part 1.2 (Q4-6): Picture-based questions -> scored 0-5 points (B1 target level)
• Part 2 (Q7): Long monologue with 3 bullet points -> scored 0-5 points (B2 target level)
• Part 3 (Q8): Discussion/Debate (For & Against) -> scored 0-6 points (C1 target level)

TOTAL RAW SCORE: 21 points maximum (5+5+5+6)

CONVERSION TABLE (Raw -> Certificate):
21->75, 20.5->73, 20->71, 19.5->69, 19->67, 18.5->65, 18->64, 17.5->63, 17->61, 16.5->59, 16->57, 15.5->56, 15->54, 14.5->52, 14->51, 13.5->50, 13->49, 12.5->47, 12->46, 11.5->45, 11->43, 10.5->42, 10->40, 9.5->39, 9->38, 8.5->37, 8->35, 7.5->32, 7->30, 6.5->30, 6->29, 5.5->27, 5->26, 4.5->24, 4->23, 3.5->21, 3->19, 2.5->17, 2->15, 1.5->13, 1->11, 0.5->10, 0->0

CEFR LEVEL (Based on Certificate Score):
• C1: 65-75 certificate points (Raw 18.5-21)
• B2: 51-64 certificate points (Raw 14-18)
• B1: 35-50 certificate points (Raw 8-13.5)
• Below B1: 0-34 certificate points (Raw 0-7.5)

===============================================================================
                         CANDIDATE'S RESPONSES
===============================================================================

`

  transcriptions.forEach((entry) => {
    const qNum = entry.questionNum
    const qText = questionTexts[qNum - 1] || `Question ${qNum}`

    prompt += `QUESTION ${qNum}:
${qText}

CANDIDATE'S RESPONSE:
"${entry.text}"

---

`
  })

  prompt += `
===============================================================================
                    REQUIRED OUTPUT FORMAT (FOLLOW EXACTLY)
===============================================================================

For EACH question above, provide detailed feedback in this format:

QUESTION [N]:
EXAMINER FEEDBACK:
[Write 2-4 sentences of detailed feedback about the response. Comment on:
- Topic relevance and coherence
- Grammar accuracy
- Vocabulary range and appropriateness
- Fluency and pronunciation notes if applicable]

CORRECTIONS:
[List specific errors with corrections in format:]
"wrong phrase" -> "correct phrase"
"another error" -> "corrected version"
[If no major errors: "No significant corrections needed"]

ASSESSMENT: [Good/Average/Poor] | ON-TOPIC / OFF-TOPIC

---

After ALL questions, provide:

===============================================================================
                              FINAL SCORES
===============================================================================

Part 1.1 (Q1-3): X / 5
Part 1.2 (Q4-6): X / 5
Part 2 (Q7): X / 5
Part 3 (Q8): X / 6
TOTAL RAW SCORE: X / 21
CERTIFICATE SCORE: X / 75
CEFR LEVEL: [Below B1 / B1 / B2 / C1]

SCORING GUIDELINES:
- Score FAIRLY based on actual performance - award B2 or C1 if the candidate truly deserves it.
- High-performing candidates CAN score 16-21 raw points if they demonstrate excellent language skills.
- Provide DETAILED examiner feedback with specific examples from the response.
- List ALL grammar and vocabulary errors with corrections.
- Base CEFR level STRICTLY on certificate score: C1(65-75), B2(51-64), B1(35-50), Below B1(0-34).`

  return prompt
}

export async function runSpeakingGeminiAnalysis({
  transcriptions,
  questionTexts = [],
  candidateName = 'Candidate',
  imageBlobs = []
}) {
  const prompt = buildSpeakingAnalysisPrompt({ transcriptions, questionTexts, candidateName })
  const parts = [{ text: prompt }]

  for (const imageBlob of imageBlobs) {
    try {
      const base64Image = await blobToBase64(imageBlob)
      parts.push({
        inline_data: {
          mime_type: imageBlob.type || 'image/png',
          data: base64Image
        }
      })
    } catch (error) {
      // Skip failed image conversion and continue
    }
  }

  return callGemini({ parts, generationConfig: defaultGenerationConfig })
}

function countWords(text = '') {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function extractJsonObject(rawText = '') {
  const start = rawText.indexOf('{')
  const end = rawText.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response does not contain valid JSON object')
  }

  return rawText.slice(start, end + 1)
}

export function buildWritingEvaluationPrompt({
  contextT1 = 'N/A',
  scenarioT1 = 'N/A',
  promptT11 = 'N/A',
  promptT12 = 'N/A',
  promptT2 = 'N/A',
  t11Prompt = 'N/A',
  t12Prompt = 'N/A',
  t2Prompt = 'N/A',
  t11 = '',
  t12 = '',
  t2 = ''
}) {
  const t11Text = t11 || '[No response]'
  const t12Text = t12 || '[No response]'
  const t2Text = t2 || '[No response]'

  const prompt11 = promptT11 || t11Prompt || 'N/A'
  const prompt12 = promptT12 || t12Prompt || 'N/A'
  const prompt2 = promptT2 || t2Prompt || 'N/A'

  return `You are a FAIR and BALANCED expert examiner for CEFR Multilevel Writing Papers. Analyze student responses THOROUGHLY and provide detailed feedback with color-coded error annotations.

SCORING RULES - USE WHOLE NUMBERS ONLY:
- Scores MUST be whole integers: 0, 1, 2, 3, 4, 5 (or 6 for Part 2). NO DECIMALS like 3.5.
- Score FAIRLY - neither too strict nor too generous. Be realistic.
- Consider the overall quality holistically, not just error counting.
- Minor errors (typos, small punctuation) should NOT heavily impact scores.
- Average student work with some errors typically scores 3.
- Work with good ideas but grammar issues can still score 3-4 if communicative.
- Only give 1-2 if the writing is very poor or completely fails the task.
- BALANCE: Good content + some errors = 3; Good content + few errors = 4; Excellent = 5.

NON-ENGLISH LANGUAGE PENALTY (CRITICAL):
- This is an ENGLISH exam. ALL text must be in English.
- If candidate uses ANY non-English words (Uzbek, Russian, or other languages), mark them with [L1: word] tag.
- Penalty: Each non-English word = -1 from the task score.
- Multiple non-English words (3+) = maximum score 2 for that task.

OFF-TOPIC SCORING GUIDANCE (VERY IMPORTANT):
- COMPLETELY OFF-TOPIC (writes about totally different subject): Score 0-1 MAXIMUM
- PARTIALLY OFF-TOPIC (addresses topic but misses key points): Score 2 max
- OVERGENERALIZED (addresses topic broadly without specifics): Score 2-3 depending on quality
- ON-TOPIC: Score based on other criteria normally

REPETITION/COPYING DETECTION (CRITICAL - CHECK THIS):
- Compare ALL THREE responses (Task 1.1, Task 1.2, Part 2) for similarities.
- If Task 1.1 and Task 1.2 contain SUBSTANTIALLY the same text (>70% identical): Mark BOTH as "REPEATED" and give maximum score of 1 for the copied task.
- If ANY task contains text copied from another task: Score the COPIED task as 0-1 maximum.
- If ALL tasks are essentially the same text: Give 0-1 for each task. Maximum total raw score: 3.
- In feedback, explicitly state: "[REPETITION DETECTED: This answer was copied from Task X.X]"
- Common cheat pattern: Student writes one answer and pastes it for all tasks. This must be SEVERELY penalized.
- Even if the copied text is well-written, repetition = automatic score reduction.

ERROR ANNOTATION FORMAT - CRITICAL:
ALWAYS use this EXACT format with BOTH error AND correction:
- [GRAMMAR: wrong text -> correct text]
- [SPELL: misspeled -> misspelled]
- [VOCAB: basic word -> better word]
- [PUNCT: missing punctuation -> added punctuation]
- [L1: foreign word]

IMPORTANT: NEVER write annotations like [PUNCT: for->] or [GRAMMAR: of->] without the correction.
ALWAYS include BOTH the error AND the correction after ->.
CORRECT: [PUNCT: for -> for,] or [GRAMMAR: of -> about]
WRONG: [PUNCT: for->] or [GRAMMAR: of->]

CALIBRATION SAMPLES - USE THESE TO JUDGE LEVEL:
A1-A2 LEVEL (Score: 1-2/5, Certificate: 30-45)
Example: "Hi my freind, I get message from coordnator today. They ask what project we want do for comunity."
ERRORS: Missing articles, wrong verb forms, spelling errors, very basic vocabulary.

B1 LEVEL (Score: 3/5, Certificate: 47-55)
Example: "I got a message from the coordinator yesterday, and they asked us to share some ideas for the next community project. I believe we should focus on something that really bring benefit to local people."
ERRORS: Subject-verb disagreement, article issues, weak connectors, awkward phrasing.

B2 LEVEL (Score: 4/5, Certificate: 57-65)
Example: "I received the coordinator's message earlier today, and it seems they want us to propose some ideas for improving the community work next term. One idea is to create a small mentoring programme."
ERRORS: Minor article slips, mostly accurate but not sophisticated.

C1 LEVEL (Score: 5/5, Certificate: 67-75)
Example: "I've just read the coordinator's announcement, and it appears they are expecting us to design several potential initiatives for next term. One possibility is to design a long-term community mentorship scheme."
Near-flawless with sophisticated vocabulary and complex structures.

SCORE CONVERSION TABLE (Raw to Certificate):
16->75, 15->69, 14->65, 13->63, 12->61, 11->57, 10->53, 9->50, 8->47, 7->43, 6->40, 5->37, 4->33, 3->28, 2->21, 1->14, 0->0

CEFR LEVELS (BY CERTIFICATE SCORE):
- 0-34: Below B1 (A1-A2) | 35-50: B1 | 51-64: B2 | 65-75: C1

ORIGINAL TASK PROMPTS (CHECK FOR RELEVANCE):
TASK 1 CONTEXT (Incoming Letter/Email):
CONTEXT: ${contextT1}
TASK 1 SCENARIO: ${scenarioT1}
TASK 1.1 PROMPT (max 5, ~50-70 words): ${prompt11}
TASK 1.2 PROMPT (max 5, ~120-150 words): ${prompt12}
PART 2 PROMPT (max 6, ~180-200 words): ${prompt2}

STUDENT RESPONSES:
TASK 1.1: ${t11Text}
TASK 1.2: ${t12Text}
PART 2: ${t2Text}

RESPOND IN THIS EXACT JSON FORMAT ONLY (WHOLE NUMBER SCORES):
{
  "t11_score": <0-5 INTEGER ONLY>,
  "t11_relevance": "<ON-TOPIC/PARTIALLY OFF-TOPIC/OFF-TOPIC>",
  "t11_feedback": "<MAX 4 bullet points of SPECIFIC areas to improve. Format: • Point 1 • Point 2. Focus on: grammar issues (fossilized errors, basic structures, subject-verb agreement), word choice, spelling patterns, redundancy, punctuation. Be CONSTRUCTIVE not complimentary. Example: • Verb tense inconsistency (went/go mixed) • Limited vocabulary - use synonyms • Missing articles before nouns>",
  "t11_corrected": "<Copy ENTIRE text. Mark ALL errors as [TYPE: error -> correction]. Example: 'I [GRAMMAR: go -> went] to [SPELL: scool -> school]'>",
  "t11_sample": "<Write a BRAND NEW, INDEPENDENT high-level C1 model answer for Task 1.1. Target 80-90 words (minimum 50 words). DO NOT revise or improve the student's answer. Write a completely new response using sophisticated vocabulary and grammar. Make it a complete, well-formed response.>",
  "t12_score": <0-5 INTEGER ONLY>,
  "t12_relevance": "<ON-TOPIC/PARTIALLY OFF-TOPIC/OFF-TOPIC>",
  "t12_feedback": "<MAX 4 bullet points of SPECIFIC improvement areas. Be constructive: grammar patterns, vocabulary range, cohesion, spelling>",
  "t12_corrected": "<Copy ENTIRE text with [TYPE: error -> correction] inline>",
  "t12_sample": "<Write a BRAND NEW, INDEPENDENT high-level C1 model answer for Task 1.2. Target 160-180 words (minimum 120 words). DO NOT revise the student's answer. Write a completely new, detailed response with sophisticated vocabulary and varied grammar structures.>",
  "t2_score": <0-6 INTEGER ONLY>,
  "t2_relevance": "<ON-TOPIC/PARTIALLY OFF-TOPIC/OFF-TOPIC>",
  "t2_feedback": "<MAX 4 bullet points of SPECIFIC improvement areas. Focus on: argument structure, complex grammar, academic vocabulary, coherence>",
  "t2_corrected": "<Copy ENTIRE text with [TYPE: error -> correction] inline>",
  "t2_sample": "<Write a BRAND NEW, INDEPENDENT high-level C1 model answer for Part 2. Target 250-300 words (minimum 180 words). DO NOT revise the student's answer. Write a comprehensive essay with clear introduction, well-developed body paragraphs with examples, and a strong conclusion. Use advanced vocabulary and complex grammar structures.>",
  "raw_score": <sum of all task scores, INTEGER>,
  "certificate_score": <from conversion table above>,
  "cefr_level": "<Below B1/B1/B2/C1 based on certificate score>",
  "overall_feedback": "<3-4 sentence overall assessment with specific strengths and key areas to improve>"
}

Return JSON only. Do not include markdown fences or extra text.`
}

export async function evaluateWritingWithGemini(payload) {
  const prompt = buildWritingEvaluationPrompt(payload)

  const raw = await callGemini({
    parts: [{ text: prompt }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  })

  const jsonText = extractJsonObject(raw)
  return JSON.parse(jsonText)
}

