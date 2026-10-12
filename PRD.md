# AI Commerce Ops Copilot (OpsPilot) — MVP PRD

> **버전:** 1.0.0  
> **작성일:** 2026-10-12  
> **대상 도메인:** 패션 자사몰(IDF몰 포트폴리오 — SHESMISS, LIST, SISTINA) E-BIZ 운영  
> **문서 목적:** 포트폴리오 제출 및 실무형 자율 운영 에이전트 MVP 구축 기준 명세서  

---

## 1. 프로젝트 배경 및 목적

### 1.1 배경
패션 자사몰에서 주 단위/월 단위 프로모션을 운영하려면 다음과 같은 고강도 반복 업무가 발생합니다:
- 연간/월간 캘린더 정리 및 행사 일정 수립
- MD팀 상품 리스트/가격 엑셀 취합 및 확인
- 디자인팀 배너 키비주얼/리사이징 의뢰 및 회신 파일 다운로드
- 상품·가격·할인율·쿠폰·상세 URL 정합성 검증
- 오픈 직전 쇼핑몰 어드민 세팅 및 모바일 노출 검수

이 과정에서 업무가 이메일, 메신저, 구글 드라이브, 엑셀 등으로 분산되어 **일정 누락, 계산 착오(정가/판매가/할인율 불일치), 깨진 링크 게시, 배너 버전 오적용 등의 치명적인 운영 사고(Human Error)**가 빈번히 발생합니다.

### 1.2 프로젝트 목적
**OpsPilot**은 분산된 프로모션 운영 워크플로우를 단일 화면으로 통합하고, **"반복 수작업 자동화 + 100% 룰 기반 사전 QC + Human-in-the-Loop AI 이메일 초안 작성"**을 통해 1인의 E-BIZ 운영자가 다수 브랜드의 프로모션을 무결점으로 운영할 수 있도록 지원하는 전문 B2B SaaS형 웹 애플리케이션입니다.

---

## 2. 타겟 사용자 및 페르소나

- **주 사용자:** 인동FN(SHESMISS, LIST, SISTINA) E-BIZ 자사몰 프로모션 운영 담당자 (1인)
- **협업 상대 (가상 페르소나):**
  - **브랜드 MD:** 행사 대상 상품 선정, 정가/판매가/기획 할인율 엑셀 제공
  - **웹디자이너:** 모델 룩북 기반 메인/서브 배너 이미지 제작 및 회신

---

## 3. 핵심 설계 원칙

1. **Deterministic Rule Engine First (수치/규격 무결성):**
   - 가격 계산, 일자 검증, URL 패턴, 배너 해상도 대조 등 정량적 검사는 AI가 아닌 **100% 결정론적 TypeScript 순수 함수 규칙**으로 검증합니다.
2. **AI for Synthesis & Communication (비정형 소통 보조):**
   - AI(Gemini)는 행사 메타데이터 요약, 디자인팀 의뢰 메일 작성, **오류 감지 시 정중한 재확인 요청 메일 초안 작성** 등 텍스트 생성 업무에만 집중합니다.
3. **Human-in-the-Loop (인간 최종 통제권 유지):**
   - AI가 메일을 임의로 자동 발송하거나 사이트에 자동 게시하지 않습니다. 모든 메일은 **'임시보관함(Drafts)'**에 생성되고, 운영자의 확인/승인을 거쳐 복사/발송 처리됩니다.
4. **Standalone Demo Excellence (포트폴리오 시연성):**
   - 사내 시스템/외부 API 연결 없이도 브라우저에서 2분 내에 전체 E2E 워크플로우를 완벽하게 시연할 수 있도록 **가상 인박스/원클릭 시연 프리셋**을 내장합니다.

---

## 4. 1차 MVP 핵심 기능 명세

### 4.1 연간 캘린더 엑셀 업로드 및 D-Day 자동 스케줄링
- **엑셀/CSV 파서:** 연간 프로모션 계획 파일(.xlsx, .csv) 드롭 시 행사 목록 자동 추출
- **마일스톤 자동 계산:** 행사 시작일(`D-Day`) 기준 타임라인 생성
  - `D-7`: MD팀 상품 확정 엑셀 요청
  - `D-5`: 디자인팀 배너 제작 요청
  - `D-2`: 유관부서 회신 확인 및 배너 합성
  - `D-1`: 게시 전 사전 QC 및 최종 승인

### 4.2 3-Way 매트릭스 필터 & 타임스탬프 상태 관리
- **3-Way 글로벌 필터:**
  - **브랜드별:** `전체` / `SHESMISS` / `LIST` / `SISTINA`
  - **협업부서별:** `전체` / `MD팀` / `디자인팀` / `E-BIZ운영`
  - **업무상태별:** `회신 대기` / `배너 컨펌 대기` / `오류 재확인 필요` / `QC 통과`
- **6단계 진행 상태(Status) 파이프라인:**
  1. `PLANNING` (기획/등록)
  2. `ASSET_REQUESTED` (소재 요청 완료)
  3. `DATA_RECEIVED` (회신 수신 완료)
  4. `NEEDS_CHECK` 🚨 (오류 감지 / 재확인 메일 초안 대기)
  5. `QC_PASSED` (사전 검증 완료)
  6. `READY_TO_PUBLISH` (게시 준비 완료)
