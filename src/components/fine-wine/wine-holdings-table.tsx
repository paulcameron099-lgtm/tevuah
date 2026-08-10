import type { WineCollectionHolding } from "@/src/data/fine-wine-platform";

type WineHoldingsTableProps = {
  holdings: WineCollectionHolding[];
};

export function WineHoldingsTable({
  holdings,
}: WineHoldingsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-burgundy-900/70 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-190 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Holding
              </th>

              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Region
              </th>

              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Vintage
              </th>

              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Bottles
              </th>

              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Value
              </th>

              <th className="px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Change
              </th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => (
              <tr
                key={holding.id}
                className="border-b border-white/10 last:border-b-0"
              >
                <td className="px-5 py-5">
                  <p className="text-sm font-semibold text-white">
                    {holding.producer}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    {holding.wine}
                  </p>
                </td>

                <td className="px-5 py-5 text-sm text-white/70">
                  {holding.region}
                </td>

                <td className="px-5 py-5 text-sm text-white/70">
                  {holding.vintage}
                </td>

                <td className="px-5 py-5 text-sm text-white/70">
                  {holding.bottles}
                </td>

                <td className="px-5 py-5 text-sm font-semibold text-white">
                  {holding.illustrativeValue}
                </td>

                <td className="px-5 py-5 text-sm font-semibold text-gold-400">
                  {holding.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}