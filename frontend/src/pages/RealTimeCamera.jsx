import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Play,
  Square,
  Zap,
  ImageDown,
  Gauge,
  Radio,
} from "lucide-react";
import CameraFeed from "../components/CameraFeed";
import { createWebSocket } from "../services/api";

export default function RealTimeCamera() {
  const cameraRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [enhancedFrame, setEnhancedFrame] = useState(null);
  const [classification, setClassification] = useState(null);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const fpsTimerRef = useRef(null);
  const framesInLastSec = useRef(0);

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

  const startEnhancement = useCallback(() => {
    setWsStatus("connecting");
    const ws = createWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      setIsActive(true);
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
        if (data.enhanced_frame) setEnhancedFrame(data.enhanced_frame);
        if (data.classification) setClassification(data.classification);
        framesInLastSec.current += 1;
        setFrameCount((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onerror = () => {
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

  useEffect(() => () => stopEnhancement(), [stopEnhancement]);

  const saveSnapshot = () => {
    if (!enhancedFrame) return;
    const link = document.createElement("a");
    link.href = enhancedFrame.startsWith("data:")
      ? enhancedFrame
      : `data:image/jpeg;base64,${enhancedFrame}`;
    link.download = `weathervision-snapshot-${Date.now()}.jpg`;
    link.click();
  };

  const getBadge = (label) => {
    switch (label?.toLowerCase()) {
      case "rain":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "fog":
        return "text-gray-700 bg-gray-50 border-gray-200";
      case "low_light":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-sky-700 bg-sky-50 border-sky-200";
    }
  };

  const statusDot =
    wsStatus === "connected"
      ? "bg-emerald-500"
      : wsStatus === "connecting"
      ? "bg-amber-400 animate-pulse"
      : wsStatus === "error"
      ? "bg-rose-500"
      : "bg-gray-300";

  return (
    <div className="max-w-5xl mx-auto px-6 w-full pt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10 text-left">
        <div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-gray-900 tracking-tight">
            Real-Time Camera Stream
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Stream live video frames via WebSocket to PyTorch for automated condition classification and Pix2Pix restoration at 2 FPS.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-white border border-gray-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span className="text-gray-600 font-medium capitalize">
              {wsStatus}
            </span>
          </div>

          {!isActive ? (
            <button
              onClick={startEnhancement}
              className="btn-pastel-green text-xs"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopEnhancement}
              className="px-4 py-1.5 rounded-xs bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs hover:bg-rose-100 transition-colors"
            >
              Stop Stream
            </button>
          )}
        </div>
      </div>

      {/* Metrics bar */}
      {isActive && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-sm bg-gray-50 border border-gray-200 mb-8 text-left">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-xs">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Rate:</span>
              <span className="font-semibold text-gray-900 font-mono">
                {fps || 2} FPS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Frames:</span>
              <span className="font-semibold text-gray-900 font-mono">
                {frameCount}
              </span>
            </div>
            {classification && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Detected:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-xs border text-[11px] uppercase ${getBadge(
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
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ImageDown className="w-3.5 h-3.5" />
            Snapshot Frame
          </button>
        </div>
      )}

      {/* Video feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Raw camera */}
        <div className="rounded-sm border border-gray-200 overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-900">
              Raw Input Feed
            </div>
            <span className="text-[10px] font-semibold text-gray-400 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-200">
              WEBCAM
            </span>
          </div>
          <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
            <CameraFeed
              ref={cameraRef}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Enhanced output */}
        <div className="rounded-sm border border-gray-200 overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-900">
              Restored Output
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
              512 × 512 PIXELS
            </span>
          </div>
          <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
            {enhancedFrame ? (
              <img
                src={
                  enhancedFrame.startsWith("data:")
                    ? enhancedFrame
                    : `data:image/jpeg;base64,${enhancedFrame}`
                }
                alt="Enhanced"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-2">
                <div className="w-10 h-10 rounded-full bg-gray-200/60 text-gray-400 flex items-center justify-center mx-auto">
                  <Radio className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-gray-500">
                  {isActive
                    ? "Waiting for processed frames..."
                    : "Click 'Start Camera' to initiate stream"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
