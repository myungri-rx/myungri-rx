"use client";

import { Textarea } from "@/components/ui/textarea";

interface ConcernInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConcernInput({ value, onChange }: ConcernInputProps) {
  return (
    <Textarea
      label="요즘 가장 고민되는 점이 있나요? (선택)"
      id="concern"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="예: 이직을 고민하고 있어요, 연애가 잘 안 풀려요, 재테크 방향이 궁금해요..."
      rows={3}
    />
  );
}
