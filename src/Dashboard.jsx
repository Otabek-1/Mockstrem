import React, { useEffect, useState } from "react";
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaGlobe, FaBell, FaSearch, FaUserCircle, FaShieldAlt, FaCreditCard, FaHeart, FaLock, FaCrown } from "react-icons/fa";
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

// Vaqtni "X minutes ago" formatiga o'tkazish
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

export default function Dashboard() {
  const [active, setActive] = useState("home");
  const [theme, setTheme] = useState("light");
  const [ieltsOpen, setIeltsOpen] = useState(false);
  const [cefrOpen, setCefrOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(true); // Change to false for non-admin users
  const [isPremium, setIsPremium] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const storedTheme = "light";
    setTheme(storedTheme);

    // USER MA'LUMOTINI OLIB KELISH
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        const data = res.data;

        setUser(data);
        setIsAdmin(data.role === "admin");

        // Check premium status: if premium_duration exists and is in future
        const isPremiumUser = data.premium_duration && new Date(data.premium_duration) > new Date();
        setIsPremium(isPremiumUser);

        // USER ID OLINGANDAN SO'NG NOTIFICATIONS FETCH QIL
        await fetchNotifications(data.id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchNotifications = async (userId) => {
      try {
        const res = await api.get(`/notifications/${userId}`);
        setNotifications(res.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchUser();

  }, []);


  const menuItems = [
    { name: "Home", icon: <FaHome size={20} />, premium: false },
    {
      name: "IELTS",
      icon: <FaGlobe size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
      open: ieltsOpen,
      setOpen: setIeltsOpen,
      premium: false,
    },
    {
      name: "CEFR",
      icon: <FaGlobe size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
      open: cefrOpen,
      setOpen: setCefrOpen,
      premium: false,
    },
    {
      name: "Settings",
      icon: <FaCog size={20} />,
      dropdown: ["Change Mode"],
      open: settingsOpen,
      setOpen: setSettingsOpen,
      premium: false,
    },
  ];

  const goto = (data) => {

    if (!data.is_read) {
      api.put(`/notifications/${data.id}`, { title: data.title, body: data.body, is_read: true }).then(res => {
      }).catch(err => {
      })
    }
    if (data.title == "Writing mock results") {
      const id = data.body.split(" ")[2].split("")[1];
      nav(`/mock/result/${id}`);
    }

  }

  if (!user) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-950" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}>
      <Background />
      {/* Sidebar */}
      <div className={`fixed z-20 md:static h-screen ${sidebarOpen ? "w-72" : "w-0 md:w-24"} transition-all duration-300 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden md:overflow-visible border-r border-gray-200 dark:border-gray-700`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <img src={logo} className="w-10 h-10 rounded-full" alt="" />
          </div>
          <button
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex z-[9999] flex-col pt-4 px-3 flex-1 gap-2">
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative group">
              <div
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 group/item relative ${item.premium && !isPremium
                  ? "opacity-60 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600"
                  }`}
                onClick={() => {
                  // Check premium requirement
                  if (item.premium && !isPremium) {
                    alert("This feature requires a Premium subscription. Please upgrade to access it.");
                    return;
                  }
                  if (item.setOpen) item.setOpen(!item.open);
                  setHoveredMenu(item.name);

                  // Faqat "Home" bosilganda active = "home"
                  if (item.name === "Home") {
                    setActive("home");
                  }
                }}
              >
                <div className={`group-hover/item:scale-110 transition-transform duration-200 ${item.premium && !isPremium ? "text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                  {item.icon}
                </div>
                {item.premium && !isPremium && (
                  <FaCrown className="text-yellow-500 text-sm ml-auto" title="Premium feature" />
                )}
                {item.dropdown && sidebarOpen && (
                  <MdArrowDropDown
                    className={`transition-transform duration-300 text-gray-600 dark:text-gray-400 ${item.open ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {/* Tooltip Popup */}
              {!sidebarOpen && (
                <div className="absolute z-[999] left-28 top-1/2 transform -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-2xl whitespace-nowrap relative">
                    {item.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45 -mr-1"></div>
                  </div>
                </div>
              )}

              {/* Dropdown - Sidebar Open */}
              {item.dropdown && item.open && sidebarOpen && (
                <div className="pl-12 flex flex-col text-sm text-gray-600 dark:text-gray-300 gap-1 mt-1 animate-in fade-in">
                  {item.name === "Settings" ? (
                    <div
                      className="py-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-colors duration-200"
                      onClick={toggleTheme}
                    >
                      <FaCog size={16} />
                      <span className="font-medium">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                  ) : (

                    item.dropdown.map((sub, i) => (
                      <div
                        key={i}
                        className="py-3 px-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors duration-200 cursor-pointer font-medium text-sm whitespace-nowrap border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => {
                          setActive(`${item.name.toLowerCase()}_${sub.toLowerCase()}`);
                          item.setOpen(false); // optional: popupni yopish uchun
                        }}
                      >
                        {sub}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Dropdown - Sidebar Closed (Popup Menu) */}
              {item.dropdown && item.open && !sidebarOpen && (
                <div className="absolute z-[9999] left-28 top-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in">
                    {item.name === "Settings" ? (
                      <div
                        className="py-3 px-6 flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors duration-200 whitespace-nowrap font-medium text-sm"
                        onClick={toggleTheme}
                      >
                        <FaCog size={16} className="text-blue-600 dark:text-blue-400" />
                        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                      </div>
                    ) : (
                      item.dropdown.map((sub, i) => (
                        <div
                          key={i}
                          onClick={() => { setActive(`${item.name.toLowerCase()}_${sub.toLowerCase()}`) }}
                          className="py-3 px-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors duration-200 cursor-pointer font-medium text-sm whitespace-nowrap border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          {sub}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); nav("/auth") }} className="p-3 border-t border-gray-200 dark:border-gray-700 relative group/logout-btn">
          <div className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 group/logout text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400">
            <FaSignOutAlt size={20} className="group-hover/logout:scale-110 transition-transform duration-200" />
          </div>

          {/* Logout Tooltip */}
          {!sidebarOpen && (
            <div onClick={() => { localStorage.removeItem("acces_token"); nav("/auth") }} className="absolute left-28 bottom-1/2 transform translate-y-1/2 opacity-0 invisible group-hover/logout-btn:opacity-100 group-hover/logout-btn:visible transition-all duration-200 z-50 pointer-events-none">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-2xl whitespace-nowrap relative">
                Log Out
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-red-600 to-pink-600 rotate-45 -mr-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden z-[9999] fixed top-6 left-6 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <MdMenu size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white z-30 dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 ">
            <div className="relative ">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <FaBell size={20} />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute  right-0 top-full z-40 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-96 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <MdClose size={20} className="text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1 ">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          onClick={() => goto(notif)}
                          key={notif.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{notif.title}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{notif.body}</p>
                              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">{formatTimeAgo(notif.created_at)}</p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700 relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
              >
                {/* <img
                  src="https://i.pravatar.cc/150?u=${user?.id}"
                  alt="User"
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                /> */}
                <User className="rounded-full border-2 text-xl w-10 h-10 p-1 border-blue-500 text-blue-500" />
                <div className="hidden sm:block">

                  <p className="font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center gap-3">
                      {/* <img
                        src="https://i.pravatar.cc/150?img=1"
                        alt="User"
                        className="w-12 h-12 rounded-full border-2 border-blue-500"
                      /> */}
                      <User className="rounded-full border-2 text-xl w-10 h-10 p-1 border-blue-500 text-blue-500" />

                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Profile */}
                    <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-3 group">
                      <FaUserCircle size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      <div onClick={() => {
                        setActive("profile");
                        setProfileOpen(false);
                      }}
                      >
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">👤 Profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View and edit your profile</p>
                      </div>
                    </div>

                    {/* Subscription */}
                    <Link to="/plans" className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700">
                      <FaCreditCard size={18} className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">💳 Subscription</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Premium • Renews in 30 days</p>
                      </div>
                    </Link>

                    {/* Account Settings */}
                    <div onClick={() => setActive("profile")} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700">
                      <FaLock size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">🔒 Security</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage password & 2FA</p>
                      </div>
                    </div>

                    {/* Admin Panel - Only for Admins */}
                    {isAdmin && (
                      <Link target="_blank" to="/admin/dashboard" className="px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-colors cursor-pointer flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700">
                        <FaShieldAlt size={18} className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="font-semibold text-orange-700 dark:text-orange-300 text-sm">⚙️ Admin Panel</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">Manage system & users</p>
                        </div>
                      </Link>
                    )}

                    {/* Logout */}
                    <div onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); nav("/auth") }} className="px-4 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer flex items-center gap-3 group border-t border-gray-100 dark:border-gray-700">
                      <FaSignOutAlt size={18} className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-300 text-sm">🚪 Log Out</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Sign out of your account</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8 w-full h-screen z-10">

          {active === "home" && <Main />}

          {active === "cefr_writing" && <Writing_list isPremium={isPremium} />}
          {active === "cefr_listening" && <div>CEFR Listening</div>}
          {active === "cefr_reading" && <Reading_list isPremium={isPremium} />}
          {active === "cefr_speaking" && <Speaking_list isPremium={isPremium} />}

          {active === "ielts_writing" && <div>IELTS Writing</div>}
          {active === "ielts_listening" && <div>IELTS Listening</div>}
          {active === "ielts_reading" && <div>IELTS Reading</div>}
          {active === "ielts_speaking" && <div>IELTS Speaking</div>}

          {active === "profile" && <Profile />}

        </div>

      </div>

      {/* Click outside to close profile dropdown and notifications */}
      {(profileOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-39"
          onClick={() => {
            setProfileOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}