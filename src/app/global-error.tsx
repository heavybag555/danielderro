"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const helvetica =
    '"Helvetica Neue", Helvetica, Arial, sans-serif' as const;

  return (
    <html lang="en">
      <body style={{ fontFamily: helvetica }}>
        <p style={{ padding: "1rem" }}>
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
