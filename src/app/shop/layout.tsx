import type { Metadata } from "next";

const description =
  "Shop editions and goods from Daniel Derro / No School Studios.";

export const metadata: Metadata = {
  title: "Shop",
  description,
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop", description, url: "/shop" },
  twitter: { title: "Shop", description },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" data-work-surface className="min-h-dvh bg-black">
      {children}
    </main>
  );
}
