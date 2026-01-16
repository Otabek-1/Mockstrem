// api.js
import axios from "axios";
// https://english-server-p7y6.onrender.com
const baseURL = "https://english-server-p7y6.onrender.com";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// TOKEN HANDLERS
// =========================

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/auth"; // redirect
}

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// REFRESH TOKEN SYSTEM
// =========================

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No refresh for login & refresh endpoints
    if (originalRequest._retry) return Promise.reject(error);

    // Access expired?
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${baseURL}/auth/verify`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;

        setAccessToken(newAccess);
        processQueue(null, newAccess);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest); // retry

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        logoutUser(); // force logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =========================
// SESSION MANAGEMENT FUNCTIONS
// =========================

// Device Fingerprint Generator
function generateDeviceFingerprint() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = '14px "Arial"';
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("Browser Fingerprint", 2, 15);
  const canvasData = canvas.toDataURL();
  return btoa(canvasData).substring(0, 32);
}

// Get Browser Name
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown";
}

// Get IP Address (optional - backend can get from headers)
async function getIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}

// ===================== SESSION API CALLS =====================

// 1️⃣ Create Session (Login/Register qilganda chaqiriladi)
export async function createSession() {
  try {
    const response = await api.post("/sessions/create", {
      device_fingerprint: generateDeviceFingerprint(),
      device_name: navigator.userAgent.substring(0, 100),
      device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "web",
      browser: getBrowserName(),
      ip_address: await getIpAddress(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

// 2️⃣ Get All User Sessions
export async function getMyDevices() {
  try {
    const response = await api.get("/sessions/my-sessions?include_inactive=false");
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

// 3️⃣ Get Session Details
export async function getSessionDetails(sessionId) {
  try {
    const response = await api.get(`/sessions/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session details:", error);
    throw error;
  }
}

// 4️⃣ Delete Single Session (Logout from specific device)
export async function logoutDevice(sessionId) {
  try {
    const response = await api.delete(`/sessions/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

// 5️⃣ Logout from All Devices
export async function logoutAllDevices(excludeCurrent = false) {
  try {
    const response = await api.delete(`/sessions/logout-all?exclude_current=${excludeCurrent}`);
    return response.data;
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    throw error;
  }
}

// 6️⃣ Get Active Devices Count
export async function getActiveDevicesCount() {
  try {
    const response = await api.get("/sessions/active-devices-count");
    return response.data;
  } catch (error) {
    console.error("Error fetching active devices count:", error);
    throw error;
  }
}

export default api;
