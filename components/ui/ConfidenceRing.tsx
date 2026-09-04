"use client";

import { useEffect, useState } from "react";
import AnimatedNumber from "./AnimatedNumber";

type ConfidenceRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
};

export default function ConfidenceRing({
  value,
  size = 180,
  strokeWidth = 10,
}: ConfidenceRingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(value);
    }, 150);

    return () => clearTimeout(timeout);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-teal-400/5 blur-2xl" />

      <svg width={size} height={size} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 18}
          stroke="rgba(34,211,238,0.12)"
          strokeWidth="1"
          fill="transparent"
          strokeDasharray="4 8"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22d3ee"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: "drop-shadow(0 0 10px rgba(34,211,238,.65))",
          }}
        />
      </svg>

      <div className="absolute text-center">
        <div className="text-5xl font-black leading-none text-white">
          <AnimatedNumber value={value} suffix="%" />
        </div>

        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-teal-300">
          Confidence
        </div>

        <div className="mx-auto mt-3 h-px w-16 bg-teal-400/30" />
      </div>
    </div>
  );
}