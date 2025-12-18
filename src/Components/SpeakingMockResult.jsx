import React, { useEffect, useState } from 'react';
import { FaDownload, FaArrowLeft, FaCheckCircle, FaAward, FaClock, FaCrown } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { jsPDF } from 'jspdf';

export default function SpeakingMockResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/mock/speaking/result/${resultId}`);
        console.log(res.data.result);
        setError(null);
      } catch (err) {
        console.error('Error fetching speaking result:', err);
        setError('Failed to load result. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result || !result.evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error || 'Result not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const evalData = result.evaluation;
  const scores = evalData.scores || {};
  const feedbacks = evalData.feedbacks || {};
  const totalScore = scores.total || 0;
  const maxTotalScore = 40; // 10 + 10 + 10 + 10
  const percentage = Math.round((totalScore / maxTotalScore) * 100);

  const getBandInfo = (band) => {
    const bandMap = {
      'A1': { band: 'A1', level: 'Elementary User' },
      'A2': { band: 'A2', level: 'Elementary User' },
      'B1': { band: 'B1', level: 'Independent User' },
      'B2': { band: 'B2', level: 'Independent User' },
      'C1': { band: 'C1', level: 'Proficient User' },
      'C2': { band: 'C2', level: 'Proficient User' },
    };
    return bandMap[band] || { band: 'N/A', level: 'Not Available' };
  };

  const bandInfo = getBandInfo(evalData.band);

  const parts = [
    {
      id: 'part1.1',
      title: 'Part 1.1 - Individual Long Turn',
      score: scores['part1.1'] || 0,
      maxScore: 10,
      feedback: feedbacks['part1.1'] || 'No feedback available',
    },
    {
      id: 'part1.2',
      title: 'Part 1.2 - Picture Description',
      score: scores['part1.2'] || 0,
      maxScore: 10,
      feedback: feedbacks['part1.2'] || 'No feedback available',
    },
    {
      id: 'part2',
      title: 'Part 2 - Extended Monologue',
      score: scores['part2'] || 0,
      maxScore: 10,
      feedback: feedbacks['part2'] || 'No feedback available',
    },
    {
      id: 'part3',
      title: 'Part 3 - Discussion',
      score: scores['part3'] || 0,
      maxScore: 10,
      feedback: feedbacks['part3'] || 'No feedback available',
    },
  ];

  const downloadPDF = () => {
    // PDF generation logic can be added later if needed
    alert("PDF download will be available soon.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">MockStream</h1>
          <p className="text-gray-600 dark:text-gray-400">CEFR Speaking Mock Exam Result</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Exam Date: {new Date(result.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{totalScore}/{maxTotalScore}</div>
              <p className="text-blue-100 text-lg font-semibold">Total Score</p>
              <p className="text-blue-200 text-sm mt-2">{percentage}%</p>
            </div>

            <div className="text-center border-l border-r border-white/30">
              <div className="flex justify-center mb-2">
                <FaAward className="text-4xl text-yellow-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{bandInfo.band}</div>
              <p className="text-blue-100 text-sm">Band Score</p>
              <p className="text-yellow-200 font-semibold mt-2">{bandInfo.level}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <FaClock className="text-4xl" />
              </div>
              <div className="text-xl font-bold mb-2">
                {evalData.evaluated_at ? new Date(evalData.evaluated_at).toLocaleString() : 'N/A'}
              </div>
              <p className="text-blue-100 text-sm">Evaluated</p>
            </div>
          </div>
        </div>

        {/* Part Results */}
        <div className="space-y-6 mb-8">
          {parts.map((part, idx) => (
            <div key={part.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-600 dark:to-gray-500 p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{part.title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {part.score}/{part.maxScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round((part.score / part.maxScore) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(part.score / part.maxScore) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-yellow-600">💡</span> Feedback
                </h4>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {part.feedback}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audio Archive Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-5 mb-8">
          <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
            🎧 Your audio recordings have been securely archived and are not displayed here for privacy and performance reasons.
          </p>
        </div>

        {/* Premium CTA */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaCrown className="text-3xl text-yellow-300" />
              <h3 className="text-2xl md:text-3xl font-bold">Want to Review Your Audio?</h3>
            </div>
            <p className="text-white/90 mb-4">
              As a premium user, your audio submissions are stored securely. Contact support or your teacher to access them for detailed review.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
          >
            <FaArrowLeft /> Back to Results
          </button>
          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            <FaDownload /> {pdfLoading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  );
}