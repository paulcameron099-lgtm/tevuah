"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  type PlaidLinkOnSuccess,
  usePlaidLink,
} from "react-plaid-link";

export function RetirementPlaidOAuthResume() {
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
    accountId,
    setAccountId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    receivedRedirectUri,
    setReceivedRedirectUri,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(
    () => {
      const savedToken =
        window.localStorage.getItem(
          "tevuah_retirement_plaid_link_token",
        );

      const savedAccountId =
        window.localStorage.getItem(
          "tevuah_retirement_plaid_account_id",
        );

      if (
        !savedToken ||
        !savedAccountId
      ) {
        setError(
          "The secure institution session could not be resumed. Return to Retirement Accounts and start the connection again.",
        );
        return;
      }

      setLinkToken(
        savedToken,
      );

      setAccountId(
        savedAccountId,
      );

      setReceivedRedirectUri(
        window.location.href,
      );
    },
    [],
  );

  const onSuccess:
    PlaidLinkOnSuccess =
    async (
      publicToken,
      metadata,
    ) => {
      if (
        !accountId
      ) {
        setError(
          "Retirement account session is missing.",
        );
        return;
      }

      const selectedAccounts =
        metadata.accounts ??
        [];

      if (
        selectedAccounts.length !==
        1
      ) {
        setError(
          "Please select exactly one retirement account.",
        );
        return;
      }

      try {
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

        window.localStorage.removeItem(
          "tevuah_retirement_plaid_link_token",
        );
        window.localStorage.removeItem(
          "tevuah_retirement_plaid_account_id",
        );

        router.replace(
          "/dashboard/retirement-accounts",
        );

        router.refresh();
      } catch (requestError) {
        console.error(
          "Retirement OAuth exchange error:",
          requestError,
        );

        setError(
          "Unable to complete secure institution connection.",
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

        receivedRedirectUri:
          receivedRedirectUri ??
          undefined,

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
          },
      },
    );

  useEffect(
    () => {
      if (
        linkToken &&
        accountId &&
        receivedRedirectUri &&
        ready
      ) {
        open();
      }
    },
    [
      linkToken,
      accountId,
      receivedRedirectUri,
      ready,
      open,
    ],
  );

  return (
    <div className="mx-auto max-w-xl rounded-[1.75rem] border border-forest-900/10 bg-white p-8 text-center">
      {error ? (
        <>
          <h1 className="font-display text-3xl font-semibold text-forest-950">
            Connection could not resume
          </h1>

          <p className="mt-4 text-sm leading-7 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={
              () =>
                router.replace(
                  "/dashboard/retirement-accounts",
                )
            }
            className="focus-ring mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white"
          >
            Return to Retirement Accounts
          </button>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto size-7 animate-spin text-forest-950" />

          <h1 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            Resuming secure institution connection
          </h1>

          <p className="mt-3 text-sm leading-7 text-stone-500">
            Plaid Link will reopen so you can finish the institution authorization flow.
          </p>
        </>
      )}
    </div>
  );
}
