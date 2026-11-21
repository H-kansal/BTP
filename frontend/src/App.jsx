import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import VideoUpload from "./pages/VideoUpload";
import RealTimeCamera from "./pages/RealTimeCamera";
import Results from "./pages/Results";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col lg:flex-row w-full overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area: fills remaining horizontal and vertical space */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pt-16 lg:pt-0">
        <main className="flex-1 flex flex-col w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<VideoUpload />} />
            <Route path="/realtime" element={<RealTimeCamera />} />
            <Route path="/results/:jobId" element={<Results />} />
          </Routes>
        </main>

        {/* Project Capstone Footer anchored at bottom */}
        <Footer />
      </div>
    </div>
  );
}
