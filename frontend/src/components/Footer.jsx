import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-24">
      {/* Pre-Footer Action Banner */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Call to action */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h3 className="font-editorial text-3xl font-normal text-gray-900 tracking-tight">
              Test the Enhancement Pipeline
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Upload degraded video files to run frame-by-frame restoration, or stream real-time webcam frames.
            </p>
            <div>
              <Link
                to="/upload"
                className="btn-pastel-green inline-block text-xs uppercase tracking-wider font-semibold py-2.5 px-5"
              >
                Upload Video Footage
              </Link>
            </div>
          </div>

          {/* Links 1: Learn */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>
                <Link to="/" className="hover:text-gray-900 transition-colors">
                  System Overview
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-gray-900 transition-colors">
                  Video Upload Pipeline
                </Link>
              </li>
              <li>
                <Link to="/realtime" className="hover:text-gray-900 transition-colors">
                  Real-Time Webcam Feed
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-gray-900 transition-colors">
                  Batch Restoration
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2: Project */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider mb-4">
              Capstone Project
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>Department of CSE</li>
              <li>Bachelor of Technology</li>
              <li>PyTorch & Pix2Pix GAN</li>
              <li>EfficientNet-B0 Backbone</li>
            </ul>
          </div>

          {/* Links 3: Conditions */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider mb-4">
              Restoration Models
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>Rain Streak Removal</li>
              <li>Atmospheric Defogging</li>
              <li>Low-Light Night Drive</li>
              <li>Real-Time WebSocket Stream</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 via-sky-400 to-emerald-400 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </div>
          <span>© {new Date().getFullYear()} WeatherVision — Department of Computer Science & Engineering</span>
        </div>
        <div className="flex items-center gap-6">
          <span>512×512 Paired GANs</span>
          <span>•</span>
          <span>OpenCV Extraction</span>
          <span>•</span>
          <span>FastAPI</span>
        </div>
      </div>
    </footer>
  );
}
