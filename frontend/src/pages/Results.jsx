import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Film,
  Clock,
  Layers,
  Play,
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
  } else if (
    lower.includes("low") ||
    lower.includes("light") ||
    lower.includes("dark")
  ) {
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
  const [viewMode, setViewMode] = useState("slider");

  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      try {
        setLoading(true);
        const data = await getJobResults(jobId);
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load results."
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="font-editorial text-2xl font-normal text-gray-900 mb-2">
          Could not load results
        </h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link
          to="/upload"
          className="btn-pastel-blue text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Upload
        </Link>
      </div>
    );
  }

  const { video_info, frames, enhanced_video_url } = results || {};
  const frameList = frames || [];

  return (
    <div className="max-w-5xl mx-auto px-6 w-full fade-in pt-10 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
          </Link>
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-gray-900 tracking-tight">
            Enhancement Results
          </h1>
        </div>
        {enhanced_video_url && (
          <a
            href={enhanced_video_url}
            download
            className="btn-pastel-green text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Video
          </a>
        )}
      </div>

      {/* Stats cards in Pastel border */}
      {video_info && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
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
            <div
              key={s.label}
              className="p-5 rounded-sm border border-gray-200 bg-white"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <s.icon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="font-editorial text-2xl font-normal text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Video comparison */}
      {enhanced_video_url && results?.original_video_url && (
        <section className="mb-14">
          <h2 className="font-editorial text-2xl font-normal text-gray-900 mb-4">
            Video Comparison
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-sm p-3 bg-white">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Original Input</p>
              <video
                src={results.original_video_url}
                controls
                className="w-full rounded-xs bg-black"
              />
            </div>
            <div className="border border-gray-200 rounded-sm p-3 bg-white">
              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">Pix2Pix Enhanced</p>
              <video
                src={enhanced_video_url}
                controls
                className="w-full rounded-xs bg-black"
              />
            </div>
          </div>
        </section>
      )}

      {/* Frame comparison */}
      {frameList.length > 0 && selectedFrame !== null && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-editorial text-2xl font-normal text-gray-900">
              Frame {selectedFrame + 1} Comparison
            </h2>
            <div className="flex items-center gap-1 p-0.5 rounded-xs bg-gray-100 border border-gray-200 text-xs">
              {["slider", "side-by-side"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
                    viewMode === mode
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {mode === "slider" ? "Slider" : "Side by Side"}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "slider" ? (
            <FrameComparison
              originalSrc={frameList[selectedFrame].original_url}
              enhancedSrc={frameList[selectedFrame].enhanced_url}
              label={`Classification: ${frameList[selectedFrame].classification}`}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-sm p-3 bg-white">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Raw Input Frame</p>
                <img
                  src={frameList[selectedFrame].original_url}
                  alt="Original"
                  className="w-full rounded-xs border border-gray-100"
                />
              </div>
              <div className="border border-gray-200 rounded-sm p-3 bg-white">
                <p className="text-xs text-emerald-600 mb-2 font-semibold">Enhanced Frame</p>
                <img
                  src={frameList[selectedFrame].enhanced_url}
                  alt="Enhanced"
                  className="w-full rounded-xs border border-gray-100"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Frame grid */}
      {frameList.length > 0 && (
        <section className="pb-8">
          <h2 className="font-editorial text-2xl font-normal text-gray-900 mb-4">
            All Frames ({frameList.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {frameList.map((frame, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFrame(idx)}
                className={`group relative rounded-sm overflow-hidden border transition-all ${
                  selectedFrame === idx
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={frame.enhanced_url || frame.original_url}
                  alt={`Frame ${idx + 1}`}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[11px] text-white font-medium">
                    Frame {idx + 1}
                  </span>
                </div>
                {frame.classification && (
                  <div className="absolute top-1.5 right-1.5">
                    {classificationBadge(frame.classification)}
                  </div>
                )}
                {frame.enhanced_url && (
                  <a
                    href={frame.enhanced_url}
                    download={`frame_${idx + 1}_enhanced.png`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <Download className="w-3 h-3" />
                  </a>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
