import type { Metadata } from "next";

const description =
  "A stills index drawn from across Daniel Derro's projects — photography for fashion, editorial, and culture.";

export const metadata: Metadata = {
  title: "Gallery",
  description,
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Gallery", description, url: "/gallery" },
  twitter: { title: "Gallery", description },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-work-surface className="min-h-dvh bg-black">
      {children}
    </div>
  );
}
