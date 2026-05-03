
import { useEffect, useState } from "react";
import { BirthInputForm } from "./birth-input-form";
import { ConcernInput } from "./concern-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import type { SajuInput } from "@/lib/types";

const DEFAULT_INPUT: SajuInput = {
  name: "",
  gender: "male",
  birthDate: "2000-01-01",
  birthTime: "모름",
  calendarType: "solar",
  isLeapMonth: false,
};

interface AnalysisFormProps {
  onSubmit: (input: SajuInput, concern?: string) => void;
  isLoading: boolean;
  defaultInput?: SajuInput;
  defaultConcern?: string;
}

export function AnalysisForm({ onSubmit, isLoading, defaultInput, defaultConcern }: AnalysisFormProps) {
  const [input, setInput] = useState<SajuInput>(defaultInput ?? DEFAULT_INPUT);
  const [concern, setConcern] = useState(defaultConcern ?? "");
  const [autofilled, setAutofilled] = useState(false);
  const { user } = useAuth();

  // Logged in & no pre-seeded input & untouched form → auto-fill from latest personal history
  useEffect(() => {
    if (!user || defaultInput || input.name.trim()) return;
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
        const fetched = record.data?.input;
        if (!fetched || cancelled) return;
        setInput(fetched);
        setAutofilled(true);
      } catch {
        /* swallow — auto-fill is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, defaultInput]);

  const handleInputChange = (next: SajuInput) => {
    setInput(next);
    if (autofilled) setAutofilled(false);
  };

  const clearMyInfo = () => {
    setInput(DEFAULT_INPUT);
    setAutofilled(false);
  };

  const isValid = input.name.trim() && input.birthDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(input, concern.trim() || undefined);
  };

  return (
    <Card variant="elevated">
      <h2 className="font-display text-xl font-bold text-gradient-gold mb-6">
        운명 해독을 위한 정보
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BirthInputForm value={input} onChange={handleInputChange} />
        {autofilled && (
          <div className="-mt-4 flex items-center justify-between gap-2 text-xs">
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
        <ConcernInput value={concern} onChange={setConcern} />
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          }}
        />
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
              운명을 해독하는 중...
            </span>
          ) : (
            "운명 해독 시작"
          )}
        </Button>
      </form>
    </Card>
  );
}
