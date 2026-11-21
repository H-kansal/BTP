import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CameraOff } from "lucide-react";

const CameraFeed = forwardRef(function CameraFeed(
  { width = 640, height = 480, facingMode = "environment", className = "" },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

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
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow permissions.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [width, height, facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    return dataUrl.split(",")[1];
  }, [isReady]);

  useImperativeHandle(
    ref,
    () => ({ startCamera, stopCamera, captureFrame, isReady }),
    [startCamera, stopCamera, captureFrame, isReady]
  );

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}
      >
        <CameraOff className="w-10 h-10 text-rose-400" />
        <p className="text-rose-400 text-center text-sm max-w-md">{error}</p>
        <button
          onClick={startCamera}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold"
        >
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
        className="w-full h-auto bg-black"
      />
      <canvas ref={canvasRef} className="hidden" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
});

export default CameraFeed;
