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
import { PaymentModal } from "@/components/payment/payment-modal";
import { SlotFullModal } from "@/components/payment/slot-full-modal";
import { LoginRequiredModal } from "@/components/payment/login-required-modal";
import { fetchOrder, type OrderPayload } from "@/lib/payment";

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

  // Payment flow state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<OrderPayload | null>(null);
  const [paymentTeaser, setPaymentTeaser] = useState("");
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const [slotFull, setSlotFull] = useState<{ count: number; max: number } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const orderHandledRef = useRef(false);

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

  // 로그인 후 복귀 시 sessionStorage에서 unlock 의도 복원 + 결제모달 자동 오픈
  useEffect(() => {
    if (!user) return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("pending_unlock");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      sessionStorage.removeItem("pending_unlock");
    } catch {
      // ignore
    }
    try {
      const pending = JSON.parse(raw) as {
        payload: OrderPayload;
        teaserText: string;
        ts?: number;
      };
      if (Date.now() - (pending.ts ?? 0) > 10 * 60 * 1000) return;

      setShowHero(false);
      setLoginRequiredOpen(false);
      if (pending.payload.type === "personal") {
        setActiveTab("personal");
        compatibility.reset();
        analysis.restoreTeaserFromOrder({
          input: pending.payload.input,
          sajuData: pending.payload.sajuData,
          concern: pending.payload.concern,
          teaserText: pending.teaserText,
        });
        setLastConcern(pending.payload.concern);
      } else {
        setActiveTab("compatibility");
        analysis.reset();
        compatibility.restoreTeaserFromOrder({
          person1: pending.payload.person1,
          person2: pending.payload.person2,
          relationshipType: pending.payload.relationshipType,
          teaserText: pending.teaserText,
        });
        setLastRelType(pending.payload.relationshipType);
      }
      setPaymentPayload(pending.payload);
      setPaymentTeaser(pending.teaserText);
      setPaymentOpen(true);
    } catch {
      // malformed entry — ignore
    }
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
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("orderId");
    const payment = url.searchParams.get("payment");

    // Payment return path
    if (orderId && !orderHandledRef.current) {
      orderHandledRef.current = true;
      void (async () => {
        const order = await fetchOrder(orderId);
        window.history.replaceState({}, "", "/");
        if (!order) {
          setPaymentError("결제 정보를 불러오지 못했어요.");
          return;
        }
        setShowHero(false);
        if (order.payload.type === "personal") {
          setActiveTab("personal");
          compatibility.reset();
        } else {
          setActiveTab("compatibility");
          analysis.reset();
        }

        if (payment === "success" && order.status === "paid") {
          if (order.payload.type === "personal") {
            analysis.restoreAndLoadFull(orderId, {
              input: order.payload.input,
              sajuData: order.payload.sajuData,
              concern: order.payload.concern,
              teaserText: order.teaserText,
            });
            setLastConcern(order.payload.concern);
          } else {
            compatibility.restoreAndLoadFull(orderId, {
              person1: order.payload.person1,
              person2: order.payload.person2,
              relationshipType: order.payload.relationshipType,
              teaserText: order.teaserText,
            });
            setLastRelType(order.payload.relationshipType);
          }
        } else {
          // cancelled / failed / already / error — restore teaser only
          if (order.payload.type === "personal") {
            analysis.restoreTeaserFromOrder({
              input: order.payload.input,
              sajuData: order.payload.sajuData,
              concern: order.payload.concern,
              teaserText: order.teaserText,
            });
            setLastConcern(order.payload.concern);
          } else {
            compatibility.restoreTeaserFromOrder({
              person1: order.payload.person1,
              person2: order.payload.person2,
              relationshipType: order.payload.relationshipType,
              teaserText: order.teaserText,
            });
            setLastRelType(order.payload.relationshipType);
          }
          if (payment === "cancelled") setPaymentError("결제가 취소되었어요. 다시 시도하실 수 있어요.");
          else if (payment === "failed") setPaymentError("결제가 실패했어요. 다시 시도해주세요.");
        }
      })();
      return;
    }

    // Share URL path
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const buildUnlockPayload = (): { payload: OrderPayload; teaser: string } | null => {
    if (activeTab === "personal" && analysis.sajuData && analysis.lastInput) {
      return {
        payload: {
          type: "personal",
          input: analysis.lastInput,
          sajuData: analysis.sajuData,
          concern: analysis.lastConcern,
        },
        teaser: analysis.teaserText,
      };
    }
    if (
      activeTab === "compatibility" &&
      compatibility.person1Data &&
      compatibility.person2Data
    ) {
      return {
        payload: {
          type: "compatibility",
          person1: compatibility.person1Data,
          person2: compatibility.person2Data,
          relationshipType: compatibility.lastRelType,
        },
        teaser: compatibility.teaserText,
      };
    }
    return null;
  };

  const handleUnlockRequest = () => {
    setPaymentError(null);
    const built = buildUnlockPayload();
    if (!user) {
      if (built) {
        try {
          sessionStorage.setItem(
            "pending_unlock",
            JSON.stringify({ payload: built.payload, teaserText: built.teaser, ts: Date.now() }),
          );
        } catch {
          // sessionStorage 사용 불가 시 그냥 진행
        }
      }
      setLoginRequiredOpen(true);
      return;
    }
    if (!built) return;
    setPaymentPayload(built.payload);
    setPaymentTeaser(built.teaser);
    setPaymentOpen(true);
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
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        payload={paymentPayload}
        teaserText={paymentTeaser}
        onSlotFull={(count, max) => {
          setPaymentOpen(false);
          setSlotFull({ count, max });
        }}
      />
      <SlotFullModal
        open={!!slotFull}
        slotCount={slotFull?.count ?? 0}
        slotMax={slotFull?.max ?? 10}
        onClose={() => setSlotFull(null)}
        onOpenHistory={() => {
          setSlotFull(null);
          setHistoryOpen(true);
        }}
      />
      <LoginRequiredModal
        open={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
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
            {paymentError && (
              <div className="mt-4 glass-card !bg-yellow-500/10 !border-yellow-500/20 p-4 text-sm text-yellow-300">{paymentError}</div>
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
              canLoadMore={analysis.canLoadMore} isLoadingMore={analysis.phase === "full-streaming"} onLoadMore={handleUnlockRequest}
            />
          )}
          {activeTab === "compatibility" && compatibility.person1Data && compatibility.person2Data && (
            <CompatibilityResult
              person1={compatibility.person1Data} person2={compatibility.person2Data}
              teaserText={compatibility.teaserText} fullText={compatibility.fullText}
              isStreaming={compatibility.isLoading} relationshipType={lastRelType} phase={compatibility.phase}
              canLoadMore={compatibility.canLoadMore} isLoadingMore={compatibility.phase === "full-streaming"} onLoadMore={handleUnlockRequest}
            />
          )}
        </section>
      )}

      {!showHero && <Footer />}
      <ScrollToTop />
    </div>
  );
}
