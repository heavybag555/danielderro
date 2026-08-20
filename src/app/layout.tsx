import SiteChrome from "@/components/SiteChrome";
import { rootSiteMetadata, rootSiteViewport } from "@/lib/site-metadata";
import "./globals.css";

export const metadata = rootSiteMetadata;
export const viewport = rootSiteViewport;

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
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.vimeocdn.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://thumbnailer.mixcloud.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: SITE_CREDIT_COMMENT }} />
        <a href="#main-content" className="visually-hidden skip-link text-small">
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
