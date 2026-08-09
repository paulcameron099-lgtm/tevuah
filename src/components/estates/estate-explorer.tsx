"use client";

import {
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  Estate,
  EstateType,
} from "@/src/types/estate";

import { EstateCard } from "./estate-card";

type EstateExplorerProps = {
  estates: Estate[];
};

type EstateTypeFilter = "all" | EstateType;

export function EstateExplorer({
  estates,
}: EstateExplorerProps) {
  const [typeFilter, setTypeFilter] =
    useState<EstateTypeFilter>("all");

  const [countryFilter, setCountryFilter] =
    useState("all");

  const countries = useMemo(
    () =>
      Array.from(
        new Set(estates.map((estate) => estate.country)),
      ).sort((a, b) => a.localeCompare(b)),
    [estates],
  );

  const filteredEstates = useMemo(() => {
    return estates.filter((estate) => {
      const matchesType =
        typeFilter === "all" ||
        estate.estateType === typeFilter;

      const matchesCountry =
        countryFilter === "all" ||
        estate.country === countryFilter;

      return matchesType && matchesCountry;
    });
  }, [
    countryFilter,
    estates,
    typeFilter,
  ]);

  const resetFilters = () => {
    setTypeFilter("all");
    setCountryFilter("all");
  };

  return (
    <div>
      <div className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
              Explore estates
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Filter by asset and region.
            </h2>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-ivory-100 hover:text-forest-950"
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="estate-type"
              className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500"
            >
              Estate type
            </label>

            <select
              id="estate-type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as EstateTypeFilter,
                )
              }
              className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm font-medium text-forest-950 outline-none"
            >
              <option value="all">All estates</option>
              <option value="vineyard">
                Vineyard Estates
              </option>
              <option value="olive">
                Olive Estates
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="estate-country"
              className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500"
            >
              Country
            </label>

            <select
              id="estate-country"
              value={countryFilter}
              onChange={(event) =>
                setCountryFilter(event.target.value)
              }
              className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 px-4 text-sm font-medium text-forest-950 outline-none"
            >
              <option value="all">All countries</option>

              {countries.map((country) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-5">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <MapPin className="size-4 text-gold-600" />

          <span>
            {filteredEstates.length}{" "}
            {filteredEstates.length === 1
              ? "estate"
              : "estates"}
          </span>
        </div>
      </div>

      {filteredEstates.length > 0 ? (
        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          {filteredEstates.map((estate, index) => (
            <EstateCard
              key={estate.id}
              estate={estate}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-4xl border border-dashed border-forest-900/20 bg-white px-6 py-16 text-center">
          <p className="font-display text-3xl font-semibold text-forest-950">
            No estates match these filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="focus-ring mt-6 rounded-full bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}