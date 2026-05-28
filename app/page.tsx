"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Progress from "@radix-ui/react-progress";
import { categories, categoryStats, movement, predictions } from "../lib/predictions";

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

export default function Home() {
  const defaultCategory = categories[0]?.id ?? "";
  const topPredictions = [...predictions].sort((a, b) => b.probability - a.probability).slice(0, 5);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-wider text-azure">NBF Forecasting Engine</p>
          <h1 className="mt-3 font-serif text-4xl font-light leading-tight text-gray-900 sm:text-5xl">
            Frontier technology forecast desk
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Industry-level probability markets across deep technology categories.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 border-y border-gray-100 py-5">
            <Metric value={predictions.length.toString()} label="markets" />
            <Metric value={categories.length.toString()} label="domains" />
            <Metric value="20" label="fermi rows" />
          </div>

          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Model status</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              No trained checkpoint is running yet. These forecasts are seed outputs. Target model is{" "}
              <span className="font-medium text-gray-900">meta-llama/Llama-3.2-1B</span> with LoRA rank 32 in{" "}
              <span className="font-mono text-xs text-gray-700">tinker/nbf_forecasting/model_config.json</span>.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Highest probabilities</h2>
            <div className="mt-3 space-y-3">
              {topPredictions.map((prediction) => (
                <div key={prediction.id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug text-gray-900">{prediction.industry}</p>
                    <span className="text-sm font-semibold text-azure">{percent.format(prediction.probability)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{prediction.question}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <Tabs.Root defaultValue={defaultCategory} className="min-w-0">
          <Tabs.List
            className="flex flex-wrap gap-2 border-b border-gray-100 pb-3"
            aria-label="Prediction categories"
          >
            {categories.map((category) => (
              <Tabs.Trigger
                key={category.id}
                value={category.id}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                {category.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {categories.map((category) => {
            const rows = predictions.filter((prediction) => prediction.category === category.label);
            const stats = categoryStats(category.label);
            return (
              <Tabs.Content key={category.id} value={category.id} className="pt-8">
                <div className="mb-8 grid gap-5 md:grid-cols-[1fr_200px_200px]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-azure">Category outlook</p>
                    <h2 className="mt-2 font-serif text-3xl font-light text-gray-900 sm:text-4xl">{category.label}</h2>
                  </div>
                  <StatBlock label="mean probability" value={percent.format(stats.average)} />
                  <StatBlock
                    label="net movement"
                    value={`${stats.movement >= 0 ? "+" : ""}${Math.round(stats.movement * 100)} pts`}
                    accent={stats.movement >= 0 ? "positive" : "negative"}
                  />
                </div>

                <div className="grid gap-4">
                  {rows.map((prediction) => {
                    const delta = movement(prediction);
                    return (
                    <article
                      key={prediction.id}
                      className="rounded-xl border border-gray-100 bg-white p-6 shadow-card transition hover:border-gray-200"
                    >
                      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                            <span>{prediction.industry}</span>
                            <span className="text-gray-300">·</span>
                            <span>{prediction.horizon}</span>
                            <span className="text-gray-300">·</span>
                            <span>{prediction.confidence} confidence</span>
                          </div>
                          <h3 className="mt-3 font-serif text-2xl font-normal leading-snug text-gray-900">
                            {prediction.question}
                          </h3>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {prediction.drivers.map((driver) => (
                              <span
                                key={driver}
                                className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                              >
                                {driver}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">{prediction.caveat}</p>
                          <div className="mt-5 border-t border-gray-100 pt-4">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Sources</p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                              {prediction.sources.map((source) => (
                                <a
                                  key={source.url}
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-azure transition hover:text-azure-700 hover:underline"
                                  style={{ textDecorationColor: "rgba(0,136,255,0.4)" }}
                                >
                                  {source.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between rounded-lg bg-gray-50/60 p-4 lg:bg-transparent lg:p-0 lg:pl-6 lg:border-l lg:border-gray-100">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Forecast</p>
                            <p className="mt-2 font-serif text-5xl font-light leading-none text-azure">
                              {percent.format(prediction.probability)}
                            </p>
                          </div>
                          <div className="mt-4">
                            <Progress.Root
                              value={prediction.probability * 100}
                              className="h-1.5 overflow-hidden rounded-full bg-gray-100"
                            >
                              <Progress.Indicator
                                className="h-full rounded-full bg-azure transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${100 - prediction.probability * 100}%)` }}
                              />
                            </Progress.Root>
                            <p
                              className={`mt-3 text-xs font-medium ${
                                delta >= 0 ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {delta >= 0 ? "+" : ""}
                              {Math.round(delta * 100)} pts since prior run
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-light leading-none text-gray-900">{value}</p>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "positive" | "negative";
}) {
  const valueColor =
    accent === "positive" ? "text-emerald-600" : accent === "negative" ? "text-rose-600" : "text-gray-900";
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-3 font-serif text-4xl font-light leading-none ${valueColor}`}>{value}</p>
    </div>
  );
}
