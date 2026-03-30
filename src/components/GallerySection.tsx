const CARD_HEIGHT = 157.88;

function Card({ color = "var(--color-gray-light)" }: { color?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: CARD_HEIGHT,
        backgroundColor: color,
      }}
    />
  );
}

function GalleryRow() {
  const light = "var(--color-gray-light)";
  const mid = "var(--color-gray)";

  return (
    <div className="page-grid" style={{ alignItems: "start" }}>
      <div style={{ gridColumn: "1 / 2" }}>
        <Card color={light} />
      </div>

      <div style={{ gridColumn: "2 / 3", display: "flex", flexDirection: "column", gap: 120 }}>
        <Card color={light} />
        <Card color={mid} />
      </div>

      <div style={{ gridColumn: "3 / 4" }}>
        <Card color={light} />
      </div>

      <div style={{ gridColumn: "4 / 5" }}>
        <Card color={light} />
      </div>

      <div style={{ gridColumn: "5 / 6" }}>
        <Card color={light} />
      </div>

      <div style={{ gridColumn: "6 / 7", display: "flex", flexDirection: "column", gap: 120 }}>
        <Card color={mid} />
        <Card color={light} />
      </div>
    </div>
  );
}

export default function GallerySection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 120,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <GalleryRow key={i} />
      ))}
    </section>
  );
}
