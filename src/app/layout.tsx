import type { Metadata, Viewport } from "next";

import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./ui/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vrs-v2.alexanderthenotsobad.us"),
  title: "VRS Kitchen & Bar — Order from the table",
  description:
    "A seasonal menu, a tray that remembers, and a table that takes care of the rest. Order from your phone at VRS Kitchen & Bar.",
  applicationName: "VRS Kitchen & Bar",
  icons: {
    icon: [{ url: "/brand/vrs-icon.png", type: "image/png", sizes: "144x144" }],
    apple: [{ url: "/brand/vrs-icon.png", sizes: "144x144" }],
  },
  openGraph: {
    title: "VRS Kitchen & Bar",
    description:
      "Seasonal food, live table service, and the check exactly when you want it.",
    images: [{ url: "/images/hero-table.jpg", width: 1600, height: 1000 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf5ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-dvh bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
