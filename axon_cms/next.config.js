// Load .env before reading NEXT_PUBLIC_* — next.config.js can evaluate
// before Next injects env, which previously baked CSP with the wrong origin.
try {
  require("dotenv").config({ path: require("path").join(__dirname, ".env") });
} catch {
  // dotenv is optional; Next still injects env for the app runtime.
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || "http://127.0.0.1:8000";

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

const apiOrigin = getOrigin(apiBaseUrl);
const mediaOrigin = getOrigin(mediaUrl);
// Always allow the local Laravel API during development.
const localApiOrigin = "http://127.0.0.1:8000";
const connectOrigins = Array.from(
  new Set([apiOrigin, mediaOrigin, localApiOrigin].filter(Boolean))
).join(" ");

const nextConfig = {
  distDir: ".next",
  output: "standalone",
  eslint: {
    dirs: ["."],
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      "headless-cms.vercel.app",
      "res.cloudinary.com",
      "headless.mehedi.com",
      "videos.pexels.com",
      "images.pexels.com",
      "127.0.0.1",
      "localhost",
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: " + mediaOrigin + " " + localApiOrigin,
              "media-src 'self' data: blob: https://videos.pexels.com https://images.pexels.com",
              "connect-src 'self' https: " + connectOrigins,
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
