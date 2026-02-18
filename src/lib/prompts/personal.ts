import type { SajuAnalysisData } from "@/lib/types";

export const PERSONAL_SYSTEM_PROMPT = `당신은 30년 경력의 정통 사주명리학 전문가입니다.
적천수의 억부론, 자평진전의 격국론, 궁통보감의 조후론을 모두 통달했습니다.

[분석 원칙]
1. 모든 해석은 반드시 사주 원국의 구체적 글자·관계에서 근거를 밝혀라
   - "甲일간이 子월에 태어나 정인격이며..." 식으로 근거를 먼저 제시
   - 근거 없는 일반론, 누구에게나 맞는 말은 절대 금지 (바넘 효과 배제)

2. 십신·지지 관계·12운성·신살을 종합하여 교차 검증하라
   - 하나의 근거만으로 단정하지 말고 최소 2~3가지 근거가 일치할 때 강하게 진술
   - 근거가 상충할 때는 "~한 면이 있으나 ~한 면도 공존합니다"로 균형 잡기

3. 시기 언급 시 반드시 구체적으로 특정하라
   - ❌ "조만간 좋은 일이 있을 것입니다"
   - ✅ "2026년 丙午 세운이 식신생재를 이루므로, 특히 하반기(7~9월)에 새로운 수입원이 열릴 가능성이 높습니다"

4. 사용자의 고민을 사주 구조와 직접 연결하라

5. "처방"은 사주 구조에서 논리적으로 도출하라
   - 용신이 水인 사람에게: "검은색 계열 옷, 북쪽 방향, 겨울 시즌 활동 강화"
   - 단순 미신이 아닌 오행 보완 논리로 설명

6. 톤: 전문적이되 따뜻하게. 한자 용어를 쓰되 반드시 쉬운 해석을 병기
   - "편관(偏官)이 강합니다 — 쉽게 말해 카리스마와 추진력이 넘치지만, 주변에서 '너무 세다'는 소리를 들을 수 있습니다"

7. "사주는 참고 도구이며 운명은 노력과 선택에 의해 바뀔 수 있다"는 관점을 유지하라

[응답 형식]
반드시 아래 섹션 순서대로 마크다운으로 작성하라. 각 섹션은 ## 헤더로 시작한다.
고민이 있는 경우에만 "고민 처방전" 섹션을 포함한다.

## 고민 처방전
(고민이 있을 때만) 고민의 명리학적 원인 분석, 대운·세운 기반 시기 해석, 구체적 처방

## 사주 원국
일간 해설, 오행 분포 요약, 용신·희신·기신 판정

## 십신 프로파일
핵심 십신 구성 요약, 강점 3개, 약점 3개, 대인관계 스타일, 직업 적성

## 6대 운세
1. 재물운 2. 직업·사업운 3. 연애·결혼운 4. 건강운 5. 대인관계운 6. 학업·자기계발운

## 대운·세운 타임라인
현재 대운 해석, 올해 세운, 내년 세운 미리보기, 월운 하이라이트

## 맞춤 처방
행운색/행운 방위/행운 숫자, 오행 보완법, 올해 핵심 조언`;

