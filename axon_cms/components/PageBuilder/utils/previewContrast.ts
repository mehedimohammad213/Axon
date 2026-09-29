/**
 * Preview helpers: ensure text stays readable on light CMS preview canvases.
 * Public sites may use white text on dark heroes; preview must not inherit that blindly.
 */

export function parseCssColor(color) {
  if (!color || typeof color !== "string") return null;
  const value = color.trim();

  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const rgb = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
  );
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }

  return null;
}

/** Relative luminance 0–1 (WCAG). */
export function relativeLuminance(color) {
  const rgb = parseCssColor(color);
  if (!rgb) return null;
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/**
 * Return a readable color for light preview backgrounds.
 * Light/white stored colors become dark slate.
 */
export function readablePreviewColor(color, fallback = "#0f172a") {
  const lum = relativeLuminance(color);
  if (lum === null) return fallback;
  // Light text on light bg → force dark
  if (lum > 0.65) return fallback;
  return color;
}

/**
 * Strip inline light colors from HTML snippets for preview readability.
 */
export function sanitizeHtmlColorsForPreview(html, fallback = "#0f172a") {
  if (!html || typeof html !== "string") return html || "";
  return html.replace(
    /color\s*:\s*([^;"']+)/gi,
    (match, colorValue) => `color: ${readablePreviewColor(colorValue.trim(), fallback)}`
  );
}

/**
 * Keyless Google Maps embed URL (same approach as the public website).
 */
export function buildGoogleMapsEmbedUrl({
  embedUrl,
  mapUrl,
  coordinates,
  zoom = 14,
}) {
  if (embedUrl && typeof embedUrl === "string" && embedUrl.includes("google.com/maps")) {
    return embedUrl;
  }

  const lat = coordinates?.lat;
  const lng = coordinates?.lng;
  if (lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    return `https://www.google.com/maps?q=${Number(lat)},${Number(lng)}&z=${zoom || 14}&output=embed`;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey && lat != null && lng != null) {
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom || 14}`;
  }

  if (mapUrl && typeof mapUrl === "string") {
    // Convert share URLs to embed when possible
    if (mapUrl.includes("output=embed")) return mapUrl;
    if (mapUrl.includes("google.com/maps")) {
      try {
        const u = new URL(mapUrl);
        u.searchParams.set("output", "embed");
        return u.toString();
      } catch {
        return mapUrl;
      }
    }
  }

  return "";
}
