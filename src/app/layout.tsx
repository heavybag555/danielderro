import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import NavWatcher from "@/components/NavWatcher";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "DANIEL DERRO",
  description:
    "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavWatcher />
        <SmoothScroll>
          <SiteChrome>{children}</SiteChrome>
        </SmoothScroll>
      </body>
    </html>
  );
}
