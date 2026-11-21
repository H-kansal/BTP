import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CameraOff } from "lucide-react";

/**
 * Reusable camera feed component.
 * Handles getUserMedia, renders video, exposes captureFrame().
 */
const CameraFeed = forwardRef(function CameraFeed(
  { width = 640, height = 480, facingMode = "environment", className = "" },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permissions in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [width, height, facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  // Capture current frame as base64 JPEG
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    // Return base64 without the data:image/jpeg;base64, prefix
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    return dataUrl.split(",")[1];
  }, [isReady]);

  // Expose methods to parent
  useImperativeHandle(
    ref,
    () => ({
      startCamera,
      stopCamera,
      captureFrame,
      isReady,
    }),
    [startCamera, stopCamera, captureFrame, isReady]
  );

  // Start on mount
  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-slate-800/50 border border-red-500/20 ${className}`}
      >
        <CameraOff className="w-12 h-12 text-red-400" />
        <p className="text-red-400 text-center text-sm max-w-md">{error}</p>
        <button onClick={startCamera} className="btn-primary text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto rounded-xl bg-black"
      />
      <canvas ref={canvasRef} className="hidden" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-xl">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
});

export default CameraFeed;
