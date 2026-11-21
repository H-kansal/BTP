import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import VideoUpload from "./pages/VideoUpload";
import RealTimeCamera from "./pages/RealTimeCamera";
import Results from "./pages/Results";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/realtime" element={<RealTimeCamera />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