- **타임스탬프 기록:** 각 상태 전이(요청, 회신, 생성, 승인) 발생 시각을 분 단위(`YYYY-MM-DD HH:mm`)로 영구 기록하여 히스토리 추적.

### 4.3 메일 회신 감지 & 배너 원큐 자동 생성 및 원클릭 컨펌
- **가상 회신 인박스:** 디자인팀 룩북 사진(`lookbook.jpg`) 또는 MD 엑셀 수신 시뮬레이션
- **HTML5 Canvas 기반 실시간 배너 렌더링:**
  - 수신된 모델 화보 배경 이미지 위에 행사명, 할인율 뱃지, 기간 텍스트를 브랜드 폰트/규격에 맞춰 자동 합성
  - PC 메인 배너(1920x600) 및 MO 메인 배너(750x900) 규격 동시 생성
- **운영자 컨펌 인터페이스:**
  - 생성된 배너 미리보기 확인 후 `[👍 원클릭 컨펌 및 적용]` 버튼으로 즉시 확정
  - 긴급 텍스트 수정 필요 시 브라우저 내에서 즉시 카피/할인율 수정 후 재렌더링

### 4.4 이상 감지 시 "임시보관함(Drafts) 재요청 메일 자동 작성" & 알림
- **감지:** MD 엑셀 파싱 시 수치 불일치, URL 오타, 배너 규격 미달 발견
- **알림 및 임시보관:**
  - 상단 헤더에 `[확인 필요: 재확인 메일 대기 N건]` 뱃지 및 노티 제공
  - 메일 임시보관함에 수신자, 제목, 오류 원인, 수정 요청 기한이 포함된 정중한 비즈니스 메일 초안 자동 생성
- **사용자 행동:** 메일 내용 인라인 수정 후 `[복사 & 발송 처리]` 승인

### 4.5 결정론적 6대 사전 QC 룰 엔진
1. **일자 검증:** 행사 시작일시 $\ge$ 종료일시 오류 차단
2. **수학적 할인율 정합성:** 정가, 판매가 대비 실제 계산 할인율 일치 여부 (`Math.round(((정가-판매가)/정가)*100)`)
3. **기획 대조:** 프로모션 기획 할인율 vs 게시 예정 실판매 할인율 불일치 검출
4. **품번 매핑:** 승인된 SKU 목록과 게시 대상 SKU 일치 여부
5. **URL 유효성:** 필수 파라미터 누락, 유효하지 않은 URL 형식 검출
6. **배너 규격/버전:** 요청 해상도(1920x600 등) 및 승인 파일 버전 일치 검사

### 4.6 IDF몰 감성 모바일 라이브 프리뷰 (Live Mockup)
- 프로모션 상세 우측에 아이폰 모바일 프레임을 배치하여, 확정된 배너와 등록 상품 리스트가 실제 자사몰 모바일 화면에 노출되는 모습을 실시간 반영.

---

## 5. 화면 구성 및 사용자 인터페이스

| 화면 | 주요 구성 요소 및 기능 |
|---|---|
| **1. 대시보드 (`/dashboard`)** | • 3-Way 필터 바 (브랜드/부서/업무)<br>• 오늘의 긴급 To-Do & 알림 피드<br>• **`[🚀 26SS LIST 시연 데이터 1클릭 로드]`** 프리셋 버튼<br>• 부서별 운영 현황 매트릭스 보드 (병목 구간 시각화) |
| **2. 통합 캘린더 & 프로모션 관리 (`/promotions`)** | • 월간/주간 캘린더 뷰 (마일스톤 뱃지 포함)<br>• 연간 엑셀 캘린더 파일 드롭존<br>• 프로모션 리스트 테이블 (상태별 배지 + 타임스탬프) |
| **3. 프로모션 상세 워크스페이스 (`/promotions/:id`)** | • **[상단]** 단계별 타임스탬프 진행 바<br>• **[좌측 탭 1: 소재/배너]** 회신 감지 ➔ Canvas 배너 자동 생성 프리뷰 ➔ 원클릭 컨펌<br>• **[좌측 탭 2: 상품/QC]** 상품 엑셀 테이블 ➔ 6대 QC 에러 리포트 ➔ 인라인 수정<br>• **[우측 패널]** IDF몰 모바일 라이브 프리뷰 목업 |
| **4. 메일 임시보관함 모달 (`/drafts`)** | • AI가 작성한 유관부서 재확인/소재요청 메일 목록<br>• 수신자, 제목, 본문 인라인 에디터<br>• `[클립보드 복사 & 발송 완료 처리]` 버튼 |

---

## 6. 핵심 데이터 스키마 (TypeScript Interfaces)

