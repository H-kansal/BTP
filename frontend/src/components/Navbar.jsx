import { NavLink, Link } from "react-router-dom";
import { Eye, Upload, Camera, Image as ImageIcon } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Pastel style with multi-color symbol */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-400 via-sky-400 to-emerald-400 flex items-center justify-center shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-gray-900">
            WeatherVision
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-gray-600">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-gray-950 font-semibold" : "hover:text-gray-950 transition-colors"
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/image"
            className={({ isActive }) =>
              isActive ? "text-gray-950 font-semibold" : "hover:text-gray-950 transition-colors"
            }
          >
            Enhance Image
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              isActive ? "text-gray-950 font-semibold" : "hover:text-gray-950 transition-colors"
            }
          >
            Video Upload
          </NavLink>
          <NavLink
            to="/realtime"
            className={({ isActive }) =>
              isActive ? "text-gray-950 font-semibold" : "hover:text-gray-950 transition-colors"
            }
          >
            Real-Time Stream
          </NavLink>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/image"
            className="text-xs font-semibold text-gray-700 hover:text-gray-950 transition-colors px-2 py-1.5 flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            Add Image
          </Link>
          <Link
            to="/upload"
            className="text-xs font-semibold text-gray-700 hover:text-gray-950 transition-colors px-2 py-1.5"
          >
            Upload Video
          </Link>
          <Link
            to="/realtime"
            className="btn-pastel-green text-xs"
          >
            Start Camera
          </Link>
        </div>
      </div>
    </nav>
  );
}
