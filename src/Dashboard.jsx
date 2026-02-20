import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaGlobe,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaShieldAlt,
  FaCreditCard,
  FaHeart,
  FaLock,
  FaCrown,
} from "react-icons/fa";
import { MdArrowDropDown, MdClose, MdMenu } from "react-icons/md";
import Main from "./Components/Main";
import Writing_list from "./Components/CEFR/Writing_list";
import logo from "./assets/logo.jpg";
import Profile from "./Components/Profile";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { User } from "lucide-react";
import Reading_list from "./Components/CEFR/Reading_list";
import Speaking_list from "./Components/CEFR/Speaking_list";
import Background from "./Background";
import Listening_list from "./Components/CEFR/Listening_list";

// ─── Time formatter ───────────────────────────────────────────
const formatTimeAgo = (dateString) => {
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
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
};

const FEEDBACK_VISIT_KEY = "ms_feedback_dashboard_visits";
const FEEDBACK_MODAL_SNOOZE_KEY = "ms_feedback_modal_snooze_until";
const FEEDBACK_VISIT_THRESHOLD = 5;
const FEEDBACK_MOCK_THRESHOLD = 3;
const FEEDBACK_SNOOZE_HOURS = 24;

// ─── Floating Popup (sidebar closed) ─────────────────────────
function FloatingDropdown({ item, active, setActive, toggleTheme, theme, isPremium }) {
  return (
    <div className="absolute left-full ml-2 top-0 z-[70] w-52">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
        {/* header label */}
        <div className="px-4 pt-2 pb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {item.name}
          </span>
        </div>
        {item.name === "Settings" ? (
          <button
            type="button"
            className="w-full py-2.5 px-4 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
            onClick={toggleTheme}
          >
            <FaCog size={15} className="text-blue-500 dark:text-blue-400" />
            <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        ) : (
          item.dropdown.map((sub, i) => {
            const key = `${item.name.toLowerCase()}_${sub.toLowerCase()}`;
            const isSubActive = active === key;
            return (
              <button
                key={i}
                type="button"
                className={[
                  "w-full text-left py-2.5 px-4 flex items-center gap-3 transition-colors duration-150",
                  isSubActive
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700",
                ].join(" ")}
                onClick={() => setActive(key)}
              >
                {/* active dot */}
                <span
                  className={[
                    "w-1.5 h-1.5 rounded-full transition-all duration-200",
                    isSubActive ? "bg-blue-500 scale-125" : "bg-transparent",
                  ].join(" ")}
                />
                <span
                  className={[
                    "font-medium text-sm",
                    isSubActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300",
                  ].join(" ")}
                >
                  {sub}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  // ─── State ──────────────────────────────────────────────────
  const [active, setActive] = useState("home");
  const [theme, setTheme] = useState("light");
  const [openMenu, setOpenMenu] = useState(null); // accordion: "IELTS" | "CEFR" | "Settings" | null
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); // Open on desktop, closed on mobile
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState({
    has_feedback: false,
    mock_submissions_count: 0,
    visit_count: 0,
  });
  // floating popup for collapsed sidebar
  const [floatingMenu, setFloatingMenu] = useState(null); // item.name | null
  const nav = useNavigate();

  // ─── Helpers ────────────────────────────────────────────────
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // ─── Data fetch ─────────────────────────────────────────────
  useEffect(() => {
    setTheme("light");

    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        const data = res.data;
        setUser(data);
        setIsAdmin(data.role === "admin");
        const premium =
          data.premium_duration && new Date(data.premium_duration) > new Date();
        setIsPremium(premium);
        await fetchNotifications(data.id);
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };

    const fetchNotifications = async (userId) => {
      try {
        const res = await api.get(`/notifications/${userId}`);
        setNotifications(res.data || []);
      } catch (e) {
        console.error("Error fetching notifications:", e);
        setNotifications([]);
      }
    };

    fetchUser();
  }, []);

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
        const canPromptNow = Date.now() > snoozeUntil;
        const shouldPrompt =
          !hasFeedback &&
          canPromptNow &&
          (visitCount >= FEEDBACK_VISIT_THRESHOLD || mockSubmissions >= FEEDBACK_MOCK_THRESHOLD);

        setFeedbackSummary({
          has_feedback: hasFeedback,
          mock_submissions_count: mockSubmissions,
          visit_count: visitCount,
        });

        if (shouldPrompt) {
          setFeedbackModalOpen(true);
        }
      } catch (e) {
        console.error("Error fetching feedback status:", e);
      }
    };

    fetchFeedbackStatus();
  }, [user]);

  const closeFeedbackModal = (withSnooze = true) => {
    if (withSnooze) {
      const snoozeUntil = Date.now() + FEEDBACK_SNOOZE_HOURS * 60 * 60 * 1000;
      localStorage.setItem(FEEDBACK_MODAL_SNOOZE_KEY, String(snoozeUntil));
    }
    setFeedbackModalOpen(false);
  };

  const submitFeedback = async () => {
    if (feedbackSubmitting) return;

    if (!feedbackText.trim()) {
      alert("Please write your feedback.");
      return;
    }

    try {
      setFeedbackSubmitting(true);
      await api.post("/feedback", {
        rating: feedbackRating,
        text: feedbackText.trim(),
      });
      setFeedbackSummary((prev) => ({ ...prev, has_feedback: true }));
      localStorage.removeItem(FEEDBACK_MODAL_SNOOZE_KEY);
      setFeedbackModalOpen(false);
      setFeedbackText("");
    } catch (e) {
      console.error("Error submitting feedback:", e);
      alert("Could not send feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ─── Menu config ────────────────────────────────────────────
  const menuItems = [
    { name: "Home", icon: <FaHome size={20} />, premium: false },
    {
      name: "IELTS",
      icon: <FaGlobe size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
      premium: false,
    },
    {
      name: "CEFR",
      icon: <FaGlobe size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
      premium: false,
    },
    {
      name: "Settings",
      icon: <FaCog size={20} />,
      dropdown: ["Change Mode"],
      premium: false,
    },
  ];

  // ─── Notification nav ───────────────────────────────────────
  const goto = (data) => {
    if (!data.is_read) {
      api
        .put(`/notifications/${data.id}`, {
          title: data.title,
          body: data.body,
          is_read: true,
        })
        .catch(() => {});
    }
    if (data.title === "Writing mock results") {
      const id = data.body.split(" ")[2].split("")[1];
      nav(`/mock/result/${id}`);
    }
  };

  // ─── Loading ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div
      className={`flex h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-950" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {/* <Background /> */}

      {/* ════════════════ SIDEBAR ════════════════ */}
      <div
        className={[
          "fixed z-50 md:z-30 md:static h-screen",
          sidebarOpen ? "w-72" : "w-0 md:w-20",
          "transition-all duration-300 ease-out",
          "bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl md:backdrop-blur-none md:bg-gradient-to-b md:from-white md:to-gray-50 md:dark:from-gray-900 md:dark:to-gray-800",
          "shadow-2xl flex flex-col justify-between overflow-hidden",
          "border-r border-gray-200 dark:border-gray-700",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <img
            src={logo}
            className="w-10 h-10 rounded-full flex-shrink-0"
            alt="Logo"
          />
          {sidebarOpen && (
            <button
              className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <MdClose size={22} />
            </button>
          )}
        </div>

        {/* ── Menu Items ── */}
        <div className="flex flex-col pt-3 px-2 flex-1 gap-1">
          {menuItems.map((item) => {
            const isOpen = openMenu === item.name;
            const isFloating = floatingMenu === item.name;

            // Determine if this root item (or any of its children) is the active page
            const isActiveRoot =
              active === "home"
                ? item.name === "Home"
                : active.startsWith(item.name.toLowerCase());

            return (
              <div
                key={item.name}
                className="relative group/menuitem"
                // floating popup: enter / leave on the wrapper
                onMouseEnter={() => {
                  if (!sidebarOpen && item.dropdown) setFloatingMenu(item.name);
                }}
                onMouseLeave={() => {
                  if (!sidebarOpen) setFloatingMenu(null);
                }}
              >
                {/* ── Root button ── */}
                <button
                  type="button"
                  className={[
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    "border border-transparent",
                    isActiveRoot
                      ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/15 dark:to-purple-500/15 border-blue-400/25"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600",
                    item.premium && !isPremium ? "opacity-55" : "",
                  ].join(" ")}
                  onClick={() => {
                    if (item.premium && !isPremium) {
                      alert(
                        "This feature requires a Premium subscription. Please upgrade to access it."
                      );
                      return;
                    }
                    if (item.dropdown) {
                      toggleMenu(item.name);
                    } else {
                      setOpenMenu(null);
                    }
                    if (item.name === "Home") {
                      setActive("home");
                      closeSidebarOnMobile();
                    }
                  }}
                >
                  {/* Left active pill */}
                  <span
                    className={[
                      "flex-shrink-0 w-0.5 rounded-full transition-all duration-300",
                      isActiveRoot ? "h-6 bg-blue-500 shadow-sm shadow-blue-400/40" : "h-0 bg-transparent",
                    ].join(" ")}
                  />

                  {/* Icon */}
                  <span
                    className={[
                      "flex-shrink-0 transition-transform duration-200",
                      isActiveRoot
                        ? "text-blue-600 dark:text-blue-400 scale-110"
                        : item.premium && !isPremium
                        ? "text-red-400"
                        : "text-gray-500 dark:text-gray-400",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  {/* Label (only when sidebar open) */}
                  {sidebarOpen && (
                    <span
                      className={[
                        "flex-1 text-left text-sm font-semibold transition-colors duration-200",
                        isActiveRoot
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-200",
                      ].join(" ")}
                    >
                      {item.name}
                    </span>
                  )}

                  {/* Premium crown */}
                  {item.premium && !isPremium && (
                    <FaCrown className="text-yellow-500 text-xs flex-shrink-0" />
                  )}

                  {/* Chevron */}
                  {item.dropdown && sidebarOpen && (
                    <MdArrowDropDown
                      size={20}
                      className={[
                        "text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  )}
                </button>

                {/* ── Tooltip (sidebar closed, no dropdown) ── */}
                {!sidebarOpen && !item.dropdown && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-200 z-[70]">
                    <div className="bg-gray-800 dark:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}

                {/* ── Floating popup dropdown (sidebar CLOSED) ── */}
                {!sidebarOpen && item.dropdown && isFloating && (
                  <FloatingDropdown
                    item={item}
                    active={active}
                    setActive={(key) => {
                      setActive(key);
                      setFloatingMenu(null);
                      closeSidebarOnMobile();
                    }}
                    toggleTheme={toggleTheme}
                    theme={theme}
                    isPremium={isPremium}
                  />
                )}

                {/* ── Accordion dropdown (sidebar OPEN) ── */}
                {item.dropdown && (
                  <div
                    className={[
                      "overflow-hidden transition-all duration-300 ease-out",
                      isOpen && sidebarOpen ? "max-h-64 mt-1" : "max-h-0",
                    ].join(" ")}
                  >
                    <div className="pl-9 pr-2 pb-1 flex flex-col gap-0.5">
                      {item.name === "Settings" ? (
                        <button
                          type="button"
                          className="w-full py-2.5 px-3 flex items-center gap-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                          onClick={toggleTheme}
                        >
                          <FaCog size={15} className="text-blue-500 dark:text-blue-400" />
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                            {theme === "light" ? "Dark Mode" : "Light Mode"}
                          </span>
                        </button>
                      ) : (
                        item.dropdown.map((sub, i) => {
                          const key = `${item.name.toLowerCase()}_${sub.toLowerCase()}`;
                          const isSubActive = active === key;
                          return (
                            <button
                              key={i}
                              type="button"
                              className={[
                                "w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-all duration-150",
                                isSubActive
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700",
                              ].join(" ")}
                              onClick={() => {
                                setActive(key);
                                setOpenMenu(null);
                                closeSidebarOnMobile();
                              }}
                            >
                              {/* sub active dot */}
                              <span
                                className={[
                                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                  isSubActive
                                    ? "bg-blue-500 scale-125"
                                    : "bg-gray-300 dark:bg-gray-600",
                                ].join(" ")}
                              />
                              <span
                                className={[
                                  "font-medium text-sm",
                                  isSubActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-300",
                                ].join(" ")}
                              >
                                {sub}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Logout ── */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="relative group/logout">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                nav("/auth");
              }}
            >
              <span className="w-0.5 h-0 rounded-full bg-transparent flex-shrink-0" />
              <FaSignOutAlt size={20} className="flex-shrink-0 transition-transform duration-200 group-hover/logout:scale-110" />
              {sidebarOpen && (
                <span className="font-semibold text-sm">Log Out</span>
              )}
            </button>
            {/* Logout tooltip (sidebar closed) */}
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/logout:opacity-100 transition-opacity duration-200 z-[70]">
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap">
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hamburger toggle button ── */}
      {!sidebarOpen && (
        <button
          className="fixed top-5 left-5 z-50 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <MdMenu size={22} className="text-gray-700 dark:text-gray-200" />
        </button>
      )}

      {/* ════════════════ MAIN AREA ════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* ── Top Header ── */}
        <div className="bg-white z-40 dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3.5 flex items-center justify-between relative">
          {/* Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={15}
              />
              <input
                type="text"
                placeholder="Search anything…"
                className="pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* ── Notifications ── */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <FaBell size={19} />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications panel */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-96">
                  {/* header */}
                  <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <MdClose size={18} className="text-gray-500 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* list */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => goto(notif)}
                          className={[
                            "p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                            "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                            !notif.is_read ? "bg-blue-50 dark:bg-blue-900/15" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {notif.title}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                                {notif.body}
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5">
                                {formatTimeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-gray-400 dark:text-gray-500">
                        <FaBell size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all duration-200 pl-4 border-l border-gray-200 dark:border-gray-700 ml-2"
              >
                {!user.google_avatar ? (
                  <User className="rounded-full border-2 w-9 h-9 p-1 border-blue-500 text-blue-500" />
                ) : (
                  <img
                    src={user.google_avatar}
                    className="w-9 h-9 rounded-full object-cover"
                    alt=""
                  />
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
                <MdArrowDropDown
                  size={18}
                  className={[
                    "text-gray-400 dark:text-gray-500 transition-transform duration-200",
                    profileOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center gap-3">
                      {!user.google_avatar ? (
                        <User className="rounded-full border-2 w-10 h-10 p-1 border-blue-500 text-blue-500" />
                      ) : (
                        <img
                          src={user.google_avatar}
                          className="w-10 h-10 rounded-full object-cover"
                          alt=""
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* items */}
                  <div className="py-1">
                    {/* Profile */}
                    <button
                      type="button"
                      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                      onClick={() => {
                        setActive("profile");
                        setProfileOpen(false);
                      }}
                    >
                      <FaUserCircle
                        size={17}
                        className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          👤 Profile
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          View and edit your profile
                        </p>
                      </div>
                    </button>

                    {/* Subscription */}
                    <Link
                      to="/plans"
                      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaCreditCard
                        size={17}
                        className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          💳 Subscription
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Premium • Renews in 30 days
                        </p>
                      </div>
                    </Link>

                    {/* Security */}
                    <button
                      type="button"
                      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700"
                      onClick={() => {
                        setActive("profile");
                        setProfileOpen(false);
                      }}
                    >
                      <FaLock
                        size={17}
                        className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          🔒 Security
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Manage password & 2FA
                        </p>
                      </div>
                    </button>

                    {/* Admin Panel */}
                    {isAdmin && (
                      <Link
                        target="_blank"
                        to="/admin/dashboard"
                        className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaShieldAlt
                          size={17}
                          className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                            ⚙️ Admin Panel
                          </p>
                          <p className="text-xs text-orange-500 dark:text-orange-400">
                            Manage system & users
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Logout */}
                    <button
                      type="button"
                      className="w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700"
                      onClick={() => {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        nav("/auth");
                      }}
                    >
                      <FaSignOutAlt
                        size={17}
                        className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                          🚪 Log Out
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 overflow-auto p-6 md:p-8 w-full z-10">
          {active === "home" && <Main />}

          {active === "cefr_writing" && <Writing_list isPremium={isPremium} />}
          {active === "cefr_listening" && <Listening_list isPremium={isPremium} />}
          {active === "cefr_reading" && <Reading_list isPremium={isPremium} />}
          {active === "cefr_speaking" && <Speaking_list isPremium={isPremium} />}

          {active === "ielts_writing" && <div>IELTS Writing</div>}
          {active === "ielts_listening" && <div>IELTS Listening</div>}
          {active === "ielts_reading" && <div>IELTS Reading</div>}
          {active === "ielts_speaking" && <div>IELTS Speaking</div>}

          {active === "profile" && <Profile />}
        </div>
      </div>

      {/* ── Click-outside overlay ── */}
      {feedbackModalOpen && active === "home" && !feedbackSummary.has_feedback && (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Platform haqida fikringiz?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {`Visits: ${feedbackSummary.visit_count} • Mock submissions: ${feedbackSummary.mock_submissions_count}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeFeedbackModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate your experience</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedbackRating(value)}
                    className={[
                      "w-10 h-10 rounded-lg border font-semibold transition-colors",
                      feedbackRating === value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Nima yaxshilansa platforma sizga yanada foydali bo'ladi?"
                className="mt-2 w-full min-h-28 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeFeedbackModal(true)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Later
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                disabled={feedbackSubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {feedbackSubmitting ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(profileOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
          onClick={() => {
            setProfileOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}
