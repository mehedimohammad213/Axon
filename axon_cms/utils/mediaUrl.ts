/**
 * Build a browser-usable URL for a media file_path.
 * - Absolute http(s) URLs are returned as-is
 * - Site-relative public assets (/banners/..., /logo.svg) stay on the CMS origin
 * - Uploaded/API files are prefixed with NEXT_PUBLIC_MEDIA_URL
 */
export function resolveMediaUrl(filePath) {
  if (!filePath) return "/images/Image_Placeholder.png";

  const pathValue = String(filePath).trim();
  if (/^https?:\/\//i.test(pathValue)) return pathValue;

  // CMS/public assets (leading slash, not API upload roots)
  if (
    pathValue.startsWith("/") &&
    !pathValue.startsWith("/uploads") &&
    !pathValue.startsWith("/media/")
  ) {
    return pathValue;
  }

  const base = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/$/, "");
  const relative = pathValue.replace(/^\//, "");
  return base ? `${base}/${relative}` : `/${relative}`;
}
