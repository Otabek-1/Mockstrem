import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, XCircle } from "lucide-react";
import api from "../api";

const MODULES = ["reading", "listening", "writing", "speaking"];

const createQuestion = (withOptions = false) => ({
  prompt: "",
  type: withOptions ? "choice" : "text",
  options: withOptions ? ["", "", "", ""] : [],
  answer: "",
});

const createAudioPart = () => ({ title: "", url: "" });
const createWritingTask = () => ({ prompt: "", min_words: 150, image_urls: [] });
const createSpeakingStage = () => ({ prompt: "", prep_seconds: 60, speak_seconds: 120 });

function normalizeQuestion(raw) {
  return {
    prompt: raw?.prompt || "",
    type: raw?.type || (Array.isArray(raw?.options) && raw.options.length > 0 ? "choice" : "text"),
    options: Array.isArray(raw?.options) ? raw.options : [],
    answer: raw?.answer || "",
  };
}

function ensureMinArray(arr, min, factory) {
  const out = Array.isArray(arr) ? [...arr] : [];
  while (out.length < min) out.push(factory());
  return out;
}

export default function IeltsManager({ defaultModule = "reading" }) {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModule, setActiveModule] = useState(defaultModule);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    exam_track: "academic",
    level: "Band 6-7",
    duration_minutes: 60,
    is_published: true,
    tags_csv: "",
    section_title: "",
    section_instructions: "",
    section_duration_minutes: 60,

    questions: [createQuestion(false), createQuestion(false), createQuestion(false)],
    audio_parts: [createAudioPart()],
    writing_tasks: [createWritingTask(), createWritingTask()],
    speaking_stages: [createSpeakingStage(), createSpeakingStage(), createSpeakingStage()],
  });

  const filteredTests = useMemo(
    () => tests.filter((test) => test.sections?.some((section) => section.module === activeModule)),
    [tests, activeModule]
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      const [testsRes, submissionsRes] = await Promise.all([
        api.get("/ielts/tests?published_only=false"),
        api.get("/ielts/submissions/admin?limit=80"),
      ]);
      setTests(Array.isArray(testsRes.data?.tests) ? testsRes.data.tests : []);
      setSubmissions(Array.isArray(submissionsRes.data?.submissions) ? submissionsRes.data.submissions : []);
    } catch {
      setTests([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const baseMinutes = activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60;
    setForm((prev) => ({
      ...prev,
      duration_minutes: baseMinutes,
      section_title: `${activeModule.toUpperCase()} Section`,
      section_duration_minutes: baseMinutes,
      questions:
        activeModule === "listening"
          ? [createQuestion(true), createQuestion(true), createQuestion(true)]
          : activeModule === "reading"
          ? [createQuestion(false), createQuestion(false), createQuestion(false)]
          : prev.questions,
      audio_parts: [createAudioPart()],
      writing_tasks: [createWritingTask(), createWritingTask()],
      speaking_stages: [createSpeakingStage(), createSpeakingStage(), createSpeakingStage()],
    }));
    setEditingId(null);
  }, [activeModule]);

  const clearForm = () => {
    const baseMinutes = activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60;
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      exam_track: "academic",
      level: "Band 6-7",
      duration_minutes: baseMinutes,
      is_published: true,
      tags_csv: "",
      section_title: `${activeModule.toUpperCase()} Section`,
      section_instructions: "",
      section_duration_minutes: baseMinutes,
      questions:
        activeModule === "listening"
          ? [createQuestion(true), createQuestion(true), createQuestion(true)]
          : activeModule === "reading"
          ? [createQuestion(false), createQuestion(false), createQuestion(false)]
          : [],
      audio_parts: [createAudioPart()],
      writing_tasks: [createWritingTask(), createWritingTask()],
      speaking_stages: [createSpeakingStage(), createSpeakingStage(), createSpeakingStage()],
    });
  };

  const onEdit = (test) => {
    const section = test.sections.find((item) => item.module === activeModule);
    if (!section) return;

    const content = section.content || {};
    const answerKey = Array.isArray(section.answer_key) ? section.answer_key : [];

    const normalizedQuestions = Array.isArray(content.questions)
      ? content.questions.map((q, idx) => {
          const normalized = normalizeQuestion(q);
          normalized.answer = q?.answer || answerKey[idx] || "";
          return normalized;
        })
      : [];

    setEditingId(test.id);
    setForm({
      title: test.title || "",
      description: test.description || "",
      exam_track: test.exam_track || "academic",
      level: test.level || "Band 6-7",
      duration_minutes: test.duration_minutes || section.duration_minutes || 60,
      is_published: Boolean(test.is_published),
      tags_csv: Array.isArray(test.tags) ? test.tags.join(", ") : "",
      section_title: section.title || "",
      section_instructions: section.instructions || "",
      section_duration_minutes: section.duration_minutes || 60,
      questions:
        activeModule === "reading"
          ? ensureMinArray(normalizedQuestions, 1, () => createQuestion(false))
          : activeModule === "listening"
          ? ensureMinArray(normalizedQuestions, 1, () => createQuestion(true))
          : [],
      audio_parts:
        activeModule === "listening"
          ? ensureMinArray(content.audio_parts || (content.audio_url ? [{ title: "Main Audio", url: content.audio_url }] : []), 1, createAudioPart)
          : [createAudioPart()],
      writing_tasks:
        activeModule === "writing"
          ? ensureMinArray(content.tasks || [], 2, createWritingTask).map((task) => ({
              prompt: task?.prompt || "",
              min_words: Number(task?.min_words || 150),
              image_urls: Array.isArray(task?.image_urls)
                ? task.image_urls
                : task?.image_url
                ? [task.image_url]
                : [],
            }))
          : [createWritingTask(), createWritingTask()],
      speaking_stages:
        activeModule === "speaking"
          ? ensureMinArray(content.stages || [], 1, createSpeakingStage).map((stage) => ({
              prompt: stage?.prompt || "",
              prep_seconds: Number(stage?.prep_seconds || stage?.prep_time || 60),
              speak_seconds: Number(stage?.speak_seconds || stage?.speak_time || 120),
            }))
          : [createSpeakingStage(), createSpeakingStage(), createSpeakingStage()],
    });
  };

  const updateQuestion = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.questions];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, questions: next };
    });
  };

  const updateQuestionOption = (qIndex, optionIndex, value) => {
    setForm((prev) => {
      const next = [...prev.questions];
      const opts = [...(next[qIndex].options || [])];
      opts[optionIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return { ...prev, questions: next };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion(activeModule === "listening")],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => {
      if (prev.questions.length <= 1) return prev;
      return { ...prev, questions: prev.questions.filter((_, idx) => idx !== index) };
    });
  };

  const updateAudioPart = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.audio_parts];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, audio_parts: next };
    });
  };

  const addAudioPart = () => setForm((prev) => ({ ...prev, audio_parts: [...prev.audio_parts, createAudioPart()] }));
  const removeAudioPart = (index) =>
    setForm((prev) => ({
      ...prev,
      audio_parts: prev.audio_parts.length <= 1 ? prev.audio_parts : prev.audio_parts.filter((_, idx) => idx !== index),
    }));

  const updateWritingTask = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.writing_tasks];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, writing_tasks: next };
    });
  };

  const addWritingTask = () => setForm((prev) => ({ ...prev, writing_tasks: [...prev.writing_tasks, createWritingTask()] }));
  const removeWritingTask = (index) =>
    setForm((prev) => ({
      ...prev,
      writing_tasks: prev.writing_tasks.length <= 1 ? prev.writing_tasks : prev.writing_tasks.filter((_, idx) => idx !== index),
    }));

  const updateSpeakingStage = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.speaking_stages];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, speaking_stages: next };
    });
  };

  const addSpeakingStage = () => setForm((prev) => ({ ...prev, speaking_stages: [...prev.speaking_stages, createSpeakingStage()] }));
  const removeSpeakingStage = (index) =>
    setForm((prev) => ({
      ...prev,
      speaking_stages: prev.speaking_stages.length <= 1 ? prev.speaking_stages : prev.speaking_stages.filter((_, idx) => idx !== index),
    }));

  const buildModulePayload = () => {
    if (activeModule === "reading") {
      const questions = form.questions.map((q) => ({ prompt: q.prompt, type: "text" }));
      const answer_key = form.questions.map((q) => q.answer || "");
      return { content: { questions }, answer_key };
    }

    if (activeModule === "listening") {
      const questions = form.questions.map((q) => ({
        prompt: q.prompt,
        type: q.type || "choice",
        options: q.type === "choice" ? q.options : [],
      }));
      const audio_parts = form.audio_parts.filter((item) => item.url?.trim()).map((item) => ({
        title: item.title?.trim() || "Part",
        url: item.url.trim(),
      }));
      const answer_key = form.questions.map((q) => q.answer || "");
      return { content: { questions, audio_parts }, answer_key };
    }

    if (activeModule === "writing") {
      const tasks = form.writing_tasks
        .filter((task) => task.prompt.trim())
        .map((task) => ({
          prompt: task.prompt.trim(),
          min_words: Number(task.min_words || 150),
          image_urls: Array.isArray(task.image_urls) ? task.image_urls.filter((url) => String(url).trim()) : [],
        }));
      return { content: { tasks }, answer_key: [] };
    }

    const stages = form.speaking_stages
      .filter((stage) => stage.prompt.trim())
      .map((stage) => ({
        prompt: stage.prompt.trim(),
        prep_seconds: Number(stage.prep_seconds || 60),
        speak_seconds: Number(stage.speak_seconds || 120),
      }));
    return { content: { stages }, answer_key: [] };
  };

  const saveTest = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Title required");
      return;
    }

    const modulePayload = buildModulePayload();
    if (activeModule === "reading" || activeModule === "listening") {
      const hasEmptyPrompt = modulePayload.content.questions.some((q) => !q.prompt?.trim());
      if (hasEmptyPrompt) {
        alert("Savol matnlarini to'liq kiriting");
        return;
      }
    }

    if (activeModule === "writing" && modulePayload.content.tasks.length === 0) {
      alert("Kamida bitta writing task kiriting");
      return;
    }
    if (activeModule === "speaking" && modulePayload.content.stages.length === 0) {
      alert("Kamida bitta speaking stage kiriting");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      exam_track: form.exam_track,
      level: form.level.trim() || "Band 6-7",
      duration_minutes: Number(form.duration_minutes),
      is_published: Boolean(form.is_published),
      tags: form.tags_csv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      meta: { source: "admin-panel" },
      sections: [
        {
          module: activeModule,
          title: form.section_title.trim() || `${activeModule.toUpperCase()} Section`,
          instructions: form.section_instructions,
          duration_minutes: Number(form.section_duration_minutes),
          content: modulePayload.content,
          answer_key: modulePayload.answer_key,
          order_index: 1,
        },
      ],
    };

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/ielts/tests/${editingId}`, payload);
      } else {
        await api.post("/ielts/tests", payload);
      }
      clearForm();
      await loadAll();
    } catch {
      alert("Saving failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeTest = async (id) => {
    if (!window.confirm("Delete this IELTS test?")) return;
    try {
      await api.delete(`/ielts/tests/${id}`);
      await loadAll();
      if (editingId === id) clearForm();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <section className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="rounded-2xl bg-white border border-slate-200 shadow p-5 mb-5">
        <h2 className="text-3xl font-black text-slate-800">IELTS Admin Ecosystem</h2>
        <p className="text-sm text-slate-600 mt-1">JSONsiz, input-based mock builder. Savol soni moslashuvchan.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {MODULES.map((module) => (
            <button
              key={module}
              onClick={() => setActiveModule(module)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                activeModule === module ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {module.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 rounded-2xl bg-white border border-slate-200 shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">{activeModule.toUpperCase()} Test Bank</h3>
            <button onClick={clearForm} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-1">
              <Plus size={14} /> New Test
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              {filteredTests.map((test) => {
                const section = test.sections.find((item) => item.module === activeModule);
                return (
                  <article key={test.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-800">{test.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{test.exam_track} • {test.level} • {section?.duration_minutes || test.duration_minutes} min</p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{test.description || "No description"}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${test.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {test.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => onEdit(test)} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs inline-flex items-center gap-1">
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => removeTest(test.id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs inline-flex items-center gap-1">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </article>
                );
              })}
              {filteredTests.length === 0 && <p className="text-slate-500">No tests in this module.</p>}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 shadow p-5">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{editingId ? `Edit #${editingId}` : "Create Test"}</h3>
          <form onSubmit={saveTest} className="space-y-3">
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full border border-slate-300 rounded-lg p-2" />
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border border-slate-300 rounded-lg p-2 min-h-20" />

            <div className="grid grid-cols-2 gap-2">
              <select value={form.exam_track} onChange={(e) => setForm((p) => ({ ...p, exam_track: e.target.value }))} className="border border-slate-300 rounded-lg p-2">
                <option value="academic">Academic</option>
                <option value="general">General</option>
              </select>
              <input value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} placeholder="Band range" className="border border-slate-300 rounded-lg p-2" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.duration_minutes} onChange={(e) => setForm((p) => ({ ...p, duration_minutes: e.target.value }))} placeholder="Total minutes" className="border border-slate-300 rounded-lg p-2" />
              <label className="flex items-center gap-2 text-sm text-slate-700 border border-slate-300 rounded-lg p-2">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} />
                Published
              </label>
            </div>

            <input value={form.tags_csv} onChange={(e) => setForm((p) => ({ ...p, tags_csv: e.target.value }))} placeholder="Tags: map, essay, T/F" className="w-full border border-slate-300 rounded-lg p-2" />
            <input value={form.section_title} onChange={(e) => setForm((p) => ({ ...p, section_title: e.target.value }))} placeholder="Section title" className="w-full border border-slate-300 rounded-lg p-2" />
            <textarea value={form.section_instructions} onChange={(e) => setForm((p) => ({ ...p, section_instructions: e.target.value }))} placeholder="Section instructions" className="w-full border border-slate-300 rounded-lg p-2 min-h-16" />
            <input type="number" value={form.section_duration_minutes} onChange={(e) => setForm((p) => ({ ...p, section_duration_minutes: e.target.value }))} placeholder="Section minutes" className="w-full border border-slate-300 rounded-lg p-2" />

            {(activeModule === "reading" || activeModule === "listening") && (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Questions ({form.questions.length})</p>
                  <button type="button" onClick={addQuestion} className="text-xs px-2 py-1 rounded bg-slate-900 text-white">+ Add</button>
                </div>
                {form.questions.map((q, idx) => (
                  <div key={`q-${idx}`} className="rounded border border-slate-200 bg-white p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">Q{idx + 1}</p>
                      <button type="button" onClick={() => removeQuestion(idx)} className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700">Remove</button>
                    </div>
                    <input
                      value={q.prompt}
                      onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
                      placeholder="Question prompt"
                      className="w-full border border-slate-300 rounded p-2 text-sm"
                    />
                    {activeModule === "listening" && (
                      <>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                          className="w-full border border-slate-300 rounded p-2 text-sm"
                        >
                          <option value="choice">Choice</option>
                          <option value="text">Text</option>
                        </select>
                        {q.type === "choice" && (
                          <div className="grid grid-cols-2 gap-2">
                            {(q.options || []).map((opt, oIdx) => (
                              <input
                                key={`q-${idx}-o-${oIdx}`}
                                value={opt}
                                onChange={(e) => updateQuestionOption(idx, oIdx, e.target.value)}
                                placeholder={`Option ${oIdx + 1}`}
                                className="border border-slate-300 rounded p-2 text-sm"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <input
                      value={q.answer}
                      onChange={(e) => updateQuestion(idx, "answer", e.target.value)}
                      placeholder="Correct answer"
                      className="w-full border border-emerald-300 rounded p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeModule === "listening" && (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Audio Parts ({form.audio_parts.length})</p>
                  <button type="button" onClick={addAudioPart} className="text-xs px-2 py-1 rounded bg-slate-900 text-white">+ Add Audio</button>
                </div>
                {form.audio_parts.map((item, idx) => (
                  <div key={`audio-${idx}`} className="rounded border border-slate-200 bg-white p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">Audio {idx + 1}</p>
                      <button type="button" onClick={() => removeAudioPart(idx)} className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700">Remove</button>
                    </div>
                    <input
                      value={item.title}
                      onChange={(e) => updateAudioPart(idx, "title", e.target.value)}
                      placeholder="Part title"
                      className="w-full border border-slate-300 rounded p-2 text-sm"
                    />
                    <input
                      value={item.url}
                      onChange={(e) => updateAudioPart(idx, "url", e.target.value)}
                      placeholder="https://...mp3"
                      className="w-full border border-slate-300 rounded p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeModule === "writing" && (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Writing Tasks ({form.writing_tasks.length})</p>
                  <button type="button" onClick={addWritingTask} className="text-xs px-2 py-1 rounded bg-slate-900 text-white">+ Add Task</button>
                </div>
                {form.writing_tasks.map((task, idx) => (
                  <div key={`task-${idx}`} className="rounded border border-slate-200 bg-white p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">Task {idx + 1}</p>
                      <button type="button" onClick={() => removeWritingTask(idx)} className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700">Remove</button>
                    </div>
                    <textarea
                      value={task.prompt}
                      onChange={(e) => updateWritingTask(idx, "prompt", e.target.value)}
                      placeholder="Task prompt"
                      className="w-full border border-slate-300 rounded p-2 text-sm min-h-20"
                    />
                    <input
                      type="number"
                      value={task.min_words}
                      onChange={(e) => updateWritingTask(idx, "min_words", e.target.value)}
                      placeholder="Min words"
                      className="w-full border border-slate-300 rounded p-2 text-sm"
                    />
                    <input
                      value={Array.isArray(task.image_urls) ? task.image_urls.join(", ") : ""}
                      onChange={(e) =>
                        updateWritingTask(
                          idx,
                          "image_urls",
                          e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Image URLs (comma separated)"
                      className="w-full border border-slate-300 rounded p-2 text-sm"
                    />
                    {Array.isArray(task.image_urls) && task.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {task.image_urls.map((url, imageIdx) => (
                          <img
                            key={`task-${idx}-img-${imageIdx}`}
                            src={url}
                            alt={`task-${idx}-diagram-${imageIdx}`}
                            className="w-full h-20 object-cover rounded border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeModule === "speaking" && (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Speaking Stages ({form.speaking_stages.length})</p>
                  <button type="button" onClick={addSpeakingStage} className="text-xs px-2 py-1 rounded bg-slate-900 text-white">+ Add Stage</button>
                </div>
                {form.speaking_stages.map((stage, idx) => (
                  <div key={`stage-${idx}`} className="rounded border border-slate-200 bg-white p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">Stage {idx + 1}</p>
                      <button type="button" onClick={() => removeSpeakingStage(idx)} className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700">Remove</button>
                    </div>
                    <textarea
                      value={stage.prompt}
                      onChange={(e) => updateSpeakingStage(idx, "prompt", e.target.value)}
                      placeholder="Stage prompt"
                      className="w-full border border-slate-300 rounded p-2 text-sm min-h-20"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={stage.prep_seconds}
                        onChange={(e) => updateSpeakingStage(idx, "prep_seconds", e.target.value)}
                        placeholder="Prep seconds"
                        className="border border-slate-300 rounded p-2 text-sm"
                      />
                      <input
                        type="number"
                        value={stage.speak_seconds}
                        onChange={(e) => updateSpeakingStage(idx, "speak_seconds", e.target.value)}
                        placeholder="Speak seconds"
                        className="border border-slate-300 rounded p-2 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button disabled={saving} type="submit" className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white inline-flex items-center justify-center gap-1 disabled:opacity-60">
                <Save size={14} /> {saving ? "Saving..." : "Save"}
              </button>
              {editingId && (
                <button type="button" onClick={clearForm} className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 inline-flex items-center gap-1">
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow p-5">
        <h3 className="text-xl font-bold text-slate-800 mb-3">Latest IELTS Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="py-2">ID</th>
                <th>User</th>
                <th>Test</th>
                <th>Module</th>
                <th>Score</th>
                <th>Band</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2">#{item.id}</td>
                  <td>{item.user?.username || "user"}</td>
                  <td>{item.test?.title || "test"}</td>
                  <td>{item.module}</td>
                  <td>
                    {item.score ?? "-"}
                    {item.max_score ? `/${item.max_score}` : ""}
                  </td>
                  <td>{item.band || "-"}</td>
                  <td>{item.time_spent_seconds || 0}s</td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && <p className="text-slate-500 py-3">No submissions yet.</p>}
        </div>
      </div>
    </section>
  );
}

