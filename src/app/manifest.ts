import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HIHONG RECRUIT",
    short_name: "하이홍채용",
    description: "구직자와 기업을 위한 채용 플랫폼",
    start_url: "/recruit",
    scope: "/recruit/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/recruit/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/recruit/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/recruit/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
