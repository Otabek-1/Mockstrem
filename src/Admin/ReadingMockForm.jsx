import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://english-server-p7y6.onrender.com';

/* ===================== CONVERTER: CEFR TEST DATA → FORM DATA ===================== */

/**
 * Converts data from cefr-reading-test-01.js format to ReadingMockForm format
 * Only extracts fields that have corresponding inputs in the form
 */
function convertCEFRTestToFormData(cefrTestData) {
  if (!cefrTestData || !cefrTestData.parts) {
    console.error('Invalid CEFR test data structure');
    return null;
  }

  const formData = {
    title: cefrTestData.testInfo?.title || '',
    part1: { task: 'Read the text. Fill in each gap with ONE word or number.', text: '' },
    part2: { task: 'Read the statements and texts. Match them.', statements: Array(10).fill(''), texts: Array(7).fill('') },
    part3: { task: 'Read the text and choose the correct heading for each paragraph.', text: '', headings: Array(8).fill(''), paragraphs: Array(6).fill('') },
    part4: { task: 'Read the text and answer the questions.', text: '', multipleChoice: Array(4).fill(null).map(() => ({ question: '', options: ['', '', '', ''] })), trueFalse: Array(5).fill(null).map(() => ({ statement: '' })) },
    part5: { task: 'Read the text and complete the exercise.', mainText: '', miniText: '', multipleChoice: Array(2).fill(null).map(() => ({ question: '', options: ['', '', '', ''] })) }
  };

  const answers = {
    part1: Array(6).fill(''),
    part2: Array(10).fill(''),
    part3: Array(6).fill(''),
    part4MC: Array(4).fill(''),
    part4TF: Array(5).fill(''),
    part5Mini: Array(5).fill(''),
    part5MC: Array(2).fill('')
  };

  // Process each part
  cefrTestData.parts.forEach(part => {
    switch (part.partNumber) {
      case 1: // Gap Fill from Text
        if (part.passage?.content) {
          // Clean HTML tags and keep gap markers (1), (2), etc
          let text = part.passage.content
            .replace(/<p>/g, '\n\n')
            .replace(/<\/p>/g, '')
            // Replace <span class="gap" data-gap="1">_____(1)_____</span> with just (1)
            .replace(/<span[^>]*class="gap"[^>]*>.*?\((\d+)\).*?<\/span>/g, '($1)')
            // Remove any remaining HTML tags
            .replace(/<[^>]+>/g, '');
          formData.part1.text = text.trim();
          
          // Extract answers
          if (part.answers) {
            Object.keys(part.answers).forEach((key, index) => {
              if (index < 6) {
                answers.part1[index] = part.answers[key][0] || '';
              }
            });
          }
        }
        break;

      case 2: // Matching
        if (part.statements && part.texts) {
          // Extract statements (up to 10)
          part.statements.forEach((stmt, index) => {
            if (index < 10) {
              formData.part2.statements[index] = stmt.text || '';
            }
          });

          // Extract texts (up to 7) - renumber from 7-14 to 1-7
          part.texts.forEach((txt, index) => {
            if (index < 7) {
              formData.part2.texts[index] = txt.content || '';
            }
          });

          // Extract answers - convert letter answers to text numbers
          if (part.answers) {
            const questionKeys = Object.keys(part.answers).sort((a, b) => parseInt(a) - parseInt(b));
            questionKeys.forEach((key, index) => {
              if (index < 10) {
                // Map text number (7-14) to index (1-7)
                const textNumber = parseInt(key);
                const textIndex = textNumber - 7 + 1; // Convert 7→1, 8→2, etc.
                answers.part2[index] = textIndex.toString();
              }
            });
          }
        }
        break;

      case 3: // Headings & Paragraphs
        // Extract main text (title) if available
        if (part.passage?.title) {
          formData.part3.text = part.passage.title;
        } else if (part.passage?.content) {
          formData.part3.text = part.passage.content
            .replace(/<p>/g, '\n\n')
            .replace(/<\/p>/g, '')
            .replace(/<[^>]+>/g, '')
            .trim();
        }

        // Extract headings
        if (part.headings) {
          part.headings.forEach((heading, index) => {
            if (index < 8) {
              formData.part3.headings[index] = heading.text || '';
            }
          });
        }

        // Extract paragraphs from passage.paragraphs array
        if (part.passage?.paragraphs) {
          part.passage.paragraphs.forEach((para, index) => {
            if (index < 6) {
              // Clean paragraph content
              let content = para.content || '';
              if (content) {
                content = content
                  .replace(/<p>/g, '')
                  .replace(/<\/p>/g, '\n')
                  .replace(/<[^>]+>/g, '')
                  .trim();
              }
              formData.part3.paragraphs[index] = content;
            }
          });
        } else if (part.paragraphs) {
          // Fallback: if paragraphs is a direct array
          part.paragraphs.forEach((para, index) => {
            if (index < 6) {
              formData.part3.paragraphs[index] = para.content
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();
            }
          });
        }

        // Extract answers
        if (part.answers) {
          Object.keys(part.answers).slice(0, 6).forEach((key, index) => {
            answers.part3[index] = part.answers[key][0] || '';
          });
        }
        break;

      case 4: // MC + True/False
        if (part.passage?.content) {
          formData.part4.text = part.passage.content
            .replace(/<p>/g, '\n\n')
            .replace(/<\/p>/g, '')
            .replace(/<[^>]+>/g, '')
            .trim();
        }

        // Process question sections
        if (part.questionSections) {
          part.questionSections.forEach(section => {
            if (section.type === 'mcq' && section.questions) {
              // Multiple Choice Questions (up to 4)
              section.questions.forEach((q, qIndex) => {
                if (qIndex < 4) {
                  formData.part4.multipleChoice[qIndex] = {
                    question: q.text || '',
                    options: q.options ? q.options.map(opt => opt.text || '') : ['', '', '', '']
                  };
                  
                  // Extract MC answers
                  const qId = q.id;
                  if (part.answers && part.answers[qId]) {
                    answers.part4MC[qIndex] = part.answers[qId][0] || '';
                  }
                }
              });
            } else if (section.type === 'tfni' && section.questions) {
              // True/False Questions (up to 5)
              section.questions.forEach((q, qIndex) => {
                if (qIndex < 5) {
                  formData.part4.trueFalse[qIndex] = {
                    statement: q.text || ''
                  };
                  
                  // Extract TF answers
                  const qId = q.id;
                  if (part.answers && part.answers[qId]) {
                    const answer = part.answers[qId][0];
                    // Convert to T/F/NG format
                    if (answer === 'True') answers.part4TF[qIndex] = 'T';
                    else if (answer === 'False') answers.part4TF[qIndex] = 'F';
                    else if (answer === 'No Information') answers.part4TF[qIndex] = 'NG';
                    else answers.part4TF[qIndex] = answer;
                  }
                }
              });
            }
          });
        }
        break;

      case 5: // Gap Fill + MCQ
        if (part.passage?.content) {
          formData.part5.mainText = part.passage.content
            .replace(/<p>/g, '\n\n')
            .replace(/<\/p>/g, '')
            .replace(/<[^>]+>/g, '')
            .trim();
        }

        if (part.questionSections) {
          part.questionSections.forEach(section => {
            if (section.type === 'gap-fill' && section.summaryText) {
              // Extract mini text with gaps
              formData.part5.miniText = section.summaryText
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<span class="gap-input"[^>]*>___\(\d+\)___<\/span>/g, (match) => {
                  const num = match.match(/\((\d+)\)/)[1];
                  // Renumber from 30-33 to 1-4
                  const newNum = parseInt(num) - 29;
                  return `(${newNum})`;
                })
                .replace(/<[^>]+>/g, '')
                .trim();

              // Extract gap fill answers (questions 30-33 → indices 0-3, but we need 5 total)
              if (part.answers) {
                [30, 31, 32, 33].forEach((qId, index) => {
                  if (part.answers[qId]) {
                    answers.part5Mini[index] = part.answers[qId][0] || '';
                  }
                });
              }
            } else if (section.type === 'mcq' && section.questions) {
              // Multiple Choice Questions (up to 2)
              section.questions.forEach((q, qIndex) => {
                if (qIndex < 2) {
                  formData.part5.multipleChoice[qIndex] = {
                    question: q.text || '',
                    options: q.options ? q.options.map(opt => opt.text || '') : ['', '', '', '']
                  };
                  
                  // Extract MC answers
                  const qId = q.id;
                  if (part.answers && part.answers[qId]) {
                    answers.part5MC[qIndex] = part.answers[qId][0] || '';
                  }
                }
              });
            }
          });
        }
        break;

      default:
        console.log(`Unknown part number: ${part.partNumber}`);
    }
  });

  return { formData, answers };
}

