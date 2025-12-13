import React, { useState } from "react";
import {
  FaChartBar,
  FaUsers,
  FaFileAlt,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaCog,
  FaDatabase,
} from "react-icons/fa";
import { MdClose, MdMenu, MdArrowDropDown } from "react-icons/md";
import CEFR_Writing from "./CEFR_writing";
import Users from "./Users";
import { useNavigate } from "react-router-dom";
import Main_admin from "./Main";
import CEFR_reading from "./CEFR_reading";

export default function Dashboard_admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const nav = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaChartBar size={20} />,
    },
    {
      name: "Users",
      icon: <FaUsers size={20} />,
    },
    {
      name: "IELTS",
      icon: <FaDatabase size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
    },
    {
      name: "CEFR",
      icon: <FaCog size={20} />,
      dropdown: ["Writing", "Listening", "Speaking", "Reading"],
    },
  ];

  const toggleDropdown = (name) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };
  console.log(activeMenu);
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white h-full transition-all duration-300 fixed md:relative z-50`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-lg font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-2 px-2">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              <div
                onClick={() => {
                  setActiveMenu(item.name);
                  if (item.dropdown) toggleDropdown(item.name);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  activeMenu === item.name
                    ? "bg-gradient-to-r from-orange-500 to-red-600"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.icon}
                {sidebarOpen && (
                  <div className="flex justify-between items-center w-full">
                    <span>{item.name}</span>
                    {item.dropdown && (
                      <MdArrowDropDown
                        size={20}
                        className={`transition-transform ${
                          dropdownOpen === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Dropdown */}
              {sidebarOpen &&
                item.dropdown &&
                dropdownOpen === item.name && (
                  <div className="ml-10 mt-1 space-y-1">
                    {item.dropdown.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMenu(item.name.toLowerCase() + "_" + sub.toLowerCase())}
                        className="block w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-700"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div onClick={()=>{localStorage.removeItem("acces_token"); nav("/auth")}} className="flex items-center gap-3 hover:bg-red-600 p-3 rounded-lg cursor-pointer">
            <FaSignOutAlt size={20} />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 ml-20 md:ml-0 p-6 overflow-auto">
        {activeMenu === "cefr_writing" && <CEFR_Writing />}
        {activeMenu === "cefr_reading" && <CEFR_reading />}
        {activeMenu === "Users" && <Users />}
        {activeMenu === "Dashboard" && <Main_admin />}
      </div>
    </div>
  );
}
