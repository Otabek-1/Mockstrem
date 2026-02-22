import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, XCircle } from "lucide-react";
import api from "../api";

const MODULES = ["reading", "listening", "writing", "speaking"];

const TEMPLATES = {
  reading: {
    questions: [
      { prompt: "Question 1", type: "text" },
      { prompt: "Question 2", type: "text" }
    ]
  },
  listening: {
    audio_parts: [
      { title: "Part 1", url: "https://example.com/listening-part1.mp3" },
      { title: "Part 2", url: "https://example.com/listening-part2.mp3" }
    ],
    questions: [
      { prompt: "Question 1", options: ["A", "B", "C", "D"], type: "choice" },
      { prompt: "Question 2", options: ["A", "B", "C", "D"], type: "choice" }
    ]
  },
  writing: {
    tasks: [
      { prompt: "Task 1 prompt", min_words: 150 },
      { prompt: "Task 2 prompt", min_words: 250 }
    ]
  },
  speaking: {
    stages: [
      { prompt: "Part 1 intro questions" },
      { prompt: "Part 2 cue card" },
      { prompt: "Part 3 follow-up" }
    ]
  }
};

function parseJsonSafe(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return fallback;
  }
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
    section_content_json: JSON.stringify(TEMPLATES[defaultModule], null, 2),
    answer_key_text: "",
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
    setForm((prev) => ({
      ...prev,
      section_content_json: JSON.stringify(TEMPLATES[activeModule], null, 2),
      answer_key_text: "",
      section_title: `${activeModule.toUpperCase()} Section`,
      section_duration_minutes: activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60,
      duration_minutes: activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60,
    }));
  }, [activeModule]);

  const clearForm = () => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      exam_track: "academic",
      level: "Band 6-7",
      duration_minutes: activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60,
      is_published: true,
      tags_csv: "",
      section_title: `${activeModule.toUpperCase()} Section`,
      section_instructions: "",
      section_duration_minutes: activeModule === "listening" ? 40 : activeModule === "speaking" ? 14 : 60,
      section_content_json: JSON.stringify(TEMPLATES[activeModule], null, 2),
      answer_key_text: "",
    }));
  };

  const onEdit = (test) => {
    const section = test.sections.find((item) => item.module === activeModule);
    if (!section) return;

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
      section_content_json: JSON.stringify(section.content || {}, null, 2),
      answer_key_text: Array.isArray(section.answer_key) ? section.answer_key.join("\n") : "",
    });
  };

  const saveTest = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      exam_track: form.exam_track,
      level: form.level.trim() || "Band 6-7",
      duration_minutes: Number(form.duration_minutes),
      is_published: Boolean(form.is_published),
      tags: form.tags_csv.split(",").map((item) => item.trim()).filter(Boolean),
      meta: { source: "admin-panel" },
      sections: [
        {
          module: activeModule,
          title: form.section_title.trim() || `${activeModule.toUpperCase()} Section`,
          instructions: form.section_instructions,
          duration_minutes: Number(form.section_duration_minutes),
          content: parseJsonSafe(form.section_content_json, TEMPLATES[activeModule]),
          answer_key: form.answer_key_text
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          order_index: 1,
        },
      ],
    };

    if (!payload.title) {
      alert("Title required");
      return;
    }

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
      alert("Saving failed. JSON formatni tekshiring.");
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
        <p className="text-sm text-slate-600 mt-1">CRUD, publish flow, CDI section templates, submissions monitoring.</p>

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

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Section Content JSON</p>
              <textarea value={form.section_content_json} onChange={(e) => setForm((p) => ({ ...p, section_content_json: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2 min-h-44 font-mono text-xs" />
              {activeModule === "listening" && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Listening uchun `audio_parts` qo‘shing. Har part: {"{"}title, url{"}"} (`.mp3`, `.wav`, `.m4a` va boshqalar).
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Answer Key (one answer per line)</p>
              <textarea value={form.answer_key_text} onChange={(e) => setForm((p) => ({ ...p, answer_key_text: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2 min-h-24 font-mono text-xs" placeholder="A&#10;B&#10;C" />
            </div>

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
                  <td>{item.score ?? "-"}{item.max_score ? `/${item.max_score}` : ""}</td>
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

