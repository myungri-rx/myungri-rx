
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SajuInput } from "@/lib/types";

// 12시진 (30분 기준, 초정법) options for birth time
const HOUR_OPTIONS = [
  { value: "모름", label: "모름" },
  { value: "00:30", label: "자시 (23:30~01:30)" },
  { value: "02:30", label: "축시 (01:30~03:30)" },
  { value: "04:30", label: "인시 (03:30~05:30)" },
  { value: "06:30", label: "묘시 (05:30~07:30)" },
  { value: "08:30", label: "진시 (07:30~09:30)" },
  { value: "10:30", label: "사시 (09:30~11:30)" },
  { value: "12:30", label: "오시 (11:30~13:30)" },
  { value: "14:30", label: "미시 (13:30~15:30)" },
  { value: "16:30", label: "신시 (15:30~17:30)" },
  { value: "18:30", label: "유시 (17:30~19:30)" },
  { value: "20:30", label: "술시 (19:30~21:30)" },
  { value: "22:30", label: "해시 (21:30~23:30)" },
];

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
