import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";

const makeQuestion = (id, extra = {}) => ({
  id,
  question_text: "",
  prep_time: 10,
  speak_time: 45,
  ...extra,
});

function nextIdFromState(state) {
  const all = Object.values(state).flat();
  const maxId = all.reduce((m, q) => Math.max(m, Number(q.id || 0)), 0);
  return maxId + 1;
}

export default function SpeakingMockForm() {
  const [params] = useSearchParams();
  const edit = params.get("edit") === "true";
  const mockId = params.get("id");

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState({
    "1.1": [makeQuestion(1, { prep_time: 5, speak_time: 30, image_url: "" })],
    "1.2": [makeQuestion(2, { prep_time: 10, speak_time: 45, images: [] })],
    "2": [makeQuestion(3, { prep_time: 60, speak_time: 120, bullets: [] })],
    "3": [makeQuestion(4, { prep_time: 60, speak_time: 120, for_points: [], against_points: [] })],
  });

  useEffect(() => {
    if (!edit || !mockId) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/mock/speaking/mock/${mockId}`);
        const qData = res.data?.questions?.questions || res.data?.questions || questions;
        setTitle(res.data?.title || "");
        setQuestions({
          "1.1": Array.isArray(qData["1.1"]) && qData["1.1"].length ? qData["1.1"] : [makeQuestion(1, { prep_time: 5, speak_time: 30, image_url: "" })],
          "1.2": Array.isArray(qData["1.2"]) && qData["1.2"].length ? qData["1.2"] : [makeQuestion(2, { prep_time: 10, speak_time: 45, images: [] })],
          "2": Array.isArray(qData["2"]) && qData["2"].length ? qData["2"] : [makeQuestion(3, { prep_time: 60, speak_time: 120, bullets: [] })],
          "3": Array.isArray(qData["3"]) && qData["3"].length ? qData["3"] : [makeQuestion(4, { prep_time: 60, speak_time: 120, for_points: [], against_points: [] })],
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [edit, mockId]);

  const update = (part, idx, key, value) => {
    setQuestions((prev) => ({
      ...prev,
      [part]: prev[part].map((q, i) => (i === idx ? { ...q, [key]: value } : q)),
    }));
  };

  const addQuestion = (part) => {
    const id = nextIdFromState(questions);
    let base = { prep_time: 10, speak_time: 45 };
    if (part === "1.1") base = { prep_time: 5, speak_time: 30, image_url: "" };
    if (part === "1.2") base = { prep_time: 10, speak_time: 45, images: [] };
    if (part === "2") base = { prep_time: 60, speak_time: 120, bullets: [] };
    if (part === "3") base = { prep_time: 60, speak_time: 120, for_points: [], against_points: [] };

    setQuestions((prev) => ({ ...prev, [part]: [...prev[part], makeQuestion(id, base)] }));
  };

  const removeQuestion = (part, idx) => {
    setQuestions((prev) => ({
      ...prev,
      [part]: prev[part].length <= 1 ? prev[part] : prev[part].filter((_, i) => i !== idx),
    }));
  };

  const submit = async () => {
    if (!title.trim()) {
      alert("Mock nomini kiriting");
      return;
    }

    try {
      setSaving(true);
      const body = { title, questions };

      if (edit && mockId) {
        await api.put(`/mock/speaking/update/${mockId}`, body);
      } else {
        await api.post(`/mock/speaking/create?title=${encodeURIComponent(title)}`, body);
      }
      alert("Saved successfully");
      window.history.back();
    } catch {
      alert("Saving failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{edit ? "Edit" : "Create"} CEFR Speaking Mock</h1>
      <p className="text-sm text-slate-600 mb-6">Moslashuvchan builder: har partga savol qo‘shish/o‘chirish mumkin.</p>

      <div className="bg-white border rounded-lg p-4 mb-4">
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <PartSection title={`Part 1.1 (${questions["1.1"].length})`} onAdd={() => addQuestion("1.1")}>
        {questions["1.1"].map((q, idx) => (
          <QuestionCard key={`11-${idx}`} onRemove={() => removeQuestion("1.1", idx)}>
            <BaseQuestionFields q={q} onChange={(key, value) => update("1.1", idx, key, value)} />
            <input className="w-full border rounded p-2" value={q.image_url || ""} onChange={(e) => update("1.1", idx, "image_url", e.target.value)} placeholder="Image URL (optional)" />
          </QuestionCard>
        ))}
      </PartSection>

      <PartSection title={`Part 1.2 (${questions["1.2"].length})`} onAdd={() => addQuestion("1.2")}>
        {questions["1.2"].map((q, idx) => (
          <QuestionCard key={`12-${idx}`} onRemove={() => removeQuestion("1.2", idx)}>
            <BaseQuestionFields q={q} onChange={(key, value) => update("1.2", idx, key, value)} />
            <input
              className="w-full border rounded p-2"
              value={Array.isArray(q.images) ? q.images.join(", ") : ""}
              onChange={(e) => update("1.2", idx, "images", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))}
              placeholder="Images URLs separated by comma"
            />
          </QuestionCard>
        ))}
      </PartSection>

      <PartSection title={`Part 2 (${questions["2"].length})`} onAdd={() => addQuestion("2")}>
        {questions["2"].map((q, idx) => (
          <QuestionCard key={`2-${idx}`} onRemove={() => removeQuestion("2", idx)}>
            <BaseQuestionFields q={q} onChange={(key, value) => update("2", idx, key, value)} />
            <textarea
              className="w-full border rounded p-2 min-h-20"
              value={Array.isArray(q.bullets) ? q.bullets.join("\n") : ""}
              onChange={(e) => update("2", idx, "bullets", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
              placeholder="Bullets (one per line)"
            />
          </QuestionCard>
        ))}
      </PartSection>

      <PartSection title={`Part 3 (${questions["3"].length})`} onAdd={() => addQuestion("3")}>
        {questions["3"].map((q, idx) => (
          <QuestionCard key={`3-${idx}`} onRemove={() => removeQuestion("3", idx)}>
            <BaseQuestionFields q={q} onChange={(key, value) => update("3", idx, key, value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <textarea
                className="w-full border rounded p-2 min-h-20"
                value={Array.isArray(q.for_points) ? q.for_points.join("\n") : ""}
                onChange={(e) => update("3", idx, "for_points", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
                placeholder="FOR points (one per line)"
              />
              <textarea
                className="w-full border rounded p-2 min-h-20"
                value={Array.isArray(q.against_points) ? q.against_points.join("\n") : ""}
                onChange={(e) => update("3", idx, "against_points", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
                placeholder="AGAINST points (one per line)"
              />
            </div>
          </QuestionCard>
        ))}
      </PartSection>

      <button disabled={saving} onClick={submit} className="px-5 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60">
        {saving ? "Saving..." : edit ? "Update Mock" : "Create Mock"}
      </button>
    </div>
  );
}

function BaseQuestionFields({ q, onChange }) {
  return (
    <div className="space-y-2">
      <input className="w-full border rounded p-2" value={q.question_text || ""} onChange={(e) => onChange("question_text", e.target.value)} placeholder="Question text" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" className="border rounded p-2" value={q.prep_time || 0} onChange={(e) => onChange("prep_time", Number(e.target.value || 0))} placeholder="Prep time" />
        <input type="number" className="border rounded p-2" value={q.speak_time || 0} onChange={(e) => onChange("speak_time", Number(e.target.value || 0))} placeholder="Speak time" />
      </div>
    </div>
  );
}

function PartSection({ title, onAdd, children }) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <button className="px-3 py-1 rounded bg-slate-900 text-white text-xs" onClick={onAdd}>+ Add</button>
      </div>
      {children}
    </div>
  );
}

function QuestionCard({ children, onRemove }) {
  return (
    <div className="border rounded p-3 mb-2 bg-slate-50">
      <div className="flex justify-end mb-2">
        <button className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs" onClick={onRemove}>Remove</button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

