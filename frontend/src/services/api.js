import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Upload a video file with progress tracking.
 * @param {File} file - The video file to upload.
 * @param {function} onProgress - Callback receiving progress percentage (0-100).
 * @returns {Promise<object>} Response data with job_id.
 */
export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });
  return response.data;
}

/**
 * Poll the processing status of a job.
 * @param {string} jobId
 * @returns {Promise<object>} { status, progress, message }
 */
export async function getJobStatus(jobId) {
  const response = await api.get(`/upload/status/${jobId}`);
  return response.data;
}

/**
 * Fetch completed results for a job.
 * @param {string} jobId
 * @returns {Promise<object>} Results payload.
 */
export async function getJobResults(jobId) {
  const response = await api.get(`/upload/results/${jobId}`);
  return response.data;
}

/**
 * Enhance a single image file.
 * @param {File} file - The image file.
 * @returns {Promise<object>} { classification, enhanced_image }
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
 * @returns {WebSocket}
 */
export function createWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return new WebSocket(`${protocol}//${host}/ws/realtime`);
}

export default api;
