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
  Film,
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
  const [phase, setPhase] = useState("idle");
  const [jobId, setJobId] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      handleFile(e.dataTransfer?.files?.[0]);
    },
    [handleFile]
  );

  const removeFile = () => {
    setFile(null);
    setPhase("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setPhase("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      const res = await uploadVideo(file, (p) => setUploadProgress(p));
      setJobId(res.job_id);
      setPhase("processing");
      setStatusMessage("Processing with deep learning models...");
    } catch (err) {
      setPhase("error");
      setErrorMessage(
        err.response?.data?.detail || "Upload failed. Check backend connection."
      );
    }
  };

  useEffect(() => {
    if (phase !== "processing" || !jobId) return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await getJobStatus(jobId);
        setProcessingProgress(data.progress || 0);
        setStatusMessage(data.message || "Processing video...");

        if (data.status === "done") {
          clearInterval(pollRef.current);
          setPhase("done");
          setTimeout(() => navigate(`/results/${jobId}`), 1200);
        } else if (data.status === "error") {
          clearInterval(pollRef.current);
          setPhase("error");
          setErrorMessage(data.error || "Video enhancement failed.");
        }
      } catch {
        clearInterval(pollRef.current);
        setPhase("error");
        setErrorMessage("Failed to check job status.");
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
    <div className="max-w-5xl mx-auto px-6 w-full pt-10">
      {/* Header with Serif Typography */}
      <div className="mb-10 text-left">
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-gray-900 tracking-tight">
          Batch Video Enhancement
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-xl">
          Upload pre-recorded degraded video footage. The pipeline extracts frames, runs dual-stage classification, and reconstructs high-fidelity output.
        </p>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left: Upload area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop zone */}
          {phase === "idle" && !file && (
            <div
              className={`border border-dashed rounded-sm p-14 text-center transition-all cursor-pointer ${
                dragging
                  ? "border-sky-500 bg-sky-50/50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50/40 hover:bg-gray-50"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-normal text-gray-900 mb-1">
                Drag and drop your video file
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                or click to browse your computer
              </p>
              <span className="inline-block px-3 py-1 rounded-xs bg-white border border-gray-200 text-[11px] text-gray-500 font-medium">
                MP4, AVI, MOV supported (up to 100MB)
              </span>
            </div>
          )}

          {/* File selected */}
          {file && phase === "idle" && (
            <div className="p-6 rounded-sm border border-gray-200 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-sm bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileVideo className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(file.size)} • {file.type || "Video file"}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleUpload}
                className="btn-pastel-blue w-full block text-center py-3"
              >
                START ENHANCEMENT PIPELINE
              </button>
            </div>
          )}

          {/* Uploading */}
          {phase === "uploading" && (
            <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm font-semibold text-gray-900">
                    Uploading video...
                  </span>
                </div>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  {uploadProgress}%
                </span>
              </div>
              <ProgressBar progress={uploadProgress} status="Uploading" />
            </div>
          )}

          {/* Processing */}
          {phase === "processing" && (
            <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">
                      Enhancing video frames...
                    </span>
                    <span className="text-xs text-gray-400">
                      {statusMessage}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  {processingProgress}%
                </span>
              </div>
              <ProgressBar
                progress={processingProgress}
                status="Extracting & Restoring"
              />
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div className="p-8 rounded-sm border border-emerald-200 bg-emerald-50/50 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-editorial text-xl font-normal text-gray-900">
                Processing Complete!
              </h4>
              <p className="text-xs text-gray-500">
                Redirecting to results view...
              </p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="p-6 rounded-sm border border-rose-200 bg-rose-50/50 space-y-3">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">
                  Processing Notice
                </span>
              </div>
              <p className="text-xs text-gray-600">{errorMessage}</p>
              <button
                onClick={removeFile}
                className="text-xs text-rose-600 underline hover:text-rose-700"
              >
                Try again with another clip
              </button>
            </div>
          )}
        </div>

        {/* Right: Pipeline specs */}
        <div className="space-y-6">
          <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-4">
            <h3 className="font-editorial text-xl font-normal text-gray-900">
              Pipeline Specs
            </h3>
            <div className="space-y-0 text-xs text-gray-500">
              {[
                ["Frame Extraction", "OpenCV @ Native FPS"],
                ["Image Normalization", "512 × 512 px [-1, 1]"],
                ["Classifier Backbone", "EfficientNet-B0"],
                ["GAN Generators", "3× Pix2Pix U-Net"],
                ["Output Container", "MP4 H.264 Video"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-2.5 border-b border-gray-100 last:border-0"
                >
                  <span>{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Automatic Route Selection
            </h4>
            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rain → Pix2Pix Rain Dehazing GAN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Fog → Pix2Pix Defogging GAN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Low-Light → Pix2Pix Luminance Restoration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
