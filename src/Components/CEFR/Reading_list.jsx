"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { CatalogAside, CatalogCard, CatalogModal, CatalogShell } from "./CefrCatalogLayout";

const FREE_LIMIT = 4;

function getReadingParts(mock) {
  return [1, 2, 3, 4, 5].map((num) => ({ num, data: mock?.[`part${num}`] })).filter((item) => Boolean(item.data));
}

export default function ReadingList({ isPremium = false }) {
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
        const res = await api.get("/mock/reading/all");
        setMocks(Array.isArray(res.data?.mocks) ? res.data.mocks : []);
        setError("");
      } catch (err) {
        console.error("Reading mocks fetch failed:", err);
        setMocks([]);
        setError("Reading tasks could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchMocks();
  }, []);

  const visibleMocks = useMemo(() => {
    return mocks.filter((mock) => {
      const text = getReadingParts(mock).map((part) => part.data?.description || "").join(" ").toLowerCase();
      const level = (mock.part1?.difficulty || "medium").toLowerCase();
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
        badge="CEFR Reading"
        title="Reading mocks that reveal structure before the start."
        description="Users can filter by difficulty, preview passage descriptions, and start a single part or full mock from one unified setup experience."
        accentClass="from-sky-500 to-cyan-400"
        stats={[
          { label: "Available mocks", value: loading ? "..." : String(mocks.length), helper: "Reading sets in catalog" },
          { label: "Open for free", value: isPremium ? "All" : String(Math.min(FREE_LIMIT, mocks.length)), helper: "First reading mocks" },
          { label: "Parts", value: "1-5", helper: "Open any section fast" },
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
        aside={<CatalogAside title="Reading needs better orientation." description="This redesign makes the number of parts, difficulty, and start options obvious before the learner commits to a mock." bullets={["Search works across part descriptions.", "Difficulty filter trims the list in real time.", "Part buttons remove the old guesswork in the modal."]} />}
      >
        {loading && <div className="col-span-full rounded-[28px] border border-slate-200 bg-white/80 px-6 py-16 text-center text-slate-500">Loading reading mocks...</div>}
        {!loading && error && <div className="col-span-full rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700">{error}</div>}
        {!loading && !error && visibleMocks.length === 0 && <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center text-slate-500">No reading mocks matched your filter.</div>}

        {!loading &&
          !error &&
          visibleMocks.map((mock, index) => (
            <CatalogCard
              key={mock.id}
              title={`Reading mock ${index + 1}`}
              description={mock.part1?.description || "Timed reading practice with five-part navigation."}
              meta={[`${getReadingParts(mock).length} parts`, `${mock.part1?.difficulty || "Medium"} level`, "65 min route"]}
              badge="Passage set"
              accentClass="from-sky-500 to-cyan-400"
              locked={!isPremium && index >= FREE_LIMIT}
              onClick={() => openMock(mock, index)}
            />
          ))}
      </CatalogShell>

      <CatalogModal
        open={Boolean(selectedMock)}
        title={selectedMock?.part1?.title || "Reading mock"}
        subtitle={selectedMock?.part1?.description || "Choose a part or launch the full mock."}
        accentClass="from-sky-500 to-cyan-500"
        onClose={() => setSelectedMock(null)}
        headerAction={
          <button
            type="button"
            onClick={() => (isPremium ? navigate(`/mock/cefr/reading/${selectedMock.id}?part=all`) : navigate("/plans"))}
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
            {getReadingParts(selectedMock).map((part) => (
              <button key={part.num} type="button" onClick={() => navigate(`/mock/cefr/reading/${selectedMock.id}?part=${part.num}`)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-white">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"><BookOpen size={18} /></div>
                <h3 className="mt-4 text-xl font-black text-slate-950">Part {part.num}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{part.data?.description || "Open this reading section directly."}</p>
                <p className="mt-4 text-sm font-semibold text-slate-700">{part.data?.time || "Timed section"}</p>
              </button>
            ))}
          </div>
        )}
      </CatalogModal>
    </>
  );
}