```typescript
export type Brand = 'SHESMISS' | 'LIST' | 'SISTINA';
export type Department = 'MD' | 'DESIGN' | 'EBIZ_OPS';
export type PromotionStatus = 
  | 'PLANNING' 
  | 'ASSET_REQUESTED' 
  | 'DATA_RECEIVED' 
  | 'NEEDS_CHECK' 
  | 'QC_PASSED' 
  | 'READY_TO_PUBLISH';

export interface Promotion {
  id: string;
  brand: Brand;
  title: string;
  startDate: string; // ISO 8601
  endDate: string;
  targetDiscountRate: number; // 기획 할인율 (%)
  status: PromotionStatus;
  currentBottleneckDept: Department;
  
  // 타임스탬프 히스토리
  timestamps: {
    plannedAt: string;
    assetRequestedAt?: string;
    dataReceivedAt?: string;
    issueDetectedAt?: string;
    qcPassedAt?: string;
    publishedAt?: string;
  };

  // 배너 소재 정보
  banner: {
    sourceImageUrl?: string;
    pcBannerUrl?: string; // 1920x600
    moBannerUrl?: string; // 750x900
    copyTitle: string;
    copySubtitle: string;
    discountBadgeText: string;
    isConfirmed: boolean;
    confirmedAt?: string;
  };

  // 대상 상품 목록
  products: ProductItem[];
}

export interface ProductItem {
  id: string;
  productCode: string; // 예: SWBLPB21010
  productName: string;
  originalPrice: number;
  salePrice: number;
  displayDiscountRate: number;
  detailUrl: string;
  isApproved: boolean;
}

export interface QcIssue {
  id: string;
  ruleCode: 
    | 'DATE_ORDER_INVALID' 
    | 'MATH_DISCOUNT_MISMATCH' 
    | 'PLAN_DISCOUNT_MISMATCH' 
    | 'UNAPPROVED_SKU' 
    | 'INVALID_URL' 
    | 'BANNER_SPEC_MISMATCH';
  severity: 'BLOCKER' | 'WARNING';
  targetField: string;
  message: string;
}

export interface EmailDraft {
  id: string;
  promotionId: string;
  toDepartment: Department;
  recipientName: string;
  subject: string;
  body: string;
  triggerReason: string;
  status: 'DRAFT' | 'REVIEWED' | 'SENT';
  createdAt: string;
}
```

---

## 7. 3분 포트폴리오 시연 대표 시나리오 (E2E Walkthrough)

1. **원클릭 시작:** 대시보드에서 `[🚀 26SS LIST 봄 아우터전 시연 로드]` 버튼 클릭.
2. **일정 자동 등록 확인:** 캘린더에 3월 행사가 등록되고, `D-5`, `D-1` 마일스톤과 타임스탬프가 생성됨.
3. **가상 회신 & 배너 원큐 자동 생성:**
   - `[시뮬레이션: 디자인팀 화보 사진 도착]` 클릭 ➔ 상단 알림 🔔 및 타임스탬프 갱신.
   - HTML5 Canvas 엔진이 1초 만에 PC/MO 배너 자동 렌더링.
   - 운영자가 배너를 확인하고 `[👍 원클릭 컨펌]` 클릭.
4. **MD 엑셀 오류 감지 & 임시보관함 메일 검토:**
   - MD 상품 데이터 로드 시 룰 엔진이 **"품번 SWBLPB21010 계산 할인율 불일치 (정가 198,000원, 판매가 138,600원 ➔ 실제 30%이나 표기 40%)"** 적발.
   - 상태가 `NEEDS_CHECK`로 전환되며 **임시보관함에 정중한 재확인 요청 메일 초안**이 자동 생성됨.
   - 운영자가 임시보관함에서 메일 검토 후 `[복사 & 발송 처리]`.
5. **인라인 수정 & 최종 무결점 배포:**
   - 상품 테이블에서 40%를 30%로 인라인 수정 ➔ 즉시 `QC PASSED` 초록 불 전환.
   - 우측 IDF몰 모바일 목업에 배너와 상품이 라이브로 반영되는 것을 확인하며 `READY_TO_PUBLISH` 완료.

---

## 8. 기술 스택 및 구현 전략

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons (모던 B2B SaaS 대시보드 룩앤필)
- **상태 관리:** Zustand (브라우저 새로고침 유지, 시연 데이터 리셋 지원)
- **파일 파싱:** `xlsx` (SheetJS)
- **이미지 엔진:** HTML5 Canvas API (서버 없이 브라우저 고해상도 배너 실시간 합성)
- **AI Integration:** Google Gemini API (Fallback 템플릿 포함하여 오프라인/API 키 부재 시에도 100% 정상 작동)
- **배포:** Vercel (원클릭 배포 및 포트폴리오 라이브 링크 제공)

---

## 9. 성공 지표 (Portfolio Evaluation Criteria)

- **완성도 (Reliability):** 시연 중 콘솔 에러 0건, 모든 버튼 및 시나리오 100% 동작.
- **실무 정합성 (Domain Fit):** 패션 자사몰 특유의 브랜드 구조(SHESMISS, LIST, SISTINA)와 실제 운영 병목 반영.
- **아키텍처 분리 (Engineering Rigor):** 비즈니스 크리티컬한 계산(결정론적 코드)과 비정형 소통(생성형 AI)의 엄격한 역할 분리 입증.
