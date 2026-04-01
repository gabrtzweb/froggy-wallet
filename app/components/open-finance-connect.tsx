"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import styles from "./open-finance-connect.module.css";

const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false },
);

type ApiTokenResponse = {
  accessToken?: string;
  error?: string;
};

export function OpenFinanceConnect() {
  const [clientUserId, setClientUserId] = useState("froggy-wallet-user");
  const [connectToken, setConnectToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Idle");
  const [lastItemId, setLastItemId] = useState("");

  const tokenPreview = useMemo(() => {
    if (!connectToken) return "No token generated yet";
    return `${connectToken.slice(0, 24)}...${connectToken.slice(-12)}`;
  }, [connectToken]);

  async function handleGenerateToken(method: "GET" | "POST") {
    setIsLoading(true);
    setStatusMessage(`Requesting token with ${method}...`);

    try {
      const userId = clientUserId.trim();
      const response =
        method === "GET"
          ? await fetch(
              `/api/connect-token?clientUserId=${encodeURIComponent(userId)}`,
            )
          : await fetch("/api/connect-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ clientUserId: userId }),
            });

      const data = (await response.json()) as ApiTokenResponse;

      if (!response.ok || !data.accessToken) {
        throw new Error(data.error ?? "Token generation failed");
      }

      setConnectToken(data.accessToken);
      setStatusMessage(`Token generated with ${method}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown request error";
      setStatusMessage(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setStatusMessage("Requesting token with GET...");

    void fetch("/api/connect-token?clientUserId=froggy-wallet-user")
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }: { response: Response; data: ApiTokenResponse }) => {
        if (!response.ok || !data.accessToken) {
          throw new Error(data.error ?? "Token generation failed");
        }

        setConnectToken(data.accessToken);
        setStatusMessage("Token generated with GET");
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Unknown request error";
        setStatusMessage(`Error: ${message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>
        Open Finance Test Bench
      </h2>
      <p className={styles.subtitle}>
        Generates a Connect Token from your backend and opens Pluggy Connect.
      </p>

      <div className={styles.controls}>
        <input
          value={clientUserId}
          onChange={(event) => setClientUserId(event.target.value)}
          className={styles.userInput}
          placeholder="Client user id"
        />
        <button
          type="button"
          onClick={() => void handleGenerateToken("POST")}
          className={`${styles.button} ${styles.primaryButton}`}
          disabled={isLoading}
        >
          Test POST
        </button>
        <button
          type="button"
          onClick={() => void handleGenerateToken("GET")}
          className={`${styles.button} ${styles.secondaryButton}`}
          disabled={isLoading}
        >
          Test GET
        </button>
      </div>

      <div className={styles.statusCard}>
        <p className={styles.statusText}>
          <strong>Status:</strong> {statusMessage}
        </p>
        <p className={styles.tokenPreview}>{tokenPreview}</p>
        {lastItemId ? (
          <p className={styles.lastItem}>
            <strong>Last connected item:</strong> {lastItemId}
          </p>
        ) : null}
      </div>

      {connectToken ? (
        <div className={styles.widget}>
          <PluggyConnect
            connectToken={connectToken}
            includeSandbox={true}
            onSuccess={(itemData) => {
              const itemId = itemData?.item?.id;
              setLastItemId(itemId ? String(itemId) : "(missing item id)");
              setStatusMessage("Connected successfully");
            }}
            onError={(error) => {
              const message = error?.message ?? "Connection failed";
              setStatusMessage(`Connect error: ${message}`);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
