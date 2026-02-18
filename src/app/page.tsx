"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs } from "@/components/ui/tabs";
import { AnalysisForm } from "@/components/forms/analysis-form";
import { CompatibilityForm } from "@/components/forms/compatibility-form";
import { PersonalResult } from "@/components/results/personal-result";
import { CompatibilityResult } from "@/components/results/compatibility-result";
import { useSajuAnalysis } from "@/hooks/use-saju-analysis";
import { useSajuCompatibility } from "@/hooks/use-saju-compatibility";

const TABS = [
  { id: "personal", label: "내 사주 보기" },
  { id: "compatibility", label: "연인 궁합" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("personal");
  const resultRef = useRef<HTMLDivElement>(null);

  const analysis = useSajuAnalysis();
  const compatibility = useSajuCompatibility();

  // Scroll to results when data is ready
  useEffect(() => {
    if (analysis.sajuData || compatibility.person1Data) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis.sajuData, compatibility.person1Data]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    analysis.reset();
    compatibility.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4">
        <Header />

        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="mt-6">
          {activeTab === "personal" ? (
            <>
              <AnalysisForm
                onSubmit={analysis.analyze}
                isLoading={analysis.isLoading}
              />
              {analysis.error && (
                <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  {analysis.error}
                </div>
              )}
              {analysis.sajuData && (
                <div ref={resultRef} className="mt-6">
                  <PersonalResult
                    sajuData={analysis.sajuData}
                    streamedText={analysis.streamedText}
                    isStreaming={analysis.isLoading}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <CompatibilityForm
                onSubmit={compatibility.analyze}
                isLoading={compatibility.isLoading}
              />
              {compatibility.error && (
                <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  {compatibility.error}
                </div>
              )}
              {compatibility.person1Data && compatibility.person2Data && (
                <div ref={resultRef} className="mt-6">
                  <CompatibilityResult
                    person1={compatibility.person1Data}
                    person2={compatibility.person2Data}
                    streamedText={compatibility.streamedText}
                    isStreaming={compatibility.isLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