/* ===================== FILE PARSER ===================== */

function parseFileContent(fileContent, fileName) {
    try {
        if (fileName.endsWith('.json')) {
            return JSON.parse(fileContent);
        } else if (fileName.endsWith('.csv')) {
            return parseCSV(fileContent);
        } else if (fileName.endsWith('.js')) {
            // Handle .js file with CEFR test data
            try {
              // Extract the object literal from the JS file
              // Look for window.CEFR_READING_TEST = { ... };
              const match = fileContent.match(/window\.CEFR_READING_TEST\s*=\s*(\{[\s\S]*\});?\s*$/m);
              
              if (!match) {
                alert("JS faylda CEFR_READING_TEST topilmadi");
                return null;
              }

              // Clean the extracted string - remove trailing semicolon and whitespace
              let objectString = match[1].trim();
              if (objectString.endsWith(';')) {
                objectString = objectString.slice(0, -1);
              }

              // Parse as JSON (with some preprocessing for JS object notation)
              // Replace single quotes with double quotes for JSON compatibility
              objectString = objectString
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // keys to double quotes
                .replace(/:\s*'([^']*)'/g, ': "$1"') // single quote values to double quotes
                .replace(/,(\s*[}\]])/g, '$1'); // remove trailing commas

              try {
                const cefrData = JSON.parse(objectString);
                return convertCEFRTestToFormData(cefrData);
              } catch (parseError) {
                // If JSON parse fails, try eval as last resort (in a safe way)
                console.error('JSON parse failed, trying alternative method:', parseError);
                
                // Create an isolated function to extract the data
                const extractData = new Function('return ' + match[1]);
                const cefrData = extractData();
                return convertCEFRTestToFormData(cefrData);
              }
            } catch (error) {
              console.error('Error parsing JS file:', error);
              alert("JS fayl formatida xatolik: " + error.message);
              return null;
            }
        } else {
            alert("Faqat .json, .csv yoki .js fayllar qabul qilinadi");
            return null;
        }
    } catch (error) {
        alert("Fayl parse qilishda xato: " + error.message);
        console.error('Parse error:', error);
        return null;
    }
}

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const data = {
        title: "",
        part1: { task: 'Read the text. Fill in each gap with ONE word or number.', text: '' },
        part2: { task: 'Read the statements and texts. Match them.', statements: Array(10).fill(''), texts: Array(7).fill('') },
        part3: { task: 'Read the text and choose the correct heading for each paragraph.', text: '', headings: Array(8).fill(''), paragraphs: Array(6).fill('') },
        part4: { task: 'Read the text and answer the questions.', text: '', multipleChoice: Array(4).fill(null).map(() => ({ question: '', options: ['', '', '', ''] })), trueFalse: Array(5).fill(null).map(() => ({ statement: '' })) },
        part5: { task: 'Read the text and complete the exercise.', mainText: '', miniText: '', multipleChoice: Array(2).fill(null).map(() => ({ question: '', options: ['', '', '', ''] })) }
    };

    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();
        i++;

        if (!line || line.startsWith('#')) continue;

        if (line.startsWith('[TITLE]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const titleLine = lines[i].trim();
                if (titleLine && !titleLine.startsWith('#')) {
                    data.title = titleLine;
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART1]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.text) {
                        data.part1.text = parsed.text;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART1_ANSWERS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const ansLine = lines[i].trim();
                if (ansLine && !ansLine.startsWith('#')) {
                    const answers = ansLine.split(';').map(a => a.trim());
                    data.part1Answers = answers;
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART2]')) {
            let statementIdx = 0;
            let textIdx = 0;
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.type === 'statement' && parsed.text) {
                        if (statementIdx < 10) {
                            data.part2.statements[statementIdx++] = parsed.text;
                        }
                    } else if (parsed.type === 'text' && parsed.text) {
                        if (textIdx < 7) {
                            data.part2.texts[textIdx++] = parsed.text;
                        }
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART2_ANSWERS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const ansLine = lines[i].trim();
                if (ansLine && !ansLine.startsWith('#')) {
                    const answers = ansLine.split(';').map(a => a.trim());
                    data.part2Answers = answers;
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART3]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.mainText) {
                        data.part3.text = parsed.mainText;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART3_HEADINGS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const hLine = lines[i].trim();
                if (hLine && !hLine.startsWith('#')) {
                    const headings = hLine.split(';').map(h => h.trim()).slice(0, 8);
                    for (let h = 0; h < headings.length; h++) {
                        data.part3.headings[h] = headings[h];
                    }
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART3_PARAGRAPHS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const pLine = lines[i].trim();
                if (pLine && !pLine.startsWith('#')) {
                    const paragraphs = pLine.split(';;;');
                    for (let p = 0; p < paragraphs.length && p < 6; p++) {
                        data.part3.paragraphs[p] = paragraphs[p].trim();
                    }
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART3_ANSWERS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const ansLine = lines[i].trim();
                if (ansLine && !ansLine.startsWith('#')) {
                    const answers = ansLine.split(';').map(a => a.trim());
                    data.part3Answers = answers;
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART4]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.mainText) {
                        data.part4.text = parsed.mainText;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART4_MC]')) {
            let qIdx = 0;
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.question && parsed.options && qIdx < 4) {
                        const opts = parsed.options.split(';').map(o => o.trim()).slice(0, 4);
                        while (opts.length < 4) opts.push('');
                        data.part4.multipleChoice[qIdx] = {
                            question: parsed.question,
                            options: opts
                        };
                        qIdx++;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART4_TF]')) {
            let sIdx = 0;
            while (i < lines.length && !lines[i].startsWith('[')) {
                const sLine = lines[i].trim();
                if (sLine && !sLine.startsWith('#')) {
                    if (sIdx < 5) {
                        data.part4.trueFalse[sIdx] = { statement: sLine };
                        sIdx++;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART4_ANSWERS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const ansLine = lines[i].trim();
                if (ansLine && !ansLine.startsWith('#')) {
                    const parts = ansLine.split(';').map(a => a.trim());
                    data.part4MCAnswers = parts.slice(0, 4);
                    data.part4TFAnswers = parts.slice(4, 9);
                    i++;
                    break;
                }
                i++;
            }
        }
        else if (line.startsWith('[PART5]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.mainText) {
                        data.part5.mainText = parsed.mainText;
                    }
                    if (parsed.miniText) {
                        data.part5.miniText = parsed.miniText;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART5_MC]')) {
            let qIdx = 0;
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.question && parsed.options && qIdx < 2) {
                        const opts = parsed.options.split(';').map(o => o.trim()).slice(0, 4);
                        while (opts.length < 4) opts.push('');
                        data.part5.multipleChoice[qIdx] = {
                            question: parsed.question,
                            options: opts
                        };
                        qIdx++;
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART5_ANSWERS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const ansLine = lines[i].trim();
                if (ansLine && !ansLine.startsWith('#')) {
                    const parts = ansLine.split(';').map(a => a.trim());
                    data.part5MiniAnswers = parts.slice(0, 5);
                    data.part5MCAnswers = parts.slice(5, 7);
                    i++;
                    break;
                }
                i++;
            }
        }
    }

    return data;
}

