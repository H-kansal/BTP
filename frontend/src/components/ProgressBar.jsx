import { useState, useRef, useCallback } from "react";

/**
 * Animated progress bar with gradient color shift and percentage label.
 * @param {{ progress: number, status?: string }} props
 */
export default function ProgressBar({ progress = 0, status = "" }) {
  const clamped = Math.min(100, Math.max(0, progress));

  // Interpolate from blue (#3b82f6) to cyan (#06b6d4) to green (#22c55e)
  const getGradient = () => {
    if (clamped < 50) {
      return "from-blue-500 to-cyan-500";
    }
    if (clamped < 80) {
      return "from-cyan-500 to-emerald-500";
    }
    return "from-emerald-500 to-green-400";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{status}</span>
        <span className="text-sm font-semibold text-slate-200">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
