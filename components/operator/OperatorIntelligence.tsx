import {
  Brain,
  Shield,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

import type { OperatorProfile } from "@/lib/oracle/operator/operator-profile-types";
import {
  generateOperatorInsight,
  generateOperatorRecommendation,
} from "@/lib/oracle/operator/operator-insights";

type Props = {
  profile: OperatorProfile;
};

function formatConfidence(level: string) {
  return level.replace(/^./, (letter) => letter.toUpperCase());
}

function formatLearningStyle(style: string) {
  return style.replace(/^./, (letter) => letter.toUpperCase());
}

export default function OperatorIntelligence({ profile }: Props) {
  const insight = generateOperatorInsight(profile);
  const recommendation = generateOperatorRecommendation(profile);

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-8 shadow-lg shadow-cyan-500/10">
      <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <Brain className="text-cyan-300" size={30} />

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
              Operator Intelligence
            </p>
          </div>

          <h2 className="mt-5 text-4xl font-black text-white">
            Behavioural Profile
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-300">
            {profile.behaviouralDNA}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
            Confidence Level
          </p>

          <p className="mt-3 text-4xl font-black text-cyan-300">
            {formatConfidence(profile.confidenceLevel)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <Brain className="text-cyan-300" size={20} />

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Learning Style
          </p>

          <p className="mt-3 text-2xl font-black text-white">
            {formatLearningStyle(profile.learningStyle)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <Shield className="text-cyan-300" size={20} />

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Primary Strength
          </p>

          <p className="mt-3 text-xl font-black text-white">
            {profile.strengths[0]}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <Target className="text-cyan-300" size={20} />

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Highest Priority
          </p>

          <p className="mt-3 text-xl font-black text-white">
            {profile.weaknesses[0]}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <TrendingUp className="text-cyan-300" size={20} />

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            Behaviour Status
          </p>

          <p className="mt-3 text-xl font-black text-emerald-300">
            Learning
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-cyan-300" />

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
              Oracle Insight
            </p>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-200">
            {insight}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-3">
            <Target size={18} className="text-emerald-300" />

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
              Oracle Recommendation
            </p>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-200">
            {recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}