# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**명리처방전** — AI-powered Korean saju (四柱) fortune analysis and compatibility web app. Users input birth date/time, optionally describe a concern, and receive saju-based analysis powered by Claude API. The core UX differentiator: when a user enters a concern, the answer appears **first** in the results, grounded in their daeun (대운, 10-year cycle) and seun (세운, yearly fortune).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Saju calculation | `@fullstackfamily/manseryeok` (만세력 JS, 1900–2050, true solar time + DST) |
| AI analysis | Anthropic Claude API (via Vercel AI SDK: `ai` + `@ai-sdk/anthropic`) |
| Deployment | Vercel |
| Storage | None (stateless POC — user re-enters each time) |

## Architecture (POC)

Single-page app at `/` with tab navigation — no routing, just client-side tab switching.

- **Tab 1 — 개인 사주 분석:** Birth info input + optional concern → manseryeok calculates four pillars → custom utils enrich data → Claude API streams structured analysis
- **Tab 2 — 연인 궁합:** Two people's birth info → Both pillars calculated and enriched → Claude API streams compatibility analysis

### Data flow

```
SajuInput → manseryeok (four pillars + time correction)
         → custom saju utils (enrich: 십신, 12운성, 지장간, 신살, 오행, 대운/세운)
         → SajuAnalysisData (full enriched data)
         → Claude API (via Vercel AI SDK streaming)
         → Streamed result sections rendered progressively
```

### manseryeok-js API (key functions)

```typescript
calculateSaju(year, month, day, hour, minute, options?)
  → { yearPillar, yearPillarHanja, monthPillar, monthPillarHanja,
      dayPillar, dayPillarHanja, hourPillar, hourPillarHanja,
      isTimeCorrected, correctedTime: { hour, minute } }
// Pillar strings are 2-char combined: "갑진" (stem+branch)

solarToLunar(year, month, day) → { lunar, gapja }
lunarToSolar(year, month, day, isLeapMonth) → { solar, gapja }
getSajuMonth(year, month, day) → number
```

**Important limitations:** manseryeok-js only provides pillar strings. It does NOT compute: ten gods (십신), hidden stems (지장간), 12 stages (12운성), five elements analysis, daeun (대운), seun (세운), spirits (신살), or day master strength. These must all be built as custom utility functions using the lookup tables in docs/SAJU_REFERENCE.md.

## Saju Calculation Reference Tables

`docs/SAJU_REFERENCE.md` contains all lookup tables needed to build the saju analysis engine:

| Section | Table | Use |
|---------|-------|-----|
| §4-5 | 십신 산출 조견표 (10×10 matrix) | Ten gods: given day stem + other stem → 십신 |
| §4-6 | 12운성 조견표 (10×12 matrix) | Twelve stages: given day stem + branch → 운성 |
| §4-7 | 지장간 조견표 | Hidden stems: each branch → 본기/중기/여기 |
| §4-8 | 24절기 월주 대응표 | Solar terms to month branch mapping |
| §4-9 | 년간별 월주 천간 산출표 | Year stem → month pillar stem |
| §4-10 | 일간별 시주 천간 산출표 | Day stem → hour pillar stem |
| §4-11 | 주요 신살 판정 기준 | Spirit/star detection rules |
| §4-12 | 대운 계산법 | Algorithm for major fortune cycles |
| §4-2-2 | 신강/신약 판단 기준 | Day master strength determination |
| §4-2-3 | 격국 분류표 | Gyeokguk classification |

### Interpretation framework

The project uses the **자평명리 (Jaepyeong Myeongri)** system with 일간 (day master) as the center of all analysis. See docs/SAJU_REFERENCE.md §0.

The AI prompt design uses the **3 major yongshin (用神) theories**:

| Theory | Source | Judges |
|--------|--------|--------|
| 억부용신 | 적천수 | Wealth, family, personal life |
| 격국용신 | 자평진전 | Career, social achievement |
| 조후용신 | 궁통보감 | Constitution, health, climate balance |

docs/SAJU_REFERENCE.md §8 contains ready-to-use interpretation templates for: 일간 해석, 대운·세운 해석, 궁합 해석, 고민 처방. These should be incorporated into the AI system prompts.

