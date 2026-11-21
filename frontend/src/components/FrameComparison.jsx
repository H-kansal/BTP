import { useState, useRef, useEffect, useCallback } from "react";

export default function FrameComparison({ originalSrc, enhancedSrc, label }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      setIsDragging(true);
      updatePosition(e.clientX);
      e.preventDefault();
    },
    [updatePosition]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => updatePosition(e.clientX);
    const handleUp = () => setIsDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="w-full">
      {label && (
        <p className="text-xs text-gray-400 mb-2.5 text-center font-medium uppercase tracking-wider">{label}</p>
      )}
      <div
        ref={containerRef}
        className="comparison-container relative w-full rounded-sm overflow-hidden border border-gray-200"
        onPointerDown={handlePointerDown}
      >
        <img
          src={enhancedSrc}
          alt="Enhanced"
          className="block w-full h-auto"
          draggable={false}
        />

        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={originalSrc}
            alt="Original"
            className="block h-full object-cover"
            style={{ width: containerRef.current?.offsetWidth || "100%" }}
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center cursor-ew-resize">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-gray-700"
            >
              <path
                d="M5 3L2 8L5 13M11 3L14 8L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-xs border border-gray-200">
          RAW DEGRADED
        </div>
        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-xs">
          PIX2PIX ENHANCED
        </div>
      </div>
    </div>
  );
}
