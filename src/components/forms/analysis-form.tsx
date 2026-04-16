"use client";

import { useState } from "react";
import { BirthInputForm } from "./birth-input-form";
import { ConcernInput } from "./concern-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <BirthInputForm value={input} onChange={setInput} />
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
