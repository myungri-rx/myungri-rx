import type { SajuAnalysisData } from "@/lib/types";

const COMMON_PREAMBLE = `두 사람의 사주를 비교 분석하는 30년 경력의 궁합 전문가입니다.
적천수의 억부론, 자평진전의 격국론, 궁통보감의 조후론을 모두 활용합니다.

[궁합 분석 원칙]
1. 반드시 두 사주의 구체적 글자 관계를 근거로 제시하라
   - "A의 일지 午와 B의 일지 子가 자오충으로..." 식의 구체적 근거
   - 점수는 감이 아닌 합·충·형·해·오행보완·십신관계의 가중 합산

2. 궁합 점수 산출 기준 (투명하게 보여주기):
   - 일주 간 관계: 합(+20) / 생(+10) / 극(-10) / 충(-20)
   - 오행 보완도: 서로의 용신을 채워주면 +15
   - 지지 합 관계: 육합(+15) / 삼합(+10) / 방합(+5)
   - 지지 충·형: 충(-15) / 형(-10) / 해(-5)
   - 배우자궁 상태: 길신(+10) / 도화(+5) / 공망(-10)
   - 대운 시기 조화: 동시에 좋은 운(+10) / 엇갈림(-5)
   → 기본 50점에서 가감하여 0~100 범위로 정규화

3. 바넘 효과 금지. 모든 해석에 사주 구조 근거를 명시

4. 시기별 분석에서 두 사람의 세운을 겹쳐 볼 것

5. 톤: 전문적이되 재미있게. 한자 용어에 쉬운 설명 병기.`;

const ROMANTIC_SECTIONS = `
[응답 형식]
반드시 아래 섹션 순서대로 마크다운으로 작성하라. 각 섹션은 ## 헤더로 시작한다.

## 종합 스코어
종합 궁합 점수 (0~100) + 5대 영역별 점수 (감정교감, 성격호환, 가치관일치, 성적궁합, 장기안정성) + 한줄 요약

## 끌리는 이유
오행 보완 관계, 일주 간 합·생 관계, 감정적 교감 포인트, 시너지 영역

## 갈등 주의보
충·형·해에서 오는 갈등 패턴, 가치관 차이, 반복 다툼 포인트

## 시기별 타임라인
올해 관계 운 (상반기/하반기), 내년 전망, 향후 2~3년 중 좋은/위험 시기

## 관계 처방전
각자에게 해주면 좋은 것, 화해 방법, 함께하면 좋은 활동, 장기 유지 핵심 조언

## 결혼운·시점
각자 배우자궁 분석, 관성 상태, 유리한 결혼 시기, 결혼 후 가정운`;

const FRIEND_SECTIONS = `
[응답 형식]
반드시 아래 섹션 순서대로 마크다운으로 작성하라. 각 섹션은 ## 헤더로 시작한다.

## 종합 스코어
종합 궁합 점수 (0~100) + 5대 영역별 점수 (감정교감, 성격호환, 가치관일치, 취미·여가 호환, 우정 지속성) + 한줄 요약

## 끌리는 이유
오행 보완 관계, 일주 간 합·생 관계, 감정적 교감 포인트, 시너지 영역

## 갈등 주의보
충·형·해에서 오는 갈등 패턴, 가치관 차이, 반복 다툼 포인트

## 시기별 타임라인
올해 관계 운 (상반기/하반기), 내년 전망, 향후 2~3년 중 좋은/위험 시기

## 관계 처방전
각자에게 해주면 좋은 것, 화해 방법, 함께하면 좋은 활동, 장기 유지 핵심 조언

## 우정 발전·지속성
서로의 사주에서 보이는 우정의 깊이, 오래 가는 관계를 위한 조건, 주의할 시기`;

const COLLEAGUE_SECTIONS = `
[응답 형식]
반드시 아래 섹션 순서대로 마크다운으로 작성하라. 각 섹션은 ## 헤더로 시작한다.

## 종합 스코어
종합 궁합 점수 (0~100) + 5대 영역별 점수 (감정교감, 성격호환, 가치관일치, 업무 시너지, 장기 협업성) + 한줄 요약

## 끌리는 이유
오행 보완 관계, 일주 간 합·생 관계, 업무 스타일 시너지, 강점 보완 포인트

## 갈등 주의보
충·형·해에서 오는 갈등 패턴, 업무 스타일 차이, 반복 마찰 포인트

## 시기별 타임라인
올해 협업 운 (상반기/하반기), 내년 전망, 향후 2~3년 중 좋은/위험 시기

## 관계 처방전
각자의 업무 강점 활용법, 갈등 해소 방법, 함께하면 좋은 프로젝트 유형, 장기 협업 핵심 조언

## 협업 최적 시기·프로젝트 궁합
함께 성과를 내기 좋은 시기, 프로젝트 유형별 궁합, 역할 분담 제안`;

