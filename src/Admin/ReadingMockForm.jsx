import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://english-server-p7y6.onrender.com'; // O'zingizning API URL ini kiriting

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
  // Function qo'shildi
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