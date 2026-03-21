import React, { useEffect, useMemo, useState } from "react";
import { Crown, Mic2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { CatalogAside, CatalogCard, CatalogModal, CatalogShell } from "./CefrCatalogLayout";

const FREE_LIMIT = 4;

function getSpeakingGroups(mock) {
  return Object.keys(mock?.questions || {}).sort();
}

export default function SpeakingList({ isPremium = false }) {
  const navigate = useNavigate();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMock, setSelectedMock] = useState(null);

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/mock/speaking/all");
        setMocks(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Speaking mocks fetch failed:", err);
        setMocks([]);
        setError("Speaking mocks could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchMocks();
  }, []);

  const visibleMocks = useMemo(() => {
    return mocks.filter((mock) => {
      const preview = Object.values(mock.questions || {}).flat().map((item) => item?.question_text || "").join(" ").toLowerCase();
      return !search.trim() || preview.includes(search.trim().toLowerCase());
    });
  }, [mocks, search]);

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
        badge="CEFR Speaking"
        title="Speaking mocks that show the prompt before the pressure."
        description="Learners can preview real prompt text, see how many speaking rounds are inside, and start immediately with fewer surprises."
        accentClass="from-fuchsia-500 to-rose-400"
        stats={[
          { label: "Available mocks", value: loading ? "..." : String(mocks.length), helper: "Speaking sessions in catalog" },
          { label: "Open for free", value: isPremium ? "All" : String(Math.min(FREE_LIMIT, mocks.length)), helper: "First speaking mocks" },
          { label: "Interview style", value: "Live", helper: "Prompt-response flow" },
        ]}
        searchValue={search}
        onSearchChange={setSearch}
        onRandom={selectRandomMock}
        aside={<CatalogAside title="Speaking needs confidence before entry." description="The old list only hinted at the mock. This version shows a real preview, keeps access rules obvious, and launches the learner directly." bullets={["Prompt search works across all speaking questions.", "Cards preview a real example question.", "Modal keeps the final launch one click away."]} />}
      >
        {loading && <div className="col-span-full rounded-[28px] border border-slate-200 bg-white/80 px-6 py-16 text-center text-slate-500">Loading speaking mocks...</div>}
        {!loading && error && <div className="col-span-full rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700">{error}</div>}
        {!loading && !error && visibleMocks.length === 0 && <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center text-slate-500">No speaking mocks matched your search.</div>}

        {!loading &&
          !error &&
          visibleMocks.map((mock, index) => (
            <CatalogCard
              key={mock.id}
              title={`Speaking mock ${index + 1}`}
              description={mock.questions?.["1.1"]?.[0]?.question_text || "Timed speaking practice with guided question rounds."}
              meta={[`${getSpeakingGroups(mock).length} prompt groups`, "Recorded response flow", !isPremium && index >= FREE_LIMIT ? "Premium" : "Open now"]}
              badge="Interview set"
              accentClass="from-fuchsia-500 to-rose-400"
              locked={!isPremium && index >= FREE_LIMIT}
              onClick={() => openMock(mock, index)}
            />
          ))}
      </CatalogShell>

      <CatalogModal
        open={Boolean(selectedMock)}
        title="Speaking mock setup"
        subtitle="Review a sample prompt and launch the speaking interface."
        accentClass="from-fuchsia-500 to-rose-500"
        onClose={() => setSelectedMock(null)}
        headerAction={
          <button
            type="button"
            onClick={() => navigate(`/mock/cefr/speaking/${selectedMock.id}`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950"
            style={{ backgroundColor: "#ffffff", color: "#020617" }}
          >
            <Crown size={16} />
            Start mock
          </button>
        }
      >
        {selectedMock && (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><Mic2 size={18} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950">Preview question</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{selectedMock.questions?.["1.1"]?.[0]?.question_text || "Speaking prompts will open inside the mock interface."}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {getSpeakingGroups(selectedMock).slice(0, 6).map((groupKey) => (
                <div key={groupKey} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Group {groupKey}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{selectedMock.questions?.[groupKey]?.[0]?.question_text || "Speaking prompt group"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CatalogModal>
    </>
  );
}
