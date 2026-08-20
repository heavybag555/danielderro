import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "DANIEL DERRO",
  description:
    "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns.",
};

/**
 * 2u4u.studio site-source credit, rendered as a raw HTML comment so it shows up
 * under "View Source" / DevTools → Elements. React cannot emit comment nodes
 * directly, so it rides inside a hidden wrapper.
 */
const SITE_CREDIT_COMMENT =
  "<!-- Site design + development — 2u4u.studio | IG — 2u4u.studio | Reach — 2you4youstudio@gmail.com -->";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: SITE_CREDIT_COMMENT }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
