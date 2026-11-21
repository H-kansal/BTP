import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Interactive before/after slider comparison.
 * @param {{ originalSrc: string, enhancedSrc: string, label?: string }} props
 */
export default function FrameComparison({ originalSrc, enhancedSrc, label }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50); // percentage
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

    const handlePointerMove = (e) => updatePosition(e.clientX);
    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="w-full">
      {label && (
        <p className="text-sm text-slate-400 mb-2 text-center">{label}</p>
      )}
      <div
        ref={containerRef}
        className="comparison-container relative w-full"
        onPointerDown={handlePointerDown}
      >
        {/* Enhanced (background, full) */}
        <img
          src={enhancedSrc}
          alt="Enhanced"
          className="block w-full h-auto"
          draggable={false}
        />

        {/* Original (clipped overlay) */}
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

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/30"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-slate-700"
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

        {/* Labels */}
        <div className="absolute top-3 left-3 badge bg-black/50 text-white backdrop-blur-sm text-xs">
          Original
        </div>
        <div className="absolute top-3 right-3 badge bg-cyan-500/70 text-white backdrop-blur-sm text-xs">
          Enhanced
        </div>
      </div>
    </div>
  );
}
