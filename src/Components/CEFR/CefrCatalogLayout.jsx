import React from "react";
import { Crown, Search, Shuffle, X } from "lucide-react";

export function CatalogShell({
  badge,
  title,
  description,
  accentClass,
  stats,
  searchValue,
  onSearchChange,
  onRandom,
  controls,
  children,
  aside,
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className={["inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-lg", accentClass].join(" ")}>
            {badge}
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
                <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search mock title or prompt"
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={onRandom}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white [color:white]"
              style={{ backgroundColor: "#020617", color: "#ffffff" }}
            >
              <Shuffle size={17} />
              Random mock
            </button>
          </div>

          {controls && <div className="mt-4">{controls}</div>}
        </div>

        <aside className="rounded-[32px] border border-[#1e293b] bg-[#0f172a] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
          {aside}
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</section>
    </div>
  );
}

export function CatalogCard({ title, description, meta, badge, accentClass, locked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group rounded-[28px] border p-5 text-left shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition",
        locked ? "cursor-not-allowed border-slate-200 bg-slate-100/90 opacity-75" : "border-white/70 bg-white/90 hover:-translate-y-1 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={["inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white", accentClass].join(" ")}>
          {badge}
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Crown size={14} />
            Premium
          </span>
        )}
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {meta.map((item) => (
          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {item}
          </span>
        ))}
      </div>
    </button>
  );
}

export function CatalogAside({ title, description, bullets }) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">User-first flow</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6 space-y-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatalogModal({ open, title, subtitle, accentClass, headerAction, onClose, children }) {
  if (!open) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[61] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.26)]">
        <div className={["flex items-start justify-between gap-4 bg-gradient-to-r px-6 py-5 text-white", accentClass].join(" ")}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Mock setup</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-white/85">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <button type="button" className="rounded-2xl border border-white/20 bg-white/10 p-2 text-white" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="ms-scrollbar max-h-[72vh] overflow-y-auto p-6 pr-4">{children}</div>
      </div>
    </>
  );
}
