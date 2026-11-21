import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Play,
  Square,
  Zap,
  ImageDown,
  Gauge,
  Radio,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import CameraFeed from "../components/CameraFeed";
import { createWebSocket } from "../services/api";

export default function RealTimeCamera() {
  const cameraRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [wsStatus, setWsStatus] = useState("disconnected"); // disconnected | connecting | connected | error
  const [enhancedFrame, setEnhancedFrame] = useState(null);
  const [classification, setClassification] = useState(null);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const fpsTimerRef = useRef(null);
  const framesInLastSec = useRef(0);

  // ── FPS Counter ──
  useEffect(() => {
    if (isActive) {
      fpsTimerRef.current = setInterval(() => {
        setFps(framesInLastSec.current * 2);
        framesInLastSec.current = 0;
      }, 1000);
    } else {
      setFps(0);
      framesInLastSec.current = 0;
      if (fpsTimerRef.current) clearInterval(fpsTimerRef.current);
    }
    return () => {
      if (fpsTimerRef.current) clearInterval(fpsTimerRef.current);
    };
  }, [isActive]);

  // ── WebSocket & Frame Loop ──
  const startEnhancement = useCallback(() => {
    setWsStatus("connecting");

    const ws = createWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      setIsActive(true);

      // Send frame every 500ms (2 FPS)
      timerRef.current = setInterval(() => {
        if (!cameraRef.current) return;
        const base64 = cameraRef.current.captureFrame();
        if (base64 && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ frame: base64 }));
        }
      }, 500);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.enhanced_frame) {
          setEnhancedFrame(data.enhanced_frame);
        }
        if (data.classification) {
          setClassification(data.classification);
        }
        framesInLastSec.current += 1;
        setFrameCount((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setWsStatus("error");
      stopEnhancement();
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      stopEnhancement();
    };
  }, []);

  const stopEnhancement = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsActive(false);
    setWsStatus("disconnected");
  }, []);

  useEffect(() => {
    return () => {
      stopEnhancement();
    };
  }, [stopEnhancement]);

  // ── Snapshot ──
  const saveSnapshot = () => {
    if (!enhancedFrame) return;
    const link = document.createElement("a");
    link.href = enhancedFrame.startsWith("data:")
      ? enhancedFrame
      : `data:image/jpeg;base64,${enhancedFrame}`;
    link.download = `weathervision-snapshot-${Date.now()}.jpg`;
    link.click();
  };

  const getBadgeStyle = (label) => {
    switch (label?.toLowerCase()) {
      case "rain":
        return "text-blue-400 bg-blue-500/15 border-blue-500/30";
      case "fog":
        return "text-slate-300 bg-slate-500/15 border-slate-500/30";
      case "low_light":
        return "text-amber-400 bg-amber-500/15 border-amber-500/30";
      default:
        return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Radio className="w-3.5 h-3.5" />
            Live WebSocket Inference (2 FPS)
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Real-Time Camera
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Stream live video frames to the PyTorch backend for automated weather classification
            and Pix2Pix U-Net image enhancement.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === "connected"
                  ? "bg-emerald-400 animate-pulse"
                  : wsStatus === "connecting"
                  ? "bg-amber-400 animate-ping"
                  : wsStatus === "error"
                  ? "bg-rose-400"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-slate-300 font-medium capitalize">{wsStatus}</span>
          </div>

          {!isActive ? (
            <button onClick={startEnhancement} className="btn-primary text-sm py-2 px-4">
              <Play className="w-4 h-4" />
              Start Stream
            </button>
          ) : (
            <button
              onClick={stopEnhancement}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Stream
            </button>
          )}
        </div>
      </div>

      {/* ── Real-Time Metrics Bar ── */}
      {isActive && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Stream Rate:</span>
              <span className="font-bold text-white font-mono">{fps || 2} FPS</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Frames Processed:</span>
              <span className="font-bold text-white font-mono">{frameCount}</span>
            </div>

            {classification && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Detected:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full border text-[11px] uppercase ${getBadgeStyle(
                    classification
                  )}`}
                >
                  {classification}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={saveSnapshot}
            disabled={!enhancedFrame}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ImageDown className="w-4 h-4" />
            Snapshot Enhanced Frame
          </button>
        </div>
      )}

      {/* ── Video Feeds ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Camera Input */}
        <div className="glass-card p-5 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Camera className="w-4 h-4 text-slate-400" />
              Raw Camera Feed
            </div>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              INPUT
            </span>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
            <CameraFeed ref={cameraRef} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Enhanced Model Output */}
        <div className="glass-card p-5 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="w-4 h-4 text-cyan-400" />
              Pix2Pix Restored Output
            </div>
            <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              512 × 512 PX
            </span>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
            {enhancedFrame ? (
              <img
                src={
                  enhancedFrame.startsWith("data:")
                    ? enhancedFrame
                    : `data:image/jpeg;base64,${enhancedFrame}`
                }
                alt="Enhanced Output"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  {isActive ? "Waiting for processed frames..." : "Start stream to view enhanced feed"}
                </p>
                <p className="text-xs text-slate-500">
                  Frames are classified & restored via WebSocket at 2 FPS
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
