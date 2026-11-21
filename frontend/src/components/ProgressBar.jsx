export default function ProgressBar({ progress = 0, status = "" }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-gray-500 font-medium">{status}</span>
        <span className="font-semibold text-gray-900 font-mono">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
