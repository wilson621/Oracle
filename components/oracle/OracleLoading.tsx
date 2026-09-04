"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
import { oracleThinkingSteps } from "@/lib/oracle/oracleThinkingSteps";

export default function OracleLoading() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((current) =>
        current >= oracleThinkingSteps.length - 1 ? current : current + 1
      );
    }, 850);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mx-auto mt-8 max-w-3xl border-teal-400/30 bg-teal-400/5">
      <div className="flex items-center gap-4">
        <div className="rounded-full border border-teal-400/30 bg-teal-400/10 p-3">
          <Brain className="text-teal-300" size={28} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.35em] text-teal-300">
            ORACLE THINKING
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Building tactical analysis...
          </h2>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {oracleThinkingSteps.map((step, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                active
                  ? "border-teal-400/40 bg-teal-400/10 text-white"
                  : complete
                  ? "border-slate-800 bg-slate-900/60 text-slate-300"
                  : "border-slate-900 bg-slate-950/60 text-slate-600"
              }`}
            >
              {complete ? (
                <CheckCircle2 className="text-teal-300" size={18} />
              ) : active ? (
                <Loader2 className="animate-spin text-teal-300" size={18} />
              ) : (
                <div className="h-[18px] w-[18px] rounded-full border border-slate-700" />
              )}

              <span className="text-sm font-semibold">{step}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}