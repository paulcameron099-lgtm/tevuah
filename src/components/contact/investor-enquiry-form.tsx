"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

type InvestorEnquiryFormProps = {
  email: string;
};

const inputClassName =
  "mt-2 min-h-13 w-full rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none transition placeholder:text-stone-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10";

const textareaClassName =
  "mt-2 min-h-36 w-full resize-y rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm leading-7 text-forest-950 outline-none transition placeholder:text-stone-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10";

export function InvestorEnquiryForm({
  email,
}: InvestorEnquiryFormProps) {
  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [emailAddress, setEmailAddress] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [interest, setInterest] =
    useState("General investment enquiry");

  const [investmentRange, setInvestmentRange] =
    useState("Prefer to discuss");

  const [message, setMessage] =
    useState("");

  const [acknowledged, setAcknowledged] =
    useState(false);

  const mailtoHref = useMemo(() => {
    const fullName =
      `${firstName} ${lastName}`.trim();

    const subject =
      `Investor enquiry — ${
        fullName || "Prospective investor"
      }`;

    const body = [
      "Tevuah Reserve Investor Enquiry",
      "",
      `Name: ${fullName || "Not provided"}`,
      `Email: ${
        emailAddress || "Not provided"
      }`,
      `Country / jurisdiction: ${
        country || "Not provided"
      }`,
      `Primary interest: ${interest}`,
      `Indicative investment range: ${investmentRange}`,
      "",
      "Enquiry:",
      message || "No additional message provided.",
      "",
      "I understand that submitting an enquiry does not create an investor account, reserve an allocation or constitute investment advice.",
    ].join("\n");

    return `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }, [
    acknowledged,
    country,
    email,
    emailAddress,
    firstName,
    interest,
    investmentRange,
    lastName,
    message,
  ]);

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    emailAddress.trim().length > 0 &&
    acknowledged;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!canContinue) {
          return;
        }

        window.location.href = mailtoHref;
      }}
      className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-[0_30px_80px_rgba(18,38,30,0.08)] sm:p-8 lg:p-10"
    >
      <div className="border-b border-forest-900/10 pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          Investor enquiry
        </p>

        <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-forest-950 sm:text-4xl">
          Start a conversation.
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
          Tell us what you are interested in.
          A member of the Tevuah Reserve team can
          then discuss the relevant process and
          available information with you.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="text-xs font-semibold text-forest-950">
          First name

          <input
            required
            value={firstName}
            onChange={(event) =>
              setFirstName(event.target.value)
            }
            className={inputClassName}
            placeholder="First name"
            autoComplete="given-name"
          />
        </label>

        <label className="text-xs font-semibold text-forest-950">
          Last name

          <input
            required
            value={lastName}
            onChange={(event) =>
              setLastName(event.target.value)
            }
            className={inputClassName}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </label>

        <label className="text-xs font-semibold text-forest-950">
          Email address

          <input
            required
            type="email"
            value={emailAddress}
            onChange={(event) =>
              setEmailAddress(event.target.value)
            }
            className={inputClassName}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </label>

        <label className="text-xs font-semibold text-forest-950">
          Country / jurisdiction

          <input
            value={country}
            onChange={(event) =>
              setCountry(event.target.value)
            }
            className={inputClassName}
            placeholder="Country of residence"
            autoComplete="country-name"
          />
        </label>

        <label className="text-xs font-semibold text-forest-950">
          I would like to discuss

          <select
            value={interest}
            onChange={(event) =>
              setInterest(event.target.value)
            }
            className={inputClassName}
          >
            <option>
              General investment enquiry
            </option>

            <option>
              Vineyard opportunities
            </option>

            <option>
              Olive estate opportunities
            </option>

            <option>
              Fine wine opportunities
            </option>

            <option>
              AgTech and estate technology
            </option>

            <option>
              Building a private-asset portfolio
            </option>

            <option>
              Existing investor support
            </option>
          </select>
        </label>

        <label className="text-xs font-semibold text-forest-950">
          Indicative investment range

          <select
            value={investmentRange}
            onChange={(event) =>
              setInvestmentRange(
                event.target.value,
              )
            }
            className={inputClassName}
          >
            <option>Prefer to discuss</option>
            <option>Under $100,000</option>
            <option>$100,000 – $249,999</option>
            <option>$250,000 – $499,999</option>
            <option>$500,000 – $999,999</option>
            <option>$1,000,000+</option>
          </select>
        </label>
      </div>

      <label className="mt-6 block text-xs font-semibold text-forest-950">
        How can we help?

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          className={textareaClassName}
          placeholder="Tell us about the opportunities you are considering, your investment objectives, questions about the platform, or the type of portfolio discussion you would like to have."
        />
      </label>

      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl bg-ivory-100 p-4">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) =>
            setAcknowledged(
              event.target.checked,
            )
          }
          className="mt-1 size-4 accent-forest-950"
        />

        <span className="text-xs leading-6 text-stone-600">
          I understand that submitting an
          enquiry does not create an investor
          account, guarantee eligibility,
          reserve an investment allocation or
          constitute personalised investment
          advice.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canContinue}
        className="focus-ring mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prepare enquiry

        <ArrowUpRight className="size-4" />
      </button>

      <div className="mt-6 flex items-start gap-3 border-t border-forest-900/10 pt-6">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" />

        <p className="text-xs leading-6 text-stone-500">
          Your email application will open with
          the information above prepared for
          Tevuah Reserve. You can review it before
          sending.
        </p>
      </div>
    </form>
  );
}