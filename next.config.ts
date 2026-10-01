import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server (the demo preview) run beside the main one
  // without the two sharing a build folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Company photos and logos are stored as full-size originals. Listing
    // their hosts lets Next resize them, so a card loads a small image instead
    // of a multi-megabyte one. Keep this list in step with lib/format.ts.
    remotePatterns: [
      // The legacy archive on Cloudflare R2.
      {
        protocol: "https",
        hostname: "pub-5b31f562a8844a1fa6c2e66816ca678e.r2.dev",
      },
      // UploadThing, where the platform stores new uploads such as logos.
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
};

export default nextConfig;
