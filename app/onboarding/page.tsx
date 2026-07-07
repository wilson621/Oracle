"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import CommissioningWizard from "@/components/onboarding/CommissioningWizard";

import {
  getCurrentOperator,
  type Operator,
} from "@/lib/operator/getCurrentOperator";

import { completeOperatorCommissioning } from "@/lib/operator/completeOperatorCommissioning";
import { isOperatorCommissioned } from "@/lib/operator/isOperatorCommissioned";

export default function OnboardingPage() {
  const router = useRouter();

  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOperator() {
      const currentOperator = await getCurrentOperator();

      if (isOperatorCommissioned(currentOperator)) {
        router.replace("/operator");
        return;
      }

      setOperator(currentOperator);
      setLoading(false);
    }

    loadOperator();
  }, [router]);

  async function handleComplete(callsign: string) {
    if (!operator) return;

    await completeOperatorCommissioning(operator.id, callsign);

    router.replace("/operator");
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-slate-400">Initialising Oracle...</p>
        </div>
      </AppLayout>
    );
  }

  if (!operator) {
    return null;
  }

  return (
    <AppLayout>
      <CommissioningWizard
        operatorId={operator.id}
        onComplete={handleComplete}
      />
    </AppLayout>
  );
}