export default function ReadingMockForm() {
  const [searchParams, setSearchParams] = useState({});
  const isEdit = searchParams.edit === 'true';
  const mockId = searchParams.id;

  const [formData, setFormData] = useState({
    title: '',
    part1: {
      task: 'Read the text. Fill in each gap with ONE word or number.',
      text: ''
    },
    part2: {
      task: 'Read the statements and texts. Match them.',
      statements: Array(10).fill(''),
      texts: Array(7).fill('')
    },
    part3: {
      task: 'Read the text and choose the correct heading for each paragraph.',
      text: '',
      headings: Array(8).fill(''),
      paragraphs: Array(6).fill('')
    },
    part4: {
      task: 'Read the text and answer the questions.',
      text: '',
      multipleChoice: Array(4).fill(null).map(() => ({ question: '', options: ['', '', '', ''] })),
      trueFalse: Array(5).fill(null).map(() => ({ statement: '' }))
    },
    part5: {
      task: 'Read the text and complete the exercise.',
      mainText: '',
      miniText: '',
      multipleChoice: Array(2).fill(null).map(() => ({ question: '', options: ['', '', '', ''] }))
    }
  });

  const [answers, setAnswers] = useState({
    part1: Array(6).fill(''),
    part2: Array(10).fill(''),
    part3: Array(6).fill(''),
    part4MC: Array(4).fill(''),
    part4TF: Array(5).fill(''),
    part5Mini: Array(5).fill(''),
    part5MC: Array(2).fill('')
  });

  const [loading, setLoading] = useState(false);
  const [showAnswersSection, setShowAnswersSection] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [answerId, setAnswerId] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = parseFileContent(content, file.name);
        
        if (parsedData) {
          // Check if it's from convertCEFRTestToFormData (has formData & answers)
          if (parsedData.formData && parsedData.answers) {
            setFormData(parsedData.formData);
            setAnswers(parsedData.answers);
            setShowAnswersSection(true);
            setError('');
            alert('✅ CEFR test fayli muvaffaqiyatli yuklandi! Barcha ma\'lumotlar to\'ldirildi.');
            return;
          }

          // Otherwise it's CSV/JSON format
          const newFormData = {
            title: parsedData.title || formData.title,
            part1: {
              ...formData.part1,
              text: parsedData.part1?.text || formData.part1.text
            },
            part2: {
              ...formData.part2,
              statements: parsedData.part2?.statements || formData.part2.statements,
              texts: parsedData.part2?.texts || formData.part2.texts
            },
            part3: {
              ...formData.part3,
              text: parsedData.part3?.text || formData.part3.text,
              headings: parsedData.part3?.headings || formData.part3.headings,
              paragraphs: parsedData.part3?.paragraphs || formData.part3.paragraphs
            },
            part4: {
              ...formData.part4,
              text: parsedData.part4?.text || formData.part4.text,
              multipleChoice: parsedData.part4?.multipleChoice || formData.part4.multipleChoice,
              trueFalse: parsedData.part4?.trueFalse || formData.part4.trueFalse
            },
            part5: {
              ...formData.part5,
              mainText: parsedData.part5?.mainText || formData.part5.mainText,
              miniText: parsedData.part5?.miniText || formData.part5.miniText,
              multipleChoice: parsedData.part5?.multipleChoice || formData.part5.multipleChoice
            }
          };

          setFormData(newFormData);

          // Update answers if available
          const newAnswers = { ...answers };
          if (parsedData.part1Answers) newAnswers.part1 = parsedData.part1Answers;
          if (parsedData.part2Answers) newAnswers.part2 = parsedData.part2Answers;
          if (parsedData.part3Answers) newAnswers.part3 = parsedData.part3Answers;
          if (parsedData.part4MCAnswers) newAnswers.part4MC = parsedData.part4MCAnswers;
          if (parsedData.part4TFAnswers) newAnswers.part4TF = parsedData.part4TFAnswers;
          if (parsedData.part5MiniAnswers) newAnswers.part5Mini = parsedData.part5MiniAnswers;
          if (parsedData.part5MCAnswers) newAnswers.part5MC = parsedData.part5MCAnswers;
          
          setAnswers(newAnswers);
          setShowAnswersSection(true);
          setError('');
          alert('✅ Fayl muvaffaqiyatli yuklandi! Barcha ma\'lumotlar to\'ldirildi.');
        }
      } catch (error) {
        console.error('File upload error:', error);
        setError(`❌ Fayl yuklashda xato: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      setError('❌ Fayl o\'qilishda xato yuz berdi');
    };
    
    reader.readAsText(file);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams({
      edit: params.get('edit'),
      id: params.get('id')
    });

    if (params.get('edit') === 'true' && params.get('id')) {
      loadMockData(params.get('id'));
    }
  }, []);

  const loadMockData = async (id) => {
    setLoadingData(true);
    setError('');
    try {
      // Load mock questions
      const mockResponse = await fetch(`${API_BASE_URL}/mock/reading/mock/${id}`);
      if (!mockResponse.ok) throw new Error('Failed to load mock');
      const mockData = await mockResponse.json();
      if (mockData.mock) {
        setFormData(mockData.mock);
      }

      // Load answers
      const answersResponse = await fetch(`${API_BASE_URL}/mock/reading/answer/${id}`);
      if (answersResponse.ok) {
        const answerData = await answersResponse.json();
        if (answerData.answers) {
          setAnswerId(answerData.answers.id);
          setAnswers({
            part1: answerData.answers.part1 || Array(6).fill(''),
            part2: answerData.answers.part2 || Array(10).fill(''),
            part3: answerData.answers.part3 || Array(6).fill(''),
            part4MC: answerData.answers.part4MC || Array(4).fill(''),
            part4TF: answerData.answers.part4TF || Array(5).fill(''),
            part5Mini: answerData.answers.part5Mini || Array(5).fill(''),
            part5MC: answerData.answers.part5MC || Array(2).fill('')
          });
          setShowAnswersSection(true);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error loading mock data: ' + error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Part 1 Handlers
  const handlePart1TextChange = (e) => {
    setFormData({
      ...formData,
      part1: { ...formData.part1, text: e.target.value }
    });
  };

  // Part 2 Handlers
  const handlePart2StatementChange = (index, value) => {
    const newStatements = [...formData.part2.statements];
    newStatements[index] = value;
    setFormData({
      ...formData,
      part2: { ...formData.part2, statements: newStatements }
    });
  };

  const handlePart2TextChange = (index, value) => {
    const newTexts = [...formData.part2.texts];
    newTexts[index] = value;
    setFormData({
      ...formData,
      part2: { ...formData.part2, texts: newTexts }
    });
  };

  // Part 3 Handlers
  const handlePart3TextChange = (e) => {
    setFormData({
      ...formData,
      part3: { ...formData.part3, text: e.target.value }
    });
  };

  const handlePart3HeadingChange = (index, value) => {
    const newHeadings = [...formData.part3.headings];
    newHeadings[index] = value;
    setFormData({
      ...formData,
      part3: { ...formData.part3, headings: newHeadings }
    });
  };

  const handlePart3ParagraphChange = (index, value) => {
    const newParagraphs = [...formData.part3.paragraphs];
    newParagraphs[index] = value;
    setFormData({
      ...formData,
      part3: { ...formData.part3, paragraphs: newParagraphs }
    });
  };

  // Part 4 Handlers
  const handlePart4TextChange = (e) => {
    setFormData({
      ...formData,
      part4: { ...formData.part4, text: e.target.value }
    });
  };

  const handlePart4MCQuestionChange = (index, value) => {
    const newQuestions = [...formData.part4.multipleChoice];
    newQuestions[index] = { ...newQuestions[index], question: value };
    setFormData({
      ...formData,
      part4: { ...formData.part4, multipleChoice: newQuestions }
    });
  };

  const handlePart4MCOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.part4.multipleChoice];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({
      ...formData,
      part4: { ...formData.part4, multipleChoice: newQuestions }
    });
  };

  const handlePart4TFStatementChange = (index, value) => {
    const newStatements = [...formData.part4.trueFalse];
    newStatements[index] = { ...newStatements[index], statement: value };
    setFormData({
      ...formData,
      part4: { ...formData.part4, trueFalse: newStatements }
    });
  };

  // Part 5 Handlers
  const handlePart5MainTextChange = (e) => {
    setFormData({
      ...formData,
      part5: { ...formData.part5, mainText: e.target.value }
    });
  };

  const handlePart5MiniTextChange = (e) => {
    setFormData({
      ...formData,
      part5: { ...formData.part5, miniText: e.target.value }
    });
  };

  const handlePart5MCQuestionChange = (index, value) => {
    const newQuestions = [...formData.part5.multipleChoice];
    newQuestions[index] = { ...newQuestions[index], question: value };
    setFormData({
      ...formData,
      part5: { ...formData.part5, multipleChoice: newQuestions }
    });
  };

  const handlePart5MCOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.part5.multipleChoice];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({
      ...formData,
      part5: { ...formData.part5, multipleChoice: newQuestions }
    });
  };

  // Answer Handlers
  const handleAnswerChange = (part, index, value) => {
    const newAnswers = { ...answers };
    newAnswers[part][index] = value;
    setAnswers(newAnswers);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const answerData = {
        part1: answers.part1.filter(a => a.trim() !== ''),
        part2: answers.part2.filter(a => a.trim() !== ''),
        part3: answers.part3.filter(a => a.trim() !== ''),
        part4: [
          ...answers.part4MC.filter(a => a.trim() !== ''),
          ...answers.part4TF.filter(a => a.trim() !== '')
        ],
        part5: [
          ...answers.part5Mini.filter(a => a.trim() !== ''),
          ...answers.part5MC.filter(a => a.trim() !== '')
        ]
      };

      if (isEdit && mockId) {
        // Update existing mock
        const updateResponse = await fetch(`${API_BASE_URL}/mock/reading/${mockId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });

        if (!updateResponse.ok) throw new Error('Failed to update mock');

        if (answerId) {
          const updateAnswerResponse = await fetch(`${API_BASE_URL}/mock/reading/answer/${answerId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(answerData)
          });

          if (!updateAnswerResponse.ok) throw new Error('Failed to update answers');
        }

        alert('Reading mock updated successfully!');
      } else {
        // Create new mock
        const createResponse = await fetch(`${API_BASE_URL}/mock/reading/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });

        if (!createResponse.ok) throw new Error('Failed to create mock');
        const responseData = await createResponse.json();
        const questionId = responseData.mock_id;

        if (!questionId) throw new Error('Could not get question ID from server');

        // Create answers
        const createAnswerResponse = await fetch(`${API_BASE_URL}/mock/reading/answer`, {
          method: 'POST',
          headers:getAuthHeaders(),
          body: JSON.stringify({
            question_id: questionId,
            ...answerData
          })
        });

        if (!createAnswerResponse.ok) throw new Error('Failed to create answers');

        alert('Reading mock created successfully!');
      }

      // Reset form
      setShowAnswersSection(false);
    } catch (error) {
      console.error('Error:', error);
      setError(`Error: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEdit ? 'Edit CEFR Reading Mock' : 'Create CEFR Reading Mock'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-300 dark:border-blue-600">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> CSV/JSON/JS dan ma'lumot yuklash
        </h2>
        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-xs relative cursor-pointer">
            <span className="block w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center transition shadow-md hover:shadow-lg transform hover:scale-105">
              📁 CSV/JSON/JS fayl tanlang
            </span>
            <input
              type="file"
              accept=".csv,.json,.js"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-lg">
            <span className="text-lg mr-2">ℹ️</span>
            <span>Yoki qo'lda to'ldiring</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded border-l-4 border-blue-600">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <strong>💡 Maslahat:</strong> cefr-reading-test-01.js, CSV yoki JSON fayllarini o'z ma'lumotingiz bilan to'ldiring va yuklayin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">

        {/* Title */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter title"
          />
        </div>

        {/* Part 1 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-blue-500">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Part 1: Fill in the Gaps (6 gaps)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Mark gaps as (1), (2), (3), (4), (5), (6)</p>
          <textarea
            value={formData.part1.text}
            onChange={handlePart1TextChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-40 text-gray-900 dark:text-white"
            placeholder="Enter text with gaps marked as (1), (2), (3), (4), (5), (6)"
          />
        </div>

        {/* Part 2 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Part 2: Matching (10 statements & 7 texts)</h2>

          <div className="mb-6">
            <label className="block font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Statements (10):</label>
            <div className="grid grid-cols-1 gap-3">
              {formData.part2.statements.map((statement, index) => (
                <input
                  key={index}
                  type="text"
                  value={statement}
                  onChange={(e) => handlePart2StatementChange(index, e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder={`Statement ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Texts (7):</label>
            <div className="grid grid-cols-1 gap-3">
              {formData.part2.texts.map((text, index) => (
                <textarea
                  key={index}
                  value={text}
                  onChange={(e) => handlePart2TextChange(index, e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-20 text-gray-900 dark:text-white"
                  placeholder={`Text ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Part 3 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-purple-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Part 3: Headings & Paragraphs (8 headings, 6 paragraphs)</h2>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Main Text:</label>
            <textarea
              value={formData.part3.text}
              onChange={handlePart3TextChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 text-gray-900 dark:text-white"
              placeholder="Enter the main text that contains paragraphs"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Headings (8):</label>
            <div className="grid grid-cols-1 gap-2">
              {formData.part3.headings.map((heading, index) => (
                <input
                  key={index}
                  type="text"
                  value={heading}
                  onChange={(e) => handlePart3HeadingChange(index, e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder={`Heading ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Paragraphs (6):</label>
            <div className="grid grid-cols-1 gap-3">
              {formData.part3.paragraphs.map((paragraph, index) => (
                <textarea
                  key={index}
                  value={paragraph}
                  onChange={(e) => handlePart3ParagraphChange(index, e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-20 text-gray-900 dark:text-white"
                  placeholder={`Paragraph ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Part 4 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-orange-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Part 4: Multiple Choice & True/False/Not Given (4 MC + 5 TF/NG)</h2>

          <textarea
            value={formData.part4.text}
            onChange={handlePart4TextChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 mb-6 text-gray-900 dark:text-white"
            placeholder="Enter the main text for Part 4"
          />

          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Multiple Choice Questions (4):</h3>
          {formData.part4.multipleChoice.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Question {qIndex + 1}:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handlePart4MCQuestionChange(qIndex, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
                placeholder="Question"
              />
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={option}
                  onChange={(e) => handlePart4MCOptionChange(qIndex, oIndex, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2 text-gray-900 dark:text-white"
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              ))}
            </div>
          ))}

          <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-800 dark:text-white">True/False/Not Given Statements (5):</h3>
          {formData.part4.trueFalse.map((tf, index) => (
            <div key={index} className="mb-3 p-3 bg-white dark:bg-gray-800 rounded">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Statement {index + 1}:</label>
              <input
                type="text"
                value={tf.statement}
                onChange={(e) => handlePart4TFStatementChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Statement"
              />
            </div>
          ))}
        </div>

        {/* Part 5 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-red-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Part 5: Text Completion & MC (1 mini text with 5 gaps + 2 MC)</h2>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Main Text:</label>
            <textarea
              value={formData.part5.mainText}
              onChange={handlePart5MainTextChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 text-gray-900 dark:text-white"
              placeholder="Enter the main text"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Mini Text with Gaps (5 gaps marked as (1), (2), (3), (4), (5)):</label>
            <textarea
              value={formData.part5.miniText}
              onChange={handlePart5MiniTextChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 text-gray-900 dark:text-white"
              placeholder="Enter mini text with gaps marked as (1), (2), (3), (4), (5)"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Multiple Choice Questions (2):</h3>
          {formData.part5.multipleChoice.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Question {qIndex + 1}:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handlePart5MCQuestionChange(qIndex, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-3 text-gray-900 dark:text-white"
                placeholder="Question"
              />
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={option}
                  onChange={(e) => handlePart5MCOptionChange(qIndex, oIndex, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2 text-gray-900 dark:text-white"
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Answers Section */}
        <button
          onClick={() => setShowAnswersSection(!showAnswersSection)}
          className="w-full p-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 mb-4 transition"
        >
          {showAnswersSection ? 'Hide Answers' : 'Add Answers'}
        </button>

        {showAnswersSection && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded border-2 border-blue-400">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Answer Key</h2>

            {/* Part 1 Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 1 Answers (6):</h3>
              {answers.part1.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part1', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Gap ${index + 1} Answer`}
                />
              ))}
            </div>

            {/* Part 2 Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 2 Answers (10):</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Kiritish: Statement qaysi text raqami bilan match bo'lsa, shu raqamni yozing (masalan: 1, 2, 3, 4, 5, 6, 7)</p>
              {answers.part2.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part2', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Statement ${index + 1} text #`}
                />
              ))}
            </div>

            {/* Part 3 Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 3 Answers (6):</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Kiritish: Paragraph qaysi heading raqami bilan match bo'lsa, shu raqamni yozing (masalan: 1, 2, 3, 4, 5, 6, 7, 8)</p>
              {answers.part3.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part3', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Paragraph ${index + 1} heading #`}
                />
              ))}
            </div>

            {/* Part 4 MC Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 4 - Multiple Choice Answers (4):</h3>
              {answers.part4MC.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part4MC', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Question ${index + 1} Answer (A/B/C/D)`}
                />
              ))}
            </div>

            {/* Part 4 TF Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 4 - True/False/Not Given Answers (5):</h3>
              {answers.part4TF.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part4TF', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Statement ${index + 1} Answer (T/F/NG)`}
                />
              ))}
            </div>

            {/* Part 5 Mini Text Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 5 - Mini Text Answers (5):</h3>
              {answers.part5Mini.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part5Mini', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Gap ${index + 1} Answer`}
                />
              ))}
            </div>

            {/* Part 5 MC Answers */}
            <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Part 5 - Multiple Choice Answers (2):</h3>
              {answers.part5MC.map((ans, index) => (
                <input
                  key={index}
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange('part5MC', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder={`Question ${index + 1} Answer (A/B/C/D)`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-500 transition"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Mock' : 'Create Mock')}
        </button>
      </div>
    </div>
  );
}