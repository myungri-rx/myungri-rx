"use client";

import { useState } from "react";
import { BirthInputForm } from "./birth-input-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SajuInput } from "@/lib/types";

const DEFAULT_INPUT: SajuInput = {
  name: "",
  gender: "male",
  birthDate: "",
  birthTime: "모름",
  calendarType: "solar",
  isLeapMonth: false,
};

interface CompatibilityFormProps {
  onSubmit: (person1: SajuInput, person2: SajuInput) => void;
  isLoading: boolean;
}

export function CompatibilityForm({ onSubmit, isLoading }: CompatibilityFormProps) {
  const [person1, setPerson1] = useState<SajuInput>(DEFAULT_INPUT);
  const [person2, setPerson2] = useState<SajuInput>({ ...DEFAULT_INPUT, gender: "female" });

  const isValid =
    person1.name.trim() && person1.birthDate &&
    person2.name.trim() && person2.birthDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(person1, person2);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BirthInputForm value={person1} onChange={setPerson1} label="나의 정보" />
        <div className="border-t border-text-secondary/10" />
        <BirthInputForm value={person2} onChange={setPerson2} label="상대방 정보" />
        <Button type="submit" className="w-full" size="lg" disabled={!isValid || isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              궁합 분석 중...
            </span>
          ) : (
            "궁합 보기"
          )}
        </Button>
      </form>
    </Card>
  );
}
