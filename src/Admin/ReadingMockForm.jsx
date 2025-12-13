import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

export default function ReadingMockForm() {
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';
  const mockId = searchParams.get('id');

  const [formData, setFormData] = useState({
    title: '',
    part1: {
      task: 'Read the text. Fill in each gap with ONE word.',
      text: ''
    },
    part2: {
      task: 'Read the texts and the statements. Match them.',
      statements: [''],
      questions: ['']
    },
    part3: {
      task: 'Read the text and choose the correct heading for each paragraph.',
      headings: [''],
      paragraphs: ['']
    },
    part4: {
      task: 'Read the following text for questions.',
      text: '',
      questions: [{ question: '', options: ['', '', '', ''] }]
    },
    part5: {
      task: 'Read the following text.',
      text: '',
      filling: '',
      multipleChoice: [{ question: '', options: ['', '', '', ''] }],
      trueFalse: [{ statement: '' }]
    }
  });

  const [answers, setAnswers] = useState({
    part1: [''],
    part2: [''],
    part3: [''],
    part4: [''],
    part5Multiple: [''],
    part5TrueFalse: ['']
  });

  const [loading, setLoading] = useState(false);
  const [showAnswersSection, setShowAnswersSection] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [answerId, setAnswerId] = useState(null);

  // Load data if editing
  useEffect(() => {
    if (isEdit && mockId) {
      loadMockData();
    }
  }, [isEdit, mockId]);

  const loadMockData = async () => {
    setLoadingData(true);
    try {
      // Load mock questions
      const mockResponse = await api.get(`/mock/reading/mock/${mockId}`);
      if (mockResponse.data) {
        setFormData(mockResponse.data.mock);
      }

      // Load answers
      const answersResponse = await api.get(`/mock/reading/answer/${mockId}`);
      if (answersResponse.data.answers) {
        const answerData = answersResponse.data.answers;
        setAnswerId(answerData.id || answerData._id);
        
        setAnswers({
          part1: answerData.part1 || [''],
          part2: answerData.part2 || [''],
          part3: answerData.part3 || [''],
          part4: answerData.part4 || [''],
          part5Multiple: answerData.part5?.slice(0, answerData.part5?.length / 2) || [''],
          part5TrueFalse: answerData.part5?.slice(answerData.part5?.length / 2) || ['']
        });
        setShowAnswersSection(true);
      }
  
    
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading mock data');
    } finally {
      setLoadingData(false);
    }
  };

  // Part 1 handlers
  const handlePart1TextChange = (e) => {
    setFormData({
      ...formData,
      part1: { ...formData.part1, text: e.target.value }
    });
  };

  // Part 2 handlers
  const handlePart2StatementChange = (index, value) => {
    const newStatements = [...formData.part2.statements];
    newStatements[index] = value;
    setFormData({
      ...formData,
      part2: { ...formData.part2, statements: newStatements }
    });
  };

  const handlePart2QuestionChange = (index, value) => {
    const newQuestions = [...formData.part2.questions];
    newQuestions[index] = value;
    setFormData({
      ...formData,
      part2: { ...formData.part2, questions: newQuestions }
    });
  };

  const addPart2Statement = () => {
    setFormData({
      ...formData,
      part2: { ...formData.part2, statements: [...formData.part2.statements, ''] }
    });
  };

  const removePart2Statement = (index) => {
    const newStatements = formData.part2.statements.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part2: { ...formData.part2, statements: newStatements }
    });
  };

  const addPart2Question = () => {
    setFormData({
      ...formData,
      part2: { ...formData.part2, questions: [...formData.part2.questions, ''] }
    });
  };

  const removePart2Question = (index) => {
    const newQuestions = formData.part2.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part2: { ...formData.part2, questions: newQuestions }
    });
  };

  // Part 3 handlers
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

  const addPart3Heading = () => {
    setFormData({
      ...formData,
      part3: { ...formData.part3, headings: [...formData.part3.headings, ''] }
    });
  };

  const removePart3Heading = (index) => {
    const newHeadings = formData.part3.headings.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part3: { ...formData.part3, headings: newHeadings }
    });
  };

  const addPart3Paragraph = () => {
    setFormData({
      ...formData,
      part3: { ...formData.part3, paragraphs: [...formData.part3.paragraphs, ''] }
    });
  };

  const removePart3Paragraph = (index) => {
    const newParagraphs = formData.part3.paragraphs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part3: { ...formData.part3, paragraphs: newParagraphs }
    });
  };

  // Part 4 handlers
  const handlePart4TextChange = (e) => {
    setFormData({
      ...formData,
      part4: { ...formData.part4, text: e.target.value }
    });
  };

  const handlePart4QuestionChange = (index, value) => {
    const newQuestions = [...formData.part4.questions];
    newQuestions[index].question = value;
    setFormData({
      ...formData,
      part4: { ...formData.part4, questions: newQuestions }
    });
  };

  const handlePart4OptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.part4.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({
      ...formData,
      part4: { ...formData.part4, questions: newQuestions }
    });
  };

  const addPart4Question = () => {
    setFormData({
      ...formData,
      part4: {
        ...formData.part4,
        questions: [...formData.part4.questions, { question: '', options: ['', '', '', ''] }]
      }
    });
  };

  const removePart4Question = (index) => {
    const newQuestions = formData.part4.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part4: { ...formData.part4, questions: newQuestions }
    });
  };

  // Part 5 handlers
  const handlePart5TextChange = (e) => {
    setFormData({
      ...formData,
      part5: { ...formData.part5, text: e.target.value }
    });
  };

  const handlePart5FillingChange = (e) => {
    setFormData({
      ...formData,
      part5: { ...formData.part5, filling: e.target.value }
    });
  };

  const handlePart5MCQuestionChange = (index, value) => {
    const newQuestions = [...formData.part5.multipleChoice];
    newQuestions[index].question = value;
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

  const addPart5MCQuestion = () => {
    setFormData({
      ...formData,
      part5: {
        ...formData.part5,
        multipleChoice: [...formData.part5.multipleChoice, { question: '', options: ['', '', '', ''] }]
      }
    });
  };

  const removePart5MCQuestion = (index) => {
    const newQuestions = formData.part5.multipleChoice.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part5: { ...formData.part5, multipleChoice: newQuestions }
    });
  };

  const handlePart5TFStatementChange = (index, value) => {
    const newStatements = [...formData.part5.trueFalse];
    newStatements[index].statement = value;
    setFormData({
      ...formData,
      part5: { ...formData.part5, trueFalse: newStatements }
    });
  };

  const addPart5TFStatement = () => {
    setFormData({
      ...formData,
      part5: {
        ...formData.part5,
        trueFalse: [...formData.part5.trueFalse, { statement: '' }]
      }
    });
  };

  const removePart5TFStatement = (index) => {
    const newStatements = formData.part5.trueFalse.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      part5: { ...formData.part5, trueFalse: newStatements }
    });
  };

  // Answer handlers
  const handleAnswerChange = (part, index, value) => {
    const newAnswers = { ...answers };
    newAnswers[part][index] = value;
    setAnswers(newAnswers);
  };

  const addAnswer = (part) => {
    const newAnswers = { ...answers };
    newAnswers[part] = [...newAnswers[part], ''];
    setAnswers(newAnswers);
  };

  const removeAnswer = (part, index) => {
    const newAnswers = { ...answers };
    newAnswers[part] = newAnswers[part].filter((_, i) => i !== index);
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEdit && mockId) {
        // Update mock questions
        await api.put(`/mock/reading/${mockId}`, formData);

        // Update answers
        const answerData = {
          part1: answers.part1.filter(a => a.trim() !== ''),
          part2: answers.part2.filter(a => a.trim() !== ''),
          part3: answers.part3.filter(a => a.trim() !== ''),
          part4: answers.part4.filter(a => a.trim() !== ''),
          part5: [
            ...answers.part5Multiple.filter(a => a.trim() !== ''),
            ...answers.part5TrueFalse.filter(a => a.trim() !== '')
          ]
        };

        if (answerId) {
          await api.put(`/mock/reading/answer/${answerId}`, answerData);
        }

        alert('Reading mock updated successfully!');
      } else {
        // Create new mock
        const questionResponse = await api.post('/mock/reading/', formData);
        
        if (questionResponse.status !== 200 && questionResponse.status !== 201) {
          alert(`Error: Server returned status ${questionResponse.status}`);
          setLoading(false);
          return;
        }

        const questionId = questionResponse.data.mock_id;
        console.log(questionId)
        if (!questionId) {
          alert('Error: Could not get question ID from server');
          setLoading(false);
          return;
        }

        // Post answers
        const answerData = {
          question_id: questionId,
          part1: answers.part1.filter(a => a.trim() !== ''),
          part2: answers.part2.filter(a => a.trim() !== ''),
          part3: answers.part3.filter(a => a.trim() !== ''),
          part4: answers.part4.filter(a => a.trim() !== ''),
          part5: [
            ...answers.part5Multiple.filter(a => a.trim() !== ''),
            ...answers.part5TrueFalse.filter(a => a.trim() !== '')
          ]
        };

        await api.post('/mock/reading/answer', answerData);

        alert('Reading mock created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        part1: { task: 'Read the text. Fill in each gap with ONE word.', text: '' },
        part2: { task: 'Read the texts and the statements. Match them.', statements: [''], questions: [''] },
        part3: { task: 'Read the text and choose the correct heading for each paragraph.', headings: [''], paragraphs: [''] },
        part4: { task: 'Read the following text for questions.', text: '', questions: [{ question: '', options: ['', '', '', ''] }] },
        part5: { task: 'Read the following text.', text: '', filling: '', multipleChoice: [{ question: '', options: ['', '', '', ''] }], trueFalse: [{ statement: '' }] }
      });
      setAnswers({
        part1: [''],
        part2: [''],
        part3: [''],
        part4: [''],
        part5Multiple: [''],
        part5TrueFalse: ['']
      });
      setShowAnswersSection(false);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Reading Mock' : 'Create Reading Mock'}</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        
        {/* Title */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
            placeholder="Enter title"
          />
        </div>

        {/* Part 1 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-4">Part 1: Fill in the Gaps</h2>
          <textarea
            value={formData.part1.text}
            onChange={handlePart1TextChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32"
            placeholder="Enter text with gaps marked as (1), (2), etc."
          />
        </div>

        {/* Part 2 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-4">Part 2: Matching</h2>
          
          <div className="mb-4">
            <label className="block font-semibold mb-2">Statements:</label>
            {formData.part2.statements.map((statement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={statement}
                  onChange={(e) => handlePart2StatementChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                  placeholder={`Statement ${index + 1}`}
                />
                <button onClick={() => removePart2Statement(index)} className="p-2 bg-red-600 text-white rounded">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={addPart2Statement} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <FaPlus /> Add
            </button>
          </div>

          <div>
            <label className="block font-semibold mb-2">Questions/Texts:</label>
            {formData.part2.questions.map((question, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={question}
                  onChange={(e) => handlePart2QuestionChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-20"
                  placeholder={`Question ${index + 1}`}
                />
                <button onClick={() => removePart2Question(index)} className="p-2 bg-red-600 text-white rounded h-fit">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={addPart2Question} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <FaPlus /> Add
            </button>
          </div>
        </div>

        {/* Part 3 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-4">Part 3: Headings & Paragraphs</h2>
          
          <div className="mb-4">
            <label className="block font-semibold mb-2">Headings:</label>
            {formData.part3.headings.map((heading, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => handlePart3HeadingChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600"
                  placeholder={`Heading ${index + 1}`}
                />
                <button onClick={() => removePart3Heading(index)} className="p-2 bg-red-600 text-white rounded">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={addPart3Heading} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <FaPlus /> Add
            </button>
          </div>

          <div>
            <label className="block font-semibold mb-2">Paragraphs:</label>
            {formData.part3.paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={paragraph}
                  onChange={(e) => handlePart3ParagraphChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-20"
                  placeholder={`Paragraph ${index + 1}`}
                />
                <button onClick={() => removePart3Paragraph(index)} className="p-2 bg-red-600 text-white rounded h-fit">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={addPart3Paragraph} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <FaPlus /> Add
            </button>
          </div>
        </div>

        {/* Part 4 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-4">Part 4: Multiple Choice</h2>
          <textarea
            value={formData.part4.text}
            onChange={handlePart4TextChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 mb-4"
            placeholder="Enter text"
          />
          
          {formData.part4.questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <input
                type="text"
                value={q.question}
                onChange={(e) => handlePart4QuestionChange(qIndex, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2"
                placeholder="Question"
              />
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={option}
                  onChange={(e) => handlePart4OptionChange(qIndex, oIndex, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2"
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              ))}
              <button onClick={() => removePart4Question(qIndex)} className="w-full p-2 bg-red-600 text-white rounded">
                Delete Question
              </button>
            </div>
          ))}
          <button onClick={addPart4Question} className="w-full px-3 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2">
            <FaPlus /> Add Question
          </button>
        </div>

        {/* Part 5 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-4">Part 5: Multiple Choice & True/False</h2>
          
          <textarea
            value={formData.part5.text}
            onChange={handlePart5TextChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-32 mb-4"
            placeholder="Enter text"
          />

          <textarea
            value={formData.part5.filling}
            onChange={handlePart5FillingChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 h-20 mb-4"
            placeholder="Enter filling exercise with gaps"
          />

          <h3 className="text-lg font-semibold mb-3">Multiple Choice Questions:</h3>
          {formData.part5.multipleChoice.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <input
                type="text"
                value={q.question}
                onChange={(e) => handlePart5MCQuestionChange(qIndex, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2"
                placeholder="Question"
              />
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={option}
                  onChange={(e) => handlePart5MCOptionChange(qIndex, oIndex, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 mb-2"
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              ))}
              <button onClick={() => removePart5MCQuestion(qIndex)} className="w-full p-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          ))}
          <button onClick={addPart5MCQuestion} className="w-full px-3 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2 mb-4">
            <FaPlus /> Add Question
          </button>

          <h3 className="text-lg font-semibold mb-3">True/False Statements:</h3>
          {formData.part5.trueFalse.map((tf, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={tf.statement}
                onChange={(e) => handlePart5TFStatementChange(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                placeholder="Statement"
              />
              <button onClick={() => removePart5TFStatement(index)} className="p-2 bg-red-600 text-white rounded">
                <FaTrash />
              </button>
            </div>
          ))}
          <button onClick={addPart5TFStatement} className="w-full px-3 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2">
            <FaPlus /> Add Statement
          </button>
        </div>

        {/* Answers Section */}
        <button
          onClick={() => setShowAnswersSection(!showAnswersSection)}
          className="w-full p-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 mb-4"
        >
          {showAnswersSection ? 'Hide Answers' : 'Add Answers'}
        </button>

        {showAnswersSection && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded border-2 border-blue-400">
            <h2 className="text-2xl font-bold mb-6">Answer Key</h2>

            {/* Part 1 Answers */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 1:</h3>
              {answers.part1.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part1', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part1', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part1')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>

            {/* Part 2 Answers */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 2:</h3>
              {answers.part2.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part2', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part2', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part2')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>

            {/* Part 3 Answers */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 3:</h3>
              {answers.part3.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part3', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part3', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part3')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>

            {/* Part 4 Answers */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 4:</h3>
              {answers.part4.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part4', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part4', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part4')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>

            {/* Part 5 Multiple Choice */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 5 - Multiple Choice:</h3>
              {answers.part5Multiple.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part5Multiple', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part5Multiple', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part5Multiple')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>

            {/* Part 5 True/False */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold mb-3">Part 5 - True/False:</h3>
              {answers.part5TrueFalse.map((ans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange('part5TrueFalse', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                    placeholder={`Answer ${index + 1}`}
                  />
                  <button onClick={() => removeAnswer('part5TrueFalse', index)} className="p-2 bg-red-600 text-white rounded">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer('part5TrueFalse')} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">
                <FaPlus /> Add
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-500"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Mock' : 'Create Mock')}
        </button>
      </div>
    </div>
  );
}