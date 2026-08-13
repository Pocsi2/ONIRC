import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function startWithEmptyCalendar(page: import("@playwright/test").Page) {
  await page.goto("/calendar/");
  await page.evaluate(() => {
    localStorage.removeItem("onirc:dreams:v3");
    localStorage.removeItem("onirc:draft:v1");
  });
  await page.reload();
}

async function recordDream(page: import("@playwright/test").Page, title: string, body: string) {
  await page.getByRole("button", { name: "Registrar sueño" }).click();
  await page.getByLabel("Título del sueño").fill(title);
  await page.getByLabel("¿Qué recuerdas?").fill(body);
  await page.getByRole("button", { name: "Registrar sueño" }).click();
  await expect(page.getByText(/ya vive en tu calendario/)).toBeVisible();
}

test("permite conservar, abrir, editar y deshacer la eliminación de un sueño local", async ({ page }) => {
  await startWithEmptyCalendar(page);
  await expect(page.getByText("Aquí empieza el tiempo.")).toBeVisible();
  await recordDream(page, "El jardín blanco", "Un jardín blanco se abría en habitaciones llenas de mañanas pequeñas.");
  await expect(page.getByText("ya vive en tu calendario")).toBeVisible();
  await page.getByRole("button", { name: /Abrir sueño: El jardín blanco/ }).click();
  await expect(page.getByRole("heading", { name: "El jardín blanco" })).toBeVisible();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Título del sueño").fill("El jardín de porcelana");
  await page.getByRole("button", { name: "Conservar cambios" }).click();
  await expect(page.getByText(/El jardín de porcelana.*ya vive en tu calendario/)).toBeVisible();
  await page.getByRole("button", { name: /Abrir sueño: El jardín de porcelana/ }).click();
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar sueño" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByRole("button", { name: /Abrir sueño: El jardín de porcelana/ })).toBeVisible();
});

test("abre una colección finita cuando un día contiene varias memorias", async ({ page }) => {
  await startWithEmptyCalendar(page);
  await recordDream(page, "Un pasillo azul", "Un pasillo azul llevaba a una puerta que respiraba como una ventana.");
  await recordDream(page, "La habitación de agua", "Una habitación de agua sostenía un vaso de luz sobre una mesa pequeña.");
  await page.getByRole("button", { name: /Abrir 2 sueños del/ }).click();
  await expect(page.getByRole("heading", { name: "2 recuerdos en un día." })).toBeVisible();
  await page.getByRole("button", { name: "Abrir sueño: La habitación de agua" }).click();
  await expect(page.getByRole("heading", { name: "La habitación de agua" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "2 recuerdos en un día." })).toBeVisible();
  await page.getByRole("button", { name: "Volver al calendario" }).click();
  await expect(page.getByRole("button", { name: /Abrir 2 sueños del/ })).toBeVisible();
});

test("mantiene la experiencia legible con reduced motion y sin errores de accesibilidad críticos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startWithEmptyCalendar(page);
  await page.getByRole("button", { name: "Registrar sueño" }).press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
