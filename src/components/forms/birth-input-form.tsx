"use client";

import { useMemo } from "react";
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

// Year options: 1920–2026
const YEAR_OPTIONS = Array.from({ length: 2026 - 1920 + 1 }, (_, i) => {
  const y = String(2026 - i);
  return { value: y, label: `${y}년` };
});

// Month options: 1–12
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, "0");
  return { value: m, label: `${i + 1}월` };
});

// Get days in a given month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
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

  // Parse birthDate (YYYY-MM-DD)
  const [birthYear, birthMonth, birthDay] = useMemo(() => {
    const parts = value.birthDate.split("-");
    return [parts[0] || "2000", parts[1] || "01", parts[2] || "01"];
  }, [value.birthDate]);

  const updateBirthDate = (year: string, month: string, day: string) => {
    // Clamp day to max days in the selected month
    const maxDay = getDaysInMonth(Number(year), Number(month));
    const clampedDay = String(Math.min(Number(day), maxDay)).padStart(2, "0");
    update({ birthDate: `${year}-${month}-${clampedDay}` });
  };

  // Day options based on selected year/month
  const dayOptions = useMemo(() => {
    const maxDay = getDaysInMonth(Number(birthYear), Number(birthMonth));
    return Array.from({ length: maxDay }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return { value: d, label: `${i + 1}일` };
    });
  }, [birthYear, birthMonth]);

  return (
    <div className="space-y-5">
      {label && (
        <h3 className="text-lg font-medium text-accent font-display border-l-2 border-accent pl-3">
          {label}
        </h3>
      )}

      <div className="grid grid-cols-2 gap-5">
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

      {/* 생년월일 - 별도 라인, 3개 셀렉트 */}
      <div>
        <label className="text-sm text-text-secondary font-display block mb-1.5">생년월일</label>
        <div className="grid grid-cols-3 gap-3">
          <Select
            id={`birthYear-${label}`}
            value={birthYear}
            onChange={(e) => updateBirthDate(e.target.value, birthMonth, birthDay)}
            options={YEAR_OPTIONS}
          />
          <Select
            id={`birthMonth-${label}`}
            value={birthMonth}
            onChange={(e) => updateBirthDate(birthYear, e.target.value, birthDay)}
            options={MONTH_OPTIONS}
          />
          <Select
            id={`birthDay-${label}`}
            value={birthDay}
            onChange={(e) => updateBirthDate(birthYear, birthMonth, e.target.value)}
            options={dayOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Select
          label="태어난 시간"
          id={`birthTime-${label}`}
          value={value.birthTime}
          onChange={(e) => update({ birthTime: e.target.value })}
          options={HOUR_OPTIONS}
        />

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
      </div>

      {value.calendarType === "lunar" && (
        <div>
          <label className="flex items-center gap-2 h-12 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={value.isLeapMonth || false}
              onChange={(e) => update({ isLeapMonth: e.target.checked })}
              className="rounded border-white/[0.08] bg-white/[0.03]"
            />
            윤달 여부
          </label>
        </div>
      )}
    </div>
  );
}
