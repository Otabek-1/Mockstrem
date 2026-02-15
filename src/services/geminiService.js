// Gemini AI Service for Speaking Exam Scoring
let GEMINI_API_KEY = null;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const BACKEND_KEY_URL = 'https://davirbek.alwaysdata.net/key?model=gemini';

/**
 * Fetch Gemini API key from backend
 */
const getGeminiKeyFromBackend = async () => {
  if (GEMINI_API_KEY) return GEMINI_API_KEY; // Return cached key if available
  try {
    const response = await fetch(BACKEND_KEY_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    const data = await response.json();
    GEMINI_API_KEY = data.key;
    if (!GEMINI_API_KEY) throw new Error('No API key received from backend');
    return GEMINI_API_KEY;
  } catch (error) {
    console.error('Failed to fetch Gemini API key from backend:', error);
    throw new Error('Could not retrieve API key from backend: ' + error.message);
  }
};

/**
 * Convert audio blob to base64
 */
export const blobToBase64 = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribe audio using Gemini (using fetch, not axios)
 */
export const transcribeAudio = async (audioBlob) => {
  try {
    const key = await getGeminiKeyFromBackend();
    const base64Audio = await blobToBase64(audioBlob);
    
    const response = await fetch(
      `${GEMINI_API_URL}?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'audio/webm',
                    data: base64Audio,
                  },
                },
                {
                  text: 'Please transcribe this audio recording. Return only the transcribed text.',
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('No transcription received');
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio: ' + error.message);
  }
};

/**
 * Score speaking task using Gemini AI
 * Returns JSON with scores and detailed feedback
 */
export const scoreSpeakingTask = async (
  transcription,
  taskNumber,
  minutesRequired,
  contextInfo = '',
  scenarioInfo = ''
) => {
  try {
    const key = await getGeminiKeyFromBackend();
    const prompt = `You are an expert IELTS Speaking examiner following STRICT scoring rules.

⚠️ SCORING RULES - USE WHOLE NUMBERS ONLY:
- Scores MUST be whole integers: 0, 1, 2, 3, 4, 5 (or 6 for Part 2). NO DECIMALS like 3.5.
- Score FAIRLY - neither too strict nor too generous. Be realistic.
- Consider the overall quality holistically, not just error counting.
- Minor errors (typos, small punctuation) should NOT heavily impact scores.
- Average student work with some errors typically scores 3.
- Work with good ideas but grammar issues can still score 3-4 if communicative.
- Only give 1-2 if the writing is very poor or completely fails the task.

🚫 NON-ENGLISH LANGUAGE PENALTY (CRITICAL):
- This is an ENGLISH exam. ALL text must be in English.
- If candidate uses ANY non-English words (Uzbek, Russian, or other languages), mark them with [L1: word] tag.
- Penalty: Each non-English word = -1 from the task score.
- Multiple non-English words (3+) = maximum score 2 for that task.

⚠️ OFF-TOPIC SCORING GUIDANCE:
- COMPLETELY OFF-TOPIC: Score 0-1 MAXIMUM
- PARTIALLY OFF-TOPIC: Score 2 max  
- OVERGENERALIZED: Score 2-3 depending on quality
- ON-TOPIC: Score based on other criteria normally

📝 ERROR ANNOTATION FORMAT:
Use this EXACT format with BOTH error AND correction:
- [GRAMMAR: wrong text -> correct text]
- [SPELL: misspeled -> misspelled]
- [VOCAB: basic word -> better word]
- [PUNCT: missing punctuation -> added punctuation]
- [L1: foreign word]

=== TASK INFORMATION ===
Task Number: Part ${taskNumber}
Required Duration: ${minutesRequired} minutes
Context: ${contextInfo || 'N/A'}
Scenario: ${scenarioInfo || 'N/A'}

=== STUDENT RESPONSE ===
"${transcription}"

Analyze this response and respond in THIS EXACT JSON FORMAT:
{
    "score": <number 0-6 INTEGER ONLY>,
    "word_count": <actual word count>,
    "relevance": "<ON-TOPIC/PARTIALLY OFF-TOPIC/OFF-TOPIC>",
    "corrected_text": "<Copy entire response with inline corrections using tags>",
    "feedback": "<2-3 bullet points of specific improvement areas>",
    "strengths": "<2-3 key strengths of the response>",
    "areas_for_improvement": "<2-3 areas that need work>",
    "error_count": {
        "grammar": <number>,
        "spelling": <number>,
        "vocabulary": <number>,
        "non_english": <number>
    },
    "cefr_level": "<A1/A2/B1/B2/C1/C2 estimated level>"
}`;

    const response = await fetch(
      `${GEMINI_API_URL}?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    
    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('No scoring response received');
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse scoring response as JSON');
    }

    const scoringResult = JSON.parse(jsonMatch[0]);
    return scoringResult;
  } catch (error) {
    console.error('Scoring error:', error);
    throw new Error('Failed to score response: ' + error.message);
  }
};

/**
 * Generate comprehensive speaking exam report
 */
export const generateSpeakingReport = async (
  task1_1_data,
  task1_2_data,
  task2_data
) => {
  try {
    const totalScore = (task1_1_data.score || 0) + (task1_2_data.score || 0) + (task2_data.score || 0);
    const maxScore = 16; // 5 + 5 + 6

    // Convert raw score to certificate score using conversion table
    const conversionTable = {
      16: 75, 15: 69, 14: 65, 13: 63, 12: 61, 11: 57, 10: 53, 9: 50, 8: 47, 7: 43, 6: 40, 5: 37, 4: 33, 3: 28, 2: 21, 1: 14, 0: 0
    };

    const certificateScore = conversionTable[totalScore] || 0;

    // Determine CEFR level
    let cefrLevel = 'Below B1';
    if (certificateScore >= 65) cefrLevel = 'C1';
    else if (certificateScore >= 51) cefrLevel = 'B2';
    else if (certificateScore >= 35) cefrLevel = 'B1';

    return {
      task1_1: task1_1_data,
      task1_2: task1_2_data,
      task2: task2_data,
      total_raw_score: totalScore,
      max_score: maxScore,
      certificate_score: certificateScore,
      cefr_level: cefrLevel,
      percentage: Math.round((totalScore / maxScore) * 100),
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate report: ' + error.message);
  }
};

export default {
  transcribeAudio,
  scoreSpeakingTask,
  generateSpeakingReport,
  blobToBase64,
};
