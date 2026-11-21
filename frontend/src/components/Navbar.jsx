import { NavLink } from "react-router-dom";
import { Eye, Upload, Camera, Home } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Video Upload", icon: Upload },
  { to: "/realtime", label: "Real-Time Camera", icon: Camera },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              WeatherVision
            </span>
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-400 shadow-sm shadow-cyan-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
