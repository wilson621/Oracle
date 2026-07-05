"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CoachHero from "@/components/coach/CoachHero";
import MissionCard from "@/components/coach/MissionCard";
import PredictionCard from "@/components/coach/PredictionCard";
import FocusCard from "@/components/coach/FocusCard";
import { Brain } from "lucide-react";
import { getCoachReport } from "@/lib/coach/getCoachReport";

type CoachReport = Awaited<ReturnType<typeof getCoachReport>>;

export default function CoachPage() {
  const [report, setReport] = useState<CoachReport>(null);

  useEffect(() => {
    async function load() {
      setReport(await getCoachReport());
    }

    load();
  }, []);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="AI COACH"
        title="Oracle Coach"
        description="Personalised missions, predictions and coaching based on how you actually play."
      />

      {!report ? (
        <EmptyState
          icon={<Brain size={42} />}
          title="No coaching profile yet"
          description="Complete Oracle Sessions and Oracle will generate a personal coaching plan."
        />
      ) : (
        <div className="grid gap-6">
          <CoachHero
            summary={report.summary}
            sessionsAnalysed={report.sessionsAnalysed}
          />

          <MissionCard
            title={report.dailyMission.title}
            description={report.dailyMission.description}
            rewardXp={report.dailyMission.rewardXp}
          />

          <FocusCard
            weakest={report.weakestSkill}
            strongest={report.strongestSkill}
          />

          <PredictionCard
            skill={report.prediction.skill}
            current={report.prediction.current}
            projected={report.prediction.projected}
            sessions={report.prediction.sessions}
          />
        </div>
      )}
    </AppLayout>
  );
}