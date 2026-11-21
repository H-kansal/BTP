import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Film,
  Clock,
  Layers,
  Play,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getJobResults } from "../services/api";
import FrameComparison from "../components/FrameComparison";

function classificationBadge(label) {
  if (!label) return null;
  const lower = label.toLowerCase().replace(/[\s_-]+/g, "");
  let cls = "badge-fog";
  let display = label;
  if (lower.includes("rain")) {
    cls = "badge-rain";
    display = "Rain";
  } else if (lower.includes("fog") || lower.includes("haze")) {
    cls = "badge-fog";
    display = "Fog";
  } else if (lower.includes("low") || lower.includes("light") || lower.includes("dark")) {
    cls = "badge-low-light";
    display = "Low-Light";
  }
  return <span className={`badge ${cls} text-[10px]`}>{display}</span>;
}

export default function Results() {
  const { jobId } = useParams();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [viewMode, setViewMode] = useState("slider"); // slider | side-by-side

  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      try {
        setLoading(true);
        const data = await getJobResults(jobId);
        if (!cancelled) setResults(data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        if (!cancelled)
          setError(
            err.response?.data?.detail || err.message || "Failed to load results."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Could not load results</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link to="/upload" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Upload
        </Link>
      </div>
    );
  }

  const { video_info, frames, enhanced_video_url } = results || {};
  const frameList = frames || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Upload
          </Link>
          <h1 className="text-3xl font-bold">Enhancement Results</h1>
        </div>
        {enhanced_video_url && (
          <a
            href={enhanced_video_url}
            download
            className="btn-primary mt-4 sm:mt-0"
          >
            <Download className="w-4 h-4" />
            Download Enhanced Video
          </a>
        )}
      </div>

      {/* ── Video info cards ── */}
      {video_info && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Clock,
              label: "Duration",
              value: `${(video_info.duration || 0).toFixed(1)}s`,
            },
            {
              icon: Layers,
              label: "Total Frames",
              value: video_info.frame_count || frameList.length,
            },
            {
              icon: Play,
              label: "FPS",
              value: (video_info.fps || 0).toFixed(1),
            },
            {
              icon: Film,
              label: "Resolution",
              value: video_info.resolution || "512×512",
            },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className="text-lg font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Video comparison ── */}
      {enhanced_video_url && results?.original_video_url && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Video Comparison</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">Original</p>
              <video
                src={results.original_video_url}
                controls
                className="w-full rounded-xl bg-black"
              />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Enhanced</p>
              <video
                src={enhanced_video_url}
                controls
                className="w-full rounded-xl bg-black"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Frame-by-frame comparison ── */}
      {frameList.length > 0 && selectedFrame !== null && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Frame {selectedFrame + 1} Comparison
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("slider")}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === "slider"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Slider
              </button>
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === "side-by-side"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Side by Side
              </button>
            </div>
          </div>

          {viewMode === "slider" ? (
            <FrameComparison
              originalSrc={frameList[selectedFrame].original_url}
              enhancedSrc={frameList[selectedFrame].enhanced_url}
              label={`Classification: ${frameList[selectedFrame].classification}`}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Original</p>
                <img
                  src={frameList[selectedFrame].original_url}
                  alt="Original"
                  className="w-full rounded-xl"
                />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Enhanced</p>
                <img
                  src={frameList[selectedFrame].enhanced_url}
                  alt="Enhanced"
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Frame grid ── */}
      {frameList.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            All Frames ({frameList.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {frameList.map((frame, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFrame(idx)}
                className={`group relative rounded-xl overflow-hidden border transition-all ${
                  selectedFrame === idx
                    ? "border-cyan-500 ring-2 ring-cyan-500/30"
                    : "border-slate-700/30 hover:border-slate-600"
                }`}
              >
                <img
                  src={frame.enhanced_url || frame.original_url}
                  alt={`Frame ${idx + 1}`}
                  className="w-full aspect-video object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-xs text-white font-medium">
                    Frame {idx + 1}
                  </span>
                </div>
                {/* Badge */}
                {frame.classification && (
                  <div className="absolute top-2 right-2">
                    {classificationBadge(frame.classification)}
                  </div>
                )}
                {/* Download button */}
                {frame.enhanced_url && (
                  <a
                    href={frame.enhanced_url}
                    download={`frame_${idx + 1}_enhanced.png`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Full frame modal ── */}
      {selectedFrame !== null && frameList[selectedFrame] && (
        <div className="fixed inset-0 z-50 hidden">
          {/* Intentionally not shown as full modal to keep UI simpler. The inline comparison above is used instead. */}
        </div>
      )}
    </div>
  );
}
