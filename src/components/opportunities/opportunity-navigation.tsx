const navigationItems = [
  {
    label: "Overview",
    href: "#overview",
  },
  {
    label: "Financials",
    href: "#financials",
  },
  {
    label: "Timeline",
    href: "#timeline",
  },
  {
    label: "Operator",
    href: "#operator",
  },
  {
    label: "Documents",
    href: "#documents",
  },
  {
    label: "Risks",
    href: "#risks",
  },
  {
    label: "Updates",
    href: "#updates",
  },
  {
    label: "FAQs",
    href: "#faqs",
  },
];

export function OpportunityNavigation() {
  return (
    <div className="sticky top-19 z-30 border-b border-forest-900/10 bg-ivory-50/95 backdrop-blur-xl lg:top-22">
      <div className="mx-auto max-w-360 overflow-x-auto px-5 sm:px-7 lg:px-10 xl:px-14">
        <nav
          aria-label="Opportunity sections"
          className="flex min-w-max items-center gap-7"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring border-b-2 border-transparent py-5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 transition hover:border-gold-500 hover:text-forest-950"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}