export function getCompatibilitySystemPrompt(relationshipType: string = "romantic"): string {
  let sections: string;
  switch (relationshipType) {
    case "friend":
      sections = FRIEND_SECTIONS;
      break;
    case "colleague":
      sections = COLLEAGUE_SECTIONS;
      break;
    default:
      sections = ROMANTIC_SECTIONS;
  }

  // romantic keeps the marriage timing principle
  const extraPrinciples = relationshipType === "romantic"
    ? `\n\n6. 결혼 시점은 관성(남: 정재·편재 / 여: 정관·편관)이 세운·대운에서 들어오는 시기, 배우자궁 합, 결혼 관련 신살 종합`
    : "";

  return `${COMMON_PREAMBLE}${extraPrinciples}${sections}`;
}

function formatPersonData(data: SajuAnalysisData, label: string): string {
  const p = data.fourPillarsHanja;
  const k = data.fourPillars;

  return `[${label}]
이름: ${data.input.name}
성별: ${data.input.gender === "male" ? "남" : "여"}
생년월일: ${data.input.birthDate}

사주팔자:
      년주        월주        일주        시주
천간  ${p.year.stem}(${k.year.stem})  ${p.month.stem}(${k.month.stem})  ${p.day.stem}(${k.day.stem})  ${p.hour ? `${p.hour.stem}(${k.hour!.stem})` : "미상"}
지지  ${p.year.branch}(${k.year.branch})  ${p.month.branch}(${k.month.branch})  ${p.day.branch}(${k.day.branch})  ${p.hour ? `${p.hour.branch}(${k.hour!.branch})` : "미상"}

일간: ${p.day.stem}(${k.day.stem}) | 신강/신약: ${data.dayMasterStrength === "strong" ? "신강" : data.dayMasterStrength === "weak" ? "신약" : "중화"}
오행: 목${data.fiveElements.wood} 화${data.fiveElements.fire} 토${data.fiveElements.earth} 금${data.fiveElements.metal} 수${data.fiveElements.water}
용신: ${data.yongShin} | 희신: ${data.huiShin} | 기신: ${data.giShin}
십신(년간/월간/일지${data.tenGods.hourStem ? "/시간" : ""}): ${data.tenGods.yearStem}/${data.tenGods.monthStem}/${data.tenGods.dayBranch}${data.tenGods.hourStem ? `/${data.tenGods.hourStem}` : ""}
12운성(년/월/일${data.twelveStages.hour ? "/시" : ""}): ${data.twelveStages.year}/${data.twelveStages.month}/${data.twelveStages.day}${data.twelveStages.hour ? `/${data.twelveStages.hour}` : ""}
신살: ${data.spirits.length > 0 ? data.spirits.join(", ") : "없음"}
공망: ${data.emptiness.length > 0 ? data.emptiness.join(", ") : "없음"}
현재 대운: ${data.currentDaeun.stemHanja}${data.currentDaeun.branchHanja}(${data.currentDaeun.tenGod}, ${data.currentDaeun.startAge}~${data.currentDaeun.endAge}세)
올해 세운: ${data.currentSeun.stemHanja}${data.currentSeun.branchHanja}(${data.currentSeun.tenGod})
지지 관계: ${[
    ...data.branchRelations.samhap,
    ...data.branchRelations.yukhap,
    ...data.branchRelations.chung,
    ...data.branchRelations.hyung,
    ...data.branchRelations.hae,
  ].join(", ") || "특이사항 없음"}`;
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  romantic: "연인 궁합",
  friend: "친구 궁합",
  colleague: "직장 동료 궁합",
};

export function buildCompatibilityUserPrompt(
  person1: SajuAnalysisData,
  person2: SajuAnalysisData,
  relationshipType: string = "romantic",
): string {
  const label = RELATIONSHIP_LABEL[relationshipType] ?? "연인 궁합";
  return `${formatPersonData(person1, "첫 번째 사람")}

${formatPersonData(person2, "두 번째 사람")}

위 두 사람의 ${label}을 분석해주세요.`;
}
