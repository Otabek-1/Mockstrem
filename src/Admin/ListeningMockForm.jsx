import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

/* ===================== HELPERS ===================== */

function Section({ title, children }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border rounded-lg mb-6 bg-white dark:bg-gray-800">
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer px-4 py-3 border-b font-semibold flex justify-between"
            >
                <span>{title}</span>
                <span>{open ? "−" : "+"}</span>
            </div>
            {open && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
}

function AudioInput({ label, value, onChange }) {
    return (
        <div>
            <label className="block font-medium mb-1">{label}</label>
            <input
                className="w-full p-2 border rounded"
                placeholder="https://archive.org/..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && <audio className="mt-2" controls src={value} />}
        </div>
    );
}

/* ===================== FILE PARSER ===================== */

function parseFileContent(fileContent, fileName) {
    try {
        if (fileName.endsWith('.json')) {
            return JSON.parse(fileContent);
        } else if (fileName.endsWith('.csv')) {
            // CSV parser - custom format
            return parseCSV(fileContent);
        } else {
            alert("Faqat .json yoki .csv fayllar qabul qilinadi");
            return null;
        }
    } catch (error) {
        alert("Fayl parse qilishda xato: " + error.message);
        return null;
    }
}

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const data = {
        title: "",
        audios: {
            part_1: "", part_2: "", part_3: "", part_4: "", part_5: "", part_6: ""
        },
        part1: [], part2: [], part3: {}, part4: {}, part5: [], part6: []
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
        else if (line.startsWith('[AUDIOS]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const audioLine = lines[i].trim();
                if (audioLine && !audioLine.startsWith('#')) {
                    const parts = audioLine.split('|');
                    if (parts.length === 2) {
                        const key = parts[0].trim();
                        const url = parts[1].trim();
                        if (key in data.audios) {
                            data.audios[key] = url;
                        }
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART1]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    // Format: options|opt1;opt2;opt3|answer|A
                    const parts = qLine.split('|');
                    const parsed = {};
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.options) {
                        const opts = parsed.options.split(';').map(o => o.trim());
                        data.part1.push({
                            options: opts.length === 3 ? opts : [opts[0] || "", opts[1] || "", opts[2] || ""],
                            answer: parsed.answer || ""
                        });
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART2]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    // Format: label|Label Text|before|Before Text|after|After Text|answer|Answer
                    const parsed = {};
                    const parts = qLine.split('|');
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.label && parsed.before && ('after' in parsed) && parsed.answer) {
                        data.part2.push({
                            label: parsed.label,
                            before: parsed.before,
                            after: parsed.after || "",
                            answer: parsed.answer
                        });
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART3]')) {
            const part3Data = { speakers: [], options: [], answers: [] };
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts[1].trim();
                        if (key === 'speakers') {
                            part3Data.speakers = value.split(';').map(s => s.trim());
                        } else if (key === 'options') {
                            part3Data.options = value.split(';').map(s => s.trim());
                        } else if (key === 'answers') {
                            part3Data.answers = value.split(';').map(s => s.trim());
                        }
                    }
                }
                i++;
            }
            data.part3 = part3Data;
        }
        else if (line.startsWith('[PART4]')) {
            const part4Data = { mapUrl: "", mapLabels: [], questions: [] };
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    const parts = qLine.split('|');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        if (key === 'mapUrl') {
                            part4Data.mapUrl = parts[1].trim();
                        } else if (key === 'mapLabels') {
                            part4Data.mapLabels = parts[1].trim().split(';').map(s => s.trim());
                        } else if (key.startsWith('question')) {
                            // Format: questionN|place|Place Name|answer|Label
                            const q = {};
                            for (let j = 1; j < parts.length; j += 2) {
                                const fKey = parts[j].trim();
                                const fVal = parts[j + 1]?.trim() || "";
                                q[fKey] = fVal;
                            }
                            if (q.place && q.answer) {
                                part4Data.questions.push({
                                    place: q.place,
                                    answer: q.answer
                                });
                            }
                        }
                    }
                }
                i++;
            }
            data.part4 = part4Data;
        }
        else if (line.startsWith('[PART5]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    // Format: extractN|text|Text|q1_question|Q1|q1_options|opt1;opt2;opt3|q1_answer|A|q2_question|Q2|q2_options|opt1;opt2;opt3|q2_answer|B
                    const parsed = {};
                    const parts = qLine.split('|');
                    for (let j = 1; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    
                    const extract = {
                        text: parsed.text || "",
                        q1: {
                            question: parsed.q1_question || "",
                            options: (parsed.q1_options || "").split(';').map(o => o.trim()).filter(o => o),
                            answer: parsed.q1_answer || ""
                        },
                        q2: {
                            question: parsed.q2_question || "",
                            options: (parsed.q2_options || "").split(';').map(o => o.trim()).filter(o => o),
                            answer: parsed.q2_answer || ""
                        }
                    };
                    
                    // Ensure we have 3 options for each question
                    if (extract.q1.options.length < 3) {
                        while (extract.q1.options.length < 3) extract.q1.options.push("");
                    }
                    if (extract.q2.options.length < 3) {
                        while (extract.q2.options.length < 3) extract.q2.options.push("");
                    }
                    
                    if (extract.q1.question && extract.q2.question) {
                        data.part5.push(extract);
                    }
                }
                i++;
            }
        }
        else if (line.startsWith('[PART6]')) {
            while (i < lines.length && !lines[i].startsWith('[')) {
                const qLine = lines[i].trim();
                if (qLine && !qLine.startsWith('#')) {
                    // Format: before|Before Text|after|After Text|answer|Answer
                    const parsed = {};
                    const parts = qLine.split('|');
                    for (let j = 0; j < parts.length; j += 2) {
                        const key = parts[j].trim();
                        const value = parts[j + 1]?.trim() || "";
                        parsed[key] = value;
                    }
                    if (parsed.before && ('after' in parsed) && parsed.answer) {
                        data.part6.push({
                            before: parsed.before,
                            after: parsed.after || "",
                            answer: parsed.answer
                        });
                    }
                }
                i++;
            }
        }
    }

    return data;
}

