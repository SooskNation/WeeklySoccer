import backend from "~backend/client";

export function getAuthenticatedBackend() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return backend;
  }
  return backend.with({
    auth: { authorization: `Bearer ${token}` }
  });
}
