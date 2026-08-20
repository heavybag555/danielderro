import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radio",
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
