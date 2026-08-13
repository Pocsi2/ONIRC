import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPagesBuild ? "/ONIRC" : "",
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
