import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    flyURL?: string;
    __retryCount?: number;
  }

  interface AxiosResponse {
    meta?: any;
  }

  interface AxiosInstance {
    logout: (redirectUrl?: string) => void;
  }
}

export {};
