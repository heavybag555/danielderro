import type { Metadata } from "next";

const description =
  "About Daniel Derro and No School Studios — services, clients, and contact for photography, film direction, and creative direction.";

export const metadata: Metadata = {
  title: "Info",
  description,
  alternates: { canonical: "/info" },
  openGraph: { title: "Info", description, url: "/info" },
  twitter: { title: "Info", description },
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      data-work-surface
      className="min-h-dvh bg-black text-white"
    >
      {children}
    </main>
  );
}
