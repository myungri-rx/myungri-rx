
import { useEffect, useState } from "react";
import { BirthInputForm } from "./birth-input-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SajuInput } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export type RelationshipType = "romantic" | "friend" | "colleague";

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: "romantic", label: "연인" },
  { value: "friend", label: "친구" },
  { value: "colleague", label: "동료" },
];

const DEFAULT_INPUT: SajuInput = {
  name: "",
  gender: "male",
  birthDate: "2000-01-01",
  birthTime: "모름",
  calendarType: "solar",
  isLeapMonth: false,
};

interface CompatibilityFormProps {
  onSubmit: (person1: SajuInput, person2: SajuInput, relationshipType: RelationshipType) => void;
  isLoading: boolean;
  defaultPerson1?: SajuInput;
  defaultPerson2?: SajuInput;
}

export function CompatibilityForm({ onSubmit, isLoading, defaultPerson1, defaultPerson2 }: CompatibilityFormProps) {
  const [person1, setPerson1] = useState<SajuInput>(defaultPerson1 ?? DEFAULT_INPUT);
  const [person2, setPerson2] = useState<SajuInput>(defaultPerson2 ?? { ...DEFAULT_INPUT, gender: "female" });
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("romantic");
  const [autofilled, setAutofilled] = useState(false);
  const { user } = useAuth();

  // Logged in & no pre-seeded person1 & untouched form → auto-fill from latest personal history
  useEffect(() => {
    if (!user || defaultPerson1 || person1.name.trim()) return;
    let cancelled = false;
    (async () => {
      try {
        const listRes = await fetch("/api/history", { credentials: "include" });
        if (!listRes.ok) return;
        const { items } = (await listRes.json()) as { items: Array<{ id: string; type: string }> };
        const latestPersonal = items.find((it) => it.type === "personal");
        if (!latestPersonal) return;
        const detailRes = await fetch(`/api/history?id=${encodeURIComponent(latestPersonal.id)}`, {
          credentials: "include",
        });
        if (!detailRes.ok) return;
        const record = (await detailRes.json()) as { data?: { input?: SajuInput } };
        const input = record.data?.input;
        if (!input || cancelled) return;
        setPerson1(input);
        setAutofilled(true);
      } catch {
        /* swallow — auto-fill is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, defaultPerson1]);

  const handlePerson1Change = (next: SajuInput) => {
    setPerson1(next);
    if (autofilled) setAutofilled(false);
  };

  const clearMyInfo = () => {
    setPerson1(DEFAULT_INPUT);
    setAutofilled(false);
  };

  const isValid =
    person1.name.trim() && person1.birthDate &&
    person2.name.trim() && person2.birthDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(person1, person2, relationshipType);
  };

  return (
    <Card variant="elevated">
      <h2 className="font-display text-xl font-bold text-gradient-gold mb-6">
        두 사람의 운명
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 관계 유형 선택 */}
        <div className="flex gap-2 justify-center">
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRelationshipType(opt.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                relationshipType === opt.value
                  ? "bg-accent text-background shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : "glass-card !py-2 !px-5 text-text-secondary hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="glass-card !p-5">
          <BirthInputForm value={person1} onChange={handlePerson1Change} label="나의 정보" />
          {autofilled && (
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-accent">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                내 정보로 자동 입력됨
              </span>
              <button
                type="button"
                onClick={clearMyInfo}
                className="text-text-secondary hover:text-text-primary underline underline-offset-2"
              >
                비우기
              </button>
            </div>
          )}
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="h-px flex-1"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3))",
            }}
          />
          <span className="text-accent font-display font-bold text-lg">VS</span>
          <div
            className="h-px flex-1"
            style={{
              background: "linear-gradient(90deg, rgba(212,175,55,0.3), transparent)",
            }}
          />
        </div>

        <div className="glass-card !p-5">
          <BirthInputForm value={person2} onChange={setPerson2} label="상대방 정보" />
        </div>

        <Button
          type="submit"
          variant="dramatic"
          className="w-full"
          size="lg"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              궁합을 분석하는 중...
            </span>
          ) : (
            "궁합 전쟁 시작"
          )}
        </Button>
      </form>
    </Card>
  );
}
