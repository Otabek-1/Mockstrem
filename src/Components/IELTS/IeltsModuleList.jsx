import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock3, Trophy, Radio, BookOpen, Mic, PenSquare, Shuffle, Filter } from "lucide-react";
import { FaCrown } from "react-icons/fa";
import api from "../../api";

const MODULE_META = {
  reading: {
    title: "IELTS Reading CDI",
    icon: BookOpen,
    accent: "from-sky-600 to-cyan-500",
    points: ["40 savol", "60 daqiqa", "Auto-scoring"],
  },
  listening: {
    title: "IELTS Listening CDI",
    icon: Radio,
    accent: "from-emerald-600 to-teal-500",
    points: ["Audio timeline", "40 savol", "Band map"],
  },
  writing: {
    title: "IELTS Writing CDI",
    icon: PenSquare,
    accent: "from-orange-600 to-amber-500",
    points: ["Task 1 + Task 2", "Word tracker", "Timed layout"],
  },
  speaking: {
    title: "IELTS Speaking CDI",
    icon: Mic,
    accent: "from-fuchsia-600 to-pink-500",
    points: ["Part flow", "Prep timer", "Recording helper"],
  },
};

export default function IeltsModuleList({ module = "reading", isPremium = false }) {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [onlyAcademic, setOnlyAcademic] = useState(false);
  const [onlyGeneral, setOnlyGeneral] = useState(false);
  const [onlyPublished, setOnlyPublished] = useState(true);
  const [sortMode, setSortMode] = useState("recent");

  const meta = MODULE_META[module] || MODULE_META.reading;
  const Icon = meta.icon;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [testsRes, subsRes] = await Promise.all([
          api.get(`/ielts/tests?module=${module}&published_only=${onlyPublished}`),
          api.get("/ielts/submissions/me"),
        ]);
        setTests(Array.isArray(testsRes.data?.tests) ? testsRes.data.tests : []);
        setSubmissions(Array.isArray(subsRes.data?.submissions) ? subsRes.data.submissions : []);
      } catch (e) {
        setError("IELTS testlar yuklanmadi. Keyinroq urinib ko'ring.");
        setTests([]);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [module, onlyPublished]);

  const filteredTests = useMemo(() => {
    let list = [...tests];
    if (onlyAcademic) list = list.filter((item) => item.exam_track === "academic");
    if (onlyGeneral) list = list.filter((item) => item.exam_track === "general");
    if (sortMode === "duration_asc") list.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
    if (sortMode === "duration_desc") list.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0));
    if (sortMode === "title_asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [tests, onlyAcademic, onlyGeneral, sortMode]);

  const highlighted = useMemo(() => filteredTests.slice(0, 2), [filteredTests]);

  const moduleAttempts = useMemo(
    () => submissions.filter((item) => item.module === module).length,
    [submissions, module]
  );
  const latestBand = useMemo(() => {
    const latest = submissions.find((item) => item.module === module && item.band);
    return latest?.band || "-";
  }, [submissions, module]);

  const openTest = (test, idx) => {
    const canAccess = isPremium || idx < 3;
    if (!canAccess) {
      navigate("/plans");
      return;
    }
    setSelectedTest(test);
  };

  const openRandom = () => {
    if (!filteredTests.length) return;
    const accessible = isPremium ? filteredTests : filteredTests.slice(0, 3);
    if (!accessible.length) {
      navigate("/plans");
      return;
    }
    const randomIdx = Math.floor(Math.random() * accessible.length);
    setSelectedTest(accessible[randomIdx]);
  };

  return (
    <section className="w-full min-h-screen p-6 bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className={`rounded-3xl bg-gradient-to-r ${meta.accent} text-white p-7 shadow-2xl mb-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{meta.title}</h2>
            <p className="mt-2 text-sm text-white/90 max-w-2xl">
              IELTS Computer Delivered Interface formatida real exam atmosferasi: timer, section-flow,
              instant natija va test history.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <Icon size={30} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
          {meta.points.map((point) => (
            <div key={point} className="rounded-xl bg-white/10 px-4 py-2 border border-white/20">
              {point}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-white/15 px-4 py-2 border border-white/20">
            Attempts: <span className="font-bold">{moduleAttempts}</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 border border-white/20">
            Latest band: <span className="font-bold">{latestBand}</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 border border-white/20">
            Access: <span className="font-bold">{isPremium ? "Premium" : "Basic (first 3)"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openRandom}
            disabled={loading || filteredTests.length === 0}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Shuffle size={15} /> Random Mock
          </button>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
            <Filter size={14} /> Filters
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyAcademic}
              onChange={(e) => {
                setOnlyAcademic(e.target.checked);
                if (e.target.checked) setOnlyGeneral(false);
              }}
            />
            Academic
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyGeneral}
              onChange={(e) => {
                setOnlyGeneral(e.target.checked);
                if (e.target.checked) setOnlyAcademic(false);
              }}
            />
            General
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyPublished}
              onChange={(e) => setOnlyPublished(e.target.checked)}
            />
            Published only
          </label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="ml-auto border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="recent">Sort: Recent</option>
            <option value="duration_asc">Duration low-high</option>
            <option value="duration_desc">Duration high-low</option>
            <option value="title_asc">Title A-Z</option>
          </select>
        </div>
      </div>

      {highlighted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {highlighted.map((test) => (
            <div key={`highlight-${test.id}`} className="rounded-2xl bg-white border border-slate-200 shadow-md p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-slate-500">Featured</p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{test.exam_track}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-2">{test.title}</h3>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{test.description || "No description"}</p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-slate-600">Yuklanmoqda...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTests.map((test, idx) => {
            const canAccess = isPremium || idx < 3;
            return (
              <article
                key={test.id}
                onClick={() => openTest(test, idx)}
                className={`rounded-2xl p-5 border transition-all ${
                  canAccess
                    ? "bg-white border-slate-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                    : "bg-slate-100 border-slate-200 opacity-75 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{test.title}</h3>
                  {!canAccess ? <FaCrown className="text-amber-500" /> : <Trophy className="text-emerald-600" size={18} />}
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{test.description || "IELTS practice test"}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {test.duration_minutes} min</span>
                  <span>{test.level}</span>
                </div>
              </article>
            );
          })}
          {filteredTests.length === 0 && <p className="text-slate-500">Hozircha testlar qo'shilmagan.</p>}
        </div>
      )}

      {selectedTest && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[110]" onClick={() => setSelectedTest(null)} />
          <div className="fixed z-[111] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className={`p-5 bg-gradient-to-r ${meta.accent} text-white`}>
              <h3 className="text-2xl font-bold">{selectedTest.title}</h3>
              <p className="text-sm text-white/90 mt-1">CDI simulation format</p>
            </div>
            <div className="p-6">
              <p className="text-slate-700">{selectedTest.description || "Bu test real exam jarayoniga yaqinlangan mock interface bilan ochiladi."}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-slate-100 p-3">
                  <p className="text-slate-500">Track</p>
                  <p className="font-bold text-slate-800">{selectedTest.exam_track}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <p className="text-slate-500">Duration</p>
                  <p className="font-bold text-slate-800">{selectedTest.duration_minutes} min</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <p className="text-slate-500">Level</p>
                  <p className="font-bold text-slate-800">{selectedTest.level}</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                >
                  Close
                </button>
                <Link
                  to={`/mock/ielts/${module}/${selectedTest.id}`}
                  className={`px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r ${meta.accent}`}
                >
                  Start CDI Mock
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

