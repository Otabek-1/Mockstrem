import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

const makePart1 = () => ({ options: ["", "", ""], answer: "" });
const makePart2 = () => ({ label: "", before: "", after: "", answer: "" });
const makePart4Question = () => ({ place: "", answer: "" });
const makePart5Question = () => ({ text: "", options: ["", "", ""], answer: "" });
const makePart5Extract = () => ({ name: "", questions: [makePart5Question(), makePart5Question()] });
const makePart6 = () => ({ before: "", after: "", answer: "" });

export default function ListeningMockForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = params.get("edit") === "true";
  const mockId = params.get("id");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [audios, setAudios] = useState({ part_1: "", part_2: "", part_3: "", part_4: "", part_5: "", part_6: "" });

  const [part1, setPart1] = useState([makePart1(), makePart1(), makePart1()]);
  const [part2, setPart2] = useState([makePart2(), makePart2(), makePart2()]);
  const [part3, setPart3] = useState({ speakers: ["", "", ""], options: ["", "", ""], answers: ["", "", ""] });
  const [part4, setPart4] = useState({ mapUrl: "", mapLabels: ["A", "B", "C", "D", "E"], questions: [makePart4Question(), makePart4Question()] });
  const [part5, setPart5] = useState([makePart5Extract()]);
  const [part6, setPart6] = useState([makePart6(), makePart6(), makePart6()]);

  useEffect(() => {
    if (!isEdit || !mockId) return;

    const load = async () => {
      try {
        setLoading(true);
        const [mockRes, answerRes] = await Promise.all([
          api.get(`/cefr/listening/${mockId}`),
          api.get(`/cefr/listening/answer/${mockId}`).catch(() => ({ data: null })),
        ]);

        const mock = mockRes.data;
        const ans = answerRes.data;

        setTitle(mock?.title || "");
        setAudios({
          part_1: mock?.audio_part_1 || "",
          part_2: mock?.audio_part_2 || "",
          part_3: mock?.audio_part_3 || "",
          part_4: mock?.audio_part_4 || "",
          part_5: mock?.audio_part_5 || "",
          part_6: mock?.audio_part_6 || "",
        });

        const p1 = Array.isArray(mock?.data?.part_1) ? mock.data.part_1 : [];
        setPart1(p1.length ? p1.map((opts, idx) => ({ options: Array.isArray(opts) ? opts : ["", "", ""], answer: ans?.part_1?.[idx] || "" })) : [makePart1()]);

        const p2 = Array.isArray(mock?.data?.part_2) ? mock.data.part_2 : [];
        setPart2(p2.length ? p2.map((q, idx) => ({ label: q?.label || "", before: q?.before || "", after: q?.after || "", answer: ans?.part_2?.[idx] || "" })) : [makePart2()]);

        const p3 = mock?.data?.part_3 || {};
        const speakers = Array.isArray(p3?.speakers) && p3.speakers.length ? p3.speakers : [""];
        const answers = Array.isArray(ans?.part_3) ? ans.part_3 : speakers.map(() => "");
        setPart3({
          speakers,
          options: Array.isArray(p3?.options) && p3.options.length ? p3.options : [""],
          answers: speakers.map((_, i) => answers[i] || ""),
        });

        const p4 = mock?.data?.part_4 || {};
        const p4q = Array.isArray(p4?.questions) ? p4.questions : [];
        setPart4({
          mapUrl: p4?.mapUrl || "",
          mapLabels: Array.isArray(p4?.mapLabels) && p4.mapLabels.length ? p4.mapLabels : ["A", "B", "C"],
          questions: p4q.length
            ? p4q.map((q, idx) => ({ place: q?.place || "", answer: ans?.part_4?.[idx] || "" }))
            : [makePart4Question()],
        });

        const p5 = Array.isArray(mock?.data?.part_5) ? mock.data.part_5 : [];
        let p5AnswerIndex = 0;
        setPart5(
          p5.length
            ? p5.map((extract) => {
                const rawQuestions = Array.isArray(extract?.questions) ? extract.questions : [];
                const questions = rawQuestions.length
                  ? rawQuestions.map((qq) => {
                      const answer = ans?.part_5?.[p5AnswerIndex] || "";
                      p5AnswerIndex += 1;
                      return {
                        text: qq?.text || "",
                        options: Array.isArray(qq?.options) && qq.options.length ? qq.options : ["", "", ""],
                        answer,
                      };
                    })
                  : [makePart5Question()];
                return { name: extract?.name || "", questions };
              })
            : [makePart5Extract()]
        );

        const p6 = Array.isArray(mock?.data?.part_6?.questions) ? mock.data.part_6.questions : [];
        setPart6(
          p6.length
            ? p6.map((q, idx) => ({ before: q?.before || "", after: q?.after || "", answer: ans?.part_6?.[idx] || "" }))
            : [makePart6()]
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, mockId]);

  const totalQuestions = useMemo(() => part1.length + part2.length + part3.speakers.length + part4.questions.length + part5.reduce((a, b) => a + b.questions.length, 0) + part6.length, [part1, part2, part3, part4, part5, part6]);

  const save = async () => {
    try {
      setSaving(true);

      const dataPayload = {
        part_1: part1.map((q) => q.options),
        part_2: part2.map((q) => ({ label: q.label, before: q.before, after: q.after })),
        part_3: { speakers: part3.speakers, options: part3.options },
        part_4: {
          mapUrl: part4.mapUrl,
          mapLabels: part4.mapLabels,
          questions: part4.questions.map((q, idx) => ({ num: 19 + idx, place: q.place })),
        },
        part_5: part5.map((extract, idx) => ({
          name: extract.name || `Extract ${idx + 1}`,
          questions: extract.questions.map((q) => ({ text: q.text, options: q.options })),
        })),
        part_6: {
          questions: part6.map((q, idx) => ({ num: 30 + idx, before: q.before, after: q.after })),
        },
      };

      const answerPayload = {
        part_1: part1.map((q) => q.answer),
        part_2: part2.map((q) => q.answer),
        part_3: part3.answers,
        part_4: part4.questions.map((q) => q.answer),
        part_5: part5.flatMap((extract) => extract.questions.map((q) => q.answer)),
        part_6: part6.map((q) => q.answer),
      };

      const mockPayload = {
        title,
        data: dataPayload,
        audio_part_1: audios.part_1,
        audio_part_2: audios.part_2,
        audio_part_3: audios.part_3,
        audio_part_4: audios.part_4,
        audio_part_5: audios.part_5,
        audio_part_6: audios.part_6,
      };

      if (isEdit && mockId) {
        await api.put(`/cefr/listening/update/${mockId}`, mockPayload);
        await api.put(`/cefr/listening/answer/update/${mockId}`, answerPayload);
      } else {
        const res = await api.post("/cefr/listening/create", mockPayload);
        await api.post(`/cefr/listening/answer/create/${res.data.id}`, answerPayload);
      }

      alert("Saved successfully");
      navigate("/admin/dashboard");
    } catch (e) {
      alert("Saving error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{isEdit ? "Edit" : "Create"} CEFR Listening Mock</h1>
      <p className="text-sm text-slate-600 mb-6">Flexible builder: savol sonini istalgancha qo‘shish/o‘chirish mumkin. Total: {totalQuestions}</p>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <h3 className="font-semibold mb-3">Audio URLs</h3>
        {Object.keys(audios).map((key) => (
          <div key={key} className="mb-2">
            <label className="block text-xs text-slate-600 mb-1">{key.replace("_", " ")}</label>
            <input
              className="w-full border rounded p-2"
              value={audios[key]}
              onChange={(e) => setAudios((p) => ({ ...p, [key]: e.target.value }))}
              placeholder="https://...mp3"
            />
          </div>
        ))}
      </div>

      <Section title={`Part 1 Multiple Choice (${part1.length})`} onAdd={() => setPart1((p) => [...p, makePart1()])}>
        {part1.map((q, idx) => (
          <Card key={`p1-${idx}`} onRemove={() => setPart1((p) => p.length <= 1 ? p : p.filter((_, i) => i !== idx))}>
            {q.options.map((opt, oIdx) => (
              <input key={oIdx} className="w-full border rounded p-2 mb-2" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={(e) => setPart1((p) => p.map((item, i) => i !== idx ? item : { ...item, options: item.options.map((oo, oi) => oi === oIdx ? e.target.value : oo) }))} />
            ))}
            <input className="w-full border rounded p-2 bg-emerald-50" placeholder="Correct answer (A/B/C...)" value={q.answer} onChange={(e) => setPart1((p) => p.map((item, i) => i === idx ? { ...item, answer: e.target.value } : item))} />
          </Card>
        ))}
      </Section>

      <Section title={`Part 2 Sentence Completion (${part2.length})`} onAdd={() => setPart2((p) => [...p, makePart2()])}>
        {part2.map((q, idx) => (
          <Card key={`p2-${idx}`} onRemove={() => setPart2((p) => p.length <= 1 ? p : p.filter((_, i) => i !== idx))}>
            <input className="w-full border rounded p-2 mb-2" placeholder="Label" value={q.label} onChange={(e) => setPart2((p) => p.map((item, i) => i === idx ? { ...item, label: e.target.value } : item))} />
            <input className="w-full border rounded p-2 mb-2" placeholder="Before" value={q.before} onChange={(e) => setPart2((p) => p.map((item, i) => i === idx ? { ...item, before: e.target.value } : item))} />
            <input className="w-full border rounded p-2 mb-2" placeholder="After" value={q.after} onChange={(e) => setPart2((p) => p.map((item, i) => i === idx ? { ...item, after: e.target.value } : item))} />
            <input className="w-full border rounded p-2 bg-emerald-50" placeholder="Correct answer" value={q.answer} onChange={(e) => setPart2((p) => p.map((item, i) => i === idx ? { ...item, answer: e.target.value } : item))} />
          </Card>
        ))}
      </Section>

      <Section title={`Part 3 Matching (speakers: ${part3.speakers.length}, options: ${part3.options.length})`} onAdd={() => setPart3((p) => ({ ...p, speakers: [...p.speakers, ""], answers: [...p.answers, ""] }))}>
        <p className="text-xs text-slate-600">Speakers</p>
        {part3.speakers.map((sp, idx) => (
          <div key={`sp-${idx}`} className="flex gap-2 mb-2">
            <input className="flex-1 border rounded p-2" value={sp} onChange={(e) => setPart3((p) => ({ ...p, speakers: p.speakers.map((s, i) => i === idx ? e.target.value : s) }))} placeholder={`Speaker ${idx + 1}`} />
            <input className="w-40 border rounded p-2 bg-emerald-50" value={part3.answers[idx] || ""} onChange={(e) => setPart3((p) => ({ ...p, answers: p.answers.map((a, i) => i === idx ? e.target.value : a) }))} placeholder="Correct (A/B...)" />
            <button className="px-2 rounded bg-red-100" onClick={() => setPart3((p) => p.speakers.length <= 1 ? p : ({ ...p, speakers: p.speakers.filter((_, i) => i !== idx), answers: p.answers.filter((_, i) => i !== idx) }))}>-</button>
          </div>
        ))}
        <p className="text-xs text-slate-600 mt-3">Options</p>
        {part3.options.map((op, idx) => (
          <div key={`op-${idx}`} className="flex gap-2 mb-2">
            <input className="flex-1 border rounded p-2" value={op} onChange={(e) => setPart3((p) => ({ ...p, options: p.options.map((o, i) => i === idx ? e.target.value : o) }))} placeholder={`Option ${String.fromCharCode(65 + idx)}`} />
            <button className="px-2 rounded bg-red-100" onClick={() => setPart3((p) => p.options.length <= 1 ? p : ({ ...p, options: p.options.filter((_, i) => i !== idx) }))}>-</button>
          </div>
        ))}
        <button className="px-3 py-1 rounded bg-slate-900 text-white text-xs" onClick={() => setPart3((p) => ({ ...p, options: [...p.options, ""] }))}>+ Add option</button>
      </Section>

      <Section title={`Part 4 Map (${part4.questions.length})`} onAdd={() => setPart4((p) => ({ ...p, questions: [...p.questions, makePart4Question()] }))}>
        <input className="w-full border rounded p-2 mb-2" value={part4.mapUrl} onChange={(e) => setPart4((p) => ({ ...p, mapUrl: e.target.value }))} placeholder="Map URL" />
        <input className="w-full border rounded p-2 mb-3" value={part4.mapLabels.join(", ")} onChange={(e) => setPart4((p) => ({ ...p, mapLabels: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} placeholder="Map labels: A,B,C,D" />
        {part4.questions.map((q, idx) => (
          <Card key={`p4-${idx}`} onRemove={() => setPart4((p) => ({ ...p, questions: p.questions.length <= 1 ? p.questions : p.questions.filter((_, i) => i !== idx) }))}>
            <input className="w-full border rounded p-2 mb-2" value={q.place} onChange={(e) => setPart4((p) => ({ ...p, questions: p.questions.map((it, i) => i === idx ? { ...it, place: e.target.value } : it) }))} placeholder="Place" />
            <input className="w-full border rounded p-2 bg-emerald-50" value={q.answer} onChange={(e) => setPart4((p) => ({ ...p, questions: p.questions.map((it, i) => i === idx ? { ...it, answer: e.target.value } : it) }))} placeholder="Correct label" />
          </Card>
        ))}
      </Section>

      <Section title={`Part 5 Extracts (${part5.length})`} onAdd={() => setPart5((p) => [...p, makePart5Extract()])}>
        {part5.map((extract, eIdx) => (
          <div key={`extract-${eIdx}`} className="border rounded p-3 mb-3 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm">Extract {eIdx + 1}</p>
              <button className="px-2 rounded bg-red-100" onClick={() => setPart5((p) => p.length <= 1 ? p : p.filter((_, i) => i !== eIdx))}>Remove extract</button>
            </div>
            <input className="w-full border rounded p-2 mb-2" value={extract.name} onChange={(e) => setPart5((p) => p.map((it, i) => i === eIdx ? { ...it, name: e.target.value } : it))} placeholder="Extract name" />
            {extract.questions.map((qq, qIdx) => (
              <div key={`eq-${eIdx}-${qIdx}`} className="border rounded p-2 mb-2 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold">Question {qIdx + 1}</p>
                  <button className="px-2 rounded bg-red-100 text-xs" onClick={() => setPart5((p) => p.map((it, i) => i !== eIdx ? it : { ...it, questions: it.questions.length <= 1 ? it.questions : it.questions.filter((_, j) => j !== qIdx) }))}>-</button>
                </div>
                <input className="w-full border rounded p-2 mb-2" value={qq.text} onChange={(e) => setPart5((p) => p.map((it, i) => i !== eIdx ? it : { ...it, questions: it.questions.map((q2, j) => j === qIdx ? { ...q2, text: e.target.value } : q2) }))} placeholder="Question text" />
                {qq.options.map((op, oIdx) => (
                  <input key={oIdx} className="w-full border rounded p-2 mb-1" value={op} onChange={(e) => setPart5((p) => p.map((it, i) => i !== eIdx ? it : { ...it, questions: it.questions.map((q2, j) => j !== qIdx ? q2 : { ...q2, options: q2.options.map((oo, oi) => oi === oIdx ? e.target.value : oo) }) }))} placeholder={`Option ${oIdx + 1}`} />
                ))}
                <input className="w-full border rounded p-2 mb-1 bg-emerald-50" value={qq.answer} onChange={(e) => setPart5((p) => p.map((it, i) => i !== eIdx ? it : { ...it, questions: it.questions.map((q2, j) => j === qIdx ? { ...q2, answer: e.target.value } : q2) }))} placeholder="Correct answer" />
              </div>
            ))}
            <button className="px-3 py-1 rounded bg-slate-900 text-white text-xs" onClick={() => setPart5((p) => p.map((it, i) => i === eIdx ? { ...it, questions: [...it.questions, makePart5Question()] } : it))}>+ Add question</button>
          </div>
        ))}
      </Section>

      <Section title={`Part 6 Completion (${part6.length})`} onAdd={() => setPart6((p) => [...p, makePart6()])}>
        {part6.map((q, idx) => (
          <Card key={`p6-${idx}`} onRemove={() => setPart6((p) => p.length <= 1 ? p : p.filter((_, i) => i !== idx))}>
            <input className="w-full border rounded p-2 mb-2" value={q.before} onChange={(e) => setPart6((p) => p.map((it, i) => i === idx ? { ...it, before: e.target.value } : it))} placeholder="Before" />
            <input className="w-full border rounded p-2 mb-2" value={q.after} onChange={(e) => setPart6((p) => p.map((it, i) => i === idx ? { ...it, after: e.target.value } : it))} placeholder="After" />
            <input className="w-full border rounded p-2 bg-emerald-50" value={q.answer} onChange={(e) => setPart6((p) => p.map((it, i) => i === idx ? { ...it, answer: e.target.value } : it))} placeholder="Correct answer" />
          </Card>
        ))}
      </Section>

      <button disabled={saving} onClick={save} className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60">
        {saving ? "Saving..." : isEdit ? "Update Mock" : "Create Mock"}
      </button>
    </div>
  );
}

function Section({ title, onAdd, children }) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <button className="px-3 py-1 rounded bg-slate-900 text-white text-xs" onClick={onAdd}>+ Add</button>
      </div>
      {children}
    </div>
  );
}

function Card({ children, onRemove }) {
  return (
    <div className="border rounded p-3 mb-2 bg-slate-50">
      <div className="flex justify-end mb-2">
        <button className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs" onClick={onRemove}>Remove</button>
      </div>
      {children}
    </div>
  );
}

