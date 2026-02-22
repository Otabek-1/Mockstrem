import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  Mic,
  PenLine,
  Newspaper,
  Sparkles,
} from "lucide-react";
import CEFR_Writing from "./CEFR_writing";
import UsersPage from "./Users";
import { useNavigate } from "react-router-dom";
import Main_admin from "./Main";
import CEFR_reading from "./CEFR_reading";
import CEFR_Speaking from "./CEFR_speaking";
import CEFR_Listening from "./CEFR_Listening";
import IELTSReadingAdmin from "./IELTS_reading";
import IELTSListeningAdmin from "./IELTS_listening";
import IELTSWritingAdmin from "./IELTS_writing";
import IELTSSpeakingAdmin from "./IELTS_speaking";

const MENU = [
  {
    id: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: null,
  },
  {
    id: "Users",
    label: "Foydalanuvchilar",
    icon: Users,
    component: null,
  },
  {
    id: "ielts",
    label: "IELTS",
    icon: Database,
    children: [
      { id: "ielts_writing", label: "Writing", icon: PenLine },
      { id: "ielts_listening", label: "Listening", icon: Mic },
      { id: "ielts_speaking", label: "Speaking", icon: Mic },
      { id: "ielts_reading", label: "Reading", icon: BookOpen },
    ],
  },
  {
    id: "cefr",
    label: "CEFR",
    icon: Settings,
    children: [
      { id: "cefr_writing", label: "Writing", icon: PenLine },
      { id: "cefr_listening", label: "Listening", icon: Mic },
      { id: "cefr_reading", label: "Reading", icon: BookOpen },
      { id: "cefr_speaking", label: "Speaking", icon: Mic },
    ],
  },
];

export default function Dashboard_admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const nav = useNavigate();

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const setMenu = (id) => {
    setActiveMenu(id);
  };

  const currentLabel = () => {
    if (activeMenu === "Dashboard") return "Boshqaruv paneli";
    if (activeMenu === "Users") return "Foydalanuvchilar";
    for (const m of MENU) {
      if (m.children) {
        const found = m.children.find((c) => c.id === activeMenu);
        if (found) return `${m.label} · ${found.label}`;
      }
    }
    return activeMenu;
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] flex">
      {/* Sidebar - glassmorphism dark */}
      <aside
        className={`
          fixed md:relative z-50 h-screen flex flex-col
          bg-[#0a0a0d]/95 backdrop-blur-xl border-r border-white/5
          transition-all duration-300 ease-out
          ${sidebarOpen ? "w-64" : "w-[72px]"}
        `}
      >
        {/* Logo / Brand */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight">Mockstream</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-widest">Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label={sidebarOpen ? "Sidebarni yopish" : "Sidebarni ochish"}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              const isExpanded = expandedId === item.id;
              const isActive = item.children.some((c) => c.id === activeMenu);
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                      ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0 text-violet-400" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 font-medium">{item.label}</span>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </>
                    )}
                  </button>
                  {sidebarOpen && isExpanded && (
                    <div className="ml-4 mt-1 pl-3 border-l border-white/10 space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active = activeMenu === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => setMenu(child.id)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all
                              ${active ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:text-white hover:bg-white/5"}
                            `}
                          >
                            <ChildIcon className="w-4 h-4 shrink-0" />
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const active = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMenu(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                  ${active ? "bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white shadow-lg shadow-violet-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              nav("/auth");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/90 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-16 px-6 flex items-center justify-between bg-[#0f0f12]/80 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">{currentLabel()}</h2>
              <p className="text-xs text-white/40">Boshqaruv va monitoring</p>
            </div>
          </div>
        </header>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-[#0f0f12] to-[#0a0a0d]">
          <div className="max-w-[1600px] mx-auto">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden min-h-[60vh]">
              {activeMenu === "cefr_writing" && <CEFR_Writing />}
              {activeMenu === "cefr_reading" && <CEFR_reading />}
              {activeMenu === "cefr_speaking" && <CEFR_Speaking />}
              {activeMenu === "cefr_listening" && <CEFR_Listening />}
              {activeMenu === "ielts_reading" && <IELTSReadingAdmin />}
              {activeMenu === "ielts_listening" && <IELTSListeningAdmin />}
              {activeMenu === "ielts_speaking" && <IELTSSpeakingAdmin />}
              {activeMenu === "ielts_writing" && <IELTSWritingAdmin />}
              {activeMenu === "Users" && <UsersPage />}
              {activeMenu === "Dashboard" && <Main_admin />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
