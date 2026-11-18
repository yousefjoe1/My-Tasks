import axios, { isAxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const api = axios.create({
  baseURL: "/backend",
  timeout: 10_000,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError<{ error?: string }>(error)) {
      const status = error.response?.status ?? 0;
      const code = error.response?.data?.error ?? "network_error";
      return Promise.reject(new ApiError(status, code));
    }
    return Promise.reject(error);
  }
);