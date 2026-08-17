import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onirc — Registro de sueños",
  description: "Escribe, guarda y consulta tus sueños.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  colorScheme: "light dark",
};

const themeBootstrap = `(() => {
  try {
    const saved = localStorage.getItem('onirc:appearance:v1');
    const preference = saved === 'day' || saved === 'night' || saved === 'system' ? saved : 'system';
    const night = preference === 'night' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    document.documentElement.style.colorScheme = night ? 'dark' : 'light';
  } catch { document.documentElement.dataset.theme = 'day'; }
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Script id="onirc-theme" strategy="beforeInteractive">{themeBootstrap}</Script>
        {children}
      </body>
    </html>
  );
}
