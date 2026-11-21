import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Sparkles,
  CloudRain,
  CloudFog,
  Moon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Video,
  Eye,
  CheckCircle2,
} from "lucide-react";

const trailerConditions = [
  {
    id: "rain",
    title: "Heavy Monsoon Rain",
    model: "Pix2Pix Rain Dehazing GAN",
    badge: "Rain Degraded",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    description:
      "Strips persistent streak occlusion and water drops while retaining high-frequency edges and natural textures.",
    originalBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    effectOverlay: "radial-gradient(ellipse at top, rgba(56, 189, 248, 0.25), transparent 70%)",
  },
  {
    id: "fog",
    title: "Dense Highway Fog",
    model: "Pix2Pix Defogging GAN",
    badge: "Atmospheric Fog",
    badgeColor: "bg-slate-400/20 text-slate-300 border-slate-400/30",
    description:
      "Penetrates optical scattering, recovering contrast, structural boundaries, and distant objects hidden in haze.",
    originalBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    effectOverlay: "radial-gradient(ellipse at center, rgba(203, 213, 225, 0.25), transparent 70%)",
  },
  {
    id: "lowlight",
    title: "Low-Light Night Drive",
    model: "Pix2Pix Luminance Restoration GAN",
    badge: "Night Scene",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description:
      "Amplifies dark illumination levels dynamically without introducing chromatic noise or blowing out specular lights.",
    originalBg: "linear-gradient(135deg, #090d16 0%, #030712 100%)",
    effectOverlay: "radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.2), transparent 70%)",
  },
];

export default function ProjectTrailer() {
  const [activeTab, setActiveTab] = useState("rain");
  const [isEnhanced, setIsEnhanced] = useState(true);

  const currentCondition =
    trailerConditions.find((c) => c.id === activeTab) || trailerConditions[0];

  return (
    <section className="relative py-16 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-[#0b1222] to-[#080d1a] p-6 sm:p-10 shadow-2xl">
      {/* Decorative background glows */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Showcase Trailer
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Experience the <span className="gradient-text">Enhancement Pipeline</span> in Action
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Autonomous condition detection paired with dedicated conditional adversarial networks (Pix2Pix)
          restores fidelity frame-by-frame.
        </p>
      </div>

      {/* Condition Switcher Tabs */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mb-8">
        {trailerConditions.map((condition) => (
          <button
            key={condition.id}
            onClick={() => setActiveTab(condition.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center gap-2 ${
              activeTab === condition.id
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10"
                : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {condition.id === "rain" && <CloudRain className="w-4 h-4 text-blue-400" />}
            {condition.id === "fog" && <CloudFog className="w-4 h-4 text-slate-300" />}
            {condition.id === "lowlight" && <Moon className="w-4 h-4 text-amber-400" />}
            {condition.title}
          </button>
        ))}
      </div>

      {/* Interactive Trailer Preview Stage */}
      <div className="relative z-10 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950/80 shadow-2xl">
        {/* Top Control Bar of Trailer Stage */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div className="text-xs font-semibold text-slate-200">
              Target Mode:{" "}
              <span className="text-cyan-400 font-bold">{currentCondition.title}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentCondition.badgeColor}`}
            >
              {currentCondition.badge}
            </span>
          </div>

          {/* Toggle Button: Original vs Enhanced */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsEnhanced(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !isEnhanced
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Degraded Raw
            </button>
            <button
              onClick={() => setIsEnhanced(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isEnhanced
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pix2Pix Enhanced
            </button>
          </div>
        </div>

        {/* Video / Visual Simulation Canvas */}
        <div className="relative aspect-video sm:h-96 w-full flex items-center justify-center overflow-hidden bg-slate-950 p-6">
          {/* Animated Atmospheric Background */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: currentCondition.originalBg,
              opacity: isEnhanced ? 0.35 : 1,
            }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: currentCondition.effectOverlay,
              opacity: isEnhanced ? 0.2 : 0.85,
            }}
          />

          {/* Simulation Graphic Card */}
          <div className="relative z-10 w-full max-w-lg p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-xl text-center">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Eye className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-bold text-white mb-1">
              {isEnhanced ? "Enhanced High-Clarity View" : "Degraded Weather Input"}
            </h4>

            <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto leading-relaxed">
              {isEnhanced
                ? currentCondition.description
                : `Simulated optical deterioration under ${currentCondition.title.toLowerCase()}. Visual signal degraded with reduced visibility.`}
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80 text-left">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                  Resolution
                </span>
                <span className="text-xs font-bold text-slate-200">512 × 512</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                  Model Routing
                </span>
                <span className="text-xs font-bold text-cyan-400">EfficientNet-B0</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                  Restoration
                </span>
                <span className="text-xs font-bold text-emerald-400">Pix2Pix GAN</span>
              </div>
            </div>
          </div>

          {/* Visual Indicator Overlay Label */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isEnhanced ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            Mode: {isEnhanced ? "Neural Enhanced (Cleaned)" : "Raw Adverse Weather"}
          </div>
        </div>

        {/* Bottom Specs Strip of the Trailer */}
        <div className="p-5 bg-slate-900/60 border-t border-slate-800/80 grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">EfficientNet-B0</div>
              <div className="text-[11px] text-slate-400">Instant Condition Classification</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Pix2Pix U-Net Generator</div>
              <div className="text-[11px] text-slate-400">512×512 Paired Image Translation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Real-Time Streaming</div>
              <div className="text-[11px] text-slate-400">WebSocket Inference @ 2 FPS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA inside Trailer */}
      <div className="relative z-10 mt-10 text-center flex flex-wrap justify-center gap-4">
        <Link to="/upload" className="btn-primary text-sm sm:text-base px-6 py-2.5">
          <Video className="w-4 h-4" />
          Test With Your Video
        </Link>
        <Link to="/realtime" className="btn-secondary text-sm sm:text-base px-6 py-2.5">
          <Eye className="w-4 h-4" />
          Launch Live Camera
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
