"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DebugPayload = {
  error?: string;
  itemIds?: string[];
  items?: unknown[];
};

export default function PluggyDebugPage() {
  const [payload, setPayload] = useState<DebugPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/debug/pluggy", { signal: controller.signal });
        const data = (await response.json()) as DebugPayload;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load raw Pluggy data");
        }

        setPayload(data);
      } catch (loadError) {
        if ((loadError as { name?: string }).name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load raw Pluggy data");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="app-page">
      <main className="app-page-main app-page-main--grid">
        <header className="page-header-block">
          <h1>Raw Pluggy Data</h1>
          <p>Live payload from configured item IDs in your local environment.</p>
          <Link href="/settings" className="backLink">
            Back to settings
          </Link>
        </header>

        <section className="rawCard card-panel" aria-label="Raw Pluggy Data JSON">
          <div className="card-panel-body">
            {loading ? <p className="statusText">Loading raw payload...</p> : null}
            {error ? <p className="statusText statusError">{error}</p> : null}
            {!loading && !error ? (
              <pre className="jsonBox">{JSON.stringify(payload, null, 2)}</pre>
            ) : null}
          </div>
        </section>
      </main>

      <style jsx>{`
        .backLink {
          width: fit-content;
          margin-top: 0.3rem;
          color: color-mix(in srgb, var(--foreground) 70%, transparent);
          font-size: var(--font-size-sm);
          text-decoration: none;
        }

        .backLink:hover {
          color: var(--foreground);
        }

        .rawCard {
          overflow: hidden;
        }

        .statusText {
          margin: 0;
          color: color-mix(in srgb, var(--foreground) 72%, transparent);
        }

        .statusError {
          color: color-mix(in srgb, #e44b4b 84%, var(--foreground) 16%);
        }

        .jsonBox {
          margin: 0;
          width: 100%;
          max-height: 64vh;
          overflow: auto;
          padding: 0.95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--glass-border) 76%, transparent);
          background: color-mix(in srgb, var(--background) 24%, transparent);
          color: color-mix(in srgb, var(--foreground) 86%, transparent);
          font-size: 0.8rem;
          line-height: 1.45;
          white-space: pre;
        }
      `}</style>
    </div>
  );
}
