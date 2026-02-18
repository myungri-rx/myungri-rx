# 명리처방전 - 프로덕트 기획서

## 1. 프로덕트 개요

**프로덕트명:** 명리처방전
**한줄 설명:** AI 기반 사주 명리 분석 및 궁합 서비스 — 당신의 고민에 명리학이 처방을 내립니다
**목표:** 사용자의 사주(생년월일시)를 기반으로 개인 운세 분석, 고민 상담, 다양한 관계의 궁합을 제공하는 웹 애플리케이션

---

## 2. 핵심 기능

### 2.1 사주 입력 및 프로필 관리

- **사주 정보 입력:** 이름, 성별, 생년월일, 태어난 시간(시주), 양력/음력 선택
- **다중 프로필 저장:** 여러 명의 사주 정보를 저장·관리 (본인, 가족, 친구 등)
- **프로필 CRUD:** 프로필 추가, 수정, 삭제, 목록 조회

### 2.2 개인 사주 분석

- **사주 팔자 계산:** 입력된 생년월일시를 기반으로 사주팔자(년주·월주·일주·시주) 자동 계산
- **오행 분석:** 목(木)·화(火)·토(土)·금(金)·수(水) 구성 분석
- **십신 분석:** 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인
- **대운·세운 흐름:** 현재 대운과 올해 세운 요약
- **종합 인생 분석:** 성격, 적성, 재물운, 건강운, 대인관계 등

### 2.3 고민 기반 맞춤 상담 (핵심 차별점)

- **고민 입력:** 사주 분석 요청 시 "요즘 가장 고민되는 점"을 자유 텍스트로 입력
- **고민 우선 답변:** 분석 결과의 **최상단**에 고민에 대한 사주 기반 답변을 배치
- **고민 카테고리 예시:** 연애/결혼, 취업/이직, 재물/투자, 건강, 인간관계, 학업, 가족, 기타

### 2.4 궁합 분석

- **관계 유형 선택:**
  - 💕 **연인 궁합:** 연애·결혼 관점의 궁합 (감정적 교감, 갈등 포인트, 장기 전망)
  - 🤝 **동료 궁합:** 업무·사업 파트너 관점의 궁합 (협업 스타일, 보완점, 주의점)
  - 👫 **친구 궁합:** 우정 관점의 궁합 (성향 매칭, 친밀도, 갈등 요소)
- **궁합 점수:** 관계 유형별 궁합 점수 (0~100) 및 상세 해설
- **프로필 간 매칭:** 저장된 프로필 중 2명을 선택하여 궁합 분석

---

## 3. 사용자 플로우

```
[홈] → [프로필 관리] → 사주 정보 입력/선택
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
      [개인 사주 분석]          [궁합 분석]
              ↓                       ↓
      고민 입력 (선택)         두 번째 프로필 선택
              ↓                       ↓
      분석 결과 표시           관계 유형 선택
      (고민 답변 최상단)              ↓
                              궁합 결과 표시
```

### 3.1 상세 플로우

1. **첫 진입:** 홈 화면에서 "내 사주 보기" 또는 "궁합 보기" 선택
2. **프로필 선택/생성:** 기존 프로필 선택 또는 새 사주 정보 입력
3. **개인 분석 시:**
   - "요즘 가장 고민되는 점이 있나요?" 입력 폼 표시
   - 고민 입력 후 분석 요청
   - 결과: ① 고민 답변 → ② 종합 사주 분석 → ③ 상세 오행/십신 정보
4. **궁합 분석 시:**
   - 두 프로필 선택 → 관계 유형(연인/동료/친구) 선택
   - 결과: 궁합 점수, 관계별 상세 해설, 조언

---

## 4. 기술 스택

### 4.1 프론트엔드

- **프레임워크:** Next.js 14+ (App Router)
- **언어:** TypeScript
- **스타일링:** Tailwind CSS
- **상태관리:** Zustand
- **UI 컴포넌트:** shadcn/ui

### 4.2 백엔드

- **API:** Next.js API Routes (Route Handlers)
- **AI 분석:** Anthropic Claude API (사주 해석 및 상담)
- **사주 계산:** 만세력 라이브러리 활용 (lunar-javascript 또는 직접 구현)

### 4.3 데이터 저장

- **로컬 저장:** localStorage (MVP 단계)
- **향후 확장:** Supabase 또는 Firebase (사용자 인증 + 클라우드 저장)

### 4.4 배포

- **호스팅:** Vercel
- **도메인:** 추후 결정

---

## 5. 데이터 모델

### 5.1 Profile (사주 프로필)

