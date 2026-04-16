"use client";

import { useState } from "react";
import { BirthInputForm } from "./birth-input-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SajuInput } from "@/lib/types";

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
          <BirthInputForm value={person1} onChange={setPerson1} label="나의 정보" />
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
