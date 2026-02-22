import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  Newspaper,
  BookOpen,
  Mic,
  PenLine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import DashboardOverview from "./DashboardOverview";
import Main_admin from "./Main";
import UsersPage from "./Users";
import CEFR_Writing from "./CEFR_writing";
import CEFR_reading from "./CEFR_reading";
import CEFR_Speaking from "./CEFR_speaking";
import CEFR_Listening from "./CEFR_Listening";
import IELTSReadingAdmin from "./IELTS_reading";
import IELTSListeningAdmin from "./IELTS_listening";
import IELTSWritingAdmin from "./IELTS_writing";
import IELTSSpeakingAdmin from "./IELTS_speaking";

const MENU = [
  {
    id: "Overview",
    label: "Boshqaruv",
    icon: LayoutDashboard,
  },
  {
    id: "News",
    label: "Yangiliklar",
    icon: Newspaper,
  },
  {
    id: "Users",
    label: "Foydalanuvchilar",
    icon: Users,
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

function getPageTitle(activeMenu) {
  const map = {
    Overview: "Boshqaruv paneli",
    News: "Yangiliklar",
    Users: "Foydalanuvchilar",
    ielts_writing: "IELTS · Writing",
    ielts_listening: "IELTS · Listening",
    ielts_speaking: "IELTS · Speaking",
    ielts_reading: "IELTS · Reading",
    cefr_writing: "CEFR · Writing",
    cefr_listening: "CEFR · Listening",
    cefr_reading: "CEFR · Reading",
    cefr_speaking: "CEFR · Speaking",
  };
  return map[activeMenu] || activeMenu;
}

function getPageSubtitle(activeMenu) {
  if (activeMenu === "Overview") return "Umumiy ko'rsatkichlar va tezkor harakatlar";
  if (activeMenu === "News") return "Yangiliklarni boshqarish";
  if (activeMenu === "Users") return "Foydalanuvchilar ro'yxati va boshqaruv";
  if (activeMenu?.startsWith("ielts_")) return "IELTS testlar va bo'limlar";
  if (activeMenu?.startsWith("cefr_")) return "CEFR mocklar va bo'limlar";
  return "Boshqaruv va monitoring";
}

export default function Dashboard_admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const nav = useNavigate();

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const setMenu = (id) => {
    setActiveMenu(id);
  };

  const onLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    nav("/auth");
  };

  const pageTitle = getPageTitle(activeMenu);
  const pageSubtitle = getPageSubtitle(activeMenu);

  const content = useMemo(() => {
    if (activeMenu === "Overview") return <DashboardOverview onNavigate={setMenu} />;
    if (activeMenu === "News") return <Main_admin />;
    if (activeMenu === "Users") return <UsersPage />;
    if (activeMenu === "cefr_writing") return <CEFR_Writing />;
    if (activeMenu === "cefr_reading") return <CEFR_reading />;
    if (activeMenu === "cefr_speaking") return <CEFR_Speaking />;
    if (activeMenu === "cefr_listening") return <CEFR_Listening />;
    if (activeMenu === "ielts_reading") return <IELTSReadingAdmin />;
    if (activeMenu === "ielts_listening") return <IELTSListeningAdmin />;
    if (activeMenu === "ielts_speaking") return <IELTSSpeakingAdmin />;
    if (activeMenu === "ielts_writing") return <IELTSWritingAdmin />;
    return null;
  }, [activeMenu]);

  return (
    <AdminLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      menuConfig={MENU}
      activeMenu={activeMenu}
      setMenu={setMenu}
      expandedId={expandedId}
      toggleExpand={toggleExpand}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      onLogout={onLogout}
    >
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden min-h-[60vh]">
        {content}
      </div>
    </AdminLayout>
  );
}