export function buildPersonalUserPrompt(data: SajuAnalysisData, concern?: string): string {
  const p = data.fourPillarsHanja;
  const k = data.fourPillars;

  let prompt = `[사주 원국 정보]
이름: ${data.input.name}
성별: ${data.input.gender === "male" ? "남" : "여"}
생년월일: ${data.input.birthDate} (${data.input.calendarType === "solar" ? "양력" : "음력"})
태어난 시간: ${data.input.birthTime}

사주팔자:
      년주        월주        일주        시주
천간  ${p.year.stem}(${k.year.stem})  ${p.month.stem}(${k.month.stem})  ${p.day.stem}(${k.day.stem})  ${p.hour ? `${p.hour.stem}(${k.hour!.stem})` : "미상"}
지지  ${p.year.branch}(${k.year.branch})  ${p.month.branch}(${k.month.branch})  ${p.day.branch}(${k.day.branch})  ${p.hour ? `${p.hour.branch}(${k.hour!.branch})` : "미상"}

일간: ${p.day.stem}(${k.day.stem})
신강/신약: ${data.dayMasterStrength === "strong" ? "신강" : data.dayMasterStrength === "weak" ? "신약" : "중화"}

[오행 분포]
목(木): ${data.fiveElements.wood} | 화(火): ${data.fiveElements.fire} | 토(土): ${data.fiveElements.earth} | 금(金): ${data.fiveElements.metal} | 수(水): ${data.fiveElements.water}
가장 강한 오행: ${data.dominantElement} | 가장 약한 오행: ${data.weakestElement}

[십신 배치]
년간: ${data.tenGods.yearStem} | 년지: ${data.tenGods.yearBranch}
월간: ${data.tenGods.monthStem} | 월지: ${data.tenGods.monthBranch}
일간: 비견(본인) | 일지: ${data.tenGods.dayBranch}
${data.tenGods.hourStem ? `시간: ${data.tenGods.hourStem} | 시지: ${data.tenGods.hourBranch}` : "시주: 미상"}

[12운성]
년지: ${data.twelveStages.year} | 월지: ${data.twelveStages.month} | 일지: ${data.twelveStages.day}${data.twelveStages.hour ? ` | 시지: ${data.twelveStages.hour}` : ""}

[지장간]
년지: ${data.hiddenStems.year.join(",")} | 월지: ${data.hiddenStems.month.join(",")} | 일지: ${data.hiddenStems.day.join(",")}${data.hiddenStems.hour ? ` | 시지: ${data.hiddenStems.hour.join(",")}` : ""}

[지지 관계]
${data.branchRelations.samhap.length > 0 ? `삼합: ${data.branchRelations.samhap.join(", ")}` : ""}
${data.branchRelations.yukhap.length > 0 ? `육합: ${data.branchRelations.yukhap.join(", ")}` : ""}
${data.branchRelations.chung.length > 0 ? `충: ${data.branchRelations.chung.join(", ")}` : ""}
${data.branchRelations.hyung.length > 0 ? `형: ${data.branchRelations.hyung.join(", ")}` : ""}
${data.branchRelations.hae.length > 0 ? `해: ${data.branchRelations.hae.join(", ")}` : ""}
${data.branchRelations.banghap.length > 0 ? `방합: ${data.branchRelations.banghap.join(", ")}` : ""}

[신살]
${data.spirits.length > 0 ? data.spirits.join(", ") : "없음"}

[공망]
${data.emptiness.length > 0 ? data.emptiness.join(", ") : "없음"}

[용신·희신·기신]
용신: ${data.yongShin} | 희신: ${data.huiShin} | 기신: ${data.giShin}

[현재 대운]
${data.currentDaeun.stemHanja}${data.currentDaeun.branchHanja}(${data.currentDaeun.stem}${data.currentDaeun.branch}) 대운 (${data.currentDaeun.startAge}세~${data.currentDaeun.endAge}세)
대운 십신: ${data.currentDaeun.tenGod}

[올해 세운 (${data.currentSeun.year})]
${data.currentSeun.stemHanja}${data.currentSeun.branchHanja}(${data.currentSeun.stem}${data.currentSeun.branch})
세운 십신: ${data.currentSeun.tenGod}

[내년 세운 (${data.nextSeun.year})]
${data.nextSeun.stemHanja}${data.nextSeun.branchHanja}(${data.nextSeun.stem}${data.nextSeun.branch})
세운 십신: ${data.nextSeun.tenGod}`;

  if (concern) {
    prompt = `[사용자 고민]\n"${concern}"\n\n위 고민에 대해 반드시 "## 고민 처방전" 섹션을 최상단에 배치하여 사주 구조에 기반한 답변을 먼저 해주세요.\n\n${prompt}`;
  }

  return prompt;
}
