"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ClipUpload from "@/components/oracle/ClipUpload";
import OracleHero from "@/components/oracle/OracleHero";
import OracleInput from "@/components/oracle/OracleInput";
import OracleLoading from "@/components/oracle/OracleLoading";
import OracleReport from "@/components/oracle/OracleReport";
import AchievementPopup from "@/components/achievements/AchievementPopup";
import XPPopup from "@/components/progression/XPPopup";

import { saveOracleSession } from "@/lib/oracle/saveOracleSession";
import { awardXp } from "@/lib/xp/awardXp";
import {
  unlockAchievements,
  type UnlockedAchievement,
} from "@/lib/achievements/unlockAchievements";

import type { OracleReport as OracleReportType } from "@/types/oracle";

type XPResult = {
  earnedXp: number;
  newXp: number;
  newLevel: number;
  levelUp: boolean;
};

type OracleAnalyzeResponse = {
  report?: OracleReportType;
  error?: string;
};

export default function OraclePage() {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [report, setReport] = useState<OracleReportType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [achievement, setAchievement] =
    useState<UnlockedAchievement | null>(null);
  const [xpResult, setXpResult] = useState<XPResult | null>(null);

  async function handleAskOracle(prompt: string) {
    if (!prompt.trim()) {
      alert("Tell Oracle what happened first.");
      return;
    }

    setIsAnalysing(true);
    setReport(null);
    setAchievement(null);
    setXpResult(null);

    try {
      const response = await fetch("/api/oracle/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as OracleAnalyzeResponse;

      if (!response.ok || !data.report) {
        alert(data.error || "Oracle returned an error.");
        return;
      }

      setReport(data.report);

      await saveOracleSession(prompt, data.report);

      const xp = await awardXp(data.report.grade, data.report.confidence);

      setXpResult(xp);

      setTimeout(() => {
        setXpResult(null);
      }, 4500);

      const unlocked = await unlockAchievements();

      if (unlocked.length > 0) {
        setAchievement(unlocked[0]);

        setTimeout(() => {
          setAchievement(null);
        }, 4500);
      }
    } catch (err: unknown) {
      console.error("FULL ERROR:", err);

      const message =
        err instanceof Error ? err.message : "Oracle could not analyse the fight.";

      alert(message);
    } finally {
      setIsAnalysing(false);
    }
  }

  return (
    <AppLayout>
      {achievement && (
        <AchievementPopup
          title={achievement.title}
          xp={achievement.xp}
          onClose={() => setAchievement(null)}
        />
      )}

      {xpResult && (
        <XPPopup
          earnedXp={xpResult.earnedXp}
          levelUp={xpResult.levelUp}
          level={xpResult.newLevel}
          onClose={() => setXpResult(null)}
        />
      )}

      <OracleHero isAnalysing={isAnalysing} />

      <OracleInput isAnalysing={isAnalysing} onAskOracle={handleAskOracle} />

      <ClipUpload selectedFile={selectedFile} onFileSelect={setSelectedFile} />

      {isAnalysing && <OracleLoading />}

      {report && <OracleReport report={report} />}
    </AppLayout>
  );
}