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
  birthDate: "",
  birthTime: "모름",
  calendarType: "solar",
  isLeapMonth: false,
};

interface AnalysisFormProps {
  onSubmit: (input: SajuInput, concern?: string) => void;
  isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [input, setInput] = useState<SajuInput>(DEFAULT_INPUT);
  const [concern, setConcern] = useState("");

  const isValid = input.name.trim() && input.birthDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(input, concern.trim() || undefined);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BirthInputForm value={input} onChange={setInput} />
        <ConcernInput value={concern} onChange={setConcern} />
        <Button type="submit" className="w-full" size="lg" disabled={!isValid || isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              분석 중...
            </span>
          ) : (
            "사주 분석하기"
          )}
        </Button>
      </form>
    </Card>
  );
}
