type PlaidEnvironment =
  | "sandbox"
  | "development"
  | "production";

type PlaidErrorBody = {
  error_code?: string;
  error_message?: string;
  display_message?: string | null;
  request_id?: string;
};

type LinkTokenResponse = {
  link_token: string;
  expiration: string;
  request_id: string;
};

type ExchangeResponse = {
  access_token: string;
  item_id: string;
  request_id: string;
};

type PlaidAccount = {
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string | null;
    unofficial_currency_code: string | null;
  };
};

type HoldingsResponse = {
  accounts: PlaidAccount[];
  request_id: string;
};

function plaidEnvironment(): PlaidEnvironment {
  const value =
    process.env.PLAID_ENV ??
    "sandbox";

  if (
    value !== "sandbox" &&
    value !== "development" &&
    value !== "production"
  ) {
    throw new Error(
      "PLAID_ENV must be sandbox, development, or production.",
    );
  }

  return value;
}

function plaidBaseUrl() {
  return `https://${plaidEnvironment()}.plaid.com`;
}

function credentials() {
  const clientId =
    process.env.PLAID_CLIENT_ID;

  const secret =
    process.env.PLAID_SECRET;

  if (
    !clientId ||
    !secret
  ) {
    throw new Error(
      "PLAID_CLIENT_ID and PLAID_SECRET must be configured.",
    );
  }

  return {
    clientId,
    secret,
  };
}

async function plaidRequest<T>(
  path: string,
  body: Record<string, unknown>,
) {
  const {
    clientId,
    secret,
  } =
    credentials();

  const response =
    await fetch(
      `${plaidBaseUrl()}${path}`,
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
              client_id:
                clientId,
              secret,
              ...body,
            },
          ),

        cache:
          "no-store",
      },
    );

  const data =
    (await response.json()) as
      | T
      | PlaidErrorBody;

  if (
    !response.ok
  ) {
    const error =
      data as PlaidErrorBody;

    throw new Error(
      error.display_message ||
        error.error_message ||
        error.error_code ||
        "Plaid request failed.",
    );
  }

  return data as T;
}

export async function createRetirementLinkToken(
  investorId: string,
) {
  const redirectUri =
    process.env.PLAID_REDIRECT_URI;

  const request:
    Record<
      string,
      unknown
    > = {
      client_name:
        "Tevuah Reserve",

      language:
        "en",

      country_codes: [
        "US",
      ],

      products: [
        "investments",
      ],

      user: {
        client_user_id:
          investorId,
      },

      account_filters: {
        investment: {
          account_subtypes: [
            "401k",
            "403B",
            "457b",
            "ira",
            "roth",
            "sep ira",
            "simple ira",
            "pension",
            "retirement",
          ],
        },
      },
    };

  if (redirectUri) {
    request.redirect_uri =
      redirectUri;
  }

  return plaidRequest<LinkTokenResponse>(
    "/link/token/create",
    request,
  );
}

export async function exchangePlaidPublicToken(
  publicToken: string,
) {
  return plaidRequest<ExchangeResponse>(
    "/item/public_token/exchange",
    {
      public_token:
        publicToken,
    },
  );
}

export async function getInvestmentHoldings(
  accessToken: string,
) {
  return plaidRequest<HoldingsResponse>(
    "/investments/holdings/get",
    {
      access_token:
        accessToken,
    },
  );
}

export type {
  PlaidAccount,
};