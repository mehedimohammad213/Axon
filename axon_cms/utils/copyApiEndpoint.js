import { message } from "antd";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:6006/api";

export function getApiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
  return String(base).replace(/\/$/, "");
}

function normalizePath(path = "") {
  const value = String(path).trim();
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
}

function isAdminOnlyPath(path) {
  return (
    path.startsWith("/admin/") ||
    path.startsWith("/organizations") ||
    path.startsWith("/trash")
  );
}

function isPublicRootPath(path) {
  return path.startsWith("/form-submission") || path.startsWith("/public/");
}

export function buildApiEndpoint(pathOrUrl, { publicEndpoint } = {}) {
  if (!pathOrUrl) return getApiBaseUrl();
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const path = normalizePath(pathOrUrl);
  const usePublic =
    publicEndpoint !== false &&
    !isAdminOnlyPath(path) &&
    !isPublicRootPath(path);

  return `${getApiBaseUrl()}${usePublic ? "/public" : ""}${path}`;
}

export async function copyText(text) {
  if (typeof window === "undefined" || text == null) return false;
  const value = String(text);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to execCommand for insecure origins / denied permissions.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export async function copyApiEndpoint(pathOrUrl, options = {}) {
  const url = buildApiEndpoint(pathOrUrl, options);
  const copied = await copyText(url);

  if (copied) {
    message.success(options.successMessage || "API endpoint copied");
  } else {
    message.error(options.errorMessage || "Failed to copy API endpoint");
  }

  return copied;
}
