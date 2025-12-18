import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import { FaSave } from "react-icons/fa";

export default function SpeakingMockForm() {
    const [searchParams] = useSearchParams();
    const edit = searchParams.get("edit") === "true";
    const mockId = searchParams.get("id");

    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [questions, setQuestions] = useState({
        "1.1": [
            { id: 1, question_text: "", prep_time: 5, speak_time: 30, image_url: "" },
            { id: 2, question_text: "", prep_time: 5, speak_time: 30, image_url: "" },
            { id: 3, question_text: "", prep_time: 5, speak_time: 30, image_url: "" }
        ],
        "1.2": [
            { id: 4, question_text: "", prep_time: 10, speak_time: 45, images: [] },
            { id: 5, question_text: "", prep_time: 10, speak_time: 45, images: [] },
            { id: 6, question_text: "", prep_time: 10, speak_time: 45, images: [] }
        ],
        "2": [
            { id: 7, question_text: "", bullets: [], prep_time: 60, speak_time: 120 }
        ],
        "3": [
            { id: 8, question_text: "", for_points: [], against_points: [], prep_time: 60, speak_time: 120 }
        ]
    });

    useEffect(() => {
        if (edit && mockId) {
            setLoading(true);
            api.get(`/mock/speaking/mock/${mockId}`)
                .then(res => {
                    setTitle(res.data.title);
                    setQuestions(res.data.questions.questions);
                })
                .catch(err => {
                    console.log(err);
                    alert("Error loading mock data");
                })
                .finally(() => setLoading(false));
        }
    }, [edit, mockId]);

    const updateQuestion = (part, index, field, value) => {
        const updated = { ...questions };
        updated[part][index] = {
            ...updated[part][index],
            [field]: value
        };
        setQuestions(updated);
    };

    const submit = () => {
        if (!title.trim()) {
            alert("Please enter a mock title");
            return;
        }

        let allFilled = true;
        Object.keys(questions).forEach(part => {
            questions[part].forEach(q => {
                if (!q.question_text.trim()) {
                    allFilled = false;
                }
            });
        });

        if (!allFilled) {
            alert("Please fill all question texts");
            return;
        }

        setSaving(true);
        const body = { title, questions };

        if (edit && mockId) {
            api.put(`/mock/speaking/update/${mockId}`, body)
                .then(() => {
                    alert("Mock updated successfully");
                    window.history.back();
                })
                .catch(err => {
                    console.log(err);
                    alert("Error updating mock");
                })
                .finally(() => setSaving(false));
        } else {
            api.post(`/mock/speaking/create?title=${title}`, body)
                .then(() => {
                    alert("Mock created successfully");
                    window.history.back();
                })
                .catch(err => {
                    console.log(err);
                    alert("Error creating mock");
                })
                .finally(() => setSaving(false));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading mock...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        {edit ? "Edit Speaking Mock" : "Create Speaking Mock"}
                    </h1>
                    <p className="text-gray-600">Create 8 questions across 4 parts (3+3+1+1)</p>
                </div>

                {/* Title Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mock Title</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Speaking Mock 1"
                    />
                </div>

                {/* Part 1.1 */}
                <Part1_1 questions={questions["1.1"]} onUpdate={(idx, field, val) => updateQuestion("1.1", idx, field, val)} />

                {/* Part 1.2 */}
                <Part1_2 questions={questions["1.2"]} onUpdate={(idx, field, val) => updateQuestion("1.2", idx, field, val)} />

                {/* Part 2 */}
                <Part2 questions={questions["2"]} onUpdate={(idx, field, val) => updateQuestion("2", idx, field, val)} />

                {/* Part 3 */}
                <Part3 questions={questions["3"]} onUpdate={(idx, field, val) => updateQuestion("3", idx, field, val)} />

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                        <FaSave /> {saving ? "Saving..." : (edit ? "Update Mock" : "Save Mock")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Part1_1({ questions, onUpdate }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Part 1.1 – Individual Long Turn (3 Questions)
            </h2>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-bold text-blue-600">Q{q.id}</span>
                            <h3 className="text-lg font-semibold text-gray-800">Question {idx + 1}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text *</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    value={q.question_text}
                                    onChange={(e) => onUpdate(idx, "question_text", e.target.value)}
                                    placeholder="e.g., What kind of clothes do you like to wear?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (seconds)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={q.prep_time}
                                        onChange={(e) => onUpdate(idx, "prep_time", parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Speak Time (seconds)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={q.speak_time}
                                        onChange={(e) => onUpdate(idx, "speak_time", parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={q.image_url}
                                    onChange={(e) => onUpdate(idx, "image_url", e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {q.image_url && (
                                    <img src={q.image_url} alt="Preview" className="mt-3 h-32 object-cover rounded" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Part1_2({ questions, onUpdate }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Part 1.2 – Picture Description (3 Questions)
            </h2>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-bold text-green-600">Q{q.id}</span>
                            <h3 className="text-lg font-semibold text-gray-800">Question {idx + 1}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text *</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    value={q.question_text}
                                    onChange={(e) => onUpdate(idx, "question_text", e.target.value)}
                                    placeholder="e.g., What do you see in these pictures?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (seconds)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={q.prep_time}
                                        onChange={(e) => onUpdate(idx, "prep_time", parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Speak Time (seconds)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={q.speak_time}
                                        onChange={(e) => onUpdate(idx, "speak_time", parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URLs (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={(q.images || []).join(", ")}
                                    onChange={(e) => onUpdate(idx, "images", e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                                />
                                {q.images && q.images.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                        {q.images.map((img, i) => img && (
                                            <img key={i} src={img} alt={`img${i}`} className="h-24 object-cover rounded" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Part2({ questions, onUpdate }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Part 2 – Extended Monologue (1 Question)
            </h2>

            <div className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-bold text-purple-600">Q{questions[0].id}</span>
                    <h3 className="text-lg font-semibold text-gray-800">Extended Monologue</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Topic/Question *</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="3"
                            value={questions[0].question_text}
                            onChange={(e) => onUpdate(0, "question_text", e.target.value)}
                            placeholder="e.g., Discuss: Curiosity in Learning"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bullet Points (one per line)</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="4"
                            value={(questions[0].bullets || []).join("\n")}
                            onChange={(e) => onUpdate(0, "bullets", e.target.value.split("\n").filter(b => b.trim()))}
                            placeholder="Share a time when your curiosity led you to discover something valuable&#10;How has curiosity influenced your personal or professional growth?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={questions[0].prep_time}
                                onChange={(e) => onUpdate(0, "prep_time", parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Speak Time (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={questions[0].speak_time}
                                onChange={(e) => onUpdate(0, "speak_time", parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Part3({ questions, onUpdate }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Part 3 – Discussion (1 Question)
            </h2>

            <div className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-red-50 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-bold text-red-600">Q{questions[0].id}</span>
                    <h3 className="text-lg font-semibold text-gray-800">Discussion Topic</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Debate Statement *</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="3"
                            value={questions[0].question_text}
                            onChange={(e) => onUpdate(0, "question_text", e.target.value)}
                            placeholder="e.g., University Degrees Are No Longer Necessary for a Successful Career"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">FOR Arguments (one per line)</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="4"
                                value={(questions[0].for_points || []).join("\n")}
                                onChange={(e) => onUpdate(0, "for_points", e.target.value.split("\n").filter(b => b.trim()))}
                                placeholder="Many successful entrepreneurs never completed university&#10;Online courses provide alternatives"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">AGAINST Arguments (one per line)</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="4"
                                value={(questions[0].against_points || []).join("\n")}
                                onChange={(e) => onUpdate(0, "against_points", e.target.value.split("\n").filter(b => b.trim()))}
                                placeholder="A degree increases job opportunities&#10;Some professions require formal education"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={questions[0].prep_time}
                                onChange={(e) => onUpdate(0, "prep_time", parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Speak Time (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={questions[0].speak_time}
                                onChange={(e) => onUpdate(0, "speak_time", parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}