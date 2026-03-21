"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { CatalogAside, CatalogCard, CatalogModal, CatalogShell } from "./CefrCatalogLayout";

const FREE_LIMIT = 4;

export default function WritingList({ isPremium = false }) {
  const navigate = useNavigate();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedMock, setSelectedMock] = useState(null);

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/mock/writing/all");
        setMocks(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Writing mocks fetch failed:", err);
        setMocks([]);
        setError("Writing tasks could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchMocks();
  }, []);

  const visibleMocks = useMemo(() => {
    return mocks.filter((mock) => {
      const text = `${mock.task1?.title || ""} ${mock.task1?.description || ""} ${mock.task2?.title || ""} ${mock.task2?.description || ""}`.toLowerCase();
      const level = (mock.task1?.difficulty || "medium").toLowerCase();
      const matchesSearch = !search.trim() || text.includes(search.trim().toLowerCase());
      const matchesDifficulty = difficulty === "all" || level === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [difficulty, mocks, search]);

  const openMock = (mock, index) => {
    const canAccess = isPremium || index < FREE_LIMIT;
    if (!canAccess) {
      navigate("/plans");
      return;
    }
    setSelectedMock(mock);
  };

  const selectRandomMock = () => {
    const accessible = visibleMocks.filter((_, index) => isPremium || index < FREE_LIMIT);
    if (!accessible.length) return;
    setSelectedMock(accessible[Math.floor(Math.random() * accessible.length)]);
  };

  return (
    <>
      <CatalogShell
        badge="CEFR Writing"
        title="Clear writing entry points instead of messy task picking."
        description="Users can search by prompt, filter difficulty, and choose Task 1, Task 2, or the full mock from one focused setup window."
        accentClass="from-orange-500 to-amber-400"
        stats={[
          { label: "Available mocks", value: loading ? "..." : String(mocks.length), helper: "Task 1 and Task 2 flows" },
          { label: "Open for free", value: isPremium ? "All" : String(Math.min(FREE_LIMIT, mocks.length)), helper: "Visible without upgrade" },
          { label: "Mode", value: "Timed", helper: "Single task or full mock" },
        ]}
        searchValue={search}
        onSearchChange={setSearch}
        onRandom={selectRandomMock}
        controls={
          <div className="flex flex-wrap gap-2">
            {["all", "easy", "medium", "hard"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDifficulty(option)}
                className={["rounded-full px-4 py-2 text-sm font-semibold transition", difficulty === option ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"].join(" ")}
              >
                {option === "all" ? "All levels" : option}
              </button>
            ))}
          </div>
        }
        aside={<CatalogAside title="Writing should feel deliberate." description="The new flow shows exactly what the learner is opening, how hard it is, and whether they want a single task or the full timed route." bullets={["Prompt preview on every card.", "Difficulty filter works before opening the modal.", "Premium boundary is visible before the user clicks deep."]} />}
      >
        {loading && <div className="col-span-full rounded-[28px] border border-slate-200 bg-white/80 px-6 py-16 text-center text-slate-500">Loading writing mocks...</div>}
        {!loading && error && <div className="col-span-full rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700">{error}</div>}
        {!loading && !error && visibleMocks.length === 0 && <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center text-slate-500">No writing mocks matched your filter.</div>}

        {!loading &&
          !error &&
          visibleMocks.map((mock, index) => (
            <CatalogCard
              key={mock.id}
              title={mock.task1?.title || `Writing mock ${index + 1}`}
              description={mock.task1?.description || "Timed CEFR writing practice with structured prompts."}
              meta={[`${mock.task1?.difficulty || "Medium"} level`, mock.task1?.time || "20 min task", mock.task2?.time || "40 min task"]}
              badge="Task flow"
              accentClass="from-orange-500 to-amber-400"
              locked={!isPremium && index >= FREE_LIMIT}
              onClick={() => openMock(mock, index)}
            />
          ))}
      </CatalogShell>

      <CatalogModal
        open={Boolean(selectedMock)}
        title={selectedMock?.task1?.title || "Writing mock"}
        subtitle={selectedMock?.task1?.description || ""}
        accentClass="from-orange-500 to-amber-500"
        onClose={() => setSelectedMock(null)}
        headerAction={
          <button
            type="button"
            onClick={() => (isPremium ? navigate(`/mock/cefr/writing/${selectedMock.id}?part=all`) : navigate("/plans"))}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950"
            style={{ backgroundColor: "#ffffff", color: "#020617" }}
          >
            <Crown size={16} />
            Full mock
          </button>
        }
      >
        {selectedMock && (
          <div className="grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => navigate(`/mock/cefr/writing/${selectedMock.id}?part=1`)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-white">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><PenSquare size={18} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950">Task 1</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selectedMock.task1?.description || "Visual or structured response practice."}</p>
              <p className="mt-4 text-sm font-semibold text-slate-700">{selectedMock.task1?.time || "20 min"}</p>
            </button>

            <button type="button" onClick={() => navigate(`/mock/cefr/writing/${selectedMock.id}?part=2`)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-white">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"><PenSquare size={18} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950">Task 2</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selectedMock.task2?.description || "Extended opinion or discussion essay."}</p>
              <p className="mt-4 text-sm font-semibold text-slate-700">{selectedMock.task2?.time || "40 min"}</p>
            </button>
          </div>
        )}
      </CatalogModal>
    </>
  );
}
