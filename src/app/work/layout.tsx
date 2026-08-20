import type { Metadata } from "next";

const description =
  "Selected projects by Daniel Derro — campaigns, editorial, and film for luxury fashion and cultural brands.";

export const metadata: Metadata = {
  title: "Work",
  description,
  alternates: { canonical: "/work" },
  openGraph: { title: "Work", description, url: "/work" },
  twitter: { title: "Work", description },
};

export default function WorkLayout({
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
