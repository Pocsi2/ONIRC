import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONEIRIC — Dream Calendar",
  description: "A luminous visual prototype for preserving dreams in time.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
