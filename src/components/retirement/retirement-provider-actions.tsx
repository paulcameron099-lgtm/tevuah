"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CircleCheck,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  type PlaidLinkOnSuccess,
  usePlaidLink,
} from "react-plaid-link";

type RetirementProviderActionsProps = {
  accountId: string;
  connectionStatus: string;
  fundingEligibilityStatus: string;
  verificationStatus: string;
  providerName: string | null;
  lastSyncedAt: string | null;
};

export function RetirementProviderActions({
  accountId,
  connectionStatus,
  fundingEligibilityStatus,
  verificationStatus,
  providerName,
  lastSyncedAt,
}: RetirementProviderActionsProps) {
  const router =
    useRouter();

  const [
    linkToken,
    setLinkToken,
  ] =
    useState<string | null>(
      null,
    );

  const [
    starting,
    setStarting,
  ] =
    useState(false);

  const [
    exchanging,
    setExchanging,
  ] =
    useState(false);

  const [
    syncing,
    setSyncing,
  ] =
    useState(false);

  const [
    requestingReview,
    setRequestingReview,
  ] =
    useState(false);

  const [
    disconnecting,
    setDisconnecting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const onSuccess:
    PlaidLinkOnSuccess =
    async (
      publicToken,
      metadata,
    ) => {
      setExchanging(
        true,
      );
      setError(
        "",
      );
      setMessage(
        "",
      );

      try {
        const selectedAccounts =
          metadata.accounts ??
          [];

        if (
          selectedAccounts.length !==
          1
        ) {
          setError(
            "Please select exactly one retirement account in Plaid Link.",
          );
          return;
        }

        const response =
          await fetch(
            `/api/retirement-accounts/${accountId}/plaid/exchange`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    publicToken,

                    providerAccountId:
                      selectedAccounts[0]
                        .id,
                  },
                ),
            },
          );

        const result =
          (await response.json()) as {
            success?: boolean;
            error?: string;
          };

        if (
          !response.ok ||
          !result.success
        ) {
          setError(
            result.error ||
              "Unable to complete secure institution connection.",
          );
          return;
        }

        setMessage(
          "Retirement account connected securely.",
        );

        window.localStorage.removeItem(
          "tevuah_retirement_plaid_link_token",
        );
        window.localStorage.removeItem(
          "tevuah_retirement_plaid_account_id",
        );

        setLinkToken(
          null,
        );

        router.refresh();
      } catch (requestError) {
        console.error(
          "Plaid exchange request error:",
          requestError,
        );

        setError(
          "Unable to complete secure institution connection.",
        );
      } finally {
        setExchanging(
          false,
        );
      }
    };

  const {
    open,
    ready,
  } =
    usePlaidLink(
      {
        token:
          linkToken,

        onSuccess,

        onExit:
          (
            plaidError,
          ) => {
            if (
              plaidError
            ) {
              setError(
                plaidError.display_message ||
                  plaidError.error_message ||
                  "The institution connection was not completed.",
              );
            }

            window.localStorage.removeItem(
              "tevuah_retirement_plaid_link_token",
            );
            window.localStorage.removeItem(
              "tevuah_retirement_plaid_account_id",
            );

            setLinkToken(
              null,
            );
          },
      },
    );

  useEffect(
    () => {
      if (
        linkToken &&
        ready
      ) {
        open();
      }
    },
    [
      linkToken,
      ready,
      open,
    ],
  );

  async function startConnection() {
    if (
      starting ||
      exchanging
    ) {
      return;
    }

    setStarting(
      true,
    );
    setError(
      "",
    );
    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/retirement-accounts/${accountId}/plaid/link-token`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          linkToken?: string;
        };

      if (
        !response.ok ||
        !result.success ||
        !result.linkToken
      ) {
        setError(
          result.error ||
            "Unable to start secure institution connection.",
        );
        return;
      }

      window.localStorage.setItem(
        "tevuah_retirement_plaid_link_token",
        result.linkToken,
      );

      window.localStorage.setItem(
        "tevuah_retirement_plaid_account_id",
        accountId,
      );

      setLinkToken(
        result.linkToken,
      );
    } catch (requestError) {
      console.error(
        "Plaid Link start error:",
        requestError,
      );

      setError(
        "Unable to start secure institution connection.",
      );
    } finally {
      setStarting(
        false,
      );
    }
  }

  async function syncAccount() {
    if (
      syncing
    ) {
      return;
    }

    setSyncing(
      true,
    );
    setError(
      "",
    );
    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/retirement-accounts/${accountId}/plaid/sync`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ||
            "Unable to synchronize retirement account.",
        );
        return;
      }

      setMessage(
        "Retirement account synchronized.",
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Retirement sync request error:",
        requestError,
      );

      setError(
        "Unable to synchronize retirement account.",
      );
    } finally {
      setSyncing(
        false,
      );
    }
  }

  async function requestFundingReview() {
    if (
      requestingReview
    ) {
      return;
    }

    setRequestingReview(
      true,
    );
    setError(
      "",
    );
    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/retirement-accounts/${accountId}/funding-review`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ||
            "Unable to request funding-source review.",
        );
        return;
      }

      setMessage(
        "Funding-source eligibility review requested.",
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Funding review request error:",
        requestError,
      );

      setError(
        "Unable to request funding-source review.",
      );
    } finally {
      setRequestingReview(
        false,
      );
    }
  }

  async function disconnectAccount() {
    if (
      disconnecting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Disconnect this retirement account? Its encrypted provider token will be removed and funding eligibility will return to Not Eligible.",
      );

    if (!confirmed) {
      return;
    }

    setDisconnecting(
      true,
    );
    setError(
      "",
    );
    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/retirement-accounts/${accountId}/disconnect`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ||
            "Unable to disconnect retirement account.",
        );
        return;
      }

      setMessage(
        "Retirement account disconnected.",
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "Retirement disconnect request error:",
        requestError,
      );

      setError(
        "Unable to disconnect retirement account.",
      );
    } finally {
      setDisconnecting(
        false,
      );
    }
  }

  const connected =
    connectionStatus ===
    "connected";

  const canRequestReview =
    connected &&
    fundingEligibilityStatus ===
      "not_eligible" &&
    verificationStatus !==
      "rejected";

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-forest-950" />

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Secure institution connection
          </p>

          <h4 className="font-display mt-2 text-xl font-semibold text-forest-950">
            {connected
              ? "Connected securely"
              : "Connect your retirement institution"}
          </h4>

          <p className="mt-2 text-xs leading-6 text-stone-600">
            Tevuah receives a provider token. Connection status and funding eligibility are reviewed separately.
          </p>
        </div>
      </div>

      {connected ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            <CircleCheck className="size-3" />

            {providerName
              ? providerName.toUpperCase()
              : "Provider"} connected
          </span>

          {lastSyncedAt ? (
            <span>
              Last synced{" "}
              {new Intl.DateTimeFormat(
                "en-US",
                {
                  dateStyle:
                    "medium",
                  timeStyle:
                    "short",
                },
              ).format(
                new Date(
                  lastSyncedAt,
                ),
              )}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {!connected ? (
          <button
            type="button"
            onClick={
              startConnection
            }
            disabled={
              starting ||
              exchanging
            }
            className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ||
            exchanging ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}

            {exchanging
              ? "Securing connection..."
              : starting
                ? "Starting..."
                : "Connect institution"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={
                syncAccount
              }
              disabled={
                syncing
              }
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}

              Sync balance
            </button>

            {canRequestReview ? (
              <button
                type="button"
                onClick={
                  requestFundingReview
                }
                disabled={
                  requestingReview
                }
                className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold-600 px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestingReview ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}

                Request funding review
              </button>
            ) : null}

            <button
              type="button"
              onClick={
                disconnectAccount
              }
              disabled={
                disconnecting
              }
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disconnecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unplug className="size-4" />
              )}

              Disconnect
            </button>
          </>
        )}
      </div>

      {fundingEligibilityStatus ===
      "under_review" ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          Funding-source eligibility is under review. Connected status alone does not authorize retirement funds for an investment.
        </p>
      ) : null}

      {fundingEligibilityStatus ===
      "eligible" ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
          This retirement account has been approved as an eligible funding source. Actual retirement funding still follows the applicable custodian/rollover or transfer process.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
