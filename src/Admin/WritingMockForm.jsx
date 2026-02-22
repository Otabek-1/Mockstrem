import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import api from "../api";

export default function WritingMockForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const edit = searchParams.get("edit") === "true";
  const mockId = searchParams.get("id");

  const [scenario, setScenario] = useState("");
  const [task11, setTask11] = useState("");
  const [task12, setTask12] = useState("");
  const [task2, setTask2] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (edit && mockId) {
      api.get(`/mock/writing/mock/${mockId}`)
        .then(res => {
          const data = res.data;
          setScenario(data.task1?.scenario || "");
          setTask11(data.task1?.task11 || "");
          setTask12(data.task1?.task12 || "");
          setTask2(data.task2?.task2 || "");
          setImages(data.images || []);
        })
        .catch(() => alert("Error loading mock data"));
    }
  }, [edit, mockId]);

  const submit = () => {
    const body = {
      images,
      task1: { scenario, task11, task12 },
      task2: { task2 },
    };
    if (edit && mockId) {
      api.put(`/mock/writing/update/${mockId}`, body)
        .then(() => {
          alert("Mock updated successfully");
          navigate("/admin/dashboard");
        })
        .catch(() => alert("Error updating mock"));
    } else {
      api.post("/mock/writing/create", body)
        .then(() => {
          alert("Mock created successfully");
          navigate("/admin/dashboard");
        })
        .catch(() => alert("Error creating mock"));
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">
          {edit ? "Writing mockni tahrirlash" : "Yangi Writing mock"}
        </h1>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div>
            <label className="block font-semibold text-gray-200 mb-2">Part 1 Scenario:</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              rows={4}
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Scenario matnini kiriting..."
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-200 mb-2">Task 1.1 Prompt:</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              rows={4}
              value={task11}
              onChange={(e) => setTask11(e.target.value)}
              placeholder="Task 1.1 prompt..."
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-200 mb-2">Task 1.2 Prompt:</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              rows={4}
              value={task12}
              onChange={(e) => setTask12(e.target.value)}
              placeholder="Task 1.2 prompt..."
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-200 mb-2">Part 2 – Task 2 Prompt:</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              rows={4}
              value={task2}
              onChange={(e) => setTask2(e.target.value)}
              placeholder="Task 2 prompt..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-500 transition"
            >
              <Save className="w-4 h-4" />
              {edit ? "Saqlash" : "Save Mock"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 transition"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
