import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import { FaSave, FaUpload, FaInfoCircle } from "react-icons/fa";

export default function SpeakingMockForm() {
    const [searchParams] = useSearchParams();
    const edit = searchParams.get("edit") === "true";
    const mockId = searchParams.get("id");

    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

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

    // JS/JSON file upload handler
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let data;

                // Check if it's a JS file with window.SPEAKING_TEST_DATA
                if (file.name.endsWith('.js')) {
                    // Execute the JS file content to get the data
                    const tempWindow = { SPEAKING_TEST_DATA: null };
                    const script = content.replace('window.SPEAKING_TEST_DATA', 'tempWindow.SPEAKING_TEST_DATA');
                    eval(script);
                    data = tempWindow.SPEAKING_TEST_DATA;
                    
                    if (!data) {
                        throw new Error('JS faylda SPEAKING_TEST_DATA topilmadi');
                    }
                } else {
                    // Parse as JSON
                    data = JSON.parse(content);
                }
                
                // Check if it's the full format or extracted format
                if (data.questions && Array.isArray(data.questions)) {
                    // Full format - extract needed data
                    extractFromFullFormat(data);
                } else if (data["1.1"] && data["1.2"] && data["2"] && data["3"]) {
                    // Already extracted format
                    setQuestions(data);
                    alert("✅ Ma'lumotlar muvaffaqiyatli yuklandi!");
                } else {
                    alert("❌ Noto'g'ri fayl formati. Iltimos, faylingizni tekshiring.");
                }
            } catch (error) {
                alert("❌ Faylni o'qishda xatolik: " + error.message);
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    // Extract data from full format (window.SPEAKING_TEST_DATA)
    const extractFromFullFormat = (data) => {
        try {
            const questionsList = data.questions;
            const images = data.images || {};
            
            const extracted = {
                "1.1": [],
                "1.2": [],
                "2": [],
                "3": []
            };

            questionsList.forEach((q) => {
                if (q.number >= 1 && q.number <= 3) {
                    // Part 1.1 - Questions 1-3
                    let imageUrl = "";
                    if (q.hasImages && images) {
                        if (q.number === 1 && images.img1) imageUrl = images.img1;
                        else if (q.number === 2 && images.img2) imageUrl = images.img2;
                        else if (q.number === 3 && images.img1) imageUrl = images.img1;
                    }
                    
                    extracted["1.1"].push({
                        id: q.number,
                        question_text: q.prompt || "",
                        prep_time: q.prepTime || 5,
                        speak_time: q.speakTime || 30,
                        image_url: imageUrl
                    });
                } 
                else if (q.number >= 4 && q.number <= 6) {
                    // Part 1.2 - Questions 4-6
                    let questionImages = [];
                    if (q.hasImages && images) {
                        if (images.img1) questionImages.push(images.img1);
                        if (images.img2) questionImages.push(images.img2);
                    }
                    
                    extracted["1.2"].push({
                        id: q.number,
                        question_text: q.prompt || "",
                        prep_time: q.prepTime || 10,
                        speak_time: q.speakTime || 45,
                        images: questionImages
                    });
                }
                else if (q.number === 7) {
                    // Part 2 - Question 7
                    extracted["2"].push({
                        id: q.number,
                        question_text: q.prompt || "",
                        bullets: q.bulletPoints || [],
                        prep_time: q.prepTime || 60,
                        speak_time: q.speakTime || 120
                    });
                }
                else if (q.number === 8) {
                    // Part 3 - Question 8
                    extracted["3"].push({
                        id: q.number,
                        question_text: q.prompt || "",
                        for_points: q.debatePoints?.for || [],
                        against_points: q.debatePoints?.against || [],
                        prep_time: q.prepTime || 60,
                        speak_time: q.speakTime || 120
                    });
                }
            });

            setQuestions(extracted);
            alert("✅ Ma'lumotlar muvaffaqiyatli ajratildi va yuklandi!");
        } catch (error) {
            alert("❌ Ma'lumotlarni ajratishda xatolik: " + error.message);
            console.error(error);
        }
    };

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
            alert("Iltimos, mock nomini kiriting");
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
            alert("Iltimos, barcha savol matnlarini to'ldiring");
            return;
        }

        setSaving(true);
        const body = { title, questions };

        if (edit && mockId) {
            api.put(`/mock/speaking/update/${mockId}`, body)
                .then(() => {
                    alert("Mock muvaffaqiyatli yangilandi");
                    window.history.back();
                })
                .catch(err => {
                    console.log(err);
                    alert("Mock yangilashda xatolik");
                })
                .finally(() => setSaving(false));
        } else {
            api.post(`/mock/speaking/create?title=${title}`, body)
                .then(() => {
                    alert("Mock muvaffaqiyatli yaratildi");
                    window.history.back();
                })
                .catch(err => {
                    console.log(err);
                    alert("Mock yaratishda xatolik");
                })
                .finally(() => setSaving(false));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Mock yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        {edit ? "Speaking Mock ni tahrirlash" : "Speaking Mock yaratish"}
                    </h1>
                    <p className="text-gray-600">4 qismda 8 ta savol yarating (3+3+1+1)</p>
                </div>

                {/* File Upload Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                                    <FaUpload className="text-purple-600" />
                                    JS/JSON fayldan import qilish
                                </h3>
                                <p className="text-sm text-gray-600">Barcha savollarni avtomatik to'ldirish uchun faylni yuklang</p>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".js,.json"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2 shadow-lg"
                                >
                                    <FaUpload /> Fayl yuklash
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                            <div className="text-sm text-gray-700">
                                <strong>Qo'llab-quvvatlanadigan formatlar:</strong>
                                <ul className="list-disc list-inside mt-1 ml-2">
                                    <li><code className="bg-white px-2 py-0.5 rounded">.js</code> - window.SPEAKING_TEST_DATA bilan</li>
                                    <li><code className="bg-white px-2 py-0.5 rounded">.json</code> - Oddiy JSON format</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mock nomi</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Masalan: Speaking Mock 30"
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
                        Bekor qilish
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                        <FaSave /> {saving ? "Saqlanmoqda..." : (edit ? "Mock ni yangilash" : "Mock ni saqlash")}
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
                Part 1.1 – Individual Long Turn (3 ta savol)
            </h2>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-bold text-blue-600">Q{q.id}</span>
                            <h3 className="text-lg font-semibold text-gray-800">Savol {idx + 1}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Savol matni *</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    value={q.question_text}
                                    onChange={(e) => onUpdate(idx, "question_text", e.target.value)}
                                    placeholder="Masalan: Do you live in a house or an apartment?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tayyorlanish vaqti (soniya)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={q.prep_time}
                                        onChange={(e) => onUpdate(idx, "prep_time", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gapirish vaqti (soniya)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={q.speak_time}
                                        onChange={(e) => onUpdate(idx, "speak_time", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rasm URL (ixtiyoriy)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={q.image_url}
                                    onChange={(e) => onUpdate(idx, "image_url", e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {q.image_url && (
                                    <img src={q.image_url} alt="Preview" className="mt-3 h-32 object-cover rounded border-2 border-gray-200" />
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
                Part 1.2 – Picture Description (3 ta savol)
            </h2>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg font-bold text-green-600">Q{q.id}</span>
                            <h3 className="text-lg font-semibold text-gray-800">Savol {idx + 1}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Savol matni *</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    value={q.question_text}
                                    onChange={(e) => onUpdate(idx, "question_text", e.target.value)}
                                    placeholder="Masalan: What do you see in these pictures?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tayyorlanish vaqti (soniya)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={q.prep_time}
                                        onChange={(e) => onUpdate(idx, "prep_time", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gapirish vaqti (soniya)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={q.speak_time}
                                        onChange={(e) => onUpdate(idx, "speak_time", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rasm URLlar (vergul bilan ajratilgan)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={(q.images || []).join(", ")}
                                    onChange={(e) => onUpdate(idx, "images", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                                />
                                {q.images && q.images.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {q.images.map((img, i) => img && (
                                            <img key={i} src={img} alt={`img${i+1}`} className="h-24 object-cover rounded border-2 border-gray-200" />
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
                Part 2 – Extended Monologue (1 ta savol)
            </h2>

            <div className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-bold text-purple-600">Q{questions[0].id}</span>
                    <h3 className="text-lg font-semibold text-gray-800">Kengaytirilgan monolog</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mavzu/Savol *</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="3"
                            value={questions[0].question_text}
                            onChange={(e) => onUpdate(0, "question_text", e.target.value)}
                            placeholder="Masalan: Talk about health and lifestyle."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bullet Points (har birini yangi qatordan)</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="5"
                            value={(questions[0].bullets || []).join("\n")}
                            onChange={(e) => onUpdate(0, "bullets", e.target.value.split("\n").filter(b => b.trim()))}
                            placeholder="Do women pay more attention to their health than men?&#10;Could governments do more to promote healthier lifestyle options?&#10;Do you think most people worry more about their health as they get older?"
                        />
                        {questions[0].bullets && questions[0].bullets.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                                <strong>{questions[0].bullets.length}</strong> ta bullet point
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tayyorlanish vaqti (soniya)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={questions[0].prep_time}
                                onChange={(e) => onUpdate(0, "prep_time", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gapirish vaqti (soniya)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={questions[0].speak_time}
                                onChange={(e) => onUpdate(0, "speak_time", parseInt(e.target.value) || 0)}
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
                Part 3 – Discussion (1 ta savol)
            </h2>

            <div className="p-5 border border-gray-200 rounded-lg bg-gradient-to-r from-red-50 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-bold text-red-600">Q{questions[0].id}</span>
                    <h3 className="text-lg font-semibold text-gray-800">Munozara mavzusi</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Munozara bayonoti *</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="3"
                            value={questions[0].question_text}
                            onChange={(e) => onUpdate(0, "question_text", e.target.value)}
                            placeholder="Masalan: Are alternative energy sources effective and justified?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">FOR</span>
                                Tarafdor argumentlar (har birini yangi qatordan)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="5"
                                value={(questions[0].for_points || []).join("\n")}
                                onChange={(e) => onUpdate(0, "for_points", e.target.value.split("\n").filter(p => p.trim()))}
                                placeholder="Alternative energy sources are effective...&#10;They have low environmental impact...&#10;They create jobs..."
                            />
                            {questions[0].for_points && questions[0].for_points.length > 0 && (
                                <div className="mt-2 text-sm text-green-600">
                                    <strong>{questions[0].for_points.length}</strong> ta FOR argument
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">AGAINST</span>
                                Qarshi argumentlar (har birini yangi qatordan)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="5"
                                value={(questions[0].against_points || []).join("\n")}
                                onChange={(e) => onUpdate(0, "against_points", e.target.value.split("\n").filter(p => p.trim()))}
                                placeholder="They are not reliable sources...&#10;They have high costs...&#10;They have environmental impact..."
                            />
                            {questions[0].against_points && questions[0].against_points.length > 0 && (
                                <div className="mt-2 text-sm text-red-600">
                                    <strong>{questions[0].against_points.length}</strong> ta AGAINST argument
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tayyorlanish vaqti (soniya)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={questions[0].prep_time}
                                onChange={(e) => onUpdate(0, "prep_time", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gapirish vaqti (soniya)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={questions[0].speak_time}
                                onChange={(e) => onUpdate(0, "speak_time", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}