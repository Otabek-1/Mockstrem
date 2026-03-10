
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import {
  evaluateWritingWithGemini,
  runSpeakingGeminiAnalysis,
  transcribeAudioWithGemini,
} from "../../services/geminiService";

const SECTION_ORDER = ["listening", "reading", "writing", "speaking"];
const SECTION_DURATION_SECONDS = {
  listening: 40 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 20 * 60,
};

const clamp75 = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(75, Math.round(num)));
};

const to75 = (correct, total) => {
  if (!total) return 0;
  return clamp75((Number(correct || 0) / Number(total)) * 75);
};

const randomItem = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const sanitizeHtml = (html) => {
  if (!html) return "";
  if (typeof window === "undefined" || !window.DOMParser) return stripHtml(html);

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(String(html), "text/html");
  doc.querySelectorAll("script, style, iframe, object").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) node.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

const hasHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ""));

const getReadingDefaults = () => ({
  part1: Array(6).fill(""),
  part2: Array(10).fill(""),
  part3: Array(6).fill(""),
  part4MC: Array(4).fill(""),
  part4TF: Array(5).fill(""),
  part5Mini: Array(5).fill(""),
  part5MC: Array(2).fill(""),
});

const getReadingDefaultsFromMock = (mock) => ({
  part1: Array((mock?.part1?.text?.match(/\(\d+\)/g) || []).length || 6).fill(""),
  part2: Array((mock?.part2?.statements || []).length || 10).fill(""),
  part3: Array((mock?.part3?.paragraphs || []).length || 6).fill(""),
  part4MC: Array((mock?.part4?.multipleChoice || []).length || 4).fill(""),
  part4TF: Array((mock?.part4?.trueFalse || []).length || 5).fill(""),
  part5Mini: Array((mock?.part5?.miniText?.match(/\(\d+\)/g) || []).length || 5).fill(""),
  part5MC: Array((mock?.part5?.multipleChoice || []).length || 2).fill(""),
});

const getListeningDefaults = (mock) => {
  const part3Speakers = mock?.data?.part_3?.speakers || [];
  const part4Questions = mock?.data?.part_4?.questions || [];
  const part6Questions = mock?.data?.part_6?.questions || [];
  const part5 = Array.isArray(mock?.data?.part_5) ? mock.data.part_5 : [];
  const part5QuestionCount = part5.reduce((total, extract) => {
    if (Array.isArray(extract?.questions)) return total + extract.questions.length;
    let count = 0;
    if (extract?.q1) count += 1;
    if (extract?.q2) count += 1;
    return total + count;
  }, 0);

  return {
    part1: Array((mock?.data?.part_1 || []).length).fill(""),
    part2: Array((mock?.data?.part_2 || []).length).fill(""),
    part3: Array(part3Speakers.length).fill(""),
    part4: Array(part4Questions.length).fill(""),
    part5: Array(part5QuestionCount).fill(""),
    part6: Array(part6Questions.length).fill(""),
  };
};

const getQuestionCountLabel = (mockData) => {
  const orderedParts = ["1.1", "1.2", "2", "3"];
  return orderedParts.reduce((total, part) => total + (Array.isArray(mockData?.[part]) ? mockData[part].length : 0), 0);
};

const normalizeSpeakingQuestions = (rawSpeakingMock) => {
  const root = rawSpeakingMock?.questions?.questions || rawSpeakingMock?.questions || {};
  const parts = ["1.1", "1.2", "2", "3"];
  const normalized = [];

  parts.forEach((partKey) => {
    const list = Array.isArray(root?.[partKey]) ? root[partKey] : [];
    list.forEach((q, idx) => {
      normalized.push({
        key: `${partKey}-${idx}`,
        part: partKey,
        questionText: q?.question_text || `Question ${idx + 1}`,
        bullets: Array.isArray(q?.bullets) ? q.bullets : [],
        forPoints: Array.isArray(q?.for_points) ? q.for_points : [],
        againstPoints: Array.isArray(q?.against_points) ? q.against_points : [],
      });
    });
  });

  return normalized;
};

const getSpeakingScoreFromAnalysis = (analysisText) => {
  if (!analysisText) return 0;
  const certMatch = analysisText.match(/CERTIFICATE\s*SCORE\s*:\s*([0-9]+)\s*\/\s*75/i);
  if (certMatch?.[1]) return clamp75(Number(certMatch[1]));

  const rawMatch = analysisText.match(/TOTAL\s*RAW\s*SCORE\s*:\s*([0-9]+(\.[0-9]+)?)\s*\/\s*21/i);
  if (rawMatch?.[1]) return to75(Number(rawMatch[1]), 21);

  return 0;
};

const extractSpeakingAdvice = (analysisText) => {
  if (!analysisText) return "";
  const cut = analysisText.split("FINAL SCORES")[0] || analysisText;
  return cut.trim().slice(0, 700);
};

