import { Eye, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#080d19]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Weather<span className="text-cyan-400">Vision</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                B.Tech Capstone Project
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              A deep learning framework for adverse weather image and video restoration.
              Combines automated multi-condition classification with targeted Pix2Pix
              adversarial generators to produce clean, high-fidelity visual streams.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Department of Computer Science & Engineering</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  System Overview
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Video Enhancement Pipeline
                </Link>
              </li>
              <li>
                <Link
                  to="/realtime"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Real-Time Camera Stream (2 FPS)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Specs Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Model Specifications
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Classifier</span>
                <span className="text-slate-200 font-medium">EfficientNet-B0</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Enhancer</span>
                <span className="text-slate-200 font-medium">Pix2Pix (U-Net)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Resolution</span>
                <span className="text-slate-200 font-medium">512 × 512 px</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol</span>
                <span className="text-slate-200 font-medium">Async WebSockets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WeatherVision Project. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with PyTorch & OpenCV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
