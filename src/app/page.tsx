"use client";

import { useState, useRef, useEffect } from "react";
import { StarField } from "@/components/effects/star-field";
import { HeroSection } from "@/components/layout/hero-section";
import { AnalysisLoading } from "@/components/effects/analysis-loading";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs } from "@/components/ui/tabs";
import { AnalysisForm } from "@/components/forms/analysis-form";
import { CompatibilityForm, type RelationshipType } from "@/components/forms/compatibility-form";
import { PersonalResult } from "@/components/results/personal-result";
import { CompatibilityResult } from "@/components/results/compatibility-result";
import { useSajuAnalysis } from "@/hooks/use-saju-analysis";
import { useSajuCompatibility } from "@/hooks/use-saju-compatibility";

const TABS = [
  { id: "personal", label: "내 사주 보기" },
  { id: "compatibility", label: "궁합 분석" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showHero, setShowHero] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const analysis = useSajuAnalysis();
  const compatibility = useSajuCompatibility();

  const hasResults =
    !!analysis.sajuData ||
    (!!compatibility.person1Data && !!compatibility.person2Data);

  // Show loading screen when loading starts, hide when data arrives
  useEffect(() => {
    if (analysis.isLoading || compatibility.isLoading) {
      setShowLoading(true);
    }
  }, [analysis.isLoading, compatibility.isLoading]);

  // Hide loading and scroll to results when data is ready
  useEffect(() => {
    if (hasResults) {
      setShowLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [hasResults]);

  const handleStart = (tab: "personal" | "compatibility") => {
    setActiveTab(tab);
    setShowHero(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    analysis.reset();
    compatibility.reset();
    setShowLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Star field background */}
      <StarField />

      {/* Sticky header (visible after hero) */}
      <Header compact={!showHero} />

      {/* Hero section */}
      {showHero && <HeroSection onStart={handleStart} />}

      {/* Loading overlay */}
      <AnalysisLoading isVisible={showLoading} />

      {/* Form section */}
      {!showHero && (
        <section
          ref={formRef}
          className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12"
        >
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="mt-8">
            {activeTab === "personal" ? (
              <AnalysisForm
                onSubmit={analysis.analyze}
                isLoading={analysis.isLoading}
              />
            ) : (
              <CompatibilityForm
                onSubmit={(p1, p2, relType: RelationshipType) => compatibility.analyze(p1, p2, relType)}
                isLoading={compatibility.isLoading}
              />
            )}

            {/* Error messages */}
            {analysis.error && (
              <div className="mt-4 glass-card !bg-red-500/10 !border-red-500/20 p-4 text-sm text-red-400">
                {analysis.error}
              </div>
            )}
            {compatibility.error && (
              <div className="mt-4 glass-card !bg-red-500/10 !border-red-500/20 p-4 text-sm text-red-400">
                {compatibility.error}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Results section */}
      {hasResults && (
        <section
          ref={resultRef}
          className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12"
        >
          {activeTab === "personal" && analysis.sajuData && (
            <PersonalResult
              sajuData={analysis.sajuData}
              streamedText={analysis.streamedText}
              isStreaming={analysis.isLoading}
            />
          )}
          {activeTab === "compatibility" &&
            compatibility.person1Data &&
            compatibility.person2Data && (
              <CompatibilityResult
                person1={compatibility.person1Data}
                person2={compatibility.person2Data}
                streamedText={compatibility.streamedText}
                isStreaming={compatibility.isLoading}
              />
            )}
        </section>
      )}

      {/* Footer */}
      {!showHero && <Footer />}
    </div>
  );
}
