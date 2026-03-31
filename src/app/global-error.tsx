"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <p style={{ fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
          Something went wrong.
        </p>
        {process.env.NODE_ENV === "development" && error?.message ? (
          <pre style={{ fontSize: 12, padding: "0 1rem", whiteSpace: "pre-wrap" }}>
            {error.message}
          </pre>
        ) : null}
        <button type="button" onClick={() => reset()} style={{ margin: "1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
