import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Upload a video file with progress tracking.
 */
export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(pct);
      }
    },
  });
  return response.data;
}

/**
 * Poll the processing status of a job.
 */
export async function getJobStatus(jobId) {
  const response = await api.get(`/upload/status/${jobId}`);
  return response.data;
}

/**
 * Fetch completed results for a job.
 */
export async function getJobResults(jobId) {
  const response = await api.get(`/upload/results/${jobId}`);
  return response.data;
}

/**
 * Enhance a single image file.
 */
export async function enhanceImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/enhance/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Create a WebSocket connection for real-time enhancement.
 */
export function createWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return new WebSocket(`${protocol}//${host}/ws/realtime`);
}

export default api;
