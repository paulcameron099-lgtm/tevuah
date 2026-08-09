import type { MonitoringStep } from "@/src/data/agtech-platform";

type MonitoringWorkflowProps = {
  steps: MonitoringStep[];
};

export function MonitoringWorkflow({
  steps,
}: MonitoringWorkflowProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step) => (
        <article
          key={step.number}
          className="relative rounded-3xl border border-forest-900/10 bg-white p-6"
        >
          <p className="font-display text-4xl font-semibold text-gold-600">
            {step.number}
          </p>

          <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
            {step.title}
          </h3>

          <p className="mt-4 text-sm leading-7 text-stone-700">
            {step.description}
          </p>
        </article>
      ))}
    </div>
  );
}