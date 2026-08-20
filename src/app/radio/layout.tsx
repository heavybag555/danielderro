import type { Metadata } from "next";

const description =
  "No School Studio Records — radio episodes and tracklists selected by Daniel Derro.";

export const metadata: Metadata = {
  title: "Radio",
  description,
  alternates: { canonical: "/radio" },
  openGraph: { title: "Radio", description, url: "/radio" },
  twitter: { title: "Radio", description },
};

export default function RadioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-work-surface className="relative z-0 h-dvh overflow-hidden bg-black">
      {children}
    </div>
  );
}
