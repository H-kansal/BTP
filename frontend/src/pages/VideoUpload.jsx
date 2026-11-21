import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileVideo,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Cpu,
  Film,
  Check,
} from "lucide-react";
import { uploadVideo, getJobStatus } from "../services/api";
import ProgressBar from "../components/ProgressBar";

export default function VideoUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | uploading | processing | done | error
  const [jobId, setJobId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ── File selection ──
  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setErrorMessage("Please select a valid video file.");
      return;
    }
    setFile(f);
    setErrorMessage("");
    setPhase("idle");
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer?.files?.[0];
      handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeFile = () => {
    setFile(null);
    setPhase("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload ──
  const handleUpload = async () => {
    if (!file) return;

    setPhase("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      const res = await uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      const id = res.data.job_id;
      setJobId(id);
      setPhase("processing");
      setStatusMessage("Frames extracted. Processing with deep learning models...");
    } catch (err) {
      setPhase("error");
      setErrorMessage(
        err.response?.data?.detail || "Upload failed. Please check backend connection."
      );
    }
  };

  // ── Polling status ──
  useEffect(() => {
    if (phase !== "processing" || !jobId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await getJobStatus(jobId);
        const data = res.data;

        setProcessingProgress(data.progress || 0);
        setStatusMessage(data.message || "Processing video...");

        if (data.status === "done") {
          clearInterval(pollRef.current);
          setPhase("done");
          setTimeout(() => {
            navigate(`/results/${jobId}`);
          }, 1200);
        } else if (data.status === "error") {
          clearInterval(pollRef.current);
          setPhase("error");
          setErrorMessage(data.error || "Video enhancement failed.");
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setPhase("error");
        setErrorMessage("Failed to check job status. Check backend connection.");
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase, jobId, navigate]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-3">
          <Film className="w-3.5 h-3.5" />
          Batch Enhancement Pipeline
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Upload Video
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-xl">
          Upload adverse weather footage to extract frames, classify atmospheric degradation,
          and reconstruct enhanced video with Pix2Pix GANs.
        </p>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Interaction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop zone */}
          {phase === "idle" && !file && (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragging
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Drag and drop your video file here
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                or click to browse your computer
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-400 font-medium">
                MP4, AVI, MOV supported (Up to 100MB)
              </span>
            </div>
          )}

          {/* File Selected Card */}
          {file && phase === "idle" && (
            <div className="glass-card p-6 border border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <FileVideo className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatFileSize(file.size)} • {file.type || "Video file"}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleUpload}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                <Upload className="w-4 h-4" />
                Start Enhancement Pipeline
              </button>
            </div>
          )}

          {/* Uploading Phase */}
          {phase === "uploading" && (
            <div className="glass-card p-6 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-sm font-semibold text-white">Uploading video...</span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">{uploadProgress}%</span>
              </div>
              <ProgressBar progress={uploadProgress} status="Uploading file to server" />
            </div>
          )}

          {/* Processing Phase */}
          {phase === "processing" && (
            <div className="glass-card p-6 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Enhancement in progress
                    </span>
                    <span className="text-xs text-slate-400">{statusMessage}</span>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-mono">{processingProgress}%</span>
              </div>
              <ProgressBar progress={processingProgress} status="Extracting & Enhancing Frames" />
            </div>
          )}

          {/* Done Phase */}
          {phase === "done" && (
            <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-500/[0.04] text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Processing Complete!</h4>
              <p className="text-xs text-slate-400">
                Redirecting to results view...
              </p>
            </div>
          )}

          {/* Error Message */}
          {phase === "error" && (
            <div className="glass-card p-6 border border-rose-500/30 bg-rose-500/[0.04] space-y-3">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">Enhancement Error</span>
              </div>
              <p className="text-xs text-slate-300">{errorMessage}</p>
              <button
                onClick={removeFile}
                className="text-xs text-rose-400 underline hover:text-rose-300"
              >
                Try again with another file
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Pipeline Specification Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Pipeline Specifications
            </h3>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Extraction</span>
                <span className="text-slate-200 font-medium">OpenCV 2 FPS</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Model Input</span>
                <span className="text-slate-200 font-medium">512 × 512 px</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Classifier</span>
                <span className="text-cyan-400 font-medium">EfficientNet-B0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Generators</span>
                <span className="text-cyan-400 font-medium">3× Pix2Pix U-Net</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Output Format</span>
                <span className="text-slate-200 font-medium">MP4 Video & ZIP</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automatic Route Selection
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Rain / Mist → Rain Dehazing GAN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Dense Fog → Defogging GAN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Low-Light → Luminance Restoration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
