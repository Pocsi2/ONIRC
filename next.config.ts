import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
// A GitHub Action also runs unit and end-to-end checks. Only the deployment
// build needs the repository subpath; coupling this to GITHUB_ACTIONS made
// local checks behave like the deployed site and obscured release failures.
const pagesBasePath = process.env.ONIRC_BASE_PATH === "/ONIRC" ? "/ONIRC" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: pagesBasePath,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
