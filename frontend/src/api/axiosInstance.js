// src/api/axiosInstance.js
import axios from "axios";
// import { hybridEncrypt } from "../utils/hybridEncrypt";
import { pgpEncrypt } from "../utils/pgpEncrypt";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

// REQUEST interceptor: encrypt payload
api.interceptors.request.use(async (config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = config.method?.toLowerCase();
  const shouldEncrypt =
    ["post", "put", "patch", "delete"].includes(method) &&
    config.data &&
    !config.skipEncryption;

  if (shouldEncrypt) {
    // Hybrid encrypt the payload
    // const encryptedPayload = await hybridEncrypt(config.data);

    // pgp encrypt the paylaod
    const encryptedPayload = await pgpEncrypt(config.data);
    config.data = { encrypted: encryptedPayload };
  }

  return config;
});

// RESPONSE interceptor: decrypt server encrypted responses
api.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
