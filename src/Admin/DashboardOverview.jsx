import React, { useState, useEffect } from "react";
import {
  Users,
  Newspaper,
  BookOpen,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  BarChart3,
  Loader2,
  PenLine,
} from "lucide-react";
import api from "../api";

const STAT_CARDS = [
  {
    key: "users",
    label: "Foydalanuvchilar",
    sublabel: "Jami ro'yxatdan o'tgan",
    icon: Users,
    color: "from-violet-500/20 to-fuchsia-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    trend: null,
  },
  {
    key: "news",
    label: "Yangiliklar",
    sublabel: "Sayt yangiliklari",
    icon: Newspaper,
    color: "from-cyan-500/20 to-blue-500/20",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    trend: null,
  },
  {
    key: "ielts",
    label: "IELTS testlar",
    sublabel: "Barcha modullar",
    icon: Database,
    color: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    trend: null,
  },
  {
    key: "activity",
    label: "Faollik",
    sublabel: "Oxirgi 7 kun",
    icon: Activity,
    color: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    trend: "+12%",
    trendUp: true,
  },
];

// Mock chart data (heights 0-100%)
const CHART_DATA = [42, 65, 48, 78, 55, 62, 88, 71, 59, 82, 68, 75];

function StatCard({ item, value, loading }) {
  const Icon = item.icon;
  return (
    <div
      className={`
        relative rounded-2xl border border-white/[0.06] bg-white/[0.02]
        p-5 overflow-hidden transition-all duration-300
        hover:border-white/[0.08] hover:bg-white/[0.03]
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
            {item.sublabel}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 h-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/40" />
            </div>
          ) : (
            <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
              {value != null ? value.toLocaleString() : "—"}
            </p>
          )}
          <p className="text-sm font-medium text-white/80 mt-0.5">{item.label}</p>
          {item.trend && (
            <span
              className={`
                inline-flex items-center gap-1 mt-2 text-xs font-medium
                ${item.trendUp ? "text-emerald-400" : "text-red-400"}
              `}
            >
              {item.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {item.trend}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 ${item.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const max = Math.max(...CHART_DATA);
  return (
    <div className="flex items-end gap-1 h-24">
      {CHART_DATA.map((h, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 rounded-t bg-gradient-to-t from-violet-600/80 to-fuchsia-500/60 transition-all duration-500 hover:from-violet-500 hover:to-fuchsia-400"
          style={{ height: `${(h / max) * 100}%`, minHeight: "4px" }}
          title={`${h}`}
        />
      ))}
    </div>
  );
}

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = useState({ users: null, news: null, ielts: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [usersRes, newsRes, ieltsRes] = await Promise.allSettled([
          api.get("/user/users"),
          api.get("/news/"),
          api.get("/ielts/tests?published_only=false"),
        ]);
        if (cancelled) return;
        setStats({
          users: usersRes.status === "fulfilled" && Array.isArray(usersRes.value?.data) ? usersRes.value.data.length : null,
          news: newsRes.status === "fulfilled" && Array.isArray(newsRes.value?.data) ? newsRes.value.data.length : null,
          ielts: ieltsRes.status === "fulfilled" && Array.isArray(ieltsRes.value?.data?.tests) ? ieltsRes.value.data.tests.length : null,
        });
      } catch {
        if (!cancelled) setStats({ users: null, news: null, ielts: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const quickActions = [
    { id: "users", label: "Foydalanuvchilar", icon: Users, menu: "Users" },
    { id: "news", label: "Yangiliklar", icon: Newspaper, menu: "News" },
    { id: "ielts_writing", label: "IELTS Writing", icon: PenLine, menu: "ielts_writing" },
    { id: "cefr_reading", label: "CEFR Reading", icon: BookOpen, menu: "cefr_reading" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Umumiy ko&apos;rsatkichlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            item={STAT_CARDS[0]}
            value={stats.users}
            loading={loading}
          />
          <StatCard
            item={STAT_CARDS[1]}
            value={stats.news}
            loading={loading}
          />
          <StatCard
            item={STAT_CARDS[2]}
            value={stats.ielts}
            loading={loading}
          />
          <StatCard
            item={{ ...STAT_CARDS[3], trend: "+12%", trendUp: true }}
            value={null}
            loading={false}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <section className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Faollik</h3>
                <p className="text-xs text-white/45">So&apos;ngi 12 kun</p>
              </div>
            </div>
            <span className="text-xs text-white/45">Mock ma&apos;lumot</span>
          </div>
          <MiniChart />
          <div className="flex justify-between mt-2 text-[10px] text-white/40">
            {CHART_DATA.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Tezkor harakatlar</h3>
              <p className="text-xs text-white/45">Bo&apos;limlarga o&apos;tish</p>
            </div>
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate(action.menu)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-white/80 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all duration-200"
                >
                  <Icon className="w-4 h-4 text-white/50 shrink-0" />
                  <span className="flex-1 text-sm font-medium">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-white/40 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent / System */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Tizim holati</h3>
            <p className="text-xs text-white/45">API va xizmatlar</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-300">API ishlayapti</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <span className="text-sm text-white/70">Barcha tizimlar normal</span>
          </div>
        </div>
      </section>
    </div>
  );
}
