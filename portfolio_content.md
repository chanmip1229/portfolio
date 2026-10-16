# 박찬미 | E-Biz Operations & CRM Specialist

> **"오류 없는 데이터 정합성과 업무 SOP 표준화로 비즈니스 성장을 이끄는 오퍼레이션 전문가"**  
> FMCG 시장 데이터(닐슨 6년)와 럭셔리 CRM·이커머스(디올 2년)를 거쳐, 자사몰 E-Biz 운영 자동화(인동FN 타겟 OpsPilot)를 직접 설계·구축한 9년 경력의 실무형 인재입니다.

---

### 👤 Profile & Contact

- **이름:** 박찬미 (Chanmi Park)
- **연락처:** 010-8991-1229
- **이메일:** chanmip1229@gmail.com
- **라이브 프로덕트:** [IDF E-Biz Operations Board (OpsPilot)](https://idf-theta.vercel.app/)
- **핵심 키워드:** `#E-Biz운영` `#자사몰프로모션` `#CRM마케팅` `#데이터정합성` `#SOP표준화` `#AI업무자동화`

---

### 🎯 Core Competencies (핵심 역량)

| 구분 | 주요 역량 | 세부 내용 및 경험 |
| :--- | :--- | :--- |
| **E-Biz & Promotion Ops** | **프로모션 라이프사이클 관제** | 연간/월간 행사 스케줄링, MD 엑셀 취합, 배너 키비주얼 검수, 오픈 전 6대 무결점 사전 QC |
| **Process Standardization** | **SOP 구축 & 조직 정착** | 부서 간 요청 양식(DRF, COF) 및 200p End-to-End 업무 가이드 작성, 휴먼 에러 원천 차단 |
| **CRM & Omnichannel Data** | **고객 데이터 분석 & 세일즈 견인** | Salesforce 기반 CRM 캠페인(탑클라이언트 +45%), 디올 성수 고객 여정 설계, 옴니채널 리포팅 |
| **AI & Automation** | **Next.js & LLM 풀스택 도구 구축** | Next.js, TypeScript, Canvas API, Gemini API를 활용한 사전 검증 룰 엔진 및 사내 도구 개발 |

---

## 🌟 0. Flagship Project : 인동FN IDF 자사몰 E-Biz 운영 코파일럿 (OpsPilot)

- **프로젝트 성격:** 개인 실무 프로젝트 (기획, UX/UI, 풀스택 개발 100%)
- **수행 기간:** 2026.10
- **라이브 데모:** 🔗 [https://idf-theta.vercel.app/](https://idf-theta.vercel.app/)
- **기술 스택:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Zustand, HTML5 Canvas API, SheetJS, Gemini API

### 1) 배경 및 해결하려는 문제 (Problem)
- **배경:** 인동FN 대표 브랜드(SHESMISS, LIST, SISTINA)의 자사몰(IDF몰) 프로모션 운영 시 주 단위/월 단위 고강도 반복 업무 발생.
- **Pain Point:** 이메일, 메신저, 엑셀 등으로 업무가 분산되어 **할인율 불일치, 링크 깨짐, 배너 오적용, 일정 누락** 등 치명적인 운영 사고(Human Error) 위험 상존.

### 2) 핵심 솔루션 (Solution & Key Features)
1. **연간 캘린더 파싱 및 D-Day 마일스톤 자동 스케줄링**
   - 엑셀 업로드 즉시 D-7(기획MD 상품 요청) ~ D-5(웹디자인 배너 의뢰) ~ D-2(회신 확인) ~ D-1(사전 QC) 일정 자동 생성
2. **결정론적 6대 사전 QC 룰 엔진 (Deterministic Rule Engine)**
   - AI 환각(Hallucination) 없이 순수 TypeScript 규칙으로 100% 무결점 정량 검증:
     ① 행사 일자 유효성 ② 수학적 실할인율 정합성 ③ 기획 할인율 대조 ④ SKU 품번 매핑 ⑤ 상세 URL 유효성 ⑥ 배너 해상도 규격 대조
3. **HTML5 Canvas 기반 배너 원큐 자동 생성 & 원클릭 컨펌**
   - 화보 수신 시 PC(1920x600) / Mobile(750x900) 배너 실시간 렌더링 및 인라인 카피 수정 지원
4. **Human-in-the-Loop AI 이메일/슬랙 초안 작성기 (다부서 듀얼 뷰 지원)**
   - 기획MD 가격 오류, 웹디자인 썸네일 해상도 결함, 전산팀 URL 단절 등 감지 시 부서별 맞춤 엑셀 자동 첨부 및 발송 초안 자동 작성
5. **IDF몰 멀티 디바이스 라이브 프리뷰 목업**
   - 확정된 배너와 상품 리스트를 iPhone / Galaxy / Desktop 반응형 프레임으로 오픈 전 실시간 시각적 검증

### 3) 정량적/정성적 기대 효과 (Impact)
- 사전 검수 소요 시간 **91% 단축** (기존 120분 ➔ 10분 수기 대조 업무 자동화)
- 계산 착오 및 배너 오적용으로 인한 오픈 당일 크리티컬 사고 **0건 달성**
- 1인의 운영자가 3개 브랜드(SHESMISS, LIST, SISTINA)의 동시 다발 프로모션을 안정적으로 관제

> 🔒 **Data Privacy & Compliance Note:**  
> 본 프로젝트 및 데모에 수록된 상품 단가, 행사 일정, 임직원 성명 및 이메일(@indongfn.co.kr)은 기업 정보 보안 및 개인정보 보호를 준수하기 위해 100% 가상(Mock Data)으로 치환되어 제작되었습니다.

---

## 💼 1. Career Experience (경력 사항)

### 크리스챤 디올 꾸뛰르 코리아 (Christian Dior Couture Korea)
*2021.04 ~ 2023.06 (2년 3개월)*

#### • CSC Business Analyst (2022.09 ~ 2023.06)
- **리포팅 체계 신설 및 표준화:** 신설 CSC 부서의 성과·커미션·볼륨 리포트를 최초 기획/제작, 이후 APAC 센트럴팀 및 타 국가 표준 양식으로 채택.
- **이커머스 연계 세일즈 전략 제안:** 이커머스팀과 매일 데이터 공유 및 주간 미팅을 통해 재고 가용성, LinkPay 결제 이슈를 분석하고 판매 전략 제안.
- **센터 볼륨 예측 & KPI 관리:** 채널/시간대별 데이터 분석을 통한 볼륨 예측, 어드바이저별 KPI 진단 및 판매 코칭.

#### • Client Marketing Analyst (2021.04 ~ 2022.08)
- **CRM 캠페인 운영:** Salesforce 기반 고객 데이터 분석 및 세그먼트 타겟팅 캠페인 운영을 통해 **Top Client 45% 증가, 전체 고객 30% 증가**에 기여.
- **디올 성수 팝업 스토어:** 고객 데이터 기반 장소/타겟 분석, 인앱 고객 여정 설계, 방문 예약 관리 및 성과 리포팅 전담.
- **VIP 이벤트 기획:** 하이주얼리 등 VIP 초청 대상 선정 및 스케줄링으로 **APAC 지역 중 한국이 유일하게 타겟을 달성**하는 성과 창출.

---

### 닐슨 코리아 (Nielsen Korea)
*2015.04 ~ 2021.04 (6년 1개월)*

#### • Data Analyst, Global Client Department (2019.04 ~ 2021.04)
- **옴니채널 데이터 분석:** POS, POSM, 이커머스, 소비자 패널(CPS)을 결합한 카테고리별 옴니채널 리포트 작성 및 인사이트 도출.
- **글로벌 프로젝트 한국 챔피언:** 글로벌 툴(CSO 2.0) 한국 런칭 전담, 안정적인 정착 공로로 **Nielsen USA ‘Thank You Award’ 수상 (2020)**.

#### • Output & RD Team, Operation (2015.04 ~ 2019.04)
- **부서 공통 양식 정착:** 딜리버리 요청서(DRF), DB 구조변경서(COF)를 신규 개발해 전사 공통 방식으로 정착, 재확인 오류 대폭 감소.
- **200페이지 규모 SOP 제작:** 팀 통합 후 업무 전 과정(End-to-End)을 집대성한 200p+ 표준 매뉴얼 제작 및 신규 인력 교육 전담.
- **SQL 데이터 프로세싱 자동화:** SQL 쿼리 자동화 스크립트를 도입해 **아이템 셋업률 월 30% 향상 및 작업 시간 월 240분 단축**.

---

### 한국 IBM (Samsung MSC 사업부, 계약직)
*2012.06 ~ 2013.06 (1년)*
- **삼성전자 Video Hub QA:** 47개국 23개 언어 서비스의 결제, 스트리밍, 메타데이터 정합성 검증 및 QA 가이드 수립.

---

## 🎓 2. Education & Certifications & Skills

### 학력 & 교육
- **용산 여성인력개발센터:** AI 활용 스마트 오피스 실무자 양성과정 (2026.08 ~ 2026.10)
- **유비온 디지털교육센터:** PBL 기반 금융 빅데이터 분석가 과정 (2023.10 ~ 2024.03 / 프로젝트 최우수상 2회)
- **성신여자대학교:** 경제학 · 경영학 학사 (2008.03 ~ 2014.08)

### 자격증
- **ADsP (데이터분석준전문가)** — 한국데이터산업진흥원 (2024.03)
- **전산회계 1급** — 한국세무사회 (2014)

### 업무 도구 & 기술 스택
- **Office & Operations:** MS Excel (고급 함수/대용량 데이터), PowerPoint, Word, Google Workspace
- **Data & CRM:** SQL, Python, Salesforce CRM, POS/Omnichannel Data
- **AI & Dev Tools:** Google Antigravity, Next.js, TypeScript, Tailwind CSS, Claude, Gemini, Aside, Make