export default function FullMockExam() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECTION_DURATION_SECONDS.listening);
  const [listeningPart, setListeningPart] = useState(1);
  const [readingPart, setReadingPart] = useState(1);
  const [writingTask, setWritingTask] = useState("t11");
  const [speakingIndex, setSpeakingIndex] = useState(0);

  const [selectedMocks, setSelectedMocks] = useState({
    listening: null,
    reading: null,
    writing: null,
    speaking: null,
  });

  const [listeningAnswers, setListeningAnswers] = useState(getListeningDefaults(null));
  const [readingAnswers, setReadingAnswers] = useState(getReadingDefaults());
  const [writingAnswers, setWritingAnswers] = useState({ t11: "", t12: "", t2: "" });
  const [speakingAnswers, setSpeakingAnswers] = useState({});
  const [speakingRecordings, setSpeakingRecordings] = useState({});
  const [recordingQuestionKey, setRecordingQuestionKey] = useState(null);
  const [speakingAiStatus, setSpeakingAiStatus] = useState("");
  const [listeningAudioLoaded, setListeningAudioLoaded] = useState(false);
  const [listeningAudioPlaying, setListeningAudioPlaying] = useState(false);
  const [listeningAudioProgress, setListeningAudioProgress] = useState(0);
  const [listeningVolume, setListeningVolume] = useState(1);
  const [listeningMuted, setListeningMuted] = useState(false);
  const speakingRecorderRef = useRef(null);
  const speakingStreamRef = useRef(null);
  const speakingChunksRef = useRef([]);
  const speakingBlobsRef = useRef({});
  const listeningAudioRef = useRef(null);
  const speakingRecordingsRef = useRef({});

  const [scores, setScores] = useState({
    listening: null,
    reading: null,
    writing: null,
    speaking: null,
  });

  const [aiData, setAiData] = useState({
    writing: null,
    speakingRaw: "",
  });

  const speakingQuestions = useMemo(
    () => normalizeSpeakingQuestions(selectedMocks.speaking),
    [selectedMocks.speaking]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [listeningRes, readingRes, writingRes, speakingRes] = await Promise.all([
          api.get("/cefr/listening/all"),
          api.get("/mock/reading/all"),
          api.get("/mock/writing/all"),
          api.get("/mock/speaking/all"),
        ]);

        const chosenListening = randomItem(listeningRes.data || []);
        const chosenReading = randomItem(readingRes.data?.mocks || []);
        const chosenWriting = randomItem(writingRes.data || []);
        const chosenSpeaking = randomItem(speakingRes.data || []);

        if (!chosenListening || !chosenReading || !chosenWriting || !chosenSpeaking) {
          throw new Error("Mock data yetarli emas. Iltimos keyinroq urinib ko'ring.");
        }

        setSelectedMocks({
          listening: chosenListening,
          reading: chosenReading,
          writing: chosenWriting,
          speaking: chosenSpeaking,
        });
        setListeningAnswers(getListeningDefaults(chosenListening));
        setReadingAnswers(getReadingDefaultsFromMock(chosenReading));
      } catch (error) {
        setLoadError(error?.message || "Full mock yuklanmadi.");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!speakingQuestions.length) return;
    const next = {};
    speakingQuestions.forEach((q) => {
      next[q.key] = speakingAnswers[q.key] || "";
    });
    setSpeakingAnswers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingQuestions.length]);

  useEffect(() => {
    speakingRecordingsRef.current = speakingRecordings;
  }, [speakingRecordings]);

  const sectionKey = SECTION_ORDER[currentSection];
  const isSectionChecked = scores[sectionKey] !== null;
  const allDone = SECTION_ORDER.every((key) => scores[key] !== null);

  const overallScore = useMemo(() => {
    if (!allDone) return 0;
    const total = SECTION_ORDER.reduce((sum, key) => sum + Number(scores[key] || 0), 0);
    return clamp75(total / 4);
  }, [allDone, scores]);

  useEffect(() => {
    if (sectionKey === "listening") setListeningPart(1);
    if (sectionKey === "reading") setReadingPart(1);
    if (sectionKey === "writing") setWritingTask("t11");
    if (sectionKey === "speaking") setSpeakingIndex(0);
  }, [sectionKey]);

  useEffect(() => {
    if (scores[sectionKey] !== null) return;
    setTimeLeft(SECTION_DURATION_SECONDS[sectionKey] || 0);
  }, [sectionKey, scores]);

  useEffect(() => {
    if (allDone || isSectionChecked || busy || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [allDone, isSectionChecked, busy, timeLeft]);

  useEffect(() => {
    const listeningAudio = listeningAudioRef.current;
    return () => {
      Object.values(speakingRecordingsRef.current || {}).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      if (speakingStreamRef.current) {
        speakingStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (listeningAudio) {
        listeningAudio.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (sectionKey !== "listening") return;

    const audio = listeningAudioRef.current;
    const src = selectedMocks.listening?.[`audio_part_${listeningPart}`];
    if (!audio || !src) {
      setListeningAudioLoaded(false);
      setListeningAudioPlaying(false);
      setListeningAudioProgress(0);
      return;
    }

    setListeningAudioLoaded(false);
    setListeningAudioPlaying(false);
    setListeningAudioProgress(0);
    audio.src = src;
    audio.load();

    const handleLoaded = () => setListeningAudioLoaded(true);
    const handlePlay = () => setListeningAudioPlaying(true);
    const handlePause = () => setListeningAudioPlaying(false);
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setListeningAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("loadeddata", handleLoaded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener("loadeddata", handleLoaded);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [sectionKey, listeningPart, selectedMocks.listening]);

  const renderRichText = (value, className = "") => {
    const html = sanitizeHtml(value);
    if (!html) return null;
    if (hasHtml(value)) {
      return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <p className={className}>{stripHtml(value)}</p>;
  };

  const renderGapText = (text, answers, onChange, inputPrefix) => {
    const raw = String(text || "");
    if (!raw) return null;

    const segments = raw.split(/(\(\d+\))/g);
    let gapIndex = 0;

    return (
      <div className="text-sm text-slate-700 leading-8 whitespace-pre-wrap">
        {segments.map((segment, idx) => {
          const gapMatch = segment.match(/\((\d+)\)/);
          if (!gapMatch) {
            if (hasHtml(segment)) {
              return (
                <span
                  key={`${inputPrefix}-html-${idx}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(segment) }}
                />
              );
            }
            return <span key={`${inputPrefix}-txt-${idx}`}>{segment}</span>;
          }

          const currentGapIndex = gapIndex;
          gapIndex += 1;
          return (
            <span key={`${inputPrefix}-gap-${idx}`} className="inline-flex items-center gap-2 mx-1">
              <span className="inline-flex min-w-7 justify-center rounded-md bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                {currentGapIndex + 1}
              </span>
              <input
                value={answers[currentGapIndex] || ""}
                onChange={(e) => onChange(currentGapIndex, e.target.value)}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-center font-semibold"
              />
            </span>
          );
        })}
      </div>
    );
  };

  const submitListening = async () => {
    const mockId = selectedMocks.listening?.id;
    if (!mockId) return;
    const payload = {
      mock_id: Number(mockId),
      part1: listeningAnswers.part1,
      part2: listeningAnswers.part2,
      part3: listeningAnswers.part3,
      part4: listeningAnswers.part4,
      part5: listeningAnswers.part5,
      part6: listeningAnswers.part6,
    };
    const res = await api.post("/cefr/listening/submit", payload);
    const normalized = to75(res.data?.total || 0, res.data?.maxScore || 35);
    setScores((prev) => ({ ...prev, listening: normalized }));
  };

  const submitReading = async () => {
    const questionId = selectedMocks.reading?.id;
    if (!questionId) return;
    const payload = {
      question_id: Number(questionId),
      part1: readingAnswers.part1,
      part2: readingAnswers.part2,
      part3: readingAnswers.part3,
      part4MC: readingAnswers.part4MC,
      part4TF: readingAnswers.part4TF,
      part5Mini: readingAnswers.part5Mini,
      part5MC: readingAnswers.part5MC,
    };
    const res = await api.post("/mock/reading/submit", payload);
    const normalized = to75(res.data?.total || 0, 38);
    setScores((prev) => ({ ...prev, reading: normalized }));
  };

  const submitWriting = async () => {
    const writingMock = selectedMocks.writing;
    if (!writingMock) return;

    await api.post("/mock/writing/submit", {
      mock_id: writingMock.id,
      task1: `${writingAnswers.t11} ---TASK--- ${writingAnswers.t12}`,
      task2: writingAnswers.t2,
    });

    const aiResult = await evaluateWritingWithGemini({
      contextT1: writingMock?.task1?.context || "N/A",
      scenarioT1: writingMock?.task1?.scenario || "N/A",
      promptT11: writingMock?.task1?.task11 || "N/A",
      promptT12: writingMock?.task1?.task12 || "N/A",
      promptT2: writingMock?.task2?.task2 || "N/A",
      t11: writingAnswers.t11,
      t12: writingAnswers.t12,
      t2: writingAnswers.t2,
    });

    const scoreFromCert = clamp75(aiResult?.certificate_score);
    const fallbackRaw = to75(aiResult?.raw_score || 0, 16);
    setAiData((prev) => ({ ...prev, writing: aiResult }));
    setScores((prev) => ({
      ...prev,
      writing: scoreFromCert > 0 ? scoreFromCert : fallbackRaw,
    }));
  };

  const startSpeakingRecording = async (questionKey) => {
    if (recordingQuestionKey) return;
    if (!questionKey) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      speakingStreamRef.current = stream;
      speakingChunksRef.current = [];

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      let recorder = null;
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported?.(type)) {
          recorder = new MediaRecorder(stream, { mimeType: type });
          break;
        }
      }
      if (!recorder) recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          speakingChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(speakingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        speakingBlobsRef.current[questionKey] = blob;
        const localUrl = URL.createObjectURL(blob);
        setSpeakingRecordings((prev) => {
          const oldUrl = prev[questionKey];
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          return { ...prev, [questionKey]: localUrl };
        });
        setRecordingQuestionKey(null);
        speakingRecorderRef.current = null;
        if (speakingStreamRef.current) {
          speakingStreamRef.current.getTracks().forEach((t) => t.stop());
          speakingStreamRef.current = null;
        }
      };

      speakingRecorderRef.current = recorder;
      setRecordingQuestionKey(questionKey);
      recorder.start();
    } catch {
      alert("Microphone access required for speaking section.");
    }
  };

  const stopSpeakingRecording = async () =>
    new Promise((resolve) => {
      const recorder = speakingRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }

      const originalOnStop = recorder.onstop;
      recorder.onstop = (event) => {
        if (originalOnStop) originalOnStop.call(recorder, event);
        resolve();
      };
      recorder.stop();
    });

  const buildSpeakingPromptText = (question, idx) => {
    const number = idx + 1;
    const baseText = question?.questionText || `Question ${number}`;
    if (Array.isArray(question?.bullets) && question.bullets.length) {
      return `Question ${number}: ${baseText}. ${question.bullets.join(" ")}`;
    }
    if (
      (Array.isArray(question?.forPoints) && question.forPoints.length) ||
      (Array.isArray(question?.againstPoints) && question.againstPoints.length)
    ) {
      return `Question ${number}: ${baseText}. FOR: ${(question.forPoints || []).join(
        "; "
      )}. AGAINST: ${(question.againstPoints || []).join("; ")}`;
    }
    return `Question ${number}: ${baseText}`;
  };

  const submitSpeaking = async () => {
    if (!speakingQuestions.length) {
      setScores((prev) => ({ ...prev, speaking: 0 }));
      setAiData((prev) => ({ ...prev, speakingRaw: "" }));
      return;
    }

    const questionTexts = speakingQuestions.map((q, idx) => buildSpeakingPromptText(q, idx));
    const transcriptions = [];

    const formData = new FormData();
    formData.append("mock_id", String(selectedMocks.speaking?.id || ""));
    formData.append("total_duration", String(SECTION_DURATION_SECONDS.speaking));

    speakingQuestions.forEach((q) => {
      const blob = speakingBlobsRef.current[q.key];
      if (blob) {
        formData.append("audios", blob, `${q.key}.webm`);
      }
    });

    if (selectedMocks.speaking?.id && formData.getAll("audios").length > 0) {
      setSpeakingAiStatus("Uploading speaking recordings...");
      await api.post("/mock/speaking/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    for (let i = 0; i < speakingQuestions.length; i += 1) {
      const q = speakingQuestions[i];
      const blob = speakingBlobsRef.current[q.key];
      if (!blob) {
        const fallback = (speakingAnswers[q.key] || "").trim();
        transcriptions.push({
          questionNum: i + 1,
          text: fallback || "[No response]",
        });
        continue;
      }

      setSpeakingAiStatus(`Transcribing question ${i + 1}/${speakingQuestions.length}...`);
      try {
        const text = await transcribeAudioWithGemini(blob, blob.type || "audio/webm");
        transcriptions.push({
          questionNum: i + 1,
          text: text || "[No speech detected]",
        });
      } catch {
        transcriptions.push({
          questionNum: i + 1,
          text: "[Transcription failed]",
        });
      }
    }

    setSpeakingAiStatus("Running AI speaking analysis...");
    const analysis = await runSpeakingGeminiAnalysis({
      transcriptions,
      questionTexts,
      candidateName: "Candidate",
      imageBlobs: [],
    });
    setSpeakingAiStatus("");

    setAiData((prev) => ({ ...prev, speakingRaw: analysis }));
    setScores((prev) => ({
      ...prev,
      speaking: getSpeakingScoreFromAnalysis(analysis),
    }));
  };

  const submitCurrentSection = async (force = false) => {
    try {
      if (sectionKey === "speaking" && recordingQuestionKey && !force) {
        alert("Please stop current recording before submitting speaking section.");
        return;
      }
      setBusy(true);
      if (sectionKey === "listening") await submitListening();
      if (sectionKey === "reading") await submitReading();
      if (sectionKey === "writing") await submitWriting();
      if (sectionKey === "speaking") await submitSpeaking();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (timeLeft !== 0 || isSectionChecked || busy || allDone) return;
    const autoSubmit = async () => {
      if (sectionKey === "speaking" && recordingQuestionKey) {
        await stopSpeakingRecording();
      }
      await submitCurrentSection(true);
    };
    autoSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isSectionChecked, busy, allDone]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const renderListening = () => {
    const mock = selectedMocks.listening;
    if (!mock) {
      return (
        <div className="rounded-xl bg-white p-5 border border-slate-200 text-slate-600">
          Listening mock not available.
        </div>
      );
    }
    const data = mock?.data || {};
    const part1 = data?.part_1 || [];
    const part2 = data?.part_2 || [];
    const part3 = data?.part_3 || {};
    const part4 = data?.part_4 || {};
    const part5 = Array.isArray(data?.part_5) ? data.part_5 : [];
    const part6 = data?.part_6?.questions || [];

    let part5GlobalIdx = -1;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">{mock?.title || "Listening"}</h2>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((partNo) => (
            <button
              key={`listen-part-${partNo}`}
              onClick={() => setListeningPart(partNo)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-semibold border",
                listeningPart === partNo
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-300 text-slate-700",
              ].join(" ")}
            >
              Part {partNo}
            </button>
          ))}
        </div>

        {listeningPart === 1 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 1</h3>
            {part1.map((options, idx) => (
              <div key={`p1-${idx}`} className="mb-4 p-3 rounded-lg bg-slate-50">
                <p className="font-semibold mb-2">Question {idx + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(options || []).map((opt, optIdx) => {
                    const value = String.fromCharCode(65 + optIdx);
                    return (
                      <label key={`${idx}-${value}`} className="flex gap-2 items-center text-sm">
                        <input
                          type="radio"
                          name={`listening-p1-${idx}`}
                          value={value}
                          checked={listeningAnswers.part1[idx] === value}
                          onChange={(e) => {
                            const next = [...listeningAnswers.part1];
                            next[idx] = e.target.value;
                            setListeningAnswers((prev) => ({ ...prev, part1: next }));
                          }}
                        />
                        <span>{value}. {String(opt)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white">
          <audio ref={listeningAudioRef} preload="auto" />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!selectedMocks.listening?.[`audio_part_${listeningPart}`] || !listeningAudioLoaded}
              onClick={() => {
                const audio = listeningAudioRef.current;
                if (!audio) return;
                if (listeningAudioPlaying) {
                  audio.pause();
                } else {
                  audio.play();
                }
              }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {listeningAudioPlaying ? "Pause Audio" : "Play Audio"}
            </button>
            <div className="min-w-[180px] flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${listeningAudioProgress}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const audio = listeningAudioRef.current;
                if (!audio) return;
                audio.muted = !listeningMuted;
                setListeningMuted(!listeningMuted);
              }}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm"
            >
              {listeningMuted ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={listeningVolume}
              onChange={(e) => {
                const nextVolume = Number(e.target.value);
                setListeningVolume(nextVolume);
                if (listeningAudioRef.current) {
                  listeningAudioRef.current.volume = nextVolume;
                }
              }}
            />
            {!selectedMocks.listening?.[`audio_part_${listeningPart}`] && (
              <p className="text-sm text-amber-300">This part has no audio file.</p>
            )}
            {selectedMocks.listening?.[`audio_part_${listeningPart}`] && !listeningAudioLoaded && (
              <p className="text-sm text-slate-300">Loading audio...</p>
            )}
          </div>
        </div>

        {listeningPart === 2 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 2</h3>
            {part2.map((item, idx) => (
              <div key={`p2-${idx}`} className="mb-3">
                <p className="text-sm mb-1">{stripHtml(item?.before)} ____ {stripHtml(item?.after)}</p>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={listeningAnswers.part2[idx] || ""}
                  onChange={(e) => {
                    const next = [...listeningAnswers.part2];
                    next[idx] = e.target.value;
                    setListeningAnswers((prev) => ({ ...prev, part2: next }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {listeningPart === 3 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 3</h3>
            {(part3?.speakers || []).map((speaker, idx) => (
              <div key={`p3-${idx}`} className="mb-3">
                <p className="text-sm mb-1">{speaker}</p>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={listeningAnswers.part3[idx] || ""}
                  onChange={(e) => {
                    const next = [...listeningAnswers.part3];
                    next[idx] = e.target.value;
                    setListeningAnswers((prev) => ({ ...prev, part3: next }));
                  }}
                >
                  <option value="">Select</option>
                  {(part3?.options || []).map((opt, optIdx) => {
                    const label = String.fromCharCode(65 + optIdx);
                    return (
                      <option key={`${idx}-${label}`} value={label}>
                        {label}. {String(opt)}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>
        )}

        {listeningPart === 4 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 4 (Map)</h3>
            {part4?.mapUrl && (
              <img
                src={part4.mapUrl}
                alt="Listening map"
                className="w-full max-h-[420px] object-contain rounded-lg border border-slate-200 mb-4 bg-slate-50"
              />
            )}
            {(part4?.questions || []).map((q, idx) => (
              <div key={`p4-${idx}`} className="mb-3">
                <p className="text-sm mb-1">{q?.place || `Question ${idx + 1}`}</p>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={listeningAnswers.part4[idx] || ""}
                  onChange={(e) => {
                    const next = [...listeningAnswers.part4];
                    next[idx] = e.target.value;
                    setListeningAnswers((prev) => ({ ...prev, part4: next }));
                  }}
                >
                  <option value="">Select</option>
                  {(part4?.mapLabels || []).map((label) => (
                    <option key={`p4-${idx}-${label}`} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {listeningPart === 5 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 5</h3>
            {part5.map((extract, extractIdx) => {
              const extractedQuestions = Array.isArray(extract?.questions)
                ? extract.questions
                : [extract?.q1, extract?.q2].filter(Boolean);

              return (
                <div key={`p5-${extractIdx}`} className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold mb-2">
                    {extract?.name || extract?.text || `Extract ${extractIdx + 1}`}
                  </p>
                  {extractedQuestions.map((q, idx) => {
                    part5GlobalIdx += 1;
                    const qOptions = Array.isArray(q?.options) ? q.options : [];
                    return (
                      <div key={`p5-${extractIdx}-${idx}`} className="mb-3">
                        <p className="text-sm mb-1">{q?.text || q?.question || `Question ${idx + 1}`}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {qOptions.map((opt, optIdx) => {
                            const value = String.fromCharCode(65 + optIdx);
                            return (
                              <label
                                key={`p5-${extractIdx}-${idx}-${value}`}
                                className="flex gap-2 items-center text-sm"
                              >
                                <input
                                  type="radio"
                                  name={`listening-p5-${part5GlobalIdx}`}
                                  value={value}
                                  checked={listeningAnswers.part5[part5GlobalIdx] === value}
                                  onChange={(e) => {
                                    const next = [...listeningAnswers.part5];
                                    next[part5GlobalIdx] = e.target.value;
                                    setListeningAnswers((prev) => ({ ...prev, part5: next }));
                                  }}
                                />
                                <span>{value}. {String(opt)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {listeningPart === 6 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Part 6</h3>
            {part6.map((q, idx) => (
              <div key={`p6-${idx}`} className="mb-3">
                <p className="text-sm mb-1">{stripHtml(q?.before)} ____ {stripHtml(q?.after)}</p>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={listeningAnswers.part6[idx] || ""}
                  onChange={(e) => {
                    const next = [...listeningAnswers.part6];
                    next[idx] = e.target.value;
                    setListeningAnswers((prev) => ({ ...prev, part6: next }));
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReading = () => {
    const mock = selectedMocks.reading;
    if (!mock) {
      return (
        <div className="rounded-xl bg-white p-5 border border-slate-200 text-slate-600">
          Reading mock not available.
        </div>
      );
    }
    const p1Text = mock?.part1?.text || "";
    const p2Statements = mock?.part2?.statements || [];
    const p2Texts = mock?.part2?.texts || [];
    const p3Headings = mock?.part3?.headings || [];
    const p3Paragraphs = mock?.part3?.paragraphs || [];
    const p4MC = mock?.part4?.multipleChoice || [];
    const p4TF = mock?.part4?.trueFalse || [];
    const p4Text = mock?.part4?.text || "";
    const p5MainText = mock?.part5?.mainText || "";
    const p5MiniText = mock?.part5?.miniText || "";
    const p5MC = mock?.part5?.multipleChoice || [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">{mock?.title || "Reading"}</h2>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((partNo) => (
            <button
              key={`reading-part-${partNo}`}
              onClick={() => setReadingPart(partNo)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-semibold border",
                readingPart === partNo
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-300 text-slate-700",
              ].join(" ")}
            >
              Part {partNo}
            </button>
          ))}
        </div>

        {readingPart === 1 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold mb-3">Part 1</h3>
            {renderGapText(
              p1Text,
              readingAnswers.part1,
              (idx, value) => {
                const next = [...readingAnswers.part1];
                next[idx] = value;
                setReadingAnswers((prev) => ({ ...prev, part1: next }));
              },
              "reading-p1"
            )}
          </div>
        )}

        {readingPart === 2 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold mb-3">Part 2</h3>
            {p2Texts.length > 0 && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {p2Texts.map((text, idx) => (
                  <div key={`p2-text-${idx}`} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <p className="font-semibold mb-1">Text {idx + 1}</p>
                    {renderRichText(text, "whitespace-pre-wrap")}
                  </div>
                ))}
              </div>
            )}
            {p2Statements.map((statement, idx) => (
              <div key={`rp2-${idx}`} className="mb-3">
                <div className="text-sm mb-1 flex gap-1">
                  <span>{idx + 1}.</span>
                  <div className="flex-1">{renderRichText(statement)}</div>
                </div>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={readingAnswers.part2[idx] || ""}
                  onChange={(e) => {
                    const next = [...readingAnswers.part2];
                    next[idx] = e.target.value;
                    setReadingAnswers((prev) => ({ ...prev, part2: next }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {readingPart === 3 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold mb-3">Part 3</h3>
            {p3Headings.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Available Headings</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {p3Headings.map((h, idx) => (
                    <p key={`p3-h-${idx}`}>{idx + 1}. {h}</p>
                  ))}
                </div>
              </div>
            )}
            {p3Paragraphs.map((paragraph, idx) => (
              <div key={`rp3-${idx}`} className="mb-3">
                <div className="text-sm mb-1 flex gap-1">
                  <span>{idx + 1}.</span>
                  <div className="flex-1">{renderRichText(paragraph)}</div>
                </div>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={readingAnswers.part3[idx] || ""}
                  onChange={(e) => {
                    const next = [...readingAnswers.part3];
                    next[idx] = e.target.value;
                    setReadingAnswers((prev) => ({ ...prev, part3: next }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {readingPart === 4 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold mb-3">Part 4</h3>
            {p4Text && renderRichText(p4Text, "text-sm text-slate-600 mb-4 whitespace-pre-wrap")}
            <h4 className="font-semibold mb-2">Multiple Choice</h4>
            {p4MC.map((q, idx) => (
              <div key={`rp4mc-${idx}`} className="mb-4 p-3 rounded-lg bg-slate-50">
                {renderRichText(q?.question || `Question ${idx + 1}`, "font-semibold mb-2")}
                {(q?.options || []).map((opt, optIdx) => {
                  const value = String.fromCharCode(65 + optIdx);
                  return (
                    <label key={`rp4mc-${idx}-${value}`} className="flex gap-2 items-center text-sm mb-1">
                      <input
                        type="radio"
                        name={`reading-p4mc-${idx}`}
                        value={value}
                        checked={readingAnswers.part4MC[idx] === value}
                        onChange={(e) => {
                          const next = [...readingAnswers.part4MC];
                          next[idx] = e.target.value;
                          setReadingAnswers((prev) => ({ ...prev, part4MC: next }));
                        }}
                      />
                      <span>{value}. {String(opt)}</span>
                    </label>
                  );
                })}
              </div>
            ))}
            <h4 className="font-semibold mb-2 mt-6">True / False / Not Given</h4>
            {p4TF.map((item, idx) => (
              <div key={`rp4tf-${idx}`} className="mb-3">
                {renderRichText(item?.statement || `Statement ${idx + 1}`, "text-sm mb-1")}
                <div className="flex flex-wrap gap-3">
                  {["True", "False", "Not Given"].map((opt) => (
                    <label key={`rp4tf-${idx}-${opt}`} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`reading-p4tf-${idx}`}
                        value={opt}
                        checked={readingAnswers.part4TF[idx] === opt}
                        onChange={(e) => {
                          const next = [...readingAnswers.part4TF];
                          next[idx] = e.target.value;
                          setReadingAnswers((prev) => ({ ...prev, part4TF: next }));
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {readingPart === 5 && (
          <div className="rounded-xl bg-white p-5 border border-slate-200">
            <h3 className="font-bold mb-3">Part 5</h3>
            {p5MainText && renderRichText(p5MainText, "text-sm text-slate-600 mb-4 whitespace-pre-wrap")}
            {p5MiniText && (
              <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {renderGapText(
                  p5MiniText,
                  readingAnswers.part5Mini,
                  (idx, value) => {
                    const next = [...readingAnswers.part5Mini];
                    next[idx] = value;
                    setReadingAnswers((prev) => ({ ...prev, part5Mini: next }));
                  },
                  "reading-p5"
                )}
              </div>
            )}
            {p5MC.map((q, idx) => (
              <div key={`rp5mc-${idx}`} className="mb-3 p-3 rounded-lg bg-slate-50">
                {renderRichText(q?.question || `Question ${idx + 1}`, "font-semibold mb-2")}
                {(q?.options || []).map((opt, optIdx) => {
                  const value = String.fromCharCode(65 + optIdx);
                  return (
                    <label key={`rp5mc-${idx}-${value}`} className="flex gap-2 items-center text-sm mb-1">
                      <input
                        type="radio"
                        name={`reading-p5mc-${idx}`}
                        value={value}
                        checked={readingAnswers.part5MC[idx] === value}
                        onChange={(e) => {
                          const next = [...readingAnswers.part5MC];
                          next[idx] = e.target.value;
                          setReadingAnswers((prev) => ({ ...prev, part5MC: next }));
                        }}
                      />
                      <span>{value}. {String(opt)}</span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWriting = () => {
    const mock = selectedMocks.writing;
    if (!mock) {
      return (
        <div className="rounded-xl bg-white p-5 border border-slate-200 text-slate-600">
          Writing mock not available.
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Writing</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "t11", label: "Task 1.1" },
            { key: "t12", label: "Task 1.2" },
            { key: "t2", label: "Task 2" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setWritingTask(item.key)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-semibold border",
                writingTask === item.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-300 text-slate-700",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200">
          {writingTask !== "t2" && mock?.task1?.scenario && (
            <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">SCENARIO</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{mock.task1.scenario}</p>
            </div>
          )}
          {writingTask !== "t2" && mock?.task1?.context && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 mb-1">CONTEXT</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{mock.task1.context}</p>
            </div>
          )}

          {writingTask === "t11" && (
            <>
              <h3 className="font-bold mb-2">Task 1.1 Prompt</h3>
              <p className="text-sm text-slate-600 mb-3">{mock?.task1?.task11 || "N/A"}</p>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-32"
                value={writingAnswers.t11}
                onChange={(e) => setWritingAnswers((prev) => ({ ...prev, t11: e.target.value }))}
              />
            </>
          )}

          {writingTask === "t12" && (
            <>
              <h3 className="font-bold mb-2">Task 1.2 Prompt</h3>
              <p className="text-sm text-slate-600 mb-3">{mock?.task1?.task12 || "N/A"}</p>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-40"
                value={writingAnswers.t12}
                onChange={(e) => setWritingAnswers((prev) => ({ ...prev, t12: e.target.value }))}
              />
            </>
          )}

          {writingTask === "t2" && (
            <>
              <h3 className="font-bold mb-2">Task 2 Prompt</h3>
              <p className="text-sm text-slate-600 mb-3">{mock?.task2?.task2 || "N/A"}</p>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-52"
                value={writingAnswers.t2}
                onChange={(e) => setWritingAnswers((prev) => ({ ...prev, t2: e.target.value }))}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSpeaking = () => {
    if (!selectedMocks.speaking) {
      return (
        <div className="rounded-xl bg-white p-5 border border-slate-200 text-slate-600">
          Speaking mock not available.
        </div>
      );
    }

    if (!speakingQuestions.length) {
      return (
        <div className="rounded-xl bg-white p-5 border border-slate-200 text-slate-600">
          Speaking savollar topilmadi.
        </div>
      );
    }

    const q = speakingQuestions[speakingIndex];
    const total = speakingQuestions.length;
    if (!q) return null;
    const raw = selectedMocks.speaking?.questions?.questions || selectedMocks.speaking?.questions || {};
    const localIndex = Number(q.key.split("-")[1] || 0);
    const fullQuestion = raw?.[q.part]?.[localIndex] || {};

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Speaking</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Question {speakingIndex + 1} / {total} of {getQuestionCountLabel(selectedMocks.speaking?.questions?.questions || selectedMocks.speaking?.questions || {})}
          </p>
          <div className="flex gap-2">
            <button
              disabled={speakingIndex === 0}
              onClick={() => setSpeakingIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={speakingIndex === total - 1}
              onClick={() => setSpeakingIndex((prev) => Math.min(total - 1, prev + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200">
          <p className="text-xs font-semibold text-blue-600 mb-1">Part {q.part}</p>
          <p className="font-semibold mb-2">{speakingIndex + 1}. {q.questionText}</p>

          {fullQuestion?.image_url && (
            <img
              src={fullQuestion.image_url}
              alt="Speaking prompt"
              className="w-full max-h-[420px] object-contain rounded-lg border border-slate-200 mb-3 bg-slate-50"
            />
          )}
          {Array.isArray(fullQuestion?.images) && fullQuestion.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {fullQuestion.images.map((url, idx) =>
                url ? (
                  <img
                    key={`sp-img-${idx}`}
                    src={url}
                    alt={`Speaking prompt ${idx + 1}`}
                    className="w-full max-h-[320px] object-contain rounded-lg border border-slate-200 bg-slate-50"
                  />
                ) : null
              )}
            </div>
          )}

          {q.bullets.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-slate-600 mb-3">
              {q.bullets.map((b, bIdx) => (
                <li key={`${q.key}-b-${bIdx}`}>{b}</li>
              ))}
            </ul>
          )}

          {(q.forPoints.length > 0 || q.againstPoints.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="font-semibold text-green-700 mb-1">For</p>
                {q.forPoints.map((p, pIdx) => (
                  <p key={`${q.key}-for-${pIdx}`}>- {p}</p>
                ))}
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="font-semibold text-red-700 mb-1">Against</p>
                {q.againstPoints.map((p, pIdx) => (
                  <p key={`${q.key}-against-${pIdx}`}>- {p}</p>
                ))}
              </div>
            </div>
          )}

          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-28"
            placeholder="Optional fallback text (if no audio)"
            value={speakingAnswers[q.key] || ""}
            onChange={(e) =>
              setSpeakingAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
            }
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              disabled={Boolean(recordingQuestionKey) && recordingQuestionKey !== q.key}
              onClick={() => startSpeakingRecording(q.key)}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {recordingQuestionKey === q.key ? "Recording..." : "Start Recording"}
            </button>
            <button
              disabled={recordingQuestionKey !== q.key}
              onClick={stopSpeakingRecording}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              Stop
            </button>
            {speakingRecordings[q.key] && (
              <audio controls src={speakingRecordings[q.key]} className="h-10" />
            )}
          </div>
        </div>
        {busy && speakingAiStatus && (
          <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
            {speakingAiStatus}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Full mock loading...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg w-full bg-white rounded-xl border border-red-200 p-6 text-center">
          <p className="text-red-600 font-semibold mb-4">{loadError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Retry
            </button>
            <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-slate-300">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-2xl bg-white/95 border border-white/50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-500 tracking-wider">MOCKSTREAM CERTIFICATE</p>
            <h1 className="text-4xl font-black text-slate-900 mt-2">CEFR Full Mock Result</h1>
            <p className="text-slate-600 mt-2">Listening + Reading + Writing + Speaking</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {SECTION_ORDER.map((key) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">{key}</p>
                  <p className="text-3xl font-bold text-slate-900">{scores[key]}</p>
                  <p className="text-xs text-slate-500">/ 75</p>
                </div>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-blue-600 text-white px-6 py-3">
              <span className="text-sm uppercase tracking-wider">Overall</span>
              <span className="text-2xl font-black">{overallScore}/75</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 border border-white/50 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">AI Suggestions & Analyses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold mb-2">Writing Analysis</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {aiData.writing?.overall_feedback || "Writing AI feedback not available."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold mb-2">Speaking Analysis</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {extractSpeakingAdvice(aiData.speakingRaw) || "Speaking AI feedback not available."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => nav("/dashboard")}
              className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-lg border border-slate-300 bg-white font-semibold"
            >
              Try Another Full Mock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg mb-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">CEFR Full Mock</h1>
              <p className="text-sm text-slate-600 mt-1">
                Order: Listening, Reading, Writing, Speaking
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isSectionChecked && !allDone && (
                <div
                  className={[
                    "px-3 py-2 rounded-lg text-sm font-bold",
                    timeLeft <= 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700",
                  ].join(" ")}
                >
                  Timer: {formatTime(timeLeft)}
                </div>
              )}
              <Link to="/dashboard" className="text-sm px-3 py-2 rounded-lg border border-slate-300">
                Exit
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {SECTION_ORDER.map((key, idx) => (
              <div
                key={key}
                className={[
                  "rounded-lg px-3 py-2 border text-sm font-semibold",
                  idx === currentSection
                    ? "bg-blue-600 text-white border-blue-600"
                    : scores[key] !== null
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200",
                ].join(" ")}
              >
                {idx + 1}. {key}
                {scores[key] !== null ? ` (${scores[key]}/75)` : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-5 md:p-6">
          {sectionKey === "listening" && renderListening()}
          {sectionKey === "reading" && renderReading()}
          {sectionKey === "writing" && renderWriting()}
          {sectionKey === "speaking" && renderSpeaking()}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            disabled={currentSection === 0 || busy}
            onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              disabled={busy}
              onClick={submitCurrentSection}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
            >
              {busy ? "Checking..." : isSectionChecked ? "Re-check Section" : "Submit Section"}
            </button>

            <button
              disabled={busy || !isSectionChecked}
              onClick={() => {
                if (currentSection < SECTION_ORDER.length - 1) {
                  setCurrentSection((prev) => prev + 1);
                }
              }}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
