"use client";

import { Textarea } from "@/components/ui/textarea";

interface ConcernInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConcernInput({ value, onChange }: ConcernInputProps) {
  return (
    <Textarea
      label="지금, 가장 풀고 싶은 운명의 수수께끼는?"
      id="concern"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="예: 이직의 때가 온 걸까요, 이 사람과의 인연은 어떤 의미일까요..."
      rows={3}
    />
  );
}
