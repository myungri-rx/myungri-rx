"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SajuInput } from "@/lib/types";

// Generate hour options for birth time
const HOUR_OPTIONS = [
  { value: "모름", label: "모름" },
  ...Array.from({ length: 24 }, (_, h) => ({
    value: `${String(h).padStart(2, "0")}:00`,
    label: `${String(h).padStart(2, "0")}:00 (${getTimeName(h)})`,
  })),
];

function getTimeName(hour: number): string {
  const names = [
    "자시", "자시", "축시", "축시", "인시", "인시",
    "묘시", "묘시", "진시", "진시", "사시", "사시",
    "오시", "오시", "미시", "미시", "신시", "신시",
    "유시", "유시", "술시", "술시", "해시", "해시",
  ];
  return names[hour] || "";
}

interface BirthInputFormProps {
  value: SajuInput;
  onChange: (value: SajuInput) => void;
  label?: string;
}

export function BirthInputForm({ value, onChange, label }: BirthInputFormProps) {
  const update = (partial: Partial<SajuInput>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="space-y-4">
      {label && <h3 className="text-lg font-medium text-accent">{label}</h3>}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="이름"
          id={`name-${label}`}
          value={value.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="홍길동"
        />

        <Select
          label="성별"
          id={`gender-${label}`}
          value={value.gender}
          onChange={(e) => update({ gender: e.target.value as "male" | "female" })}
          options={[
            { value: "male", label: "남성" },
            { value: "female", label: "여성" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="생년월일"
          id={`birthDate-${label}`}
          type="date"
          value={value.birthDate}
          onChange={(e) => update({ birthDate: e.target.value })}
        />

        <Select
          label="태어난 시간"
          id={`birthTime-${label}`}
          value={value.birthTime}
          onChange={(e) => update({ birthTime: e.target.value })}
          options={HOUR_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="달력 유형"
          id={`calendar-${label}`}
          value={value.calendarType}
          onChange={(e) => update({ calendarType: e.target.value as "solar" | "lunar" })}
          options={[
            { value: "solar", label: "양력" },
            { value: "lunar", label: "음력" },
          ]}
        />

        {value.calendarType === "lunar" && (
          <div className="flex items-end">
            <label className="flex items-center gap-2 h-10 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={value.isLeapMonth || false}
                onChange={(e) => update({ isLeapMonth: e.target.checked })}
                className="rounded border-text-secondary/20 bg-surface"
              />
              윤달 여부
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
