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
