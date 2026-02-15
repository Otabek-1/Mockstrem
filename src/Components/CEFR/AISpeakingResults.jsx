import React, { useState, useEffect } from 'react';
import { Volume2, Loader, AlertCircle, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { 
  transcribeAudio, 
  scoreSpeakingTask, 
  generateSpeakingReport 
} from '../../services/geminiService';

export default function AISpeakingResults({ 
  recordings, 
  mockData, 
  isPremium, 
  onResultsGenerated,
  currentPart
}) {
  const [aiScores, setAiScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptions, setTranscriptions] = useState({});
  const [scoringProgress, setScoringProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, transcript, detailed

  useEffect(() => {
    console.log('🎤 AISpeakingResults mounted:', { isPremium, recordingsCount: Object.keys(recordings).length });
    if (isPremium && recordings && Object.keys(recordings).length > 0) {
      generateAIScores();
    }
  }, [isPremium, recordings]);

  const generateAIScores = async () => {
    try {
      setLoading(true);
      setError(null);
      setScoringProgress(0);

      const transcriptions = {};
      const scores = {};
      const allTranscriptions = {};

      // Get all audio blobs
      const audioData = {
        part_1_1: [],
        part_1_2: [],
        part_2: [],
      };

      // Map recordings to parts based on question number
      Object.entries(recordings).forEach(([key, url]) => {
        if (!url || typeof url !== 'string' || !url.startsWith('blob:')) return;
        
        const qNum = parseInt(key.replace('q', ''));
        if (qNum <= 2) audioData.part_1_1.push({ key, url });
        else if (qNum <= 4) audioData.part_1_2.push({ key, url });
        else if (qNum <= 6) audioData.part_2.push({ key, url });
      });

      // Transcribe Part 1.1
      if (audioData.part_1_1.length > 0) {
        let combinedTranscript = '';
        for (const item of audioData.part_1_1) {
          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const transcript = await transcribeAudio(blob);
            combinedTranscript += transcript + ' ';
            allTranscriptions[item.key] = transcript;
          } catch (err) {
            console.error('Transcription error for', item.key, err);
            allTranscriptions[item.key] = '[Transcription failed]';
          }
        }
        transcriptions.part_1_1 = combinedTranscript.trim();
        setScoringProgress(25);

        // Score Part 1.1
        try {
          const score = await scoreSpeakingTask(
            transcriptions.part_1_1,
            '1.1',
            1,
            mockData?.['1.1']?.[0]?.context || '',
            mockData?.['1.1']?.[0]?.scenario || ''
          );
          scores.part_1_1 = score;
        } catch (err) {
          console.error('Scoring error for Part 1.1:', err);
          scores.part_1_1 = { score: 0, error: true, message: err.message };
        }
      }

      // Transcribe Part 1.2
      if (audioData.part_1_2.length > 0) {
        let combinedTranscript = '';
        for (const item of audioData.part_1_2) {
          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const transcript = await transcribeAudio(blob);
            combinedTranscript += transcript + ' ';
            allTranscriptions[item.key] = transcript;
          } catch (err) {
            console.error('Transcription error for', item.key, err);
            allTranscriptions[item.key] = '[Transcription failed]';
          }
        }
        transcriptions.part_1_2 = combinedTranscript.trim();
        setScoringProgress(50);

        // Score Part 1.2
        try {
          const score = await scoreSpeakingTask(
            transcriptions.part_1_2,
            '1.2',
            2,
            mockData?.['1.2']?.[0]?.context || '',
            mockData?.['1.2']?.[0]?.scenario || ''
          );
          scores.part_1_2 = score;
        } catch (err) {
          console.error('Scoring error for Part 1.2:', err);
          scores.part_1_2 = { score: 0, error: true, message: err.message };
        }
      }

      // Transcribe Part 2
      if (audioData.part_2.length > 0) {
        let combinedTranscript = '';
        for (const item of audioData.part_2) {
          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const transcript = await transcribeAudio(blob);
            combinedTranscript += transcript + ' ';
            allTranscriptions[item.key] = transcript;
          } catch (err) {
            console.error('Transcription error for', item.key, err);
            allTranscriptions[item.key] = '[Transcription failed]';
          }
        }
        transcriptions.part_2 = combinedTranscript.trim();
        setScoringProgress(75);

        // Score Part 2
        try {
          const score = await scoreSpeakingTask(
            transcriptions.part_2,
            '2',
            3,
            mockData?.['2']?.[0]?.context || '',
            mockData?.['2']?.[0]?.scenario || ''
          );
          scores.part_2 = score;
        } catch (err) {
          console.error('Scoring error for Part 2:', err);
          scores.part_2 = { score: 0, error: true, message: err.message };
        }
      }

      // Generate comprehensive report
      const report = await generateSpeakingReport(
        scores.part_1_1 || { score: 0 },
        scores.part_1_2 || { score: 0 },
        scores.part_2 || { score: 0 }
      );

      setTranscriptions(allTranscriptions);
      setAiScores({
        ...report,
        individual_scores: scores,
      });

      setScoringProgress(100);
      if (onResultsGenerated) {
        onResultsGenerated(report);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI scores');
      console.error('AI scoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Premium CTA Banner
  console.log('📊 AISpeakingResults render:', { isPremium, currentPart, recordingCount: Object.keys(recordings || {}).length });
  
  if (!isPremium) {
    console.warn('⚠️ User not premium, showing CTA banner');
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <Award className="w-10 h-10 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">🤖 Get AI-Powered Feedback</h3>
            <p className="text-blue-50 mb-4">
              Unlock detailed AI analysis of your speaking responses with instant transcription, 
              scoring, and personalized improvement suggestions using advanced language models.
            </p>
            <button className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition">
              ⭐ Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <h3 className="text-xl font-bold text-slate-800">
              Your results are being received, please wait
            </h3>
          </div>
          <p className="text-slate-600 mb-4">(It can take up to 1 minute)</p>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-500"
              style={{ width: `${scoringProgress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">{scoringProgress}% Complete</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Failed to Generate AI Analysis</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={generateAIScores}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!aiScores) {
    return null;
  }

  const grades = {
    0: { color: 'bg-red-100', textColor: 'text-red-700', label: 'Very Poor' },
    1: { color: 'bg-orange-100', textColor: 'text-orange-700', label: 'Poor' },
    2: { color: 'bg-yellow-100', textColor: 'text-yellow-700', label: 'Fair' },
    3: { color: 'bg-lime-100', textColor: 'text-lime-700', label: 'Good' },
    4: { color: 'bg-green-100', textColor: 'text-green-700', label: 'Very Good' },
    5: { color: 'bg-emerald-100', textColor: 'text-emerald-700', label: 'Excellent' },
    6: { color: 'bg-blue-100', textColor: 'text-blue-700', label: 'Outstanding' },
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{aiScores.total_raw_score}/{aiScores.max_score}</div>
            <p className="text-blue-100 text-lg">Raw Score</p>
            <p className="text-blue-200 text-sm mt-1">{aiScores.percentage}%</p>
          </div>

          <div className="text-center border-l border-r border-white/30">
            <div className="text-5xl font-bold mb-2">{aiScores.certificate_score}</div>
            <p className="text-blue-100 text-lg">Certificate Score</p>
            <p className="text-blue-200 text-sm mt-1">out of 75</p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">🎓</div>
            <div className="text-3xl font-bold mb-2">{aiScores.cefr_level}</div>
            <p className="text-blue-100 text-sm">CEFR Level</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        {['overview', 'transcript', 'detailed'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-semibold transition ${
              selectedTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'transcript' && '📝 Transcripts'}
            {tab === 'detailed' && '🔍 Detailed Feedback'}
          </button>
        ))}
      </div>

      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {['part_1_1', 'part_1_2', 'part_2'].map(part => {
            const scoreData = aiScores.individual_scores?.[part];
            if (!scoreData || scoreData.error) return null;

            const partLabel = {
              part_1_1: 'Part 1.1 - Individual Long Turn',
              part_1_2: 'Part 1.2 - Picture Description',
              part_2: 'Part 2 - Monologue',
            }[part];

            const gradeInfo = grades[scoreData.score || 0];

            return (
              <div key={part} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{partLabel}</h3>
                    <p className="text-sm text-slate-600 mt-1">Relevance: {scoreData.relevance}</p>
                  </div>
                  <div className={`${gradeInfo.color} ${gradeInfo.textColor} px-4 py-2 rounded-full font-bold text-lg text-center`}>
                    {scoreData.score || 0}/{part === 'part_2' ? 6 : 5}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Strengths:</p>
                    <p className="text-slate-700 text-sm">{scoreData.strengths || 'No data'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Areas for Improvement:</p>
                    <p className="text-slate-700 text-sm">{scoreData.areas_for_improvement || 'No data'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded">
                      <p className="text-slate-600">Grammar Errors</p>
                      <p className="font-bold text-slate-800">{scoreData.error_count?.grammar || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-slate-600">Spelling Errors</p>
                      <p className="font-bold text-slate-800">{scoreData.error_count?.spelling || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-slate-600">Non-English Words</p>
                      <p className="font-bold text-slate-800">{scoreData.error_count?.non_english || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-slate-600">CEFR Level</p>
                      <p className="font-bold text-slate-800">{scoreData.cefr_level || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTab === 'transcript' && (
        <div className="space-y-4">
          {Object.entries(transcriptions).map(([key, text]) => (
            <div key={key} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-slate-800 mb-3">Question {key.replace('q', '')}</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-slate-700 leading-relaxed">
                {text || '[No transcription available]'}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'detailed' && (
        <div className="space-y-4">
          {['part_1_1', 'part_1_2', 'part_2'].map(part => {
            const scoreData = aiScores.individual_scores?.[part];
            if (!scoreData || scoreData.error) return null;

            const partLabel = {
              part_1_1: 'Part 1.1 - Individual Long Turn',
              part_1_2: 'Part 1.2 - Picture Description',
              part_2: 'Part 2 - Monologue',
            }[part];

            return (
              <div key={part} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{partLabel} - Detailed Analysis</h3>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-slate-800 mb-2">📋 Corrected Text:</p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm text-slate-700 leading-relaxed">
                      {scoreData.corrected_text || 'No analysis available'}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 mb-2">💡 Examiner Feedback:</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded text-sm text-slate-700">
                      {scoreData.feedback || 'No feedback available'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
