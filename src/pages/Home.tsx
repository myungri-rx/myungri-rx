import { useState, useRef, useEffect } from "react";
import { StarField } from "@/components/effects/star-field";
import { HeroSection } from "@/components/layout/hero-section";
import { AnalysisLoading } from "@/components/effects/analysis-loading";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthMenu } from "@/components/auth/auth-menu";
import { HistoryModal, type HistoryRecord } from "@/components/history/history-modal";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Tabs } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { AnalysisForm } from "@/components/forms/analysis-form";
import { CompatibilityForm, type RelationshipType } from "@/components/forms/compatibility-form";
import { PersonalResult } from "@/components/results/personal-result";
import { CompatibilityResult } from "@/components/results/compatibility-result";
import { useSajuAnalysis } from "@/hooks/use-saju-analysis";
import { useSajuCompatibility } from "@/hooks/use-saju-compatibility";
import { parseShareUrl } from "@/lib/share-url";

const TABS = [
  { id: "personal", label: "내 사주 보기" },
  { id: "compatibility", label: "궁합 분석" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showHero, setShowHero] = useState(true);
  const [lastConcern, setLastConcern] = useState<string | undefined>();
  const [lastRelType, setLastRelType] = useState<string | undefined>();
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const prevHasResultsRef = useRef(false);

  const analysis = useSajuAnalysis();
  const compatibility = useSajuCompatibility();
  const [historyOpen, setHistoryOpen] = useState(false);
  const { user } = useAuth();
  const prevUserRef = useRef(user);

  const handleGoHome = () => {
    analysis.reset();
    compatibility.reset();
    setShowHero(true);
    setLastConcern(undefined);
    setLastRelType(undefined);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (prevUserRef.current && !user) {
      handleGoHome();
    }
    prevUserRef.current = user;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRestore = (record: HistoryRecord) => {
    setShowHero(false);
    if (record.type === "personal") {
      setActiveTab("personal");
      compatibility.reset();
      const data = record.data as Parameters<typeof analysis.restore>[0];
      analysis.restore(data, record.id);
      setLastConcern(data.concern);
    } else {
      setActiveTab("compatibility");
      analysis.reset();
      const data = record.data as Parameters<typeof compatibility.restore>[0];
      compatibility.restore(data, record.id);
      setLastRelType(data.relationshipType);
    }
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const [sharedInput, setSharedInput] = useState<ReturnType<typeof parseShareUrl>>(null);
  useEffect(() => {
    const params = parseShareUrl(window.location.href);
    if (!params) return;
    window.history.replaceState({}, "", "/");
    setShowHero(false);
    setSharedInput(params);
    if (params.type === "personal") {
      setActiveTab("personal");
    } else {
      setActiveTab("compatibility");
    }
  }, []);

  const isCurrentlyLoading = analysis.isLoading || compatibility.isLoading;
  const hasResults =
    !!analysis.sajuData ||
    (!!compatibility.person1Data && !!compatibility.person2Data);

  useEffect(() => {
    if (hasResults && !prevHasResultsRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    prevHasResultsRef.current = hasResults;
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
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      <AuthMenu onOpenHistory={() => setHistoryOpen(true)} />
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleRestore}
      />
      <Header compact={!showHero} onHome={handleGoHome} />
      {showHero && <HeroSection onStart={handleStart} />}
      <AnalysisLoading isVisible={isCurrentlyLoading && !hasResults} />

      {!showHero && (
        <section ref={formRef} className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="mt-8">
            {activeTab === "personal" ? (
              <AnalysisForm
                onSubmit={(input, concern) => { setLastConcern(concern); analysis.analyze(input, concern); }}
                isLoading={analysis.isLoading}
                defaultInput={sharedInput?.type === "personal" ? sharedInput.input : undefined}
                defaultConcern={sharedInput?.type === "personal" ? sharedInput.concern : undefined}
              />
            ) : (
              <CompatibilityForm
                onSubmit={(p1, p2, relType: RelationshipType) => { setLastRelType(relType); compatibility.analyze(p1, p2, relType); }}
                isLoading={compatibility.isLoading}
                defaultPerson1={sharedInput?.type === "compatibility" ? sharedInput.person1 : undefined}
                defaultPerson2={sharedInput?.type === "compatibility" ? sharedInput.person2 : undefined}
              />
            )}
            {analysis.error && (
              <div className="mt-4 glass-card !bg-red-500/10 !border-red-500/20 p-4 text-sm text-red-400">{analysis.error}</div>
            )}
            {compatibility.error && (
              <div className="mt-4 glass-card !bg-red-500/10 !border-red-500/20 p-4 text-sm text-red-400">{compatibility.error}</div>
            )}
          </div>
        </section>
      )}

      {hasResults && (
        <section ref={resultRef} className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          {activeTab === "personal" && analysis.sajuData && (
            <PersonalResult
              sajuData={analysis.sajuData} teaserText={analysis.teaserText} fullText={analysis.fullText}
              isStreaming={analysis.isLoading} concern={lastConcern} phase={analysis.phase}
              canLoadMore={analysis.canLoadMore} isLoadingMore={analysis.phase === "full-streaming"} onLoadMore={analysis.loadMore}
            />
          )}
          {activeTab === "compatibility" && compatibility.person1Data && compatibility.person2Data && (
            <CompatibilityResult
              person1={compatibility.person1Data} person2={compatibility.person2Data}
              teaserText={compatibility.teaserText} fullText={compatibility.fullText}
              isStreaming={compatibility.isLoading} relationshipType={lastRelType} phase={compatibility.phase}
              canLoadMore={compatibility.canLoadMore} isLoadingMore={compatibility.phase === "full-streaming"} onLoadMore={compatibility.loadMore}
            />
          )}
        </section>
      )}

      {!showHero && <Footer />}
      <ScrollToTop />
    </div>
  );
}
