"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { CatalogAside, CatalogCard, CatalogModal, CatalogShell } from "./CefrCatalogLayout";

const FREE_LIMIT = 4;

function getParts(mock) {
  if (!mock) return [];
  return [1, 2, 3, 4, 5, 6].map((num) => ({ num, audio: mock[`audio_part_${num}`] })).filter((item) => Boolean(item.audio));
}

export default function ListeningList({ isPremium = false }) {
  const navigate = useNavigate();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMock, setSelectedMock] = useState(null);

  useEffect(() => {
    const loadMocks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/cefr/listening/all");
        setMocks(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Listening mocks fetch failed:", err);
        setMocks([]);
        setError("Listening mocks could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };
    loadMocks();
  }, []);

  const visibleMocks = useMemo(() => mocks.filter((mock) => !search.trim() || `${mock.title || ""}`.toLowerCase().includes(search.trim().toLowerCase())), [mocks, search]);

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
        badge="CEFR Listening"
        title="Audio mocks with part-level entry and less friction."
        description="The catalog shows how many listening parts are available in each mock and lets the learner jump into the exact part or the full mock from one place."
        accentClass="from-teal-500 to-emerald-400"
        stats={[
          { label: "Available mocks", value: loading ? "..." : String(mocks.length), helper: "Audio sets ready to open" },
          { label: "Open for free", value: isPremium ? "All" : String(Math.min(FREE_LIMIT, mocks.length)), helper: "First listening mocks" },
          { label: "Part structure", value: "1-6", helper: "Starts from any available part" },
        ]}
        searchValue={search}
        onSearchChange={setSearch}
        onRandom={selectRandomMock}
        aside={<CatalogAside title="Learners should not guess the audio structure." description="Each card now exposes the number of available parts before opening the mock. Inside the modal, every part is a direct launch button." bullets={["Part count is visible on the card.", "Full mock action stays pinned in the modal header.", "Free and premium access are clearly separated."]} />}
      >
        {loading && <div className="col-span-full rounded-[28px] border border-slate-200 bg-white/80 px-6 py-16 text-center text-slate-500">Loading listening mocks...</div>}
        {!loading && error && <div className="col-span-full rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700">{error}</div>}
        {!loading && !error && visibleMocks.length === 0 && <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center text-slate-500">No listening mocks matched your search.</div>}

        {!loading &&
          !error &&
          visibleMocks.map((mock, index) => (
            <CatalogCard
              key={mock.id}
              title={mock.title || `Listening mock ${index + 1}`}
              description="Timed CEFR listening practice with audio-led parts and direct launch flow."
              meta={[`${getParts(mock).length} parts`, "Audio ready", !isPremium && index >= FREE_LIMIT ? "Premium" : "Open now"]}
              badge="Audio set"
              accentClass="from-teal-500 to-emerald-400"
              locked={!isPremium && index >= FREE_LIMIT}
              onClick={() => openMock(mock, index)}
            />
          ))}
      </CatalogShell>

      <CatalogModal
        open={Boolean(selectedMock)}
        title={selectedMock?.title || "Listening mock"}
        subtitle="Choose a single listening part or launch the full mock."
        accentClass="from-teal-500 to-emerald-500"
        onClose={() => setSelectedMock(null)}
        headerAction={
          <button
            type="button"
            onClick={() => (isPremium ? navigate(`/mock/cefr/listening/${selectedMock.id}?part=all`) : navigate("/plans"))}
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
            {getParts(selectedMock).map((part) => (
              <button key={part.num} type="button" onClick={() => navigate(`/mock/cefr/listening/${selectedMock.id}?part=${part.num}`)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-white">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Headphones size={18} /></div>
                <h3 className="mt-4 text-xl font-black text-slate-950">Part {part.num}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">Start directly from this section with the saved CEFR listening interface.</p>
              </button>
            ))}
          </div>
        )}
      </CatalogModal>
    </>
  );
}
