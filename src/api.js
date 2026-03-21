import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://english-server-p7y6.onrender.com";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  try {
    api.delete("/sessions/logout").catch(() => {});
  } catch (err) {
    console.warn("Could not notify backend of logout", err);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/auth";
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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

    if (originalRequest?._retry) return Promise.reject(error);

    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
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
          refresh_token: refreshToken,
        });

        const newAccess = res.data.access_token;
        setAccessToken(newAccess);
        processQueue(null, newAccess);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function getMyDevices() {
  try {
    const response = await api.get("/sessions/my-sessions?include_inactive=false");
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

export async function getSessionDetails(sessionId) {
  try {
    const response = await api.get(`/sessions/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session details:", error);
    throw error;
  }
}

export async function logoutDevice(sessionId) {
  try {
    const response = await api.delete(`/sessions/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

export async function logoutAllDevices(excludeCurrent = false) {
  try {
    const response = await api.delete(`/sessions/logout-all?exclude_current=${excludeCurrent}`);
    return response.data;
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    throw error;
  }
}

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
