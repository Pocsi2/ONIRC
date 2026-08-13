import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const root = process.cwd();
const lhciDirectory = join(root, ".lighthouseci");
const artifactDirectory = join(root, "artifacts", "lighthouse");
const chromeProfileDirectory = join(artifactDirectory, "chrome-profile");
const urls = ["http://127.0.0.1:4173/", "http://127.0.0.1:4173/calendar/"];
const chromePort = 9222;

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}.`));
    });
  });

const waitForUrl = async (url, description) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The static server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`${description} no estuvo listo para Lighthouse CI.`);
};

if (process.env.ONIRC_SKIP_BUILD !== "true") {
  await run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);
}

await rm(lhciDirectory, { recursive: true, force: true });
await rm(artifactDirectory, { recursive: true, force: true });
await mkdir(lhciDirectory, { recursive: true });
await mkdir(artifactDirectory, { recursive: true });

const staticServer = spawn(process.execPath, ["node_modules/serve/build/main.js", "out", "-l", "4173"], {
  cwd: root,
  stdio: "ignore",
  windowsHide: true,
});

let chromeServer;

try {
  await waitForUrl(urls[0], "El servidor estático");
  chromeServer = spawn(
    chromium.executablePath(),
    [
      "--headless=new",
      `--remote-debugging-port=${chromePort}`,
      `--user-data-dir=${chromeProfileDirectory}`,
      "--no-first-run",
      "--no-default-browser-check",
    ],
    { stdio: "ignore", windowsHide: true },
  );
  await waitForUrl(`http://127.0.0.1:${chromePort}/json/version`, "Chrome");

  for (const [index, url] of urls.entries()) {
    const result = await lighthouse(url, {
      logLevel: "error",
      output: "json",
      port: chromePort,
    });

    if (!result?.lhr) throw new Error(`Lighthouse no produjo un reporte para ${url}.`);

    const reportName = `lhr-${Date.now() + index}.json`;
    const serializedReport = JSON.stringify(result.lhr, null, 2);
    await Promise.all([
      writeFile(join(lhciDirectory, reportName), serializedReport),
      writeFile(join(artifactDirectory, reportName), serializedReport),
    ]);

    const { performance, accessibility } = result.lhr.categories;
    console.log(
      `${url} — rendimiento ${Math.round(performance.score * 100)}, accesibilidad ${Math.round(accessibility.score * 100)}`,
    );
  }
} finally {
  chromeServer?.kill();
  staticServer.kill();
}

await run(process.execPath, ["node_modules/@lhci/cli/src/cli.js", "assert"]);
