import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Eye,
  Upload,
  Camera,
  Home,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  Activity,
  Radio,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: Home, badge: "Main" },
  { to: "/upload", label: "Video Enhancement", icon: Upload, badge: "Batch" },
  { to: "/realtime", label: "Real-Time Camera", icon: Camera, badge: "Live" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">
            Weather<span className="text-cyan-400">Vision</span>
          </span>
        </NavLink>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile Drawer Backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-45"
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar (Sticky on desktop, drawer on mobile) ── */}
      <aside
        className={`
          flex flex-col bg-[#0b1120] border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0
          fixed inset-y-0 left-0 z-50 lg:static lg:sticky lg:top-0 lg:h-screen lg:z-30
          ${collapsed ? "w-20" : "w-64 xl:w-72"}
          ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800/80">
          <NavLink
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 overflow-hidden min-w-0"
          >
            <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <Eye className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base text-white tracking-tight truncate">
                  Weather<span className="text-cyan-400">Vision</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  AI Vision Engine
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3.5 space-y-2 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                } ${collapsed ? "justify-center px-0 py-3" : ""}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ml-2 ${
                        isActive
                          ? "bg-cyan-400/20 text-cyan-300"
                          : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Active Models Card */}
          {!collapsed && (
            <div className="pt-6">
              <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Active Models
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200">
                      Classifier
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      EfficientNet-B0
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200">
                      Enhancement
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Pix2Pix (512×512)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200">
                      Stream Rate
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      2 FPS WebSocket
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info: with generous padding so browser link tooltip won't cover it */}
        <div className="p-4 pb-6 border-t border-slate-800/80 bg-[#080d19]">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-300">
                  Backend Engine
                </span>
                <span className="text-[11px] text-emerald-400/90 font-mono">
                  Online (Port 8000)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Backend: Online">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
