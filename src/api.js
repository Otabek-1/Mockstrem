// api.js
import axios from "axios";
// https://english-server-bk91.onrender.com
const baseURL = "https://english-server-bk91.onrender.com";

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

export default api;
