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
  await page.locator("#dream-body").fill(body);
  await page.locator("#dream-title").fill(title);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("permite conservar, abrir, editar y deshacer la eliminación de un sueño local", async ({ page }) => {
  await startWithEmptyCalendar(page);
  await expect(page.getByText("No hay sueños todavía.")).toBeVisible();
  await recordDream(page, "El jardín blanco", "Un jardín blanco se abría en habitaciones llenas de mañanas pequeñas.");
  await page.getByRole("button", { name: /Abrir sueño: El jardín blanco/ }).click();
  await expect(page.getByRole("heading", { name: "El jardín blanco" })).toBeVisible();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.locator("#dream-title").fill("El jardín de porcelana");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Abrir sueño: El jardín de porcelana/ }).click();
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar sueño" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByRole("button", { name: /Abrir sueño: El jardín de porcelana/ })).toBeVisible();
});

test("abre una colección finita cuando un día contiene varios sueños", async ({ page }) => {
  await startWithEmptyCalendar(page);
  await recordDream(page, "Un pasillo azul", "Un pasillo azul llevaba a una puerta que respiraba como una ventana.");
  await recordDream(page, "La habitación de agua", "Una habitación de agua sostenía un vaso de luz sobre una mesa pequeña.");
  await page.getByRole("button", { name: /Abrir 2 sueños del/ }).click();
  await expect(page.getByRole("heading", { name: "2 sueños ese día." })).toBeVisible();
  await page.getByRole("button", { name: "Abrir sueño: La habitación de agua" }).click();
  await expect(page.getByRole("heading", { name: "La habitación de agua" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "2 sueños ese día." })).toBeVisible();
  await page.getByLabel(/Sueños del/).getByRole("button", { name: "Volver al calendario" }).click();
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

test("escribe antes de clasificar y conserva el punto de origen al volver", async ({ page }) => {
  await startWithEmptyCalendar(page);
  await page.getByRole("button", { name: "Registrar sueño" }).click();
  await expect(page.locator("#dream-body")).toBeFocused();
  await expect(page.locator("#dream-title")).toHaveCount(0);
  await page.locator("#dream-body").fill("Una escalera de sal llevaba hacia una ciudad silenciosa y brillante.");
  await expect(page.locator("#dream-date")).toBeVisible();
  await expect(page.locator("#dream-title")).toBeVisible();
  await page.locator("#dream-title").fill("Escalera de sal");
  await page.getByRole("button", { name: "Guardar" }).click();
  const pearl = page.getByRole("button", { name: /Abrir sueño: Escalera de sal/ });
  await pearl.click();
  await expect(page).toHaveURL(/dream=/);
  await page.getByRole("button", { name: "Volver al calendario" }).click();
  await expect(pearl).toBeFocused();
});

test("mantiene privada la referencia EEG/MRI y hace explícita la publicación", async ({ page }) => {
  test.setTimeout(45_000);
  await startWithEmptyCalendar(page);
  await page.getByRole("button", { name: "Registrar sueño" }).click();
  await page.locator("#dream-body").fill("Una señal blanca atravesaba el sueño con el ritmo de una respiración lenta.");
  await page.locator("#dream-title").fill("Señal blanca");
  await expect(page.getByRole("button", { name: "Privado" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Vincular EEG / MRI" }).click();
  await page.locator("#dream-neuro-file").fill("https://example.test/studies/eeg-42");
  await page.getByRole("button", { name: "Guardar" }).click();
  await page.getByRole("button", { name: /Abrir sueño: Señal blanca/ }).click();
  await expect(page.getByRole("link", { name: "Abrir referencia EEG / MRI" })).toHaveAttribute("href", "https://example.test/studies/eeg-42");

  await page.getByRole("button", { name: "Editar" }).click();
  await page.locator("#dream-neuro-file").fill("http://example.test/unsafe");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "URL segura" })).toBeVisible();

  await page.getByRole("button", { name: "Hacer público" }).click();
  await expect(page.getByRole("button", { name: "Hacer público" })).toHaveAttribute("aria-pressed", "true");
  await page.locator("#dream-neuro-file").fill("https://example.test/studies/eeg-42");
  await page.locator("#dream-pseudonym").fill("Marea de prueba");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Inicia sesión" })).toBeVisible();
});
