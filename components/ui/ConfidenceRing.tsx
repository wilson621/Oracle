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
  size = 160,
  strokeWidth = 12,
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

  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
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
            transition: "stroke-dashoffset 1s ease",
            filter: "drop-shadow(0 0 8px rgba(34,211,238,.55))",
          }}
        />
      </svg>

      <div className="absolute text-center">
        <div className="text-4xl font-black text-white">
          <AnimatedNumber value={value} suffix="%" />
        </div>

        <div className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
          Confidence
        </div>
      </div>
    </div>
  );
}