import { investmentCategories } from "@/src/data/investment-categories";

import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";

import { CategoryCard } from "./category-card";
import { SectionHeading } from "./section-heading";

export function InvestmentCategories() {
  return (
    <Section className="bg-ivory-100">
      <Container>
        <SectionHeading
          eyebrow="Investment categories"
          title="Four distinct paths into cultivated assets."
          description="Explore opportunities connected to productive estates, agricultural innovation and carefully selected collectible assets."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {investmentCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              priority={index < 2}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-forest-900/10 bg-white/60 px-6 py-5">
          <p className="text-xs leading-6 text-stone-500">
            The opportunities and categories currently displayed are for
            platform-design demonstration purposes. They do not constitute an
            offer, financial recommendation or guarantee of performance.
          </p>
        </div>
      </Container>
    </Section>
  );
}