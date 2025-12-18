import React, { useEffect, useState } from "react";
import api from "../api";

export default function SpeakingMocks() {
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [evaluation, setEvaluation] = useState({
    scores: {
      "part1.1": 0,
      "part1.2": 0,
      "part2": 0,
      "part3": 0,
      "total": 0
    },
    band: "",
    feedbacks: {
      "part1.1": "",
      "part1.2": "",
      "part2": "",
      "part3": ""
    },
    send_email: false
  });

  useEffect(() => {
    fetchResults();
    fetchUsers();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mock/speaking/results");
      setResults(response.data);
    } catch (err) {
      console.log(err);
      alert("Error loading results");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user/users");
      setUsers(response.data);
    } catch (err) {
      console.log(err);
      alert("Error loading users");
    }
  };

  const updateScore = (field, value) => {
    const v = Number(value);
    const newScores = { ...evaluation.scores, [field]: v };
    const total = newScores["part1.1"] + newScores["part1.2"] + newScores["part2"] + newScores["part3"];

    let band = "";
    if (total <= 10) band = "B1";
    else if (total <= 20) band = "B2";
    else if (total <= 30) band = "C1";
    else band = "C2";

    setEvaluation({
      ...evaluation,
      scores: { ...newScores, total },
      band
    });
  };

  const handleSubmitReview = async (id) => {
    if (!evaluation.scores["part1.1"] || !evaluation.scores["part1.2"] || !evaluation.scores["part2"] || !evaluation.scores["part3"]) {
      alert("Please fill all scores");
      return;
    }

    if (!Object.values(evaluation.feedbacks).every(f => f.trim())) {
      alert("Please write feedback for all parts");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/mock/speaking/check/${id}`, evaluation);
      alert("Review submitted successfully!");
      setSelected(null);
      fetchResults();

      // Send notification
      const user = users.find(u => u.id === selected.user_id);
      if (user) {
        api.post("/notifications/", {
          title: "Speaking mock results",
          body: `Speaking mock #${selected.id} is ready. Check your ${user.email} notifications in gmail to see your results.`,
          user_id: user.id
        }).catch(err => console.log(err));
      }
    } catch (err) {
      console.log(err);
      alert("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResults = results.filter(r => {
    const user = users.find(u => u.id === r.user_id);
    if (!user) return false;

    const matchesQuery = query === "" ||
      user.id.toString().includes(query) ||
      user.username.toLowerCase().includes(query.toLowerCase());

    if (filterBadge === "premium") {
      const isPremium = user.premium_duration && new Date(user.premium_duration) > new Date();
      return matchesQuery && isPremium;
    } else if (filterBadge === "normal") {
      const isPremium = user.premium_duration && new Date(user.premium_duration) > new Date();
      return matchesQuery && !isPremium;
    }

    return matchesQuery;
  });

  // ✅ FIX: Audio URL'larni Supabase'dan olish
  const getAudioUrls = (recordings) => {
    if (!recordings) return {};
    
    // Supabase storage'dan kelgan URL'lar
    if (recordings.audios) {
      return recordings.audios; // {q1: url, q2: url, ...}
    }
    
    // Backend storage'dan kelgan URL'lar (eski format)
    if (recordings.folder) {
      const urls = {};
      ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].forEach(key => {
        urls[key] = `http://127.0.0.1:8000/${recordings.folder}/${key}.webm`;
      });
      return urls;
    }
    
    return {};
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Speaking Mocks – Reviews</h1>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id or username..."
            className="w-72 px-3 py-2 border rounded"
          />

          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All users</option>
            <option value="premium">Premium only</option>
            <option value="normal">Standard only</option>
          </select>
        </div>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Info</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((r) => {
              const user = users.find(u => u.id === r.user_id);
              if (!user) return null;

              const isPremium = user.premium_duration && new Date(user.premium_duration) > new Date();

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">{user.username}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${isPremium ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                      }`}>
                      {isPremium ? "Premium" : "Standard"}
                    </span>
                    {r.evaluation && (
                      <span className="ml-2 text-green-600 text-xs font-semibold">✓ Checked</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-3 py-1 bg-rose-600 text-white rounded text-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* REVIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelected(null)} />

          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">
              {users.find(u => u.id === selected.user_id)?.username} – ID: {selected.id}
            </h2>

            {/* AUDIO FILES PREVIEW - SUPABASE VERSION */}
            {selected?.recordings && (selected.recordings.audios || selected.recordings.folder) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-3">🎙️ Recorded Audio</h3>
                {(() => {
                  const audioUrls = getAudioUrls(selected.recordings);
                  const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
                  
                  return questions.map((key) => {
                    const audioUrl = audioUrls[key];
                    
                    if (!audioUrl) return null; // Audio mavjud bo'lmasa o'tkazib yuborish
                    
                    return (
                      <div key={key} className="flex items-center gap-3 mb-3 p-2 bg-white rounded border">
                        <span className="text-sm font-semibold text-gray-700 min-w-12">
                          Q{key.replace('q', '')}
                        </span>
                        <audio controls className="flex-1 h-8">
                          <source src={audioUrl} type="audio/webm" />
                          Your browser does not support audio.
                        </audio>
                        <a
                          href={audioUrl}
                          download={`question_${key.replace('q', '')}.webm`}
                          className="text-blue-600 hover:underline text-sm font-medium whitespace-nowrap"
                        >
                          ⬇️ Download
                        </a>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* PARTS EVALUATION */}
            {["part1.1", "part1.2", "part2", "part3"].map((part) => (
              <section key={part} className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-semibold mb-4">Part {part.replace("part", "")}</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Enter score"
                    value={evaluation.scores[part] || ""}
                    onChange={(e) => updateScore(part, e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    placeholder={`Write feedback for part ${part.replace("part", "")}...`}
                    value={evaluation.feedbacks[part]}
                    onChange={(e) => setEvaluation({
                      ...evaluation,
                      feedbacks: { ...evaluation.feedbacks, [part]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows="3"
                  />
                </div>
              </section>
            ))}

            {/* BAND DISPLAY */}
            <div className="mb-4 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <strong className="text-gray-700">Overall Band:</strong>
                <span className="text-2xl font-bold text-blue-600">
                  {evaluation.band || "—"}
                </span>
              </div>
            </div>

            {/* EMAIL CHECKBOX */}
            <label className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={evaluation.send_email}
                onChange={(e) => setEvaluation({ ...evaluation, send_email: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Send result to email</span>
            </label>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleSubmitReview(selected.id)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}