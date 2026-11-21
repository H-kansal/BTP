import { useState } from "react";
import { Link } from "react-router-dom";
import { CloudRain, CloudFog, Moon, Radio, Sparkles, Check, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");

  const components = [
    {
      id: "rain",
      title: "Rain Streak Removal",
      subtitle: "Precipitation & droplet restoration",
      icon: CloudRain,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
      architecture: "Pix2Pix U-Net Generator",
      tag: "Condition 01",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Isolates and removes linear rain streaks and droplet occlusion on vehicle cameras, reconstructing hidden roadway boundaries and lane markings.",
      features: [
        "Paired Cityscapes rain streak dataset",
        "Suppresses dense monsoon downpour streaks",
        "Restores background occluded by droplets",
        "Skip-connections retain fine texture details",
        "Zero distortion of pedestrian & road signs",
      ],
      link: "/upload",
      buttonText: "TEST WITH RAIN VIDEO",
    },
    {
      id: "fog",
      title: "Fog & Haze Defogging",
      subtitle: "Atmospheric scattering recovery",
      icon: CloudFog,
      iconColor: "text-slate-600 bg-slate-50 border-slate-200",
      architecture: "Atmospheric Defogging GAN",
      tag: "Condition 02",
      tagColor: "bg-slate-50 text-slate-700 border-slate-200",
      description:
        "Penetrates optical scattering caused by suspended water droplets, boosting contrast, recovering distant depth cues, and sharpening structural silhouettes.",
      features: [
        "Penetrates dense highway fog & haze",
        "Boosts scene contrast and edge gradients",
        "Recovers distant vehicle & building boundaries",
        "Avoids halo artifacts around headlights",
        "Normalizes atmospheric light distribution",
      ],
      link: "/upload",
      buttonText: "TEST WITH FOG VIDEO",
    },
    {
      id: "lowlight",
      title: "Low-Light Night Vision",
      subtitle: "Dynamic luminance enhancement",
      icon: Moon,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
      architecture: "Luminance Recovery GAN",
      tag: "Condition 03",
      tagColor: "bg-amber-50 text-amber-700 border-amber-200",
      description:
        "Amplifies illumination in underexposed night driving scenes, recovering dark objects while suppressing high-ISO sensor noise and preventing blowout.",
      features: [
        "Dynamic range expansion for dark scenes",
        "Suppresses chrominance sensor noise",
        "Preserves specular headlights & street lamps",
        "Balanced color fidelity without yellow tint",
        "Enhances pedestrian & obstacle visibility",
      ],
      link: "/upload",
      buttonText: "TEST WITH NIGHT VIDEO",
    },
    {
      id: "realtime",
      title: "Real-Time Classification",
      subtitle: "Automated routing & streaming",
      icon: Radio,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      architecture: "EfficientNet-B0 + WebSocket",
      tag: "Pipeline Dispatch",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description:
        "EfficientNet-B0 analyzes each incoming frame to detect the degradation type, automatically routing it to the appropriate GAN in real-time over WebSockets.",
      features: [
        "Automated 3-class weather detection",
        "Sub-15ms classification latency",
        "Live webcam streaming at ~2 FPS",
        "Full batch MP4 video reconstruction",
        "Interactive slider & side-by-side comparison",
      ],
      link: "/realtime",
      buttonText: "OPEN REAL-TIME STREAM",
    },
  ];

  return (
    <div className="w-full bg-white text-gray-900">
      {/* ── Main Hero Section (Pastel Academic Style) ── */}
      <section className="pt-16 pb-12 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold tracking-wide uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          B.Tech Capstone Project — Department of CSE
        </div>

        <h1 className="font-editorial text-5xl sm:text-6xl text-gray-900 font-normal tracking-tight mb-4">
          Adverse Weather Vision System
        </h1>
        <p className="text-gray-600 text-sm sm:text-base font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
          A dual-stage deep learning framework that automatically classifies weather degradation (rain, fog, low-light) using <strong>EfficientNet-B0</strong> and restores video frames via dedicated <strong>Pix2Pix U-Net</strong> generative adversarial networks.
        </p>

        {/* Technical Flow Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xs bg-gray-50 border border-gray-200 text-xs text-gray-700 mb-2">
          <span className="font-semibold text-gray-900">Stage 1:</span> Condition Classification (EfficientNet-B0)
          <span className="text-gray-400">→</span>
          <span className="font-semibold text-gray-900">Stage 2:</span> Targeted GAN Restoration (Pix2Pix 512×512)
          <span className="text-gray-400">→</span>
          <span className="font-semibold text-gray-900">Output:</span> Reconstructed Stream / Video
        </div>
        <div className="text-[11px] text-gray-400 font-medium mt-1">
          Operates on pre-recorded video clips and live webcam streams
        </div>
      </section>

      {/* ── 4-Column Technical Component Grid (Pastel Table Style) ── */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="text-center mb-6">
          <h2 className="font-editorial text-3xl font-normal text-gray-900">
            System Modules & Degradation Handlers
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Each weather condition is paired with a dedicated neural restoration model fine-tuned for high visual fidelity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-sm bg-white shadow-xs">
          {components.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-7 flex flex-col justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  {/* Category Tag */}
                  <div className="text-center mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border uppercase tracking-wider ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Component Title */}
                  <h3 className="font-editorial text-2xl font-normal text-gray-900 mb-1 text-center">
                    {item.title}
                  </h3>

                  {/* Architecture & Role */}
                  <div className="text-center mb-4">
                    <span className="text-xs font-semibold text-blue-600 block">
                      {item.architecture}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {item.subtitle}
                    </span>
                  </div>

                  {/* Paragraph explanation */}
                  <p className="text-xs text-gray-500 leading-relaxed text-left mb-6 pb-4 border-b border-gray-100">
                    {item.description}
                  </p>

                  {/* Key Capabilities Checklist */}
                  <div className="space-y-2.5 text-xs text-gray-600 pb-8 text-left">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Key Capabilities
                    </div>
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-2">
                  <Link
                    to={item.link}
                    className="btn-pastel-blue w-full block text-center text-[11px]"
                  >
                    {item.buttonText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Research Overview / Project Context ── */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="border border-gray-200 rounded-sm p-8 bg-gray-50/50">
          <h3 className="font-editorial text-2xl font-normal text-gray-900 mb-3 text-left">
            Project Overview & Methodology
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-6 text-left">
            Autonomous driving and outdoor surveillance cameras frequently fail in harsh weather due to reduced visibility, light scattering, and sensor noise. Instead of applying a generic, single-filter model, WeatherVision adopts an intelligent <strong>classify-then-enhance paradigm</strong>: an EfficientNet-B0 network first determines the degradation class, and the frame is then processed by a Pix2Pix U-Net generator trained specifically for that condition.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-4 border-t border-gray-200">
            <div>
              <div className="text-xs font-semibold text-gray-900 mb-1">
                Research Supervisor
              </div>
              <p className="text-xs text-gray-600">
                Dr. K. Ramanathan — Department of Computer Science & Engineering
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900 mb-1">
                Implementation Stack
              </div>
              <p className="text-xs text-gray-600">
                PyTorch 2.9, FastAPI, OpenCV, React 18, Tailwind CSS, WebSockets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Frequently Asked Questions Section (Pastel 2-Col Layout) ── */}
      <section className="bg-gray-50/70 border-t border-gray-200 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-editorial text-4xl text-gray-900 font-normal mb-14 text-left">
            Frequently asked questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10 text-left">
            {/* Q1 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Why use separate GANs instead of a single general model?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Rain streaks, atmospheric fog, and low-light darkness require fundamentally different mathematical restorations. Rain requires directional streak removal, fog requires transmission map depth inversion, and low-light requires non-linear luminance amplification. Dedicated generators achieve significantly higher structural fidelity than a one-size-fits-all model.
              </p>
            </div>

            {/* Q2 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                How does the EfficientNet-B0 classifier work?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                EfficientNet-B0 is fine-tuned to classify incoming frames into three classes: <code>rain</code>, <code>fog</code>, and <code>low_light</code>. It runs lightweight inference (under 15ms per frame) to route the image tensor to the matching generator without human intervention.
              </p>
            </div>

            {/* Q3 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What is the real-time streaming capability?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Using bi-directional WebSockets, live webcam frames are sent from the browser to the FastAPI backend, where they are resized to 512×512, classified, enhanced, and returned at approximately 2 FPS for real-time visual inspection.
              </p>
            </div>

            {/* Q4 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Does WeatherVision require an NVIDIA GPU?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The PyTorch backend automatically detects whether CUDA is available. If an NVIDIA GPU is detected, inference runs on CUDA; otherwise, it seamlessly falls back to CPU multi-threading.
              </p>
            </div>

            {/* Q5 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What video formats and resolutions are supported?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The batch pipeline accepts MP4, AVI, and MOV video formats. Frames are normalized to 512×512 for the Pix2Pix models and re-assembled into an MP4 video matching the original video's frame rate.
              </p>
            </div>

            {/* Q6 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Where are model weights stored?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pre-trained PyTorch weights are placed in <code className="bg-gray-200/60 px-1 py-0.5 rounded text-[11px]">backend/app/weights/</code> as <code className="bg-gray-200/60 px-1 py-0.5 rounded text-[11px]">classifier.pth</code>, <code className="bg-gray-200/60 px-1 py-0.5 rounded text-[11px]">rain_enhancer.pth</code>, <code className="bg-gray-200/60 px-1 py-0.5 rounded text-[11px]">fog_enhancer.pth</code>, and <code className="bg-gray-200/60 px-1 py-0.5 rounded text-[11px]">lowlight_enhancer.pth</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
