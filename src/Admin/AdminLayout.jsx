import React, { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  Command,
} from "lucide-react";

export default function AdminLayout({
  sidebarOpen,
  setSidebarOpen,
  menuConfig,
  activeMenu,
  setMenu,
  expandedId,
  toggleExpand,
  pageTitle,
  pageSubtitle,
  children,
  onLogout,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090b] text-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] bg-cyan-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#08090b_40%)]" />
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col
          bg-[#0c0d0f]/95 backdrop-blur-2xl border-r border-white/[0.06]
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full md:translate-x-0 md:w-[72px]"}
        `}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-white/[0.06]">
            {sidebarOpen ? (
              <a href="/dashboard" className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-semibold text-white truncate">Mockstream</span>
              </a>
            ) : (
              <a href="/dashboard" className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">M</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:flex hidden items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {sidebarOpen ? (
                <ChevronDown className="w-4 h-4 rotate-[270deg]" />
              ) : (
                <ChevronDown className="w-4 h-4 rotate-90" />
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5">
            {menuConfig.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const isExpanded = expandedId === item.id;
                const hasActive = item.children.some((c) => c.id === activeMenu);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                        ${hasActive ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white hover:bg-white/[0.04]"}
                      `}
                    >
                      <Icon className="w-5 h-5 shrink-0 opacity-90" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                    </button>
                    {sidebarOpen && isExpanded && (
                      <div className="mt-1 ml-3 pl-4 border-l border-white/[0.06] space-y-0.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = activeMenu === child.id;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => setMenu(child.id)}
                              className={`
                                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200
                                ${isActive ? "bg-violet-500/15 text-violet-300" : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"}
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
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMenu(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                    ${isActive ? "bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 text-white shadow-lg shadow-violet-500/25" : "text-white/60 hover:text-white hover:bg-white/[0.04]"}
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/90 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 bg-[#08090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:bg-white/[0.06]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-semibold text-white truncate">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-xs text-white/45 truncate">{pageSubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div
              className={`
                hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200
                ${searchFocused ? "border-violet-500/50 bg-white/[0.03] w-64" : "border-white/[0.06] bg-white/[0.02] w-44"}
              `}
            >
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                placeholder="Qidirish..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/40 outline-none"
              />
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-white/50 font-mono">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#08090b]" />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#121316] border border-white/[0.06] shadow-2xl shadow-black/50 py-2 z-20">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">Bildirishnomalar</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-6 text-center text-white/45 text-sm">
                        Yangi bildirishnomalar yo&apos;q
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-violet-300" />
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121316] border border-white/[0.06] shadow-2xl shadow-black/50 py-2 z-20">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">Admin</p>
                      <p className="text-xs text-white/45">Boshqaruv paneli</p>
                    </div>
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.04]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Asosiy sahifa
                    </a>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400/90 hover:bg-red-500/10 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
