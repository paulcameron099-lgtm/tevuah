import type { OpportunityFaq } from "@/src/types/opportunity-detail";

type OpportunityFaqsProps = {
  faqs: OpportunityFaq[];
};

export function OpportunityFaqs({
  faqs,
}: OpportunityFaqsProps) {
  return (
    <div className="divide-y divide-forest-900/10 overflow-hidden rounded-3xl border border-forest-900/10 bg-white">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group p-5 open:bg-ivory-50 sm:p-6"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-forest-950">
            <span>{faq.question}</span>

            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-forest-900/10 text-lg transition group-open:rotate-45">
              +
            </span>
          </summary>

          <p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-stone-700">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}