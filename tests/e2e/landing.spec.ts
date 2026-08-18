import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("presenta la experiencia social como un recorrido editorial", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Tus sueños para siempre." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primero, tuyos." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Publicar es cruzar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tu firma. No tu identidad." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar a mi calendario privado" })).toHaveAttribute("href", "/calendar");
  await expect(page.getByRole("link", { name: "Explorar el calendario público" })).toHaveAttribute("href", "/explorar");
});

test("la landing permanece accesible, estática con reduced motion y sin overflow móvil", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const hasHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("entra al calendario sin una espera artificial", async ({ page }) => {
  await page.goto("/");
  const startedAt = Date.now();
  await page.getByRole("link", { name: "Entrar a mi calendario privado" }).click();

  await expect(page).toHaveURL(/\/calendar\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(2_000);
});
