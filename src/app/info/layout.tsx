import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Info",
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-work-surface className="min-h-dvh bg-black text-white">
      {children}
    </div>
  );
}
