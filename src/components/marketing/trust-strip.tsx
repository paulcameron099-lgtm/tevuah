import {
  BarChart3,
  FileCheck2,
  Leaf,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/src/components/ui/container";

const trustItems = [
  {
    title: "Carefully presented",
    description: "Clear opportunity information",
    icon: FileCheck2,
  },
  {
    title: "Real-asset focus",
    description: "Land, production and collections",
    icon: Leaf,
  },
  {
    title: "Transparent reporting",
    description: "Operational and portfolio updates",
    icon: BarChart3,
  },
  {
    title: "Secure investor access",
    description: "Private account infrastructure",
    icon: ShieldCheck,
  },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Platform principles"
      className="border-b border-forest-900/10 bg-ivory-50"
    >
      <Container>
        <div className="grid divide-y divide-forest-900/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-start gap-4 px-0 py-6 sm:px-6 lg:px-7 lg:py-7 first:pl-0 last:pr-0"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400">
                  <Icon className="size-4.5" />
                </span>

                <div>
                  <h2 className="text-sm font-semibold text-forest-950">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}