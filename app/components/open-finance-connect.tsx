"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("testBench");
  const [clientUserId, setClientUserId] = useState("froggy-wallet-user");
  const [connectToken, setConnectToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    t("status.idle"),
  );
  const [lastItemId, setLastItemId] = useState("");

  const tokenPreview = useMemo(() => {
    if (!connectToken) return t("status.noToken");
    return `${connectToken.slice(0, 24)}...${connectToken.slice(-12)}`;
  }, [connectToken, t]);

  async function handleGenerateToken(method: "GET" | "POST") {
    setIsLoading(true);
    setStatusMessage(t("status.requesting", { method }));

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
        throw new Error(data.error ?? t("status.tokenGenerationFailed"));
      }

      setConnectToken(data.accessToken);
      setStatusMessage(t("status.generated", { method }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("status.unknownRequestError");
      setStatusMessage(t("status.error", { message }));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setStatusMessage(t("status.requesting", { method: "GET" }));

    void fetch("/api/connect-token?clientUserId=froggy-wallet-user")
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }: { response: Response; data: ApiTokenResponse }) => {
        if (!response.ok || !data.accessToken) {
          throw new Error(data.error ?? t("status.tokenGenerationFailed"));
        }

        setConnectToken(data.accessToken);
        setStatusMessage(t("status.generated", { method: "GET" }));
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : t("status.unknownRequestError");
        setStatusMessage(t("status.error", { message }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [t]);

  return (
    <section className={`${styles.panel} glass-panel`}>
      <div className="cardHeader">
        <h2 className="card-title">{t("title")}</h2>
        <p className="card-subtitle">{t("subtitle")}</p>
      </div>

      <div className={styles.controls}>
        <input
          value={clientUserId}
          onChange={(event) => setClientUserId(event.target.value)}
          className={styles.userInput}
          placeholder={t("placeholder")}
        />
        <button
          type="button"
          onClick={() => void handleGenerateToken("POST")}
          className={`${styles.button} btn-base btn-primary`}
          disabled={isLoading}
        >
          {t("buttons.post")}
        </button>
        <button
          type="button"
          onClick={() => void handleGenerateToken("GET")}
          className={`${styles.button} btn-base btn-secondary`}
          disabled={isLoading}
        >
          {t("buttons.get")}
        </button>
      </div>

      <div className={`${styles.statusCard} glass-panel`}>
        <p className="card-content">
          <strong>{t("status.label")}:</strong> {statusMessage}
        </p>
        <p className="card-content">{tokenPreview}</p>
        {lastItemId ? (
          <p className="card-content">
            <strong>{t("status.lastItem")}:</strong> {lastItemId}
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
              setLastItemId(itemId ? String(itemId) : t("pluggy.missingItemId"));
              setStatusMessage(t("pluggy.success"));
            }}
            onError={(error) => {
              const message = error?.message ?? t("pluggy.failed");
              setStatusMessage(t("pluggy.connectError", { message }));
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
