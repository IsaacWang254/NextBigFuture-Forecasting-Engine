"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Progress from "@radix-ui/react-progress";
import { categories, categoryStats, predictions } from "../lib/predictions";

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

export default function Home() {
  const defaultCategory = categories[0];
  const topPredictions = [...predictions].sort((a, b) => b.probability - a.probability).slice(0, 5);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="border border-line bg-paper/92 p-5 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">NBF Forecasting Engine</p>
          <h1 className="mt-4 font-display text-4xl leading-[0.95] text-ink sm:text-5xl">
            Frontier technology forecast desk
          </h1>
          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4">
            <Metric value={predictions.length.toString()} label="markets" />
            <Metric value={categories.length.toString()} label="domains" />
            <Metric value="20" label="fermi rows" />
          </div>
          <div className="mt-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/70">Highest probabilities</h2>
            {topPredictions.map((prediction) => (
              <div key={prediction.id} className="border-t border-line pt-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-snug">{prediction.industry}</p>
                  <span className="text-sm font-bold text-moss">{percent.format(prediction.probability)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink/68">{prediction.question}</p>
              </div>
            ))}
          </div>
        </aside>

        <Tabs.Root defaultValue={defaultCategory} className="min-w-0">
          <Tabs.List className="flex gap-2 overflow-x-auto border-b border-line pb-3" aria-label="Prediction categories">
            {categories.map((category) => (
              <Tabs.Trigger
                key={category}
                value={category}
                className="shrink-0 border border-line bg-field px-3 py-2 text-sm font-semibold text-ink/70 transition data-[state=active]:border-ink data-[state=active]:bg-ink data-[state=active]:text-paper"
              >
                {category}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {categories.map((category) => {
            const rows = predictions.filter((prediction) => prediction.category === category);
            const stats = categoryStats(category);
            return (
              <Tabs.Content key={category} value={category} className="pt-5">
                <div className="mb-5 grid gap-4 md:grid-cols-[1fr_240px_220px]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Category outlook</p>
                    <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{category}</h2>
                  </div>
                  <StatBlock label="mean probability" value={percent.format(stats.average)} />
                  <StatBlock label="net movement" value={`${stats.movement >= 0 ? "+" : ""}${Math.round(stats.movement * 100)} pts`} />
                </div>

                <div className="grid gap-4">
                  {rows.map((prediction) => (
                    <article key={prediction.id} className="border border-line bg-paper/95 p-4 shadow-panel">
                      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
                            <span>{prediction.industry}</span>
                            <span className="h-1 w-1 bg-copper" />
                            <span>{prediction.horizon}</span>
                            <span className="h-1 w-1 bg-copper" />
                            <span>{prediction.confidence} confidence</span>
                          </div>
                          <h3 className="mt-2 text-xl font-semibold leading-snug">{prediction.question}</h3>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {prediction.drivers.map((driver) => (
                              <span key={driver} className="border border-line bg-field px-2 py-1 text-xs font-medium text-ink/72">
                                {driver}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/70">{prediction.caveat}</p>
                        </div>
                        <div className="border-l-0 border-line lg:border-l lg:pl-4">
                          <div className="flex items-end justify-between">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">forecast</span>
                            <span className="font-display text-4xl leading-none text-moss">{percent.format(prediction.probability)}</span>
                          </div>
                          <Progress.Root value={prediction.probability * 100} className="mt-4 h-3 overflow-hidden bg-field">
                            <Progress.Indicator
                              className="h-full bg-moss transition-transform duration-500 ease-out"
                              style={{ transform: `translateX(-${100 - prediction.probability * 100}%)` }}
                            />
                          </Progress.Root>
                          <p className={`mt-3 text-sm font-semibold ${prediction.movement >= 0 ? "text-moss" : "text-copper"}`}>
                            {prediction.movement >= 0 ? "+" : ""}
                            {Math.round(prediction.movement * 100)} pts since prior run
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
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
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">{label}</p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-paper/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
    </div>
  );
}
