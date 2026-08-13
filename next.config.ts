import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  // Keeps Next's generated cache separate from OneDrive's occasionally locked
  // default directory. It is ignored by Git and does not affect `out/`.
  distDir: ".next-onirc",
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPagesBuild ? "/ONIRC" : "",
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