```typescript
interface Profile {
  id: string;              // UUID
  name: string;            // 이름
  gender: 'male' | 'female'; // 성별
  birthDate: string;       // 생년월일 (YYYY-MM-DD)
  birthTime: string;       // 태어난 시간 (HH:mm) 또는 '모름'
  calendarType: 'solar' | 'lunar'; // 양력/음력
  isLeapMonth: boolean;    // 윤달 여부 (음력인 경우)
  createdAt: string;       // 생성일시
  updatedAt: string;       // 수정일시
}
```

### 5.2 SajuResult (사주 분석 결과)

```typescript
interface SajuResult {
  profileId: string;
  fourPillars: {           // 사주팔자
    year: { stem: string; branch: string };   // 년주
    month: { stem: string; branch: string };  // 월주
    day: { stem: string; branch: string };    // 일주
    hour: { stem: string; branch: string };   // 시주
  };
  fiveElements: {          // 오행 구성
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  concern: string;         // 입력된 고민
  analysis: {
    concernAnswer: string; // 고민에 대한 답변 (최상단)
    personality: string;   // 성격 분석
    career: string;        // 직업/적성
    wealth: string;        // 재물운
    health: string;        // 건강운
    relationships: string; // 대인관계
    currentFortune: string; // 현재 운세
  };
}
```

### 5.3 CompatibilityResult (궁합 결과)

```typescript
interface CompatibilityResult {
  profileId1: string;
  profileId2: string;
  relationType: 'lover' | 'colleague' | 'friend';
  score: number;           // 0~100
  analysis: {
    summary: string;       // 궁합 요약
    strengths: string;     // 잘 맞는 점
    challenges: string;    // 주의할 점
    advice: string;        // 관계 조언
  };
}
```

---

## 6. 페이지 구조

```
/                          → 홈 (랜딩)
/profiles                  → 프로필 목록 관리
/profiles/new              → 새 프로필 생성
/profiles/[id]/edit        → 프로필 수정
/analysis                  → 개인 사주 분석 (프로필 선택 + 고민 입력)
/analysis/result            → 분석 결과
/compatibility             → 궁합 분석 (두 프로필 선택 + 관계 유형)
/compatibility/result      → 궁합 결과
```

---

## 7. AI 프롬프트 설계 방향

### 7.1 개인 사주 분석 프롬프트

- 사주팔자, 오행 구성, 십신 정보를 시스템 프롬프트에 포함
- 사용자의 고민을 최우선으로 다루도록 지시
- 한국 전통 사주명리학 기반으로 해석하되, 현대적이고 이해하기 쉬운 언어 사용
- 긍정적 관점 유지, 맹목적 미신 조장 지양

### 7.2 궁합 분석 프롬프트

- 두 사람의 사주팔자를 모두 포함
- 관계 유형(연인/동료/친구)에 따라 분석 관점 전환
- 구체적인 관계 조언 포함

---

## 8. MVP 범위 (v0.1)

### 포함

- [x] 사주 프로필 CRUD (localStorage)
- [x] 사주팔자 자동 계산 (만세력)
- [x] 개인 사주 분석 (Claude API 연동)
- [x] 고민 입력 → 고민 우선 답변
- [x] 궁합 분석 (연인/동료/친구)
- [x] 반응형 웹 디자인

### 미포함 (향후)

- [ ] 사용자 인증/로그인
- [ ] 분석 결과 저장 및 히스토리
- [ ] 운세 알림 (일간/월간)
- [ ] SNS 공유 기능
- [ ] 다국어 지원

---

## 9. 디자인 가이드

### 색상

- **Primary:** 딥 퍼플 (#6B21A8) — 신비로운 느낌
- **Secondary:** 골드 (#D4AF37) — 전통적 고급감
- **Background:** 다크 네이비 (#0F172A) — 밤하늘/우주 컨셉
- **Text:** 화이트 (#F8FAFC) / 라이트 그레이 (#CBD5E1)

### 분위기

- 동양적 신비감 + 모던 미니멀 UI
- 별자리/우주 테마의 배경 그래디언트
- 부드러운 애니메이션과 전환 효과

---

## 10. Claude Code 초기화 가이드

이 문서를 프로젝트 루트에 `PRODUCT_SPEC.md`로 배치한 뒤, Claude Code에서 다음과 같이 초기화:

```bash
claude /init
```

**CLAUDE.md에 포함할 핵심 컨텍스트:**

- 이 프로젝트는 "명리처방전" — 한국어 사주(四柱) 명리 분석 웹앱
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Anthropic Claude API로 사주 해석 수행
- 만세력 기반 사주팔자 자동 계산 필요
- 고민 입력 → 고민 답변이 분석 결과 최상단에 위치하는 것이 핵심 UX
- 궁합 분석은 연인/동료/친구 3가지 관계 유형 지원
- MVP에서는 localStorage로 프로필 저장
- 한국어 UI, 동양적+모던 디자인