import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Crown,
  Headphones,
  LayoutDashboard,
  LogOut,
  Mic2,
  PenSquare,
  Shield,
  Sparkles,
  Star,
  UserCircle2,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Main from "./Components/Main";
import WritingList from "./Components/CEFR/Writing_list";
import ReadingList from "./Components/CEFR/Reading_list";
import SpeakingList from "./Components/CEFR/Speaking_list";
import ListeningList from "./Components/CEFR/Listening_list";
import IELTSWritingList from "./Components/IELTS/Writing_list";
import IELTSListeningList from "./Components/IELTS/Listening_list";
import IELTSReadingList from "./Components/IELTS/Reading_list";
import IELTSSpeakingList from "./Components/IELTS/Speaking_list";
import Profile from "./Components/Profile";
import api from "./api";
import logo from "./assets/logo.jpg";

const FEEDBACK_VISIT_KEY = "ms_feedback_dashboard_visits";
const FEEDBACK_MODAL_SNOOZE_KEY = "ms_feedback_modal_snooze_until";
const FEEDBACK_VISIT_THRESHOLD = 5;
const FEEDBACK_MOCK_THRESHOLD = 3;
const FEEDBACK_SNOOZE_HOURS = 24;

const CEFR_SKILLS = [
  { id: "cefr_listening", label: "Listening", icon: Headphones, accent: "from-teal-500 to-emerald-400", summary: "Audio-first timed practice with part selection." },
  { id: "cefr_reading", label: "Reading", icon: BookOpen, accent: "from-sky-500 to-cyan-400", summary: "Passage preview and part-by-part starts." },
  { id: "cefr_writing", label: "Writing", icon: PenSquare, accent: "from-orange-500 to-amber-400", summary: "Task-first flow with timing clarity." },
  { id: "cefr_speaking", label: "Speaking", icon: Mic2, accent: "from-fuchsia-500 to-rose-400", summary: "Prompt preview and direct launch." },
];

