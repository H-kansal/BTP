import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  Cpu,
} from "lucide-react";
import { enhanceImage } from "../services/api";
import FrameComparison from "../components/FrameComparison";

export default function ImageEnhance() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("slider"); // "slider" | "side-by-side"

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }
    setFile(f);
    setOriginalPreview(URL.createObjectURL(f));
    setResult(null);
    setErrorMessage("");
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
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }
    setFile(null);
    setOriginalPreview(null);
    setResult(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEnhance = async () => {
    if (!file) return;

    setProcessing(true);
    setErrorMessage("");
    setResult(null);

    try {
      const data = await enhanceImage(file);
      // Construct data URI for the enhanced base64 image
      const enhancedSrc = data.enhanced_image_base64.startsWith("data:")
        ? data.enhanced_image_base64
        : `data:image/png;base64,${data.enhanced_image_base64}`;

      setResult({
        ...data,
        enhancedSrc,
      });
    } catch (err) {
      console.error("Enhancement failed:", err);
      setErrorMessage(
        err.response?.data?.detail || "Enhancement failed. Check backend connection."
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadEnhanced = () => {
    if (!result?.enhancedSrc) return;
    const link = document.createElement("a");
    link.href = result.enhancedSrc;
    link.download = `enhanced_${file?.name?.split(".")[0] || "image"}.png`;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBadgeStyle = (label) => {
    switch (label?.toLowerCase()) {
      case "rain":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "fog":
        return "text-slate-700 bg-slate-50 border-slate-200";
      case "low_light":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-sky-700 bg-sky-50 border-sky-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 w-full pt-10 text-left">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-gray-900 tracking-tight">
          Single Image Enhancement
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-xl">
          Upload any degraded weather photograph. EfficientNet-B0 detects rain, fog, or low-light, and dispatches the frame directly to the trained Pix2Pix generator.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Input / Output Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Drop Zone (idle, no file selected) */}
          {!file && (
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
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-normal text-gray-900 mb-1">
                Drag and drop your image here
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                or click to browse your files
              </p>
              <span className="inline-block px-3 py-1 rounded-xs bg-white border border-gray-200 text-[11px] text-gray-500 font-medium">
                PNG, JPG, JPEG, WEBP supported
              </span>
            </div>
          )}

          {/* 2. File Selected & Ready for Enhancement */}
          {file && !result && (
            <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-6">
              {/* File Info Card */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-sm bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(file.size)} • {file.type || "Image file"}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  disabled={processing}
                  className="p-1.5 rounded-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Original Image Preview */}
              {originalPreview && (
                <div className="rounded-sm border border-gray-200 overflow-hidden bg-gray-50">
                  <div className="px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-600 bg-white">
                    Selected Input Image
                  </div>
                  <div className="max-h-96 flex items-center justify-center p-2 bg-gray-100">
                    <img
                      src={originalPreview}
                      alt="Selected upload"
                      className="max-h-80 object-contain rounded-xs"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleEnhance}
                disabled={processing}
                className="btn-pastel-blue w-full block text-center py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    RUNNING CLASSIFIER & GAN RESTORATION...
                  </span>
                ) : (
                  "RUN RESTORATION PIPELINE"
                )}
              </button>
            </div>
          )}

          {/* 3. Processing State Indicator */}
          {processing && (
            <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Executing Neural Workflow
                  </h4>
                  <p className="text-xs text-gray-400">
                    Stage 1: EfficientNet-B0 detection → Stage 2: Pix2Pix enhancement
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Enhancement Result Presentation */}
          {result && (
            <div className="space-y-6">
              {/* Classification Info Banner */}
              <div className="p-4 rounded-sm border border-gray-200 bg-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Detected Condition
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-xs border uppercase tracking-wider ${getBadgeStyle(
                          result.classification
                        )}`}
                      >
                        {result.classification}
                      </span>
                      {result.confidence && (
                        <span className="text-xs text-gray-500 font-mono">
                          ({(result.confidence * 100).toFixed(1)}% confidence)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadEnhanced}
                    className="btn-pastel-green text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Result
                  </button>
                  <button
                    onClick={removeFile}
                    className="px-3 py-1.5 rounded-xs border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Enhance Another
                  </button>
                </div>
              </div>

              {/* Visual Comparison: Slider or Side-by-Side */}
              <div className="p-4 rounded-sm border border-gray-200 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-2xl font-normal text-gray-900">
                    Before & After Comparison
                  </h3>
                  <div className="flex items-center gap-1 p-0.5 rounded-xs bg-gray-100 border border-gray-200 text-xs">
                    <button
                      onClick={() => setViewMode("slider")}
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
                        viewMode === "slider"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Slider
                    </button>
                    <button
                      onClick={() => setViewMode("side-by-side")}
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
                        viewMode === "side-by-side"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Side by Side
                    </button>
                  </div>
                </div>

                {viewMode === "slider" ? (
                  <FrameComparison
                    originalSrc={originalPreview}
                    enhancedSrc={result.enhancedSrc}
                    label={`Restoration with ${result.classification.toUpperCase()} GAN`}
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-sm p-3 bg-white">
                      <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                        Raw Degraded Input
                      </p>
                      <img
                        src={originalPreview}
                        alt="Raw Input"
                        className="w-full rounded-xs border border-gray-100"
                      />
                    </div>
                    <div className="border border-gray-200 rounded-sm p-3 bg-white">
                      <p className="text-xs text-emerald-600 mb-2 font-semibold uppercase tracking-wider">
                        Pix2Pix Restored
                      </p>
                      <img
                        src={result.enhancedSrc}
                        alt="Enhanced Result"
                        className="w-full rounded-xs border border-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message Card */}
          {errorMessage && (
            <div className="p-6 rounded-sm border border-rose-200 bg-rose-50/50 space-y-3">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">Enhancement Notice</span>
              </div>
              <p className="text-xs text-gray-600">{errorMessage}</p>
              <button
                onClick={removeFile}
                className="text-xs text-rose-600 underline hover:text-rose-700"
              >
                Try again with another image
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Column: Workflow Information */}
        <div className="space-y-6">
          <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-4">
            <h3 className="font-editorial text-xl font-normal text-gray-900">
              Pipeline Execution Flow
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When an image is submitted, it automatically moves through our two-stage deep learning pipeline:
            </p>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-xs border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  Stage 1: Condition Classifier
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  EfficientNet-B0 scales image to 224px, crops center, and generates class probability across <code>fog</code>, <code>low_light</code>, and <code>rain</code>.
                </p>
              </div>

              <div className="p-3 rounded-xs border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Stage 2: Targeted GAN Translation
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  The matched Pix2Pix U-Net generator performs 512×512 image-to-image translation, removing occlusion while retaining high-frequency edges.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-sm border border-gray-200 bg-white space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Auto Dispatch Matrix
            </h4>
            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rain → Rain Dehazing GAN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Fog → Defogging GAN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Low-Light → Luminance Restoration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
