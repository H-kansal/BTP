import { Link } from "react-router-dom";
import {
  Upload,
  Camera,
  CloudRain,
  CloudFog,
  Moon,
  ArrowRight,
  Sparkles,
  ScanSearch,
  Wand2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const conditions = [
  {
    icon: CloudRain,
    title: "Rain Removal",
    tag: "RAIN / MIST",
    desc: "Strips rain streak occlusion and water droplets to restore crisp visibility in stormy conditions.",
    badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: CloudFog,
    title: "Fog & Haze Removal",
    tag: "FOG / HAZE",
    desc: "Cuts through dense atmospheric scattering to recover structural edges and contrast in heavy haze.",
    badgeClass: "text-slate-300 bg-slate-500/10 border-slate-500/20",
    color: "from-slate-400 to-slate-200",
  },
  {
    icon: Moon,
    title: "Low-Light Enhancement",
    tag: "LOW-LIGHT",
    desc: "Dynamically brightens dark underexposed frames while preserving color fidelity and suppressing noise.",
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    color: "from-amber-400 to-orange-500",
  },
];

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Input Source",
    desc: "Upload any pre-recorded video or stream your live webcam feed at 2 FPS.",
  },
  {
    step: "02",
    icon: ScanSearch,
    title: "Condition Classifier",
    desc: "EfficientNet-B0 analyzes each frame to accurately detect rain, fog, or low-light.",
  },
  {
    step: "03",
    icon: Wand2,
    title: "Pix2Pix GAN Restoration",
    desc: "The matched Pix2Pix U-Net generator performs 512×512 paired image translation.",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      {/* ── Hero Section ── */}
      <section className="pt-6 sm:pt-10 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-semibold tracking-wide mb-6">
          <Sparkles className="w-4 h-4" />
          Autonomous Multi-Weather Vision System
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          <span className="gradient-text">See Clearly</span>
          <br />
          Through Any Weather
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Enhance images and videos degraded by rain, fog, or low-light conditions
          using state-of-the-art deep learning models — in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/upload"
            className="btn-primary text-base px-7 py-3 w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Video
          </Link>
          <Link
            to="/realtime"
            className="btn-secondary text-base px-7 py-3 w-full sm:w-auto justify-center"
          >
            <Camera className="w-4 h-4" />
            Try Real-Time
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Capabilities Section ── */}
      <section className="py-12 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            What We Enhance
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Our intelligent dual-stage AI architecture automatically classifies and restores three major adverse conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conditions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card p-6 flex flex-col justify-between border border-slate-800 hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6 text-slate-950" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeClass}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="py-12 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Three streamlined steps from adverse capture to crystal-clear output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card p-6 relative border border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-black text-slate-700">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
