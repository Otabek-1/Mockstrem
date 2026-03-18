import api from "../api";

export async function saveMockProgress(payload) {
  const response = await api.post("/dashboard/progress", payload);
  return response.data?.progress || null;
}

export async function getMockProgress(examType, mockId = null) {
  const response = await api.get("/dashboard/progress/lookup", {
    params: {
      exam_type: examType,
      mock_id: mockId,
    },
  });
  return response.data?.progress || null;
}

export async function getActiveMockProgress() {
  const response = await api.get("/dashboard/progress/active");
  return response.data?.progress || null;
}

export async function completeMockProgress(examType, mockId = null) {
  const response = await api.post("/dashboard/progress/complete", {
    exam_type: examType,
    mock_id: mockId,
  });
  return response.data;
}

export async function createMockAttempt(payload) {
  const response = await api.post("/dashboard/attempts", payload);
  return response.data?.attempt || null;
}

export async function createFullMockAttempt(payload) {
  const response = await api.post("/dashboard/attempts/full-mock", payload);
  return response.data?.attempt || null;
}

export async function resolveLatestMockAttempt(payload) {
  const response = await api.patch("/dashboard/attempts/latest", payload);
  return response.data?.attempt || null;
}
