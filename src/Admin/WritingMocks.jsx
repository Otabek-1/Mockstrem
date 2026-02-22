import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function WritingMocks() {
  // Example mock — replace with API later
  const [MOCK, setMOCK] = useState([]);
  const [mockData, setMockData] = useState();
  const [users, setUsers] = useState();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [filterBadge, setFilterBadge] = useState("all");

  // Scores state
  const [scores, setScores] = useState({
    task11: 0,
    task12: 0,
    task2: 0,
  });

  const [band, setBand] = useState("");
  const [feedbacks, setFeedbacks] = useState({
    task11: "",
    task12: "",
    task2: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMockLoading, setIsMockLoading] = useState(false); // <-- add this

  useEffect(() => {
    api.get("/mock/writing/results").then(res => {
      setMOCK(res.data);
      console.log("loaded results:", res.data.length);
    }).catch(err => {
      console.log(err);
      alert("Error in getting results. (See console)")
    })
 
    api.get("/user/users").then(res => {
      setUsers(res.data);
    }).catch(err => {
      alert("Error! (See console.)")
    })
  }, [])
 
  // Fetch single mock by id (called when opening Review modal)
  const fetchMock = async (mockId) => {
    try {
      setIsMockLoading(true); // <-- set to true
      const res = await api.get(`/mock/writing/mock/${mockId}`)
      setMockData(res.data)
    } catch (err) {
      console.error("Error fetching mock:", err)
      alert("Error loading mock. See console.")
    } finally {
      setIsMockLoading(false); // <-- set to false
    }
  }
 
  const updateScore = (field, value) => {
    const v = Number(value);
    const newScores = { ...scores, [field]: v };
    setScores(newScores);

    // Auto band calculation
    // Task 1.1: max 5, Task 1.2: max 5, Task 2: max 6
    // Total max: 16
    const total = newScores.task11 + newScores.task12 + newScores.task2;

    if (total <= 5) setBand("B1");
    else if (total <= 10) setBand("B2");
    else if (total <= 13) setBand("C1");
    else setBand("C2");
  };


  const handleSubmitReview = async (id) => {
    // Validate inputs
    if (!scores.task11 || !scores.task12 || !scores.task2) {
      alert("Please fill in all scores");
      return;
    }

    if (!feedbacks.task11.trim() || !feedbacks.task12.trim() || !feedbacks.task2.trim()) {
      alert("Please write feedback for all tasks");
      return;
    }

    setIsSubmitting(true);

    // Prepare review data
    const reviewData = {
      mock_id: selected.id,
      user_id: selected.user_id,
      scores: {
        task11: scores.task11,
        task12: scores.task12,
        task2: scores.task2,
        total: scores.task11 + scores.task12 + scores.task2
      },
      band: band,
      feedbacks: {
        task11: feedbacks.task11,
        task12: feedbacks.task12,
        task2: feedbacks.task2
      },
      submitted_at: new Date().toISOString(),
      send_email: document.querySelector('input[type="checkbox"]')?.checked
    };


    try {
      const response = await api.post(`/mock/writing/check/${id}`, { result: reviewData }).then(res => console.log(res));
      alert("Review submitted successfully!");
      setSelected(null);
      setScores({ task11: 0, task12: 0, task2: 0 });
      setBand("");
      setFeedbacks({ task11: "", task12: "", task2: "" });

      // Refresh the list
      api.get("/mock/writing/results").then(res => {
        setMOCK(res.data);
      });
    } catch (err) {
      console.log(err);
      alert("Error submitting review. (See console)");
    } finally {
      setIsSubmitting(false);
    }

    
    const user = users.filter(user => user.id == selected.user_id)[0];
    api.post("/notifications/", { title: `Writing mock results`, body: `Writing mock #${selected.id} is ready. Check your results.`, user_id: user.id }).then(res=>{
      console.log(res);
    }).catch(err=>{
      alert("Error in sending notification (see console).")
      console.log(err);
    })
  };

  if (!users || !MOCK) {
    return (
      <div className="min-h-screen bg-[#08090b] flex items-center justify-center">
        <div className="text-gray-400">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090b] text-white p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-white">Writing Mocks — Reviews</h1>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, fullname or username..."
            className="w-full sm:w-72 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="all" className="bg-[#16161a]">All users</option>
            <option value="premium" className="bg-[#16161a]">Premium only</option>
            <option value="normal" className="bg-[#16161a]">Standard only</option>
          </select>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Info</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Submitted</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {MOCK.map((u) => {
              const user = users.find(us => us.id == u.user_id);
              const username = user?.username || "—";
              const isPremiumActive = user?.premium_duration && new Date(user.premium_duration) > new Date();
              return (
                <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-200">{username}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${isPremiumActive ? "bg-amber-500/20 text-amber-200" : "bg-white/10 text-gray-300"}`}>
                      {isPremiumActive ? "Premium" : "Standard"}
                    </span>
                    {u.result && (
                      <span className="ml-2 text-emerald-400 text-xs font-semibold">✔ Checked</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelected(u);
                        setScores({ task11: 0, task12: 0, task2: 0 });
                        setBand("");
                        setFeedbacks({ task11: "", task12: "", task2: "" });
                        fetchMock(u.mock_id);
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-500 transition"
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

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-[#16161a] border border-white/10 p-6 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold text-white mb-1">
              {(users.find(user => user.id == selected.user_id))?.username ?? "—"} — ID:{selected.id}
            </h2>
            <div className="text-xs text-gray-400 mb-5">
              {new Date(selected.created_at).toLocaleString()}
            </div>

            {isMockLoading && (
              <div className="text-center py-6">
                <div className="inline-block w-8 h-8 rounded-full border-2 border-white/10 border-t-rose-500 animate-spin" />
                <p className="text-sm text-gray-400 mt-2">Loading mock...</p>
              </div>
            )}

            {mockData && !isMockLoading && (
              <>
            <section className="mb-6">
              <h3 className="font-medium text-white mb-2">Task 1.1</h3>
              <div className="text-gray-400 text-sm mb-1 font-medium">Question:</div>
              <p className="text-sm text-gray-200 mb-3">{mockData.task1.task11}</p>
              <div className="text-gray-400 text-sm mb-1 font-medium">Student Answer:</div>
              <p className="text-sm text-gray-200 mb-3">{selected.task1.split(" ---TASK--- ")[0]}</p>
              <div className="flex gap-3 mb-3">
                <input
                  type="number"
                  min="0"
                  max="5"
                  placeholder="Score (0–5)"
                  value={scores.task11 || ""}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl w-32 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  onChange={(e) => updateScore("task11", e.target.value)}
                />
              </div>
              <div className="text-gray-400 text-sm mb-1 font-medium">Feedback:</div>
              <textarea
                placeholder="Write feedback for Task 1.1..."
                value={feedbacks.task11}
                onChange={(e) => setFeedbacks({ ...feedbacks, task11: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                rows={3}
              />
            </section>

            <section className="mb-6">
              <h3 className="font-medium text-white mb-2">Task 1.2</h3>
              <div className="text-gray-400 text-sm mb-1 font-medium">Question:</div>
              <p className="text-sm text-gray-200 mb-3">{mockData.task1.task12}</p>
              <div className="text-gray-400 text-sm mb-1 font-medium">Student Answer:</div>
              <p className="text-sm text-gray-200 mb-3">{selected.task1.split(" ---TASK--- ")[1]}</p>
              <input
                type="number"
                min="0"
                max="5"
                placeholder="Score (0–5)"
                value={scores.task12 || ""}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl w-32 mb-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                onChange={(e) => updateScore("task12", e.target.value)}
              />
              <div className="text-gray-400 text-sm mb-1 font-medium">Feedback:</div>
              <textarea
                placeholder="Write feedback for Task 1.2..."
                value={feedbacks.task12}
                onChange={(e) => setFeedbacks({ ...feedbacks, task12: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                rows={3}
              />
            </section>

            <section className="mb-6">
              <h3 className="font-medium text-white mb-2">Task 2</h3>
              <div className="text-gray-400 text-sm mb-1 font-medium">Question:</div>
              <p className="text-sm text-gray-200 mb-3">{mockData.task2.task2}</p>
              <div className="text-gray-400 text-sm mb-1 font-medium">Student Answer:</div>
              <p className="text-sm text-gray-200 mb-3">{selected.task2}</p>
              <input
                type="number"
                min="0"
                max="6"
                placeholder="Score (0–6)"
                value={scores.task2 || ""}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl w-32 mb-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                onChange={(e) => updateScore("task2", e.target.value)}
              />
              <div className="text-gray-400 text-sm mb-1 font-medium">Feedback:</div>
              <textarea
                placeholder="Write feedback for Task 2..."
                value={feedbacks.task2}
                onChange={(e) => setFeedbacks({ ...feedbacks, task2: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                rows={3}
              />
            </section>

            <section className="mb-6">
              <h3 className="font-medium text-white mb-2">Overall Band</h3>
              <div className="px-3 py-2 border border-white/10 rounded-xl w-40 bg-white/5 text-gray-200">
                {band || "–"}
              </div>
            </section>

            {(() => {
              const user = users.find(u => u.id === selected.user_id);
              const isPremium = user?.premium_duration && new Date(user.premium_duration) > new Date();
              return isPremium && (
                <label className="flex items-center gap-2 mb-4 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-violet-500" /> Send result to email
                </label>
              );
            })()}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleSubmitReview(selected.id)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition disabled:opacity-50 font-medium"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}