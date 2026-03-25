import type { NextConfig } from "next";

const repositorioGitHub = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const esRepositorioUsuario = repositorioGitHub.endsWith(".github.io");
const rutaBaseGitHubPages =
  process.env.GH_PAGES === "true" && repositorioGitHub && !esRepositorioUsuario
    ? `/${repositorioGitHub}`
    : "";

const cabecerasSeguridad = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join("; ")
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()"
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  }
] as const;

const configuracionBase: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.GH_PAGES === "true" ? "export" : undefined,
  trailingSlash: process.env.GH_PAGES === "true",
  images: {
    unoptimized: true
  },
  basePath: rutaBaseGitHubPages,
  assetPrefix: rutaBaseGitHubPages || undefined,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  }
};

const configuracionNext: NextConfig =
  process.env.GH_PAGES === "true"
    ? configuracionBase
    : {
        ...configuracionBase,
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [...cabecerasSeguridad]
            }
          ];
        }
      };

export default configuracionNext;
