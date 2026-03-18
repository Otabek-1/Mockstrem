import React, { useEffect, useMemo, useState } from "react";
import { Flame, Radar, PlayCircle, RefreshCcw, Sparkles, Trophy, Clock3, Target, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { getActiveMockProgress } from "../services/mockProgress";

const SKILL_META = {
  listening: { label: "Listening", color: "#0f766e" },
  reading: { label: "Reading", color: "#0ea5e9" },
  writing: { label: "Writing", color: "#f97316" },
  speaking: { label: "Speaking", color: "#db2777" },
};

function RadarChart({ data }) {
  const size = 320;
  const center = size / 2;
  const radius = 108;
  const labels = Object.keys(SKILL_META);
  const points = labels.map((key, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / labels.length;
    const value = Math.max(0, Math.min(100, Number(data?.[key]?.score || 0))) / 100;
    return {
      key,
      angle,
      x: center + Math.cos(angle) * radius * value,
      y: center + Math.sin(angle) * radius * value,
      labelX: center + Math.cos(angle) * (radius + 28),
      labelY: center + Math.sin(angle) * (radius + 28),
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px]">
      {[0.25, 0.5, 0.75, 1].map((step) => {
        const ring = labels
          .map((key, index) => {
            const angle = (-Math.PI / 2) + (index * Math.PI * 2) / labels.length;
            return `${center + Math.cos(angle) * radius * step},${center + Math.sin(angle) * radius * step}`;
          })
          .join(" ");
        return <polygon key={step} points={ring} fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />;
      })}
      {labels.map((key, index) => {
        const angle = (-Math.PI / 2) + (index * Math.PI * 2) / labels.length;
        return (
          <line
            key={key}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="rgba(148,163,184,0.22)"
          />
        );
      })}
      <polygon points={polygon} fill="rgba(14,165,233,0.16)" stroke="#38bdf8" strokeWidth="3" />
      {points.map((point) => (
        <g key={point.key}>
          <circle cx={point.x} cy={point.y} r="5" fill={SKILL_META[point.key].color} />
          <text x={point.labelX} y={point.labelY} textAnchor="middle" className="fill-slate-200 text-[13px] font-semibold">
            {SKILL_META[point.key].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function formatDateLabel(raw) {
  if (!raw) return "No attempts yet";
  return new Date(raw).toLocaleString();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "Saved";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m left`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s left`;
}

export default function Main() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNews, setCurrentNews] = useState(0);

  const refreshActiveProgress = () => {
    getActiveMockProgress().then((progress) => {
      setDashboard((prev) => {
        if (!prev) return prev;
        return { ...prev, active_progress: progress || null };
      });
    }).catch(() => {});
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashboardRes, newsRes] = await Promise.all([
          api.get("/dashboard/home"),
          api.get("/news/"),
        ]);
        setDashboard(dashboardRes.data);
        setNews(Array.isArray(newsRes.data) ? newsRes.data.slice(0, 3) : []);
      } catch (error) {
        console.error("Dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeProgress = dashboard?.active_progress || null;
  const history = dashboard?.history || [];
  const skillScores = dashboard?.skill_scores || {};
  const focus = dashboard?.cards?.focus;
  const trend = dashboard?.cards?.trend;
  const featuredNews = news[currentNews] || null;

  const strongestSkill = useMemo(() => {
    const entries = Object.entries(skillScores);
    if (!entries.length) return null;
    return entries.sort((a, b) => (b[1]?.score || 0) - (a[1]?.score || 0))[0];
  }, [skillScores]);

  const weakestSkill = useMemo(() => {
    const entries = Object.entries(skillScores);
    if (!entries.length) return null;
    return entries.sort((a, b) => (a[1]?.score || 0) - (b[1]?.score || 0))[0];
  }, [skillScores]);

  useEffect(() => {
    if (!dashboard) return undefined;

    refreshActiveProgress();

    const handleFocus = () => refreshActiveProgress();
    const timer = setInterval(() => refreshActiveProgress(), 8000);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [Boolean(dashboard)]);

  useEffect(() => {
    if (news.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % news.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [news]);

  if (loading) {
    return (
      <div className="min-h-[70vh] rounded-[32px] bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-300">Building your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen rounded-[32px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.24),_transparent_24%),linear-gradient(135deg,_#020617,_#0f172a_48%,_#111827)] text-white p-4 md:p-6">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Performance Room</p>
              <h1 className="mt-3 text-3xl md:text-5xl font-black leading-tight">
                Pressure reveals the gap.
                <span className="block text-cyan-300">Consistency closes it.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm md:text-base text-slate-300 leading-7">
                {dashboard?.quote}
              </p>
            </div>
            <div className="grid gap-3 min-w-[220px]">
              <div className="rounded-2xl bg-emerald-400/10 border border-emerald-300/20 p-4">
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                  <Flame size={16} />
                  Daily streak
                </div>
                <p className="mt-3 text-4xl font-black">{dashboard?.streak?.current || 0}</p>
                <p className="text-xs text-slate-300 mt-1">This week: {dashboard?.streak?.this_week || 0} attempts</p>
              </div>
              <div className="rounded-2xl bg-white/6 border border-white/10 p-4">
                <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold">
                  <Trophy size={16} />
                  Strongest edge
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {strongestSkill ? `${SKILL_META[strongestSkill[0]].label} ${strongestSkill[1]?.score || 0}%` : "Build your first score"}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {weakestSkill ? `Weakest signal: ${SKILL_META[weakestSkill[0]].label}` : "No weak area yet"}
                </p>
              </div>
            </div>
          </div>

          {activeProgress && (
            <div className="mt-6 rounded-[24px] border border-cyan-300/30 bg-cyan-400/10 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Continue Last Mock</p>
                <h2 className="mt-2 text-2xl font-bold">{activeProgress.title || "Saved mock session"}</h2>
                <p className="mt-2 text-sm text-slate-200">
                  Your timer and answers are saved. Resume from the exact point you left.
                </p>
                <p className="mt-3 text-xs text-cyan-100/80">
                  {formatTime(activeProgress.remaining_seconds)} • last activity {formatDateLabel(activeProgress.last_activity_at)}
                </p>
              </div>
              <button
                onClick={() => navigate(activeProgress.route_path)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 px-5 py-3 font-bold hover:scale-[1.02] transition"
              >
                <RefreshCcw size={18} />
                Continue
              </button>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold">
            <Radar size={16} />
            4-skill map
          </div>
          <div className="mt-4 flex justify-center">
            <RadarChart data={skillScores} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.keys(SKILL_META).map((skill) => (
              <div key={skill} className="rounded-2xl bg-black/20 border border-white/8 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{SKILL_META[skill].label}</p>
                <p className="mt-1 text-2xl font-bold">{skillScores?.[skill]?.score || 0}%</p>
                <p className="text-xs text-slate-400 mt-1">{skillScores?.[skill]?.attempts || 0} scored attempts</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 mt-4 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-amber-200 text-sm font-semibold">
            <Sparkles size={16} />
            Motivation engine
          </div>
          <div className="mt-4 rounded-[22px] bg-gradient-to-br from-amber-400/16 to-orange-500/10 border border-amber-300/20 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-100/70">Daily focus</p>
            <h3 className="mt-3 text-2xl font-bold">{focus?.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">{focus?.body}</p>
            <button
              onClick={() => navigate(focus?.route_path || "/dashboard")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-300 text-slate-950 px-4 py-3 font-bold"
            >
              <PlayCircle size={18} />
              {focus?.button_label || "Start"}
            </button>
          </div>
          <div className="mt-4 rounded-[22px] bg-white/6 border border-white/10 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">Trend card</p>
            <h3 className="mt-3 text-xl font-bold">{trend?.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{trend?.body}</p>
            <button
              onClick={() => navigate(trend?.route_path || "/mock/cefr/full")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/8 transition"
            >
              <Target size={18} />
              {trend?.button_label || "Open"}
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Last 10 mocks</p>
              <p className="text-xs text-slate-400 mt-1">Your recent history and result trail.</p>
            </div>
            <Link to="/mock/cefr/full" className="text-xs text-cyan-200 hover:text-cyan-100">
              Try full mock
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {history.length > 0 ? history.map((item) => (
              <button
                key={item.id}
                onClick={() => item.route_path && navigate(item.route_path)}
                className="w-full rounded-[22px] border border-white/8 bg-black/15 p-4 text-left hover:bg-white/8 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.exam_type.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 text-lg font-bold text-white">{item.title || "Mock attempt"}</h3>
                    <p className="mt-1 text-xs text-slate-400">{formatDateLabel(item.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <div className="rounded-xl bg-white text-slate-950 px-3 py-2 text-sm font-black inline-flex items-center gap-2">
                      <Clock3 size={15} />
                      {item.score_75 !== null && item.score_75 !== undefined ? `${item.score_75}/75` : "Submitted"}
                    </div>
                    {item.band && <p className="mt-2 text-xs text-cyan-200">Band {item.band}</p>}
                  </div>
                </div>
              </button>
            )) : (
              <div className="rounded-[22px] border border-dashed border-white/14 bg-black/10 p-8 text-center text-slate-400">
                Your completed mocks will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Quick jump</p>
              <p className="text-xs text-slate-400 mt-1">Go straight into the skill you want to pressure-test.</p>
            </div>
          </div>
          <div className="mt-4 rounded-[22px] border border-white/8 bg-black/15 p-5">
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/dashboard?tab=cefr_listening")} className="rounded-2xl bg-emerald-400/12 px-4 py-3 text-left">
                <p className="font-semibold">Listening</p>
                <p className="text-xs text-slate-300 mt-1">Timed audio pressure</p>
              </button>
              <button onClick={() => navigate("/dashboard?tab=cefr_reading")} className="rounded-2xl bg-sky-400/12 px-4 py-3 text-left">
                <p className="font-semibold">Reading</p>
                <p className="text-xs text-slate-300 mt-1">Accuracy under pace</p>
              </button>
              <button onClick={() => navigate("/dashboard?tab=cefr_writing")} className="rounded-2xl bg-orange-400/12 px-4 py-3 text-left">
                <p className="font-semibold">Writing</p>
                <p className="text-xs text-slate-300 mt-1">Timed production</p>
              </button>
              <button onClick={() => navigate("/dashboard?tab=cefr_speaking")} className="rounded-2xl bg-pink-400/12 px-4 py-3 text-left">
                <p className="font-semibold">Speaking</p>
                <p className="text-xs text-slate-300 mt-1">Live answer pressure</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-7 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold">
              <Newspaper size={16} />
              Platform news
            </div>
            <p className="text-xs text-slate-400 mt-1">Updates, releases, announcements and what to watch next.</p>
          </div>
          {news.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentNews((prev) => (prev - 1 + news.length) % news.length)}
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentNews((prev) => (prev + 1) % news.length)}
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {featuredNews ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
            <Link
              to={`/news/${featuredNews.slug}`}
              className="block rounded-[26px] overflow-hidden border border-cyan-300/10 bg-gradient-to-br from-cyan-400/14 via-sky-400/10 to-transparent p-6 hover:from-cyan-400/20 hover:via-sky-400/14 transition"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Featured update</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-black text-white leading-tight max-w-2xl">
                {featuredNews.title}
              </h2>
              <div
                className="mt-4 text-sm md:text-base text-slate-200 leading-7 line-clamp-5"
                dangerouslySetInnerHTML={{ __html: featuredNews.body }}
              />
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white text-slate-950 px-4 py-3 font-bold">
                Read update
              </div>
            </Link>

            <div className="space-y-3">
              {news.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className={[
                    "block rounded-[22px] border p-4 transition",
                    index === currentNews
                      ? "border-cyan-300/20 bg-cyan-400/10"
                      : "border-white/8 bg-black/15 hover:bg-white/8",
                  ].join(" ")}
                >
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">News #{index + 1}</p>
                  <h3 className="mt-2 text-lg font-bold text-white line-clamp-2">{item.title}</h3>
                  <div className="mt-2 text-sm text-slate-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.body }} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-white/14 bg-black/10 p-10 text-center text-slate-400">
            News cards are not available right now.
          </div>
        )}
      </section>
    </div>
  );
}
