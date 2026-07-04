"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ClipUpload from "@/components/oracle/ClipUpload";
import OracleHero from "@/components/oracle/OracleHero";
import OracleInput from "@/components/oracle/OracleInput";
import OracleLoading from "@/components/oracle/OracleLoading";
import OracleReport from "@/components/oracle/OracleReport";
import type { OracleReport as OracleReportType } from "@/types/oracle";

export default function OraclePage() {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [report, setReport] = useState<OracleReportType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleAskOracle() {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const prompt = textarea.value.trim();

    if (!prompt) {
      alert("Tell Oracle what happened first.");
      return;
    }

    setIsAnalysing(true);
    setReport(null);

    try {
      const response = await fetch("/api/oracle/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Oracle returned an error.");
        return;
      }

      setReport(data.report);
    } catch (err) {
      console.error(err);
      alert("Oracle could not analyse the fight.");
    }

    setIsAnalysing(false);
  }

  return (
    <AppLayout>
      <OracleHero isAnalysing={isAnalysing} />

      <OracleInput isAnalysing={isAnalysing} onAsk={handleAskOracle} />

      <ClipUpload selectedFile={selectedFile} onFileSelect={setSelectedFile} />

      {isAnalysing && <OracleLoading />}

      {report && <OracleReport report={report} />}
    </AppLayout>
  );
}