const IELTS_SKILLS = [
  { id: "ielts_listening", label: "Listening", icon: Headphones, accent: "from-indigo-500 to-violet-400", summary: "Open the module directly from the hub." },
  { id: "ielts_reading", label: "Reading", icon: BookOpen, accent: "from-blue-500 to-cyan-400", summary: "Open the module directly from the hub." },
  { id: "ielts_writing", label: "Writing", icon: PenSquare, accent: "from-amber-500 to-orange-400", summary: "Open the module directly from the hub." },
  { id: "ielts_speaking", label: "Speaking", icon: Mic2, accent: "from-pink-500 to-rose-400", summary: "Open the module directly from the hub." },
];

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function HubSection({ eyebrow, title, description, items, onOpen, ctaLabel, ctaAction, bullets }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <section className="rounded-[32px] border border-white/60 bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item.id)}
                className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white"
              >
                <div className={["inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", item.accent].join(" ")}>
                  <Icon size={20} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-950">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  Open module
                  <ChevronRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-[32px] border border-[#1e293b] bg-[#0f172a] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
          <Sparkles size={14} />
          Fast lane
        </div>
        <h2 className="mt-5 text-3xl font-black tracking-tight">Use the shortest path to practice.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          This dashboard keeps the user focused on finding the right mock, understanding the workload, and starting without confusion.
        </p>
        <div className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {bullet}
            </div>
          ))}
        </div>
        <button type="button" onClick={ctaAction} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-950">
          {ctaLabel}
          <ChevronRight size={18} />
        </button>
      </aside>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState({ has_feedback: false, mock_submissions_count: 0, visit_count: 0 });

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        const data = res.data;
        setUser(data);
        setIsAdmin(data.role === "admin");
        setIsPremium(Boolean(data.premium_duration && new Date(data.premium_duration) > new Date()));
        if (data.id) {
          const notifRes = await api.get(`/notifications/${data.id}`);
          setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        }
      } catch (error) {
        console.error("Dashboard user fetch failed:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab) setActive(tab);
  }, [location.search]);

  useEffect(() => {
    const visitCount = Number(localStorage.getItem(FEEDBACK_VISIT_KEY) || "0") + 1;
    localStorage.setItem(FEEDBACK_VISIT_KEY, String(visitCount));
    setFeedbackSummary((prev) => ({ ...prev, visit_count: visitCount }));
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchFeedbackStatus = async () => {
      try {
        const res = await api.get("/feedback/me");
        const data = res.data || {};
        const hasFeedback = Boolean(data.has_feedback);
        const mockSubmissions = Number(data.mock_submissions_count || 0);
        const visitCount = Number(localStorage.getItem(FEEDBACK_VISIT_KEY) || "0");
        const snoozeUntil = Number(localStorage.getItem(FEEDBACK_MODAL_SNOOZE_KEY) || "0");
        const shouldPrompt = !hasFeedback && Date.now() > snoozeUntil && (visitCount >= FEEDBACK_VISIT_THRESHOLD || mockSubmissions >= FEEDBACK_MOCK_THRESHOLD);
        setFeedbackSummary({ has_feedback: hasFeedback, mock_submissions_count: mockSubmissions, visit_count: visitCount });
        if (shouldPrompt) setFeedbackModalOpen(true);
      } catch (error) {
        console.error("Feedback status fetch failed:", error);
      }
    };
    fetchFeedbackStatus();
  }, [user]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);
  const menuGroups = [
    { title: "Workspace", items: [{ id: "home", label: "Dashboard", icon: LayoutDashboard }, { id: "cefr_hub", label: "CEFR Skills", icon: Sparkles }, { id: "ielts_hub", label: "IELTS Skills", icon: Crown }, { id: "profile", label: "Profile", icon: UserCircle2 }] },
    { title: "CEFR Direct", items: CEFR_SKILLS.map((item) => ({ id: item.id, label: item.label, icon: item.icon })) },
  ];

  const activeMeta = useMemo(() => {
    if (active === "home") return { eyebrow: "MockStream cockpit", title: "One control room for every English exam flow.", description: "Open CEFR practice, jump into IELTS modules, and keep your progress visible without hunting through raw menus." };
    if (active === "cefr_hub") return { eyebrow: "CEFR skill lab", title: "Practice the exact skill that needs pressure.", description: "Choose the format, preview the workload, then enter the mock with the fewest clicks possible." };
    if (active === "ielts_hub") return { eyebrow: "IELTS prep lane", title: "Move between IELTS modules without losing context.", description: "Writing, listening, reading, and speaking stay grouped under one clean navigation layer." };
    const cefrItem = CEFR_SKILLS.find((item) => item.id === active);
    if (cefrItem) return { eyebrow: "CEFR module", title: `${cefrItem.label} with cleaner entry, clearer choices, and faster start.`, description: cefrItem.summary };
    const ieltsItem = IELTS_SKILLS.find((item) => item.id === active);
    if (ieltsItem) return { eyebrow: "IELTS module", title: `IELTS ${ieltsItem.label}`, description: "Stay inside the same shell while switching across IELTS skills." };
    return { eyebrow: "Account", title: "Your profile and platform access.", description: "Manage your account, subscription, and access settings from one place." };
  }, [active]);

  const handleSelect = (next) => {
    setActive(next);
    setProfileOpen(false);
    setNotificationsOpen(false);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const gotoNotification = (item) => {
    if (!item.is_read) api.put(`/notifications/${item.id}`, { title: item.title, body: item.body, is_read: true }).catch(() => {});
    setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, is_read: true } : entry)));
    if (item.title === "Writing mock results") {
      const id = item.body.split(" ")[2]?.split("")[1];
      if (id) nav(`/mock/result/${id}`);
    }
    setNotificationsOpen(false);
  };

  const closeFeedbackModal = (withSnooze = true) => {
    if (withSnooze) {
      const snoozeUntil = Date.now() + FEEDBACK_SNOOZE_HOURS * 60 * 60 * 1000;
      localStorage.setItem(FEEDBACK_MODAL_SNOOZE_KEY, String(snoozeUntil));
    }
    setFeedbackModalOpen(false);
  };

  const submitFeedback = async () => {
    if (feedbackSubmitting) return;
    if (!feedbackText.trim()) return alert("Please write your feedback.");
    try {
      setFeedbackSubmitting(true);
      await api.post("/feedback", { rating: feedbackRating, text: feedbackText.trim() });
      setFeedbackSummary((prev) => ({ ...prev, has_feedback: true }));
      localStorage.removeItem(FEEDBACK_MODAL_SNOOZE_KEY);
      setFeedbackModalOpen(false);
      setFeedbackText("");
    } catch (error) {
      console.error("Feedback submit failed:", error);
      alert("Could not send feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const renderContent = () => {
    if (active === "home") return <Main />;
    if (active === "cefr_hub") return <HubSection eyebrow="CEFR experience" title="Build CEFR confidence skill by skill." description="Each skill now opens through a cleaner catalog flow: clearer cards, fewer dead controls, direct part selection, and obvious premium boundaries." items={CEFR_SKILLS} onOpen={handleSelect} ctaLabel="Open full mock" ctaAction={() => nav("/mock/cefr/full")} bullets={["Cards show free vs premium access before the click.", "Every skill keeps random pick and direct start actions close.", "Part selection appears inside a focused modal instead of scattered buttons."]} />;
    if (active === "ielts_hub") return <HubSection eyebrow="IELTS experience" title="Switch IELTS modules without breaking your flow." description="Use one branded workspace for all IELTS modules instead of separate-looking mini pages." items={IELTS_SKILLS} onOpen={handleSelect} ctaLabel="Go home" ctaAction={() => handleSelect("home")} bullets={["One navigation model for all IELTS sections.", "Cleaner information hierarchy across modules.", "Same top account and notification controls everywhere."]} />;
    if (active === "cefr_writing") return <WritingList isPremium={isPremium} />;
    if (active === "cefr_reading") return <ReadingList isPremium={isPremium} />;
    if (active === "cefr_speaking") return <SpeakingList isPremium={isPremium} />;
    if (active === "cefr_listening") return <ListeningList isPremium={isPremium} />;
    if (active === "ielts_writing") return <IELTSWritingList isPremium={isPremium} />;
    if (active === "ielts_reading") return <IELTSReadingList isPremium={isPremium} />;
    if (active === "ielts_speaking") return <IELTSSpeakingList isPremium={isPremium} />;
    if (active === "ielts_listening") return <IELTSListeningList isPremium={isPremium} />;
    return <Profile />;
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6efe8]">
        <div className="rounded-[28px] border border-white/70 bg-white/90 px-10 py-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#efe4d6_0%,#f7f3ee_24%,#fbfaf8_100%)] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.1),transparent_28%)]" />
      <div className="relative flex min-h-screen">
        <aside className={["fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col border-r border-white/60 bg-[#0f172a] px-5 py-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] transition-transform lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => handleSelect("home")} className="flex items-center gap-3 text-left">
              <img src={logo} alt="MockStream" className="h-11 w-11 rounded-2xl object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">MockStream</p>
                <p className="text-xl font-black tracking-tight">Brand workspace</p>
              </div>
            </button>
            <button type="button" className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Membership</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black">{isPremium ? "Premium" : "Starter"}</p>
                <p className="mt-1 text-sm text-slate-300">{isPremium ? "Unlocked access across more mocks." : "First mocks stay open. Premium unlocks the full library."}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Crown size={20} className="text-amber-300" />
              </div>
            </div>
            {!isPremium && <Link to="/plans" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950">Upgrade plan<ChevronRight size={16} /></Link>}
          </div>

          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{group.title}</p>
                <div className="mt-3 space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={[
                          "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                          isActive
                            ? "bg-white shadow-[0_18px_45px_rgba(255,255,255,0.18)]"
                            : "text-slate-300 hover:bg-white/8 hover:text-white",
                        ].join(" ")}
                        style={isActive ? { color: "#020617" } : undefined}
                      >
                        <Icon size={18} style={isActive ? { color: "#020617" } : undefined} />
                        <span className="font-semibold" style={isActive ? { color: "#020617" } : undefined}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Account</p>
            <p className="mt-3 text-lg font-bold">{user.username}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="mt-4 flex gap-2">
              {isAdmin && <Link to="/admin/dashboard" target="_blank" className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-sm font-semibold text-orange-200"><Shield size={15} />Admin</Link>}
              <button type="button" onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); nav("/auth"); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200"><LogOut size={15} />Logout</button>
            </div>
          </div>
        </aside>

        <div className="relative flex min-h-screen flex-1 flex-col lg:pl-[290px]">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <LayoutDashboard size={18} />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{activeMeta.eyebrow}</p>
                  <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:text-2xl">{activeMeta.title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setNotificationsOpen((prev) => !prev); setProfileOpen(false); }} className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />}
                </button>
                <button type="button" onClick={() => { setProfileOpen((prev) => !prev); setNotificationsOpen(false); }} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  {user.google_avatar ? <img src={user.google_avatar} alt={user.username} className="h-10 w-10 rounded-2xl object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100"><UserCircle2 size={22} className="text-slate-700" /></div>}
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-bold text-slate-950">{user.username}</p>
                    <p className="text-xs text-slate-500">{isPremium ? "Premium member" : "Starter member"}</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-4 pb-4 md:px-8">
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{activeMeta.description}</p>
              {(active.startsWith("cefr_") || active === "cefr_hub") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {CEFR_SKILLS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        active === item.id ? "bg-slate-950" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                      style={active === item.id ? { color: "#ffffff" } : undefined}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main className="relative px-4 py-6 md:px-8 md:py-8">{renderContent()}</main>
        </div>

        {notificationsOpen && (
          <div className="fixed right-4 top-[84px] z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-sm font-bold text-slate-950">Notifications</p>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setNotificationsOpen(false)}><X size={16} /></button>
            </div>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
              {notifications.length > 0 ? notifications.map((item) => (
                <button key={item.id} type="button" onClick={() => gotoNotification(item)} className={["w-full rounded-2xl border p-4 text-left transition", item.is_read ? "border-slate-200 bg-slate-50 hover:bg-slate-100" : "border-sky-200 bg-sky-50 hover:bg-sky-100"].join(" ")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                    {!item.is_read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{formatTimeAgo(item.created_at)}</p>
                </button>
              )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No notifications yet.</div>}
            </div>
          </div>
        )}

        {profileOpen && (
          <div className="fixed right-4 top-[84px] z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              {user.google_avatar ? <img src={user.google_avatar} alt={user.username} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100"><UserCircle2 size={24} className="text-slate-700" /></div>}
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-950">{user.username}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <button type="button" onClick={() => handleSelect("profile")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-slate-50"><UserCircle2 size={18} className="text-slate-600" /><span className="font-semibold text-slate-900">Profile</span></button>
              <Link to="/plans" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50"><Crown size={18} className="text-amber-500" /><span className="font-semibold text-slate-900">Plans</span></Link>
              {isAdmin && <Link to="/admin/dashboard" target="_blank" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50"><Shield size={18} className="text-orange-500" /><span className="font-semibold text-slate-900">Admin panel</span></Link>}
              <button type="button" onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); nav("/auth"); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-rose-50"><LogOut size={18} className="text-rose-500" /><span className="font-semibold text-rose-700">Logout</span></button>
            </div>
          </div>
        )}

        {(profileOpen || notificationsOpen || sidebarOpen) && window.innerWidth < 1024 && <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden" onClick={() => { setSidebarOpen(false); setProfileOpen(false); setNotificationsOpen(false); }} />}

        {feedbackModalOpen && active === "home" && !feedbackSummary.has_feedback && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Product feedback</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">How is the new practice experience?</h2>
                  <p className="mt-2 text-sm text-slate-600">Visits: {feedbackSummary.visit_count} | Mock submissions: {feedbackSummary.mock_submissions_count}</p>
                </div>
                <button type="button" onClick={() => closeFeedbackModal(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-800">Rate MockStream</p>
                <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setFeedbackHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onMouseEnter={() => setFeedbackHoverRating(value)} onClick={() => setFeedbackRating(value)} className={["transition hover:scale-110", value <= (feedbackHoverRating || feedbackRating) ? "text-amber-400" : "text-slate-300"].join(" ")}>
                      <Star size={30} fill="currentColor" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-600">{feedbackHoverRating || feedbackRating}/5</span>
                </div>
              </div>
              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-800">Your feedback</label>
                <textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Tell us what feels better and what still slows you down." className="mt-2 min-h-32 w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white" />
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => closeFeedbackModal(true)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Later</button>
                <button type="button" onClick={submitFeedback} disabled={feedbackSubmitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{feedbackSubmitting ? "Sending..." : "Send feedback"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