/* ===================== MAIN ===================== */

export default function ListeningMockForm() {
    /* -------- BASIC -------- */
    const [title, setTitle] = useState("");
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const isEdit = params.get("edit") === "true";
    const mockId = params.get("id");

    useEffect(() => {
        if (!isEdit || !mockId) return;

        async function loadMock() {
            // ===== MOCK =====
            const mockRes = await api.get(`/cefr/listening/${mockId}`);
            const m = mockRes.data;

            setTitle(m.title);

            setAudios({
                part_1: m.audio_part_1,
                part_2: m.audio_part_2,
                part_3: m.audio_part_3,
                part_4: m.audio_part_4,
                part_5: m.audio_part_5,
                part_6: m.audio_part_6,
            });

            // ===== PART 1 =====
            setPart1(
                m.data.part_1.map((opts) => ({
                    options: opts,
                    answer: "",
                }))
            );

            // ===== PART 2 =====
            setPart2(
                m.data.part_2.map((q) => ({
                    label: q.label,
                    before: q.before,
                    after: q.after,
                    answer: "",
                }))
            );

            // ===== PART 3 =====
            setPart3({
                speakers: m.data.part_3.speakers,
                options: m.data.part_3.options,
                answers: ["", "", "", ""],
            });

            // ===== PART 4 =====
            setPart4({
                mapUrl: m.data.part_4.mapUrl,
                mapLabels: m.data.part_4.mapLabels,
                questions: m.data.part_4.questions.map((q) => ({
                    place: q.place,
                    answer: "",
                })),
            });

            // ===== PART 5 =====
            setPart5(
                m.data.part_5.map((ex) => ({
                    text: ex.name,
                    q1: {
                        question: ex.questions[0].text,
                        options: ex.questions[0].options,
                        answer: "",
                    },
                    q2: {
                        question: ex.questions[1].text,
                        options: ex.questions[1].options,
                        answer: "",
                    },
                }))
            );

            // ===== PART 6 =====
            setPart6(
                m.data.part_6.questions.map((q) => ({
                    before: q.before,
                    after: q.after,
                    answer: "",
                }))
            );

            // ===== ANSWERS =====
            try {
                const ansRes = await api.get(`/cefr/listening/answer/${mockId}`);
                const a = ansRes.data;

                setPart1((p) => p.map((q, i) => ({ ...q, answer: a.part_1[i] })));
                setPart2((p) => p.map((q, i) => ({ ...q, answer: a.part_2[i] })));
                setPart3((p) => ({ ...p, answers: a.part_3 }));
                setPart4((p) => ({
                    ...p,
                    questions: p.questions.map((q, i) => ({
                        ...q,
                        answer: a.part_4[i],
                    })),
                }));

                setPart5((p) =>
                    p.map((ex, i) => ({
                        ...ex,
                        q1: { ...ex.q1, answer: a.part_5[i * 2] },
                        q2: { ...ex.q2, answer: a.part_5[i * 2 + 1] },
                    }))
                );

                setPart6((p) => p.map((q, i) => ({ ...q, answer: a.part_6[i] })));
            } catch { }
        }

        loadMock();
    }, [isEdit, mockId]);


    const [audios, setAudios] = useState({
        part_1: "",
        part_2: "",
        part_3: "",
        part_4: "",
        part_5: "",
        part_6: "",
    });

    /* -------- PART 1 -------- */
    const [part1, setPart1] = useState(
        Array.from({ length: 8 }, () => ({
            options: ["", "", ""],
            answer: "",
        }))
    );

    /* -------- PART 2 -------- */
    const [part2, setPart2] = useState(
        Array.from({ length: 6 }, () => ({
            label: "",
            before: "",
            after: "",
            answer: "",
        }))
    );

    /* -------- PART 3 -------- */
    const [part3, setPart3] = useState({
        speakers: ["", "", "", ""],
        options: ["", "", "", "", "", ""],
        answers: ["", "", "", ""],
    });

    /* -------- PART 4 -------- */
    const [part4, setPart4] = useState({
        mapUrl: "",
        questions: Array.from({ length: 5 }, () => ({
            place: "",
            answer: "",
        })),
        mapLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    });

    /* -------- PART 5 -------- */
    const [part5, setPart5] = useState(
        Array.from({ length: 3 }, () => ({
            text: "",
            q1: { question: "", options: ["", "", ""], answer: "" },
            q2: { question: "", options: ["", "", ""], answer: "" },
        }))
    );

    /* -------- PART 6 -------- */
    const [part6, setPart6] = useState(
        Array.from({ length: 6 }, () => ({
            before: "",
            after: "",
            answer: "",
        }))
    );

    /* ===================== SAVE ===================== */

    async function saveMock() {
        // Prepare payload matching database schema exactly
        const payload = {
            title,
            data: {
                part_1: part1.map((q) => q.options),
                part_2: part2.map(({ label, before, after }) => ({ 
                    label, 
                    before, 
                    after 
                })),
                part_3: {
                    speakers: part3.speakers,
                    options: part3.options,
                },
                part_4: {
                    mapUrl: part4.mapUrl,
                    mapLabels: part4.mapLabels,
                    questions: part4.questions.map((q, i) => ({
                        num: 19 + i,
                        place: q.place,
                    })),
                },
                part_5: part5.map((e, i) => ({
                    name: `Extract ${i + 1}`,
                    questions: [
                        { text: e.q1.question, options: e.q1.options },
                        { text: e.q2.question, options: e.q2.options },
                    ],
                })),
                part_6: {
                    questions: part6.map((q, i) => ({
                        num: 30 + i,
                        before: q.before,
                        after: q.after,
                    })),
                },
            },
            audio_part_1: audios.part_1,
            audio_part_2: audios.part_2,
            audio_part_3: audios.part_3,
            audio_part_4: audios.part_4,
            audio_part_5: audios.part_5,
            audio_part_6: audios.part_6,
        };

        const answersPayload = {
            part_1: part1.map((q) => q.answer),
            part_2: part2.map((q) => q.answer),
            part_3: part3.answers,
            part_4: part4.questions.map((q) => q.answer),
            part_5: part5.flatMap((e) => [e.q1.answer, e.q2.answer]),
            part_6: part6.map((q) => q.answer),
        };

        try {
            if (isEdit) {
                await api.put(`/cefr/listening/update/${mockId}`, payload);
                await api.put(`/cefr/listening/answer/update/${mockId}`, answersPayload);
            } else {
                const res = await api.post("/cefr/listening/create", payload);
                await api.post(`/cefr/listening/answer/create/${res.data.id}`, answersPayload);
            }
            alert("✅ Muvaffaqiyatli saqlandi!");
            navigate("/admin/dashboard");
        } catch (error) {
            console.error("Save error:", error);
            alert("❌ Saqlashda xato: " + error.message);
        }
    }


    /* ===================== RENDER ===================== */

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const data = parseFileContent(content, file.name);
            
            if (data) {
                // Set title
                if (data.title) setTitle(data.title);

                // Set audios
                if (data.audios) {
                    setAudios(data.audios);
                }

                // Set part1
                if (data.part1 && data.part1.length > 0) {
                    setPart1([
                        ...data.part1,
                        ...Array.from(
                            { length: Math.max(0, 8 - data.part1.length) },
                            () => ({ options: ["", "", ""], answer: "" })
                        )
                    ]);
                }

                // Set part2
                if (data.part2 && data.part2.length > 0) {
                    setPart2([
                        ...data.part2,
                        ...Array.from(
                            { length: Math.max(0, 6 - data.part2.length) },
                            () => ({ label: "", before: "", after: "", answer: "" })
                        )
                    ]);
                }

                // Set part3
                if (data.part3 && Object.keys(data.part3).length > 0) {
                    setPart3({
                        speakers: data.part3.speakers || ["", "", "", ""],
                        options: data.part3.options || ["", "", "", "", "", ""],
                        answers: data.part3.answers || ["", "", "", ""]
                    });
                }

                // Set part4
                if (data.part4 && Object.keys(data.part4).length > 0) {
                    setPart4({
                        mapUrl: data.part4.mapUrl || "",
                        mapLabels: data.part4.mapLabels || ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
                        questions: [
                            ...data.part4.questions || [],
                            ...Array.from(
                                { length: Math.max(0, 5 - (data.part4.questions?.length || 0)) },
                                () => ({ place: "", answer: "" })
                            )
                        ]
                    });
                }

                // Set part5
                if (data.part5 && data.part5.length > 0) {
                    setPart5([
                        ...data.part5,
                        ...Array.from(
                            { length: Math.max(0, 3 - data.part5.length) },
                            () => ({
                                text: "",
                                q1: { question: "", options: ["", "", ""], answer: "" },
                                q2: { question: "", options: ["", "", ""], answer: "" }
                            })
                        )
                    ]);
                }

                // Set part6
                if (data.part6 && data.part6.length > 0) {
                    setPart6([
                        ...data.part6,
                        ...Array.from(
                            { length: Math.max(0, 6 - data.part6.length) },
                            () => ({ before: "", after: "", answer: "" })
                        )
                    ]);
                }

                alert("✅ Fayl muvaffaqiyatli yuklandi!");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Listening Mock</h1>

            {/* FILE UPLOAD SECTION */}
            <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 mb-6 bg-blue-50">
                <h3 className="font-bold text-lg mb-3">📁 Fayldan Yuklash (JSON/CSV)</h3>
                <input
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full p-3 border border-blue-300 rounded-lg cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-2">
                    💡 Masala: 
                    <code className="bg-gray-200 px-2 py-1 rounded">.json</code> yoki 
                    <code className="bg-gray-200 px-2 py-1 rounded">.csv</code> fayl yuklang
                </p>
                <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-semibold">📋 CSV Format Namunasi</summary>
                    <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
{`[TITLE]
CEFR Listening Test 2024

[AUDIOS]
part_1|https://example.com/audio1.mp3
part_2|https://example.com/audio2.mp3
part_3|https://example.com/audio3.mp3

[PART1]
Apple|Banana|Orange|A
Car|Bus|Train|B

[PART2]
label|Numbers|before|Flight is at|after|o'clock|answer|3pm
label|Time|before|Shop opens|after|daily|answer|9am

[PART3]
speakers|John;Mary;David;Sarah
options|Doctor;Teacher;Engineer;Driver;Manager;Accountant
answers|A;B;C;D

[PART4]
mapUrl|https://example.com/map.jpg
mapLabels|A;B;C;D;E
question1|place|Museum|answer|A
question2|place|Library|answer|B

[PART5]
extract1|text|Interview|q1_question|What is the job?|q1_options|Doctor;Teacher;Engineer|q1_answer|A|q2_question|Experience?|q2_options|5;10;15|q2_answer|B

[PART6]
before|The project|after|completed successfully|answer|was
before|We must|after|responsibilities|answer|take`}
                    </pre>
                    <p className="text-gray-600 mt-2">
                        💡 <strong>JSON</strong> formatiga o'tish: <code className="bg-gray-200 px-1">LISTENING_MOCK_TEMPLATE.json</code> faylni ko'ring
                    </p>
                </details>
            </div>

            {/* TITLE */}
            <Section title="Basic Info">
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Mock title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </Section>

            {/* PART 1 */}
            <Section title="Part 1 – Multiple Choice (8 questions)">
                <AudioInput
                    label="Audio Part 1"
                    value={audios.part_1}
                    onChange={(v) => setAudios({ ...audios, part_1: v })}
                />

                {part1.map((q, i) => (
                    <div key={i} className="border p-3 rounded">
                        <p className="font-semibold mb-2">Question {i + 1}</p>

                        {q.options.map((opt, j) => (
                            <input
                                key={j}
                                className="w-full p-2 border rounded mb-2"
                                placeholder={`Option ${j + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const copy = [...part1];
                                    copy[i].options[j] = e.target.value;
                                    setPart1(copy);
                                }}
                            />
                        ))}

                        <select
                            className="p-2 border rounded"
                            value={q.answer}
                            onChange={(e) => {
                                const copy = [...part1];
                                copy[i].answer = e.target.value;
                                setPart1(copy);
                            }}
                        >
                            <option value="">Correct answer</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                ))}
            </Section>

            <Section title="Part 2 – Sentence Completion (6 questions)">
                <AudioInput
                    label="Audio Part 2"
                    value={audios.part_2}
                    onChange={(v) => setAudios({ ...audios, part_2: v })}
                />

                {part2.map((q, i) => (
                    <div key={i} className="border p-3 rounded space-y-2">
                        <p className="font-semibold">Question {i + 9}</p>

                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Label (e.g. Running times)"
                            value={q.label}
                            onChange={(e) => {
                                const c = [...part2];
                                c[i].label = e.target.value;
                                setPart2(c);
                            }}
                        />

                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Text BEFORE the blank"
                            value={q.before}
                            onChange={(e) => {
                                const c = [...part2];
                                c[i].before = e.target.value;
                                setPart2(c);
                            }}
                        />

                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Text AFTER the blank"
                            value={q.after}
                            onChange={(e) => {
                                const c = [...part2];
                                c[i].after = e.target.value;
                                setPart2(c);
                            }}
                        />

                        <input
                            className="w-full p-2 border rounded bg-green-50"
                            placeholder="Correct answer"
                            value={q.answer}
                            onChange={(e) => {
                                const c = [...part2];
                                c[i].answer = e.target.value;
                                setPart2(c);
                            }}
                        />
                    </div>
                ))}
            </Section>

            <Section title="Part 3 – Matching (Speakers)">
                <AudioInput
                    label="Audio Part 3"
                    value={audios.part_3}
                    onChange={(v) => setAudios({ ...audios, part_3: v })}
                />

                <div className="grid grid-cols-2 gap-4">
                    {part3.speakers.map((s, i) => (
                        <input
                            key={i}
                            className="p-2 border rounded"
                            placeholder={`Speaker ${15 + i}`}
                            value={s}
                            onChange={(e) => {
                                const c = { ...part3 };
                                c.speakers[i] = e.target.value;
                                setPart3(c);
                            }}
                        />
                    ))}
                </div>

                <h4 className="font-semibold mt-4">Options</h4>
                {part3.options.map((o, i) => (
                    <input
                        key={i}
                        className="w-full p-2 border rounded mb-2"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={o}
                        onChange={(e) => {
                            const c = { ...part3 };
                            c.options[i] = e.target.value;
                            setPart3(c);
                        }}
                    />
                ))}

                <h4 className="font-semibold mt-4">Correct Answers</h4>
                {part3.answers.map((a, i) => (
                    <select
                        key={i}
                        className="p-2 border rounded mr-2"
                        value={a}
                        onChange={(e) => {
                            const c = { ...part3 };
                            c.answers[i] = e.target.value;
                            setPart3(c);
                        }}
                    >
                        <option value="">Speaker {15 + i}</option>
                        {part3.options.map((_, j) => (
                            <option key={j} value={String.fromCharCode(65 + j)}>
                                {String.fromCharCode(65 + j)}
                            </option>
                        ))}
                    </select>
                ))}
            </Section>

            <Section title="Part 4 – Map Labelling">
                <AudioInput
                    label="Audio Part 4"
                    value={audios.part_4}
                    onChange={(v) => setAudios({ ...audios, part_4: v })}
                />

                <input
                    className="w-full p-2 border rounded"
                    placeholder="Map Image URL"
                    value={part4.mapUrl}
                    onChange={(e) => setPart4({ ...part4, mapUrl: e.target.value })}
                />

                {part4.mapUrl && (
                    <img src={part4.mapUrl} alt="map" className="mt-2 max-w-md" />
                )}

                {part4.questions.map((q, i) => (
                    <div key={i} className="border p-3 rounded">
                        <input
                            className="w-full p-2 border rounded mb-2"
                            placeholder={`Place name (Q${19 + i})`}
                            value={q.place}
                            onChange={(e) => {
                                const c = [...part4.questions];
                                c[i].place = e.target.value;
                                setPart4({ ...part4, questions: c });
                            }}
                        />

                        <select
                            className="p-2 border rounded"
                            value={q.answer}
                            onChange={(e) => {
                                const c = [...part4.questions];
                                c[i].answer = e.target.value;
                                setPart4({ ...part4, questions: c });
                            }}
                        >
                            <option value="">Correct label</option>
                            {part4.mapLabels.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </Section>

            <Section title="Part 5 – Multiple Choice Extracts">
                <AudioInput
                    label="Audio Part 5"
                    value={audios.part_5}
                    onChange={(v) => setAudios({ ...audios, part_5: v })}
                />

                {part5.map((ex, i) => (
                    <div key={i} className="border p-4 rounded space-y-3">
                        <h4 className="font-semibold">Extract {i + 1}</h4>

                        <textarea
                            className="w-full p-2 border rounded"
                            placeholder="Extract description (optional)"
                            value={ex.text}
                            onChange={(e) => {
                                const c = [...part5];
                                c[i].text = e.target.value;
                                setPart5(c);
                            }}
                        />

                        {[ex.q1, ex.q2].map((q, qi) => (
                            <div key={qi} className="border p-3 rounded">
                                <input
                                    className="w-full p-2 border rounded mb-2"
                                    placeholder={`Question ${24 + i * 2 + qi}`}
                                    value={q.question}
                                    onChange={(e) => {
                                        const c = [...part5];
                                        c[i][qi === 0 ? "q1" : "q2"].question = e.target.value;
                                        setPart5(c);
                                    }}
                                />

                                {q.options.map((opt, oi) => (
                                    <input
                                        key={oi}
                                        className="w-full p-2 border rounded mb-1"
                                        placeholder={`Option ${oi + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const c = [...part5];
                                            c[i][qi === 0 ? "q1" : "q2"].options[oi] = e.target.value;
                                            setPart5(c);
                                        }}
                                    />
                                ))}

                                <select
                                    className="p-2 border rounded"
                                    value={q.answer}
                                    onChange={(e) => {
                                        const c = [...part5];
                                        c[i][qi === 0 ? "q1" : "q2"].answer = e.target.value;
                                        setPart5(c);
                                    }}
                                >
                                    <option value="">Correct</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                        ))}
                    </div>
                ))}
            </Section>

            <Section title="Part 6 – Lecture Completion">
                <AudioInput
                    label="Audio Part 6"
                    value={audios.part_6}
                    onChange={(v) => setAudios({ ...audios, part_6: v })}
                />

                {part6.map((q, i) => (
                    <div key={i} className="border p-3 rounded space-y-2">
                        <p className="font-semibold">Question {30 + i}</p>

                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Text BEFORE blank"
                            value={q.before}
                            onChange={(e) => {
                                const c = [...part6];
                                c[i].before = e.target.value;
                                setPart6(c);
                            }}
                        />

                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Text AFTER blank"
                            value={q.after}
                            onChange={(e) => {
                                const c = [...part6];
                                c[i].after = e.target.value;
                                setPart6(c);
                            }}
                        />

                        <input
                            className="w-full p-2 border rounded bg-green-50"
                            placeholder="Correct answer"
                            value={q.answer}
                            onChange={(e) => {
                                const c = [...part6];
                                c[i].answer = e.target.value;
                                setPart6(c);
                            }}
                        />
                    </div>
                ))}
            </Section>


            {/* Qolgan partlar shu strukturada, xuddi shunday */}
            {/* Part 2–6 ni shu model bilan davom ettirish mumkin */}

            <button
                onClick={saveMock}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg"
            >
                Save Listening Mock
            </button>
        </div>
    );
}