## Critical Design Principle: Anti-Barnum Effect

Every AI interpretation must cite specific saju structure as evidence. See docs/PRODUCT_SPEC.md §7-0.

- **Never:** generic statements that apply to anyone ("you sometimes feel lonely")
- **Always:** cite the exact stems/branches/relationships ("甲일간이 월지 午火 위에 앉아 식신이 왕성합니다")
- **Time references:** must specify year/month ("2026년 丙午 세운, 특히 하반기 7~9월")
- **Advice:** must derive logically from saju structure (yongshin-based color/direction/timing)

Quality checklist (docs/SAJU_REFERENCE.md §8-5): 근거 명시, 바넘 효과 배제, 시기 특정, 교차 검증, 균형, 실천 가능성, 용어 병기, 일간 중심, 궁위 활용, 개인화.

## AI Response Structures

### Personal analysis (6 sections, in order):
1. **고민 처방전** — Concern answer (only if concern provided, always first)
2. **사주 원국** — Four pillars table + day master summary + five elements chart + yongshin
3. **십신 프로파일** — Personality profile from ten gods composition
4. **6대 운세** — Wealth, career, love, health, relationships, learning
5. **대운·세운 타임라인** — Current daeun + this year + next year + monthly highlights
6. **맞춤 처방** — Lucky color/direction/number + practical ohaeng補 advice

### Compatibility analysis (6 sections, in order):
1. **종합 스코어** — Overall 0–100 + five sub-scores (감정교감/성격호환/가치관일치/성적궁합/장기안정성)
2. **끌리는 이유** — Ohaeng complementarity, branch harmony
3. **갈등 주의보** — Chung/hyung/hae conflicts, value differences
4. **시기별 타임라인** — Overlapping seun analysis for next 2–3 years
5. **관계 처방전** — Personalized advice for each person
6. **결혼운·시점** — Spouse palace analysis, favorable/unfavorable marriage years

Compatibility scoring formula: docs/PRODUCT_SPEC.md §7-3 (base 50, add/subtract for 합/충/형 etc., normalize to 0–100).

## UX Trust Devices

Results must include these visual elements (docs/PRODUCT_SPEC.md §7-4):
- **근거 태그** next to every interpretation ("근거: 일간甲 + 월지午 = 식신")
- **사주 원국표** with hanja and ohaeng color coding
- **오행 차트** (radar or bar chart for 목/화/토/금/수)
- **타임라인 UI** for daeun/seun flow
- **궁합 레이더** (radar chart for 5 compatibility dimensions)
- **경고 배지** (red badges for 충/형/공망)

## Spec Documents

- `docs/PRODUCT_SPEC.md` — Active POC spec (scope, data model, AI prompt design with examples, response structures, design guide)
- `docs/SAJU_REFERENCE.md` — Complete saju theory reference with all lookup tables needed for implementation (5 classics, yongshin theories, 십신/12운성/지장간/신살 tables, 대운 algorithm, interpretation templates, quality checklist)
- `docs/prd_deprecated.md` — Earlier full-scope spec — **deprecated**

## Design Guide

| Token | Value |
|-------|-------|
| Primary | Deep purple `#6B21A8` |
| Accent | Gold `#D4AF37` |
| Background | Dark navy `#0F172A` |
| Surface | Slate `#1E293B` |
| Text | White `#F8FAFC` / Gray `#CBD5E1` |
| Mood | Night sky + Eastern mystique + modern minimal |

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server
npm run build      # Production build
npm run lint       # Lint
```

## Implementation Notes

- All UI text is in Korean
- Birth time "모름" (unknown) is valid — skip hour pillar when unknown
- Lunar calendar with leap month (윤달) must be handled
- manseryeok-js returns pillar strings as 2-char combined ("갑자") — split into stem[0] and branch[1] for lookups
- 궁위론 (palace theory): 년주=조상궁/초년, 월주=부모궁/청년, 일주=본인궁·배우자궁/중년, 시주=자녀궁/말년
- Daeun direction: male+양간 or female+음간 = forward (순행); reverse for opposite
- Daeun start age = (days from birth to next/prev 절기) ÷ 3
- The ohaeng color mapping for UI: 목=green, 화=red, 토=yellow, 금=white, 수=blue/black
