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

  useEffect(() => {
    api.get("/mock/writing/results").then(res => {
      setMOCK(res.data);
      api.get(`/mock/writing/mock/${res.data[0].mock_id}`).then(res => {
        setMockData(res.data);
      }).catch(err => {
        console.log(err);
      })

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

  const updateScore = (field, value) => {
    const v = Number(value);
    const newScores = { ...scores, [field]: v };
    setScores(newScores);

    // Auto band calculation (example rule)
    const total = newScores.task11 + newScores.task12 + newScores.task2;

    if (total <= 7) setBand("B1");
    else if (total <= 12) setBand("B2");
    else if (total <= 16) setBand("C1");
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

  if (!users || !MOCK || !mockData) {
    return (
      <div>Please wait...</div>
    )
  }
  return (
    <div className="p-6">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Writing Mocks — Reviews</h1>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, fullname or username..."
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

      {/* LIST */}
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
            {MOCK.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">{users.filter(user => user.id == u.user_id)[0].username}</td>

                <td className="px-4 py-4 text-sm">

                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${(() => {
                      const user = users.find(user => user.id === u.user_id);
                      if (!user || !user.premium_duration) return "bg-gray-100 text-gray-700"; // null yoki user yo'q
                      const now = new Date();
                      const premiumDate = new Date(user.premium_duration);
                      return premiumDate > now ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700";
                    })()
                      }`}
                  >
                    {(() => {
                      const user = users.find(user => user.id === u.user_id);
                      if (!user || !user.premium_duration) return "Standard";
                      const now = new Date();
                      const premiumDate = new Date(user.premium_duration);
                      return premiumDate > now ? "Premium" : "Standard";
                    })()}
                  </span>


                  {u.result && (
                    <span className="ml-2 text-green-600 text-xs font-semibold">
                      ✔ Checked
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 text-xs text-gray-500">
                  {new Date(u.created_at).toLocaleString()}
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelected(u);
                      setScores({ task11: 0, task12: 0, task2: 0 });
                      setBand("");
                      setFeedbacks({ task11: "", task12: "", task2: "" });
                    }}
                    className="px-3 py-1 bg-rose-600 text-white rounded text-sm"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />

          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-1">
              {users.filter(user => user.id == selected.user_id)[0].username} — ID:{selected.id}
            </h2>
            <div className="text-xs text-gray-500 mb-5">
              {new Date(selected.created_at).toLocaleString()}
            </div>

            {/* TASK 1.1 */}
            <section className="mb-6">
              <h3 className="font-medium mb-2">Task 1.1</h3>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Question:
              </div>
              <p className="text-sm text-gray-600 mb-3">{mockData.task1.task11}</p>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Student Answer:
              </div>
              <p className="text-sm text-gray-700 mb-3">{selected.task1.split(" ---TASK--- ")[0]}</p>

              <div className="flex gap-3 mb-3">
                <input
                  type="number"
                  min="0"
                  max="5"
                  placeholder="Score (0–5)"
                  value={scores.task11 || ""}
                  className="px-3 py-2 border rounded w-32"
                  onChange={(e) => updateScore("task11", e.target.value)}
                />
              </div>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Feedback:
              </div>
              <textarea
                placeholder="Write feedback for Task 1.1..."
                value={feedbacks.task11}
                onChange={(e) => setFeedbacks({ ...feedbacks, task11: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
                rows="3"
              />
            </section>

            {/* TASK 1.2 */}
            <section className="mb-6">
              <h3 className="font-medium mb-2">Task 1.2</h3>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Question:
              </div>
              <p className="text-sm text-gray-600 mb-3">{mockData.task1.task12}</p>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Student Answer:
              </div>
              <p className="text-sm text-gray-700 mb-3">{selected.task1.split(" ---TASK--- ")[1]}</p>

              <input
                type="number"
                min="0"
                max="6"
                placeholder="Score (0–6)"
                value={scores.task12 || ""}
                className="px-3 py-2 border rounded w-32 mb-3"
                onChange={(e) => updateScore("task12", e.target.value)}
              />

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Feedback:
              </div>
              <textarea
                placeholder="Write feedback for Task 1.2..."
                value={feedbacks.task12}
                onChange={(e) => setFeedbacks({ ...feedbacks, task12: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
                rows="3"
              />
            </section>

            {/* TASK 2 */}
            <section className="mb-6">
              <h3 className="font-medium mb-2">Task 2</h3>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Question:
              </div>
              <p className="text-sm text-gray-600 mb-3">{mockData.task2.task2}</p>

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Student Answer:
              </div>
              <p className="text-sm text-gray-700 mb-3">{selected.task2}</p>

              <input
                type="number"
                min="0"
                max="6"
                placeholder="Score (0–6)"
                value={scores.task2 || ""}
                className="px-3 py-2 border rounded w-32 mb-3"
                onChange={(e) => updateScore("task2", e.target.value)}
              />

              <div className="text-gray-700 text-sm mb-1 font-medium">
                Feedback:
              </div>
              <textarea
                placeholder="Write feedback for Task 2..."
                value={feedbacks.task2}
                onChange={(e) => setFeedbacks({ ...feedbacks, task2: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
                rows="3"
              />
            </section>

            {/* AUTO BAND */}
            <section className="mb-6">
              <h3 className="font-medium mb-2">Overall Band</h3>

              <div className="px-3 py-2 border rounded w-40 bg-gray-50">
                {band || "–"}
              </div>
            </section>

            {/* EMAIL CHECKBOX */}
            {(() => {
              const user = users.find(user => user.id === selected.user_id);
              if (!user || !user.premium_duration) return null;

              const now = new Date();
              const premiumDate = new Date(user.premium_duration);
              const isPremium = premiumDate > now;

              return isPremium && (
                <label className="flex items-center gap-2 mb-4 text-sm">
                  <input type="checkbox" /> Send result to email
                </label>
              );
            })()}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              <button
                onClick={() => handleSubmitReview(selected.id)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white rounded disabled:opacity-50"
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