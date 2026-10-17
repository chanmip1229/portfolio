const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

function getBase64(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

console.log('Loading screenshots as base64...');
const img1 = getBase64('01_step1_gantt.png');
const img2 = getBase64('02_step1_monthly_cards.png');
const img3 = getBase64('03_step1_brand_filter.png');
const img4 = getBase64('04_step2_qc_overview.png');
const img5 = getBase64('05_step2_dual_mail_modal.png');
const img6 = getBase64('06_step2_sku_table.png');
const img7 = getBase64('07_step3_mobile_preview.png');
const img8 = getBase64('08_step3_desktop_preview.png');
const img9 = getBase64('09_common_grouped_mail.png');
const img10 = getBase64('10_common_slack_webhook.png');
const img11 = getBase64('11_common_history_modal.png');

console.log('Base64 images loaded successfully.');

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IDF E-Biz 운영 보드 포트폴리오 | 박찬미</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      color: #111111;
      background-color: #e5e7eb;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    @page {
      size: A4 portrait;
      margin: 0;
    }

    .portfolio-page {
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      margin: 20px auto;
      padding: 18mm 22mm 16mm 22mm;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    @media print {
      body {
        background: transparent;
      }
      .portfolio-page {
        margin: 0;
        box-shadow: none;
      }
    }

    .page-header {
      border-bottom: 1.5px solid #111111;
      padding-bottom: 10px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .page-header .category {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #8C6D3B;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .page-header .page-num {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #888888;
      letter-spacing: 0.05em;
    }
    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #111111;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
      line-height: 1.35;
    }
    .page-subtitle {
      font-size: 13.5px;
      color: #555555;
      margin-bottom: 20px;
      line-height: 1.65;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .footer {
      border-top: 1px solid #E8E4DA;
      padding-top: 10px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #888888;
      font-family: 'Montserrat', 'Pretendard', sans-serif;
    }
    
    /* Cover Page */
    .cover-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: 10px 0;
    }
    .cover-tag {
      display: inline-block;
      background: #8C6D3B;
      border: 1px solid #7A5E32;
      color: #FAF9F5;
      font-family: 'Montserrat', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 4px;
      margin-bottom: 22px;
      align-self: flex-start;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.25;
      color: #111111;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
    }
    .cover-subtitle {
      font-size: 20px;
      font-weight: 700;
      color: #8C6D3B;
      margin-bottom: 22px;
      letter-spacing: -0.02em;
    }
    .cover-desc {
      font-size: 14.5px;
      color: #444444;
      line-height: 1.75;
      margin-bottom: 28px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .meta-table th, .meta-table td {
      padding: 13px 16px;
      text-align: left;
      font-size: 13px;
      border-bottom: 1px solid #E8E4DA;
    }
    .meta-table th {
      background: #FAF9F5;
      color: #111111;
      font-weight: 700;
      width: 22%;
    }
    .meta-table td {
      color: #333333;
    }
    .btn-link {
      color: #8C6D3B;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    /* Common Card Styles */
    .card {
      background: #FAF9F5;
      border: 1px solid #E8E4DA;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bullet-list {
      list-style: none;
    }
    .bullet-list li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #333333;
      line-height: 1.65;
    }
    .bullet-list li:last-child {
      margin-bottom: 0;
    }
    .bullet-list li::before {
      content: '•';
      position: absolute;
      left: 2px;
      color: #8C6D3B;
      font-weight: bold;
      font-size: 15px;
    }
    .highlight {
      font-weight: 700;
      color: #111111;
    }

    /* Images */
    .img-box {
      width: 100%;
      margin: 8px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #E8E4DA;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      background: #FAF9F5;
    }
    .img-box img {
      width: 100%;
      height: auto;
      display: block;
    }
    .img-box.compact img {
      max-height: 60mm;
      object-fit: contain;
    }
    .img-box.medium img {
      max-height: 80mm;
      object-fit: contain;
    }
    .img-box.large img {
      max-height: 105mm;
      object-fit: contain;
    }
    .img-caption {
      padding: 6px 10px;
      font-size: 10.5px;
      color: #777777;
      background: #FAF9F5;
      border-top: 1px solid #E8E4DA;
      text-align: right;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 10px 0;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 12px;
    }
    .data-table th, .data-table td {
      padding: 8px 12px;
      border: 1px solid #E8E4DA;
      text-align: left;
    }
    .data-table th {
      background: #F7F4EE;
      font-weight: 700;
      color: #111111;
    }
    .data-table tr.total-row {
      background: #F5EFE6;
      font-weight: 800;
      color: #111111;
    }

    .notice-box {
      font-size: 12px;
      color: #666666;
      background: #FAF9F5;
      border: 1px dashed #D4CBBF;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 12px;
      line-height: 1.6;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: 표지 -->
  <div class="portfolio-page">
    <div class="cover-content">
      <span class="cover-tag">E-BIZ STOREFRONT OPERATIONS · CRM · DATA ANALYTICS</span>
      <h1 class="cover-title">IDF E-Biz 운영 보드</h1>
      <div class="cover-subtitle">인동FN 자사몰 프로모션 관제·사전 QC 솔루션 & 실무 경력 포트폴리오</div>
      <p class="cover-desc">
        크리스챤 디올 꾸뛰르(CRM·이커머스 세일즈 분석)와 닐슨코리아(옴니채널 데이터·SOP 표준화)에서<br>
        8년간 검증한 <strong>데이터 기반 매출 개선·CRM 리텐션·유관부서 협업 노하우</strong>를 바탕으로,<br>
        인동FN 자사몰(SHESMISS·LIST·SISTINA)의 상품·프로모션·쿠폰·배너 운영을 표준화한 실무형 솔루션입니다.
      </p>

      <table class="meta-table">
        <tr>
          <th>지원 직무 / 성명</th>
          <td><strong>인동FN 영업본부 E-BIZ (자사몰) 경력직 — 박찬미</strong> (010-8991-1229 / chanmip1229@gmail.com)</td>
        </tr>
        <tr>
          <th>보유 경력 요약</th>
          <td>
            <strong>총 8년 4개월 (데이터 기반 매출 개선 · CRM 캠페인 · 유관부서 SOP 표준화)</strong><br>
            • <strong>크리스챤 디올 꾸뛰르 코리아 (2년 3개월)</strong>: 이커머스 재고·결제(LinkPay) 분석, Salesforce CRM (Top Client +45%)<br>
            • <strong>닐슨코리아 (6년 1개월)</strong>: POS·이커머스·패널 결합 매출·전환율 분석, 전사 요청양식(DRF·COF) 및 200p SOP 구축
          </td>
        </tr>
        <tr>
          <th>대표 프로젝트 역할</th>
          <td>
            <strong>인동FN 자사몰 타겟 『IDF E-Biz 운영 보드』 기획·설계·구현 100% (단독 수행)</strong><br>
            • 브랜드별 연간 프로모션 일정 관제(D-30) 및 오픈 전 3단계 무결점 사전 QC 파이프라인 설계<br>
            • 단가·할인율 수식 검증, 시즌 트렌드 이상치 감지, 쿠폰 중복/역마진 방지, 유관부서 듀얼·취합 소통 체계 구현
          </td>
        </tr>
        <tr>
          <th>라이브 서비스</th>
          <td><a href="https://idf-theta.vercel.app/" target="_blank" class="btn-link">https://idf-theta.vercel.app/</a> <span style="font-size: 11.5px; color: #666666; margin-left: 6px;">(PC · 모바일 반응형 실시간 작동)</span></td>
        </tr>
      </table>

      <div class="card" style="background: #FAF9F5; border-left: 3px solid #8C6D3B; margin-top: 10px; padding: 16px 20px;">
        <div class="card-title" style="color: #111111; font-size: 14.5px; margin-bottom: 6px;">
          <span style="color: #8C6D3B; font-weight: 800;">[핵심 밸류]</span>
          <span>"표준화된 시스템으로 운영 오류를 막고, 데이터와 CRM으로 매출 성장을 견인합니다"</span>
        </div>
        <p style="font-size: 13px; color: #444444; line-height: 1.6;">
          자사몰 프로모션 오픈 전 반복되는 수기 대조와 부서 간 재확인 병목을 룰 기반 사전 검증으로 자동화하여 휴먼 에러(역마진·링크 단절)를 원천 차단하고, 확보된 리소스를 매출·전환율·객단가 데이터 분석과 CRM 리텐션 고도화에 집중 투자하고자 합니다.
        </p>
      </div>

      <div class="notice-box" style="margin-top: 12px;">
        ※ 본 포트폴리오의 『IDF E-Biz 운영 보드』에 수록된 상품 단가 및 일정은 기업 보안 준수를 위해 구성한 시뮬레이션 데이터입니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 & 경력 포트폴리오 | 박찬미</span>
      <span>PAGE 01 / 10</span>
    </div>
  </div>

  <!-- PAGE 2: 인동FN E-BIZ(자사몰) 직무 요건 1:1 매칭 & 핵심 경력 성과 -->
  <div class="portfolio-page" style="padding: 13mm 22mm 11mm 22mm;">
    <div class="page-header" style="margin-bottom: 10px; padding-bottom: 7px;">
      <span class="category">Career Highlights & JD Fit</span>
      <span class="page-num">PAGE 02 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title" style="margin-bottom: 3px; font-size: 21px;">인동FN E-BIZ(자사몰) 직무 요건 1:1 매칭 및 핵심 경력</h2>
      <p class="page-subtitle" style="margin-bottom: 8px; font-size: 12.4px; line-height: 1.45;">
        크리스챤 디올 꾸뛰르와 닐슨코리아에서 8년간 검증한 <strong>데이터 기반 매출 개선·CRM·유관부서 협업 역량</strong>과<br>
        인동FN 자사몰 운영 프로세스를 직접 구현한 <strong>『IDF E-Biz 운영 보드』</strong>로 채용 공고의 5대 핵심 업무를 완벽히 수행합니다.
      </p>

      <div style="font-size: 13px; font-weight: 800; color: #111111; margin: 0 0 5px 0;">
        📌 인동FN [E-BIZ(자사몰) 경력 채용] 담당업무 & 우대사항 1:1 매칭
      </div>

      <table class="data-table" style="margin: 0 0 9px 0; font-size: 11px; line-height: 1.4;">
        <thead>
          <tr>
            <th style="width: 34%; padding: 5px 9px;">인동FN E-BIZ(자사몰) 공고 요건</th>
            <th style="width: 66%; padding: 5px 9px;">보유 경력 성과 및 대표 프로젝트 검증 내역</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 4.5px 9px; font-weight: 700; color: #111111;">
              1. 매출·전환율·객단가 분석 및 성과 개선<br>
              <span style="font-size: 10px; color: #8C6D3B; font-weight: 700;">[우대] 데이터 기반 매출 개선 경험</span>
            </td>
            <td style="padding: 4.5px 9px;">
              • <strong style="color:#111111;">[디올 꾸뛰르]</strong> 이커머스팀과 일일 데이터 공유 및 재고 가용성·LinkPay 결제 이탈 분석을 통한 세일즈 전환 전략 제안<br>
              • <strong style="color:#111111;">[닐슨코리아]</strong> 오프라인(POS)·이커머스·소비자 패널(CPS) 결합 카테고리 매출·객단가·전환율 인사이트 도출 (6년)
            </td>
          </tr>
          <tr>
            <td style="padding: 4.5px 9px; font-weight: 700; color: #111111;">
              2. 회원·쿠폰·리텐션 등 CRM 운영 및<br>고객 경험 개선
            </td>
            <td style="padding: 4.5px 9px;">
              • <strong style="color:#111111;">[디올 꾸뛰르]</strong> Salesforce 기반 구매주기·세그먼트 타겟팅 CRM 캠페인 운영으로 <strong style="color:#8C6D3B;">Top Client 45%·전체 고객 30% 증가</strong><br>
              • <strong style="color:#111111;">[디올 꾸뛰르]</strong> 디올 성수 팝업 인앱 예약·고객 여정 설계 및 VIP 초청 행사 기획 (<strong style="color:#8C6D3B;">APAC 유일 타겟 달성</strong>)
            </td>
          </tr>
          <tr>
            <td style="padding: 4.5px 9px; font-weight: 700; color: #111111;">
              3. 물류·마케팅·디자인 등 유관부서 협업<br>및 운영 관리
            </td>
            <td style="padding: 4.5px 9px;">
              • <strong style="color:#111111;">[닐슨코리아]</strong> 부서 간 딜리버리 요청서(DRF)·구조변경서(COF) 신설 및 <strong style="color:#8C6D3B;">200p 규모 End-to-End 표준 SOP</strong> 구축<br>
              • <strong style="color:#111111;">[디올 꾸뛰르]</strong> PR·MD·이커머스·부티크 간 시즌 캠페인 에셋 및 재고 가용성 교차 검증·협업 리드
            </td>
          </tr>
          <tr>
            <td style="padding: 4.5px 9px; font-weight: 700; color: #111111;">
              4. 브랜드별 자사몰 상품 등록·진열·재고<br>및 시즌 운영 관리
            </td>
            <td style="padding: 4.5px 9px;">
              • <strong style="color:#111111;">[IDF 운영 보드]</strong> SHESMISS·LIST·SISTINA 3대 브랜드 상품 엑셀 일괄 등록 및 단품(SKU) 마스터 전수 검증 구현<br>
              • <strong style="color:#111111;">[운영 호환성]</strong> 카페24 등 자사몰 솔루션의 상품·단가·재고·상세링크(404) 표준 엑셀 구조와 즉시 호환 설계
            </td>
          </tr>
          <tr>
            <td style="padding: 4.5px 9px; font-weight: 700; color: #111111;">
              5. 프로모션·기획전·이벤트 및<br>콘텐츠 기획·운영
            </td>
            <td style="padding: 4.5px 9px;">
              • <strong style="color:#111111;">[IDF 운영 보드]</strong> 연간 프로모션 간트 로드맵, D-30 집중 관제, 쿠폰 중복/역마진 정책 검수 및 PC·모바일 배너 스튜디오 구축<br>
              • <strong style="color:#111111;">[사전 QC 자동화]</strong> 행사 1건(50 SKU) 기준 사전 검수 및 부서 소통 소요 시간 <strong style="color:#8C6D3B;">약 91% 단축 (190분 ➔ 17분)</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 13px; font-weight: 800; color: #111111; margin: 2px 0 5px 0;">
        💼 주요 경력 상세 (총 8년 4개월)
      </div>

      <div class="grid-2" style="gap: 10px; margin: 0 0 7px 0;">
        <div class="card" style="margin-bottom: 0; padding: 9px 12px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 12.2px; margin-bottom: 2px; justify-content: space-between; white-space: nowrap;">
            <span><strong style="color: #8C6D3B;">01</strong> 크리스챤 디올 꾸뛰르 코리아</span>
            <span style="font-size: 10px; color: #777777; font-weight: 600;">2021.04~2023.06 (2년 3개월)</span>
          </div>
          <div style="font-size: 10.5px; color: #8C6D3B; font-weight: 700; margin-bottom: 5px;">CSC Business Analyst & Client Marketing Analyst</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">이커머스 연계 세일즈 전략 제안</span>: 이커머스팀과 일일 데이터 공유 및 주간 미팅을 통해 재고 가용성·LinkPay 결제 이슈를 분석하고 판매 전환 전략 제안</li>
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">데이터 기반 CRM 캠페인</span>: Salesforce 기반 고객 세그먼트 타겟팅 캠페인 운영으로 <span class="highlight">Top Client 45% 증가, 전체 고객 30% 증가</span> 견인</li>
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">디올 성수 팝업 & VIP 이벤트</span>: 고객 데이터 기반 타겟 분석, 인앱 방문 예약 여정 설계 및 성과 리포팅 전담 (APAC 유일 타겟 달성)</li>
            <li style="font-size: 11px; line-height: 1.4;"><span class="highlight">글로벌 표준 리포팅 신설</span>: 성과·커미션·볼륨 리포트를 최초 기획/구축하여 APAC 센트럴팀 및 타 국가 표준 양식으로 채택</li>
          </ul>
        </div>

        <div class="card" style="margin-bottom: 0; padding: 9px 12px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 12.2px; margin-bottom: 2px; justify-content: space-between; white-space: nowrap;">
            <span><strong style="color: #8C6D3B;">02</strong> 닐슨코리아 (Nielsen Korea)</span>
            <span style="font-size: 10px; color: #777777; font-weight: 600;">2015.04~2021.04 (6년 1개월)</span>
          </div>
          <div style="font-size: 10.5px; color: #8C6D3B; font-weight: 700; margin-bottom: 5px;">Data Analyst (Global Client) & Operation (Output & RD)</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">옴니채널 매출·전환 분석</span>: POS·이커머스·소비자 패널(CPS) 데이터를 결합한 브랜드별 성과 분석 및 성장 전략 도출</li>
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">전사 협업 양식(DRF·COF) 표준화</span>: 부서 간 요청 누락과 재확인 병목을 해결하기 위해 표준 요청 양식을 신규 개발해 전사 정착</li>
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">200p 표준 매뉴얼(SOP) 구축</span>: 팀 통합 후 업무 전 과정(End-to-End)을 집대성한 200p+ 표준 가이드 제작 및 교육 전담</li>
            <li style="font-size: 11px; line-height: 1.4;"><span class="highlight">SQL 자동화 & 글로벌 어워드</span>: SQL 스크립트로 셋업률 월 30% 향상·작업 월 240분 단축 / 2020 Nielsen USA 'Thank You Award' 수상</li>
          </ul>
        </div>
      </div>

      <div class="card" style="background: #F7F4EE; border-left: 3px solid #8C6D3B; border-color: #E2D7C3; padding: 8px 13px; margin-top: 0; margin-bottom: 0;">
        <p style="font-size: 11.4px; color: #222222; font-weight: 700; line-height: 1.45;">
          <span style="color: #8C6D3B;">✦</span> 다음 페이지(03~10p)에서는 위 8년의 CRM·데이터 정합성·SOP 표준화 노하우를 인동FN 3대 브랜드 자사몰 운영 환경에 직접 이식해 구현한 대표 프로젝트 『IDF E-Biz 운영 보드』의 설계 과정과 핵심 기능을 상세히 소개합니다.
        </p>
      </div>
    </div>
    <div class="footer" style="margin-top: 6px; padding-top: 6px;">
      <span>IDF E-Biz 운영 보드 & 경력 포트폴리오 | 박찬미</span>
      <span>PAGE 02 / 10</span>
    </div>
  </div>

  <!-- PAGE 3: 시작점 (예상한 문제 6가지) -->
  <div class="portfolio-page">
    <div class="page-header" style="margin-bottom: 14px; padding-bottom: 8px;">
      <span class="category">Project Background & Problem Definition</span>
      <span class="page-num">PAGE 03 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title" style="margin-bottom: 6px; font-size: 22px;">현업에서 검증한 '정합성 검증과 협업 표준화'를 자사몰에 이식하다</h2>
      <p class="page-subtitle" style="margin-bottom: 12px; font-size: 12.6px; line-height: 1.5;">
        크리스챤 디올 꾸뛰르와 닐슨코리아에서 반복적인 확인 병목과 데이터 오류를 표준 양식(SOP)으로 해결했던 경험을 바탕으로,<br>
        인동FN 3대 브랜드(SHESMISS·LIST·SISTINA) 자사몰 프로모션 운영의 6대 핵심 리스크를 선제적으로 차단하는 솔루션을 설계했습니다.
      </p>

      <div class="card" style="margin-bottom: 10px; padding: 12px 16px; background: #FAF9F5; border: 1px solid #E8E4DA;">
        <div class="card-title" style="font-size: 14px; margin-bottom: 6px; color: #111111;">
          <span style="color: #8C6D3B; font-weight: 800;">🔍</span> 8년 실무 경험에서 출발한 자사몰 운영 문제의식
        </div>
        <ul class="bullet-list">
          <li style="margin-bottom: 5px; font-size: 12.2px; line-height: 1.48;"><span class="highlight">크리스챤 디올 꾸뛰르(Christian Dior Couture) 프로모션·이커머스 협업</span>: 백화점·부티크 행사와 시즌 캠페인을 준비하며 PR팀에 공식 노출 이미지를 요청하고, MD·이커머스팀과 상품 정보·재고 가용성을 교차 확인하는 과정이 매 시즌 반복됐습니다.</li>
          <li style="margin-bottom: 5px; font-size: 12.2px; line-height: 1.48;"><span class="highlight">닐슨코리아(Nielsen) 데이터 정합성 & SOP 표준화</span>: 필수 정보가 누락된 요청으로 인해 되묻는 메일이 오가며 리드타임이 지연되었고, 이를 표준 요청 양식(DRF·COF)과 사전 검증 체계로 해결해 재확인 오류를 획기적으로 줄였습니다.</li>
          <li style="font-size: 12.2px; line-height: 1.48;"><span class="highlight">인동FN 자사몰(IDF몰) 프로세스 적용</span>: 다브랜드 시즌 기획전과 수백 개 단품(SKU)·쿠폰·배너가 동시 운영되는 자사몰 환경에서도, 오픈 전 원천 데이터 검증과 부서 간 요청 표준화가 곧 매출 손실(역마진·고객 이탈) 방지와 직결된다고 판단했습니다.</li>
        </ul>
      </div>

      <div style="font-size: 14px; font-weight: 800; color: #111111; margin: 10px 0 8px 0;">
        📌 자사몰 프로모션 운영 시 해결하고자 한 6가지 핵심 문제
      </div>

      <div class="grid-2" style="gap: 10px; margin-bottom: 8px;">
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">1.</span> 기획서 자체의 수치 오류와 할인율 불일치
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">전달받은 기획 엑셀에 애초부터 0이 빠졌거나(예: 198,000원 ➔ 19,800원), 계산식과 다른 할인율이 기재되어 올 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">사전 QC 필요성</span>: 어드민에 옮기기 전 원천 데이터를 걸러내는 사전 점검이 필수적입니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">2.</span> 수작업 엑셀 등록의 번거로움과 입력 실수
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">수십 개 행사와 수백 개 품번을 어드민에 일일이 복사·붙여넣기하며 많은 시간과 인력이 소모됩니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">오류 가중</span>: 단순 반복 작업이 길어질수록 실무자의 피로도가 높아져 0 누락 등 입력 실수가 가중됩니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">3.</span> 상세 링크(404)와 대표 이미지 누락
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">상품 코드는 정상 등록되어 있지만, 실제 고객이 클릭할 상세 페이지 링크가 깨져 있거나(404) 썸네일이 누락될 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">고객 이탈</span>: 대표 썸네일 해상도가 깨지거나 링크가 단절되면 즉각적인 고객 이탈로 이어집니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">4.</span> 배너의 내용과 해상도 규격 불일치
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">배너 속 헤드카피나 표기 할인율(예: UP TO 50%)이 실제 진열 상품 내용과 다를 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">규격 불일치</span>: PC(1920×600)와 모바일(750×900) 규격이 달라 화면에서 깨져 보일 수 있습니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">5.</span> 다중 행사 동시 관제와 지연 파악 한계
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">수많은 브랜드 기획전이 동시 진행될 때, 오픈이 임박한 행사를 놓치기 쉽습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">공정 추적 한계</span>: D-7(소재 요청)부터 D-Day까지 어느 단계에서 딜레이가 생기는지 추적하기 어렵습니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px; background: #FAF9F5; border: 1px solid #E8E4DA;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
            <span style="color: #8C6D3B; font-weight: 800;">6.</span> 재확인 메일 작성 소모와 확인 누락
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">오류 발견 시 담당 부서별로 내용을 정리해 건건이 메일을 쓰느라 많은 시간이 낭비됩니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">요청 누락</span>: 쏟아지는 업무 메일 속에서 중요 확인 요청이 묻혀 제때 조치되지 못할 수 있습니다.</li>
          </ul>
        </div>
      </div>

      <div class="card" style="background: #F7F4EE; border-left: 3px solid #8C6D3B; border-color: #E2D7C3; padding: 11px 16px; margin-top: 6px; margin-bottom: 0;">
        <p style="font-size: 12px; color: #222222; font-weight: 700; line-height: 1.55;">
          <span style="color: #8C6D3B;">💡</span> "기준이 명확한 데이터 검증과 일정 관리는 시스템이 1차로 확인하고 정리해 줌으로써, 실무자의 소통 피로와 대형 사고 위험을 원천 차단하고자 했습니다."
        </p>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 & 경력 포트폴리오 | 박찬미</span>
      <span>PAGE 03 / 10</span>
    </div>
  </div>

  <!-- PAGE 4: 해결 방향 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">Solution & Operation Flow</span>
      <span class="page-num">PAGE 04 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">일정 등록부터 오픈 전 확인까지, 한 흐름으로 연결했습니다</h2>
      <p class="page-subtitle">
        프로모션을 등록하고, 진행 상황을 확인하고, 오픈 전에 빠진 내용을 점검하는 순서로 화면을 나눴습니다.
      </p>

      <div class="card" style="border-left: 3px solid #8C6D3B; background: #FAF9F5; border-color: #E8E4DA; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 6px; color: #111111;">
          <span style="color: #8C6D3B; font-family: 'Montserrat', sans-serif; font-weight: 800; margin-right: 6px;">STEP 01</span> 일정 등록과 진행 관제 (딜레이 지점 파악)
        </div>
        <ul class="bullet-list">
          <li><span class="highlight">연간 프로모션 일정을 쉽게 등록</span>하고, D-30 이내 오픈 임박 행사를 상단에 모아 집중 관리합니다.</li>
          <li><span class="highlight">진행 상황 & 딜레이 확인</span>: D-7부터 D-Day까지 5단계 마일스톤으로 업무가 얼마나 진행되었는지, 어디서 지연이 생기는지 실시간으로 파악합니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3px solid #8C6D3B; background: #FAF9F5; border-color: #E8E4DA; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 6px; color: #111111;">
          <span style="color: #8C6D3B; font-family: 'Montserrat', sans-serif; font-weight: 800; margin-right: 6px;">STEP 02</span> 사전 점검과 정합성 검증 (트렌드 이상치 감지)
        </div>
        <ul class="bullet-list">
          <li><span class="highlight">가격·할인율 3단 수식 검증</span>: 단순 계산 일치뿐 아니라, 카테고리/시즌 트렌드 대비 비정상적으로 튀는 숫자(이상치)를 감지해 오기입 의심 경고(WARNING)를 띄웁니다.</li>
          <li><span class="highlight">쿠폰 성격 매핑 & 중복 정책</span>: 다운로드/장바구니 쿠폰 적용 범위와 특가 상품 역마진 방지 정책을 사전 검수합니다.</li>
          <li><span class="highlight">단품·링크·이미지 전수 확인</span>: 404 데드링크와 이미지 규격을 점검하고, 표에서 바로 값을 고치면 실시간으로 재계산됩니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3px solid #8C6D3B; background: #FAF9F5; border-color: #E8E4DA; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 6px; color: #111111;">
          <span style="color: #8C6D3B; font-family: 'Montserrat', sans-serif; font-weight: 800; margin-right: 6px;">STEP 03</span> 오픈 전 미리보기 & 배너 검수
        </div>
        <ul class="bullet-list">
          <li><span class="highlight">모바일과 PC에서 상품과 배너가 어떻게 보이는지</span> 고객 화면으로 오픈 직전 최종 확인합니다.</li>
          <li>배너 문구 및 표기 할인율(예: UP TO 50%)을 시스템이 실제 상품 최고 할인율과 자동 비교 검증하고, 화면에서 육안 확인 후 즉시 문구 수정 및 승인합니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3px solid #8C6D3B; background: #FAF9F5; border-color: #E8E4DA; margin-bottom: 14px; padding: 14px 18px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 6px; color: #111111;">
          <span style="color: #8C6D3B; font-family: 'Montserrat', sans-serif; font-weight: 800; margin-right: 6px;">COLLABORATION</span> 협업 소통 & 피로도 방지 (재확인 시간 단축)
        </div>
        <ul class="bullet-list">
          <li><span class="highlight">재확인 메일 작성 시간 대폭 단축</span>: AI가 오류 유형별 맞춤 초안을 자동 작성하여 여러 번 되묻고 메일을 쓰는 시간을 줄입니다.</li>
          <li><span class="highlight">부서별 1통 취합으로 메일 피로도 감소</span>: 오류마다 건건이 메일을 쏟아내지 않고, 부서별 모든 오류를 1통의 메일(표 서식)로 깔끔하게 묶어 보냅니다.</li>
          <li><span class="highlight">소통 히스토리 기록 & Slack 리마인더</span>: 발송 내역과 조치 상태를 타임라인으로 기록하고, Slack #qc 채널로 알림을 보내 담당자가 중요한 요청을 놓치지 않게 합니다.</li>
        </ul>
      </div>

      <div class="card" style="background: #F7F4EE; border-left: 3px solid #8C6D3B; border-color: #E2D7C3; margin-bottom: 0; padding: 13px 18px;">
        <p style="font-size: 13px; color: #222222; font-weight: 700; line-height: 1.55;">
          <span style="color: #8C6D3B;">🎯</span> "오류를 찾는 데서 끝나지 않고, 누가 무엇을 확인할지 보이게 하며, 담당자의 소통 피로와 재확인 비용을 줄이는 데 집중했습니다."
        </p>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 04 / 10</span>
    </div>
  </div>

  <!-- PAGE 5: STEP 1 연간 일정 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 01 — Annual Schedule</span>
      <span class="page-num">PAGE 05 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">연간 프로모션 일정을 한곳에서 관리합니다</h2>
      <p class="page-subtitle">
        기획 엑셀을 올리면 연간 프로모션이 간트차트와 월별 카드에 자동 등록됩니다.
      </p>

      <div class="img-box compact" style="margin-bottom: 8px;">
        <img src="${img1}" alt="연간 프로모션 간트차트 로드맵">
        <div class="img-caption">▲ 연간 프로모션 간트차트 뷰 및 상단 D-30 오픈 집중 준비 관제 영역</div>
      </div>

      <div class="grid-2">
        <div class="img-box compact">
          <img src="${img2}" alt="월별 카드 뷰">
          <div class="img-caption">▲ 월별 카드 뷰 (월별 행사 목록 직관적 파악)</div>
        </div>
        <div class="img-box compact">
          <img src="${img3}" alt="브랜드 필터링">
          <div class="img-caption">▲ LIST 브랜드 전용 필터 적용 화면</div>
        </div>
      </div>

      <div class="card" style="margin-top: 14px; margin-bottom: 0; padding: 16px 20px;">
        <div class="card-title" style="font-size: 14.5px;">
          <span style="color: #8C6D3B; font-weight: 800;">📌</span> 연간 프로모션 일정 관리 핵심 기능
        </div>
        <ul class="bullet-list">
          <li><span class="highlight">엑셀 일괄 등록</span>: 복잡한 어드민 수기 입력 대신, 기획 엑셀 파일을 올리면 간트차트와 월별 카드에 한 번에 등록됩니다.</li>
          <li><span class="highlight">브랜드별 필터링</span>: SHESMISS, LIST, SISTINA 브랜드별로 일정을 좁혀 보며 브랜드 간 프로모션 간섭을 방지합니다.</li>
          <li><span class="highlight">진행 상태별 4단계 분류</span>: 행사를 <span class="highlight">오픈 집중 준비(D-30 이내)</span>, 실시간 라이브 운영, 연간 기획 편성, 게시 완료로 나눠 마감이 가까운 행사를 위에 배치합니다.</li>
          <li><span class="highlight">5단계 마일스톤 관제</span>: 행사마다 <span class="highlight">D-7 소재 요청 → D-5 기획서 수령 → D-3 배너 확정 → D-2 전수 점검 → D-Day 오픈</span>의 진행률을 체크해 딜레이 지점을 사전에 찾아냅니다.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 05 / 10</span>
    </div>
  </div>

  <!-- PAGE 6: STEP 2 오류 확인 (기획전 & 부서별 사전 점검) -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 02 — Pre-launch Promotion QC</span>
      <span class="page-num">PAGE 06 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">오류를 찾으면, 누가 무엇을 확인할지 보입니다</h2>
      <p class="page-subtitle">
        행사 전체의 핵심 지표를 요약하고, 가격·쿠폰·상품·이미지 오류를 역할별로 분류합니다.
      </p>

      <div class="img-box" style="height: 94mm; display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
        <img src="${img4}" alt="QC 센터 전체 개요" style="height: 80mm; width: 100%; object-fit: contain; margin: auto 0;">
        <div class="img-caption">▲ QC 센터 4대 KPI 요약 카드 및 부서별(MD/디자인/퍼블리셔) 사전 점검 리포트 탭</div>
      </div>

      <div class="card" style="margin-top: 22px; margin-bottom: 0; padding: 22px 24px;">
        <div class="card-title" style="font-size: 15px; margin-bottom: 14px;">
          <span style="color: #8C6D3B; font-weight: 800;">🔍</span> 사전 점검 항목 3가지 & 역할별 분기 기준
        </div>
        <ul class="bullet-list">
          <li style="margin-bottom: 14px; font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">가격과 할인율 정합성 (MD)</span>: <code style="background:#FAF8F5; border: 1px solid #E2D7C3; color: #8C6D3B; padding:2px 5px; border-radius:3px;">(정가 − 판매가) ÷ 정가</code>가 표기 할인율과 일치하는지 전수 검산합니다. 단순 계산은 맞아도 카테고리나 시즌 트렌드 대비 비정상적으로 튀는 숫자(예: 80%)는 오기입 가능성(0 누락 등)으로 경고(WARNING)를 띄워 확인을 유도합니다.
          </li>
          <li style="margin-bottom: 14px; font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">쿠폰 적용 및 중복 정책 검수 (마케팅/MD)</span>: 상품에 적용 가능한 쿠폰이 제대로 등록되었는지 확인합니다. 특히 다운로드 쿠폰, 장바구니 쿠폰 등 각 쿠폰의 성격에 맞게 등록되었는지 점검하고, 중복 적용 허용 범위와 쿠폰 제외 상품의 역마진 방지 정책을 검수합니다.
          </li>
          <li style="font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">상품과 이미지 규격 (디자인/퍼블리셔)</span>: 상품 번호 유효성, 승인 여부, 상세 링크(404 데드링크), 대표 썸네일 이미지 해상도 및 엑스박스 여부를 전수 점검합니다.
          </li>
        </ul>
      </div>

      <div class="notice-box" style="margin-top: 20px; padding: 13px 18px; font-size: 12.5px;">
        ※ 확인하는 부서와 역할은 실제 인동FN의 조직도가 아니라, 이 프로젝트에서 설정한 가상의 협업 역할(MD, 디자인, 퍼블리셔 등)입니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 06 / 10</span>
    </div>
  </div>

  <!-- PAGE 7: 상품 단위 점검 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 02 — SKU Master Table & Inline QC</span>
      <span class="page-num">PAGE 07 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">행사 전체에서 상품 하나까지 확인합니다</h2>
      <p class="page-subtitle">
        상품 번호(SKU)별로 가격, 할인율, 링크, 이미지를 하나씩 점검합니다.
      </p>

      <div class="img-box" style="height: 94mm; display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
        <img src="${img6}" alt="단품 SKU 마스터 전수 검증 테이블" style="height: 80mm; width: 100%; object-fit: contain; margin: auto 0;">
        <div class="img-caption">▲ SKU 마스터 테이블: 3단 수식 검증, 트렌드 이상치 경고, 인라인 즉시 수정 및 엑셀 다운로드</div>
      </div>

      <div class="card" style="margin-top: 22px; margin-bottom: 0; padding: 22px 24px;">
        <div class="card-title" style="font-size: 15px; margin-bottom: 14px;">
          <span style="color: #8C6D3B; font-weight: 800;">📌</span> 단품 전수 점검 핵심 기능 & 운영 효율화
        </div>
        <ul class="bullet-list">
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">오류 상품 필터</span>: 문제가 있는 상품(BLOCKER / WARNING)만 모아 긴급 조치 대상을 우선적으로 파악합니다.</li>
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">인라인 즉시 수정 & 실시간 재계산</span>: 어드민 화면으로 돌아갈 필요 없이, 점검 테이블에서 잘못된 값을 바로 고치면(예: 판매가 19,800원 ➔ 198,000원) 즉시 재계산되어 정상(PASS) 상태로 전환됩니다.</li>
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">엑셀(.xlsx) 내려받기</span>: 점검 결과 및 정정된 품번 리스트를 엑셀 파일로 바로 내려받아 유관 부서 및 외부 협력사와 간편하게 공유할 수 있습니다.</li>
          <li style="font-size: 13.5px; line-height: 1.7;"><span class="highlight">품번별 원클릭 확인 요청</span>: 각 행 우측의 [확인 요청] 버튼을 누르면 해당 부서(MD, 디자인) 메일 초안 팝업이 바로 연결되어 메일 작성 시간을 대폭 줄입니다.</li>
        </ul>
      </div>

      <div class="notice-box" style="margin-top: 20px; padding: 13px 18px; font-size: 12.5px;">
        💡 잘못된 수치를 어드민에 다시 들어가지 않고 점검 화면 표에서 바로 고칠 수 있어, 사소한 수치 정정으로 인한 왕복 소통 시간을 최소화했습니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 07 / 10</span>
    </div>
  </div>

  <!-- PAGE 8: 확인 요청 & 소통 히스토리 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">Collaboration & Communication History</span>
      <span class="page-num">PAGE 08 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">점검한 내용을 담당자에게 보내기 쉽게 정리합니다</h2>
      <p class="page-subtitle">
        오류 유형별 AI 메일 초안, 1통 취합 발송, 타임라인 히스토리와 Slack 리마인더로 소통 누락을 방지합니다.
      </p>

      <div class="grid-2" style="margin-bottom: 6px;">
        <div class="img-box compact" style="margin: 2px 0;">
          <img src="${img5}" alt="AI 2분할 듀얼 메일 모달" style="max-height: 48mm; width: 100%; object-fit: contain;">
          <div class="img-caption">▲ AI 2분할 듀얼 메일 (가격: MD / 이미지: 디자인)</div>
        </div>
        <div class="img-box compact" style="margin: 2px 0;">
          <img src="${img9}" alt="부서별 1통 취합 메일" style="max-height: 48mm; width: 100%; object-fit: contain;">
          <div class="img-caption">▲ 부서별 오류를 표 하나로 묶은 1통 취합 메일</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 6px;">
        <div class="img-box compact" style="margin: 2px 0;">
          <img src="${img11}" alt="소통 & 타임라인 히스토리 모달" style="max-height: 48mm; width: 100%; object-fit: contain;">
          <div class="img-caption">▲ 소통 & 타임라인 히스토리 (발송 메일 및 조치 내역 기록)</div>
        </div>
        <div class="img-box compact" style="margin: 2px 0;">
          <img src="${img10}" alt="Slack #qc 실시간 웹훅" style="max-height: 48mm; width: 100%; object-fit: contain;">
          <div class="img-caption">▲ Slack #qc 채널 웹훅 점검 요약 & 리마인더 브리핑</div>
        </div>
      </div>

      <div class="card" style="margin-top: 6px; margin-bottom: 0; padding: 12px 16px;">
        <ul class="bullet-list">
          <li style="margin-bottom: 6px; font-size: 12.2px; line-height: 1.5;"><span class="highlight">AI 2분할 듀얼 메일</span>: 오류 유형에 따라 MD(가격), 디자인(이미지) 등 담당 역할별로 요청 내용을 나눕니다. 한 상품에 여러 문제가 있으면 양쪽 초안을 나란히 보여 줍니다. 메일은 자동 발송되지 않고 실무자가 확인한 뒤에 보냅니다.</li>
          <li style="margin-bottom: 6px; font-size: 12.2px; line-height: 1.5;"><span class="highlight">부서별 1통 취합 메일과 리포트</span>: 수많은 개별 메일로 인한 업무 피로도를 방지하기 위해, 부서별 모든 오류 품번을 표 하나로 묶어 정리한 취합 메일과 리포트를 생성합니다.</li>
          <li style="margin-bottom: 6px; font-size: 12.2px; line-height: 1.5;"><span class="highlight">소통 타임라인 & 히스토리 관리</span>: 발송된 메일, 업무 요청 내용, 담당자 처리 상태(조치 완료/보류)를 시간순 타임라인으로 기록하여 여러 번 되묻지 않고 진행 현황을 파악합니다.</li>
          <li style="font-size: 12.2px; line-height: 1.5;"><span class="highlight">Slack 웹훅 연동 & 리마인더 기능</span>: #qc 채널에 점검 요약(BLOCKER/WARNING 건수, 마감 시한)을 전송합니다. <span class="highlight">특히 바쁜 업무 중 쏟아지는 이메일 사이에서 담당자가 중요한 요청을 놓치지 않도록 리마인더 역할을 수행</span>하여 즉각적인 확인을 돕습니다.</li>
        </ul>
      </div>

      <div class="notice-box" style="margin-top: 8px; padding: 8px 12px; font-size: 11.5px;">
        ※ 행사와 상품 정보, 확인 역할, 메일 및 히스토리 내용은 모두 시연용 가상 데이터입니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 08 / 10</span>
    </div>
  </div>

  <!-- PAGE 9: STEP 3 전시 미리보기 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 03 — Live Storefront Preview</span>
      <span class="page-num">PAGE 09 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">오픈 전에 실제 고객 화면을 미리 봅니다</h2>
      <p class="page-subtitle">
        아이폰, 갤럭시, PC 화면으로 바꿔 가며 행사와 상품이 어떻게 보이는지 확인합니다.
      </p>

      <div class="grid-2">
        <div class="img-box" style="height: 102mm; display: flex; flex-direction: column; justify-content: space-between;">
          <img src="${img7}" alt="모바일 뷰어 프리뷰" style="height: 88mm; width: 100%; object-fit: contain; margin: auto 0;">
          <div class="img-caption">▲ 모바일(375px) 실시간 고객 전시 화면 뷰어</div>
        </div>
        <div class="img-box" style="height: 102mm; display: flex; flex-direction: column; justify-content: space-between;">
          <img src="${img8}" alt="데스크톱 PC 뷰어 프리뷰" style="height: 88mm; width: 100%; object-fit: contain; margin: auto 0;">
          <div class="img-caption">▲ PC 와이드 화면 뷰어 및 1920×600 배너 스튜디오</div>
        </div>
      </div>

      <div class="card" style="margin-top: 14px; margin-bottom: 0; padding: 18px 22px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 12px;">
          <span style="color: #8C6D3B; font-weight: 800;">📌</span> 고객 화면 및 배너 최종 크로스 체크 포인트
        </div>
        <ul class="bullet-list">
          <li style="margin-bottom: 10px; font-size: 13px; line-height: 1.65;"><span class="highlight">디바이스별 화면 반응형 검증</span>: 아이폰, 갤럭시, PC 화면으로 전환하며 모바일 배너와 상품 진열 그리드가 깨지거나 잘리지 않는지 확인합니다.</li>
          <li style="margin-bottom: 10px; font-size: 13px; line-height: 1.65;"><span class="highlight">배너 스튜디오 (카피 합성 및 규격 다운로드)</span>: 메인 제목, 서브 문구, 할인율 뱃지를 배너 이미지에 직접 합성해 보고 PC(1920×600), 모바일(750×900) 규격으로 즉시 내려받을 수 있습니다.</li>
          <li style="margin-bottom: 10px; font-size: 13px; line-height: 1.65;"><span class="highlight">배너 문구 & 할인율 일치 확인 (자동 비교 + 육안 확인)</span>: 배너 표기 할인율(예: UP TO 50%)이 실제 상품들의 최고 할인율과 맞는지 시스템이 1차 자동 비교 검증하고, 화면에서 육안으로 확인하며 틀린 곳은 바로 문구를 수정하고 승인 처리합니다.</li>
          <li style="font-size: 13px; line-height: 1.65;"><span class="highlight">고객 화면 내 결함 경고 표시</span>: 가격 불일치, 할인율 이상치, 미승인 상품, 404 링크는 고객 화면 미리보기에도 시각적 경고 뱃지로 표시되어 오픈 직전 마지막으로 걸러냅니다.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 09 / 10</span>
    </div>
  </div>

  <!-- PAGE 10: 마무리 & E-BIZ 경력직 기여 계획 -->
  <div class="portfolio-page" style="padding: 13mm 22mm 11mm 22mm;">
    <div class="page-header" style="margin-bottom: 10px; padding-bottom: 7px;">
      <span class="category">Impact & Post-Hire Roadmap</span>
      <span class="page-num">PAGE 10 / 10</span>
    </div>
    <div class="content-area">
      <h2 class="page-title" style="font-size: 20.5px; margin-bottom: 3px;">운영 리드타임 91% 단축 및 입사 후 기여 계획</h2>
      <p class="page-subtitle" style="font-size: 12px; margin-bottom: 8px; line-height: 1.4;">
        단순 반복 검수를 자동화하여 확보한 시간으로, 자사몰 매출·전환율 개선과 CRM 고도화에 집중합니다.
      </p>

      <div class="grid-2" style="gap: 10px; margin: 0 0 7px 0;">
        <div class="card" style="margin-bottom: 0; padding: 9px 13px;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 4px;">
            <span style="color: #8C6D3B; font-weight: 800;">👤</span> 프로젝트 설계 및 구현 범위 (100% 단독 수행)
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 2px; font-size: 11px; line-height: 1.38;"><span class="highlight">문제 정의</span>: 디올·닐슨 8년 실무 경험에서 도출한 프로모션·소통 병목 분석</li>
            <li style="margin-bottom: 2px; font-size: 11px; line-height: 1.38;"><span class="highlight">운영 설계</span>: 연간 일정 관제(STEP 1) ➔ 3단 QC(STEP 2) ➔ 프리뷰(STEP 3)</li>
            <li style="margin-bottom: 2px; font-size: 11px; line-height: 1.38;"><span class="highlight">검증 규칙</span>: 가격 수식, 트렌드 이상치 경고, 쿠폰 중복·역마진 방지, 404/이미지</li>
            <li style="margin-bottom: 2px; font-size: 11px; line-height: 1.38;"><span class="highlight">협업 표준화</span>: MD/디자인/퍼블리셔 역할별 AI 분할·1통 취합 및 Slack 연동</li>
            <li style="font-size: 11px; line-height: 1.38;"><span class="highlight">AI-Native 구현</span>: 비즈니스 로직·UI/UX 직접 설계 및 Google Antigravity 구현</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 9px 13px;">
          <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 4px;">
            <span style="color: #8C6D3B; font-weight: 800;">📌</span> 실무 확장성 및 운영 기준 (카페24 등 호환 설계)
          </div>
          <ul class="bullet-list">
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">솔루션 호환성</span>: 카페24(Cafe24) 등 표준 이커머스 어드민의 상품·기획전 엑셀 일괄 업로드/다운로드 스키마와 즉시 호환되도록 데이터 구조를 설계했습니다.</li>
            <li style="margin-bottom: 3px; font-size: 11px; line-height: 1.4;"><span class="highlight">Human-in-the-Loop</span>: 사전 점검은 정밀한 규칙(Rule-based)으로 동작하며, 이상치 경고와 AI 메일 초안은 실무자가 최종 확인 후 발송하도록 안전망을 두었습니다.</li>
            <li style="font-size: 11px; line-height: 1.4;">※ 본 시연 버전은 10월 15일 기준 가상 프로모션 데이터로 동작합니다.</li>
          </ul>
        </div>
      </div>

      <!-- 소요 시간 절감 표 -->
      <div class="card" style="margin-top: 0; margin-bottom: 7px; padding: 9px 13px;">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
          <span style="font-size: 13px;">⏱️ 소요 시간 절감 효과 추론 (행사 1건 기준)</span>
          <span style="font-size: 10px; font-weight: normal; color: #888888;">※ 인동FN 시즌 기획전 규모(약 50 SKU) 실무 시나리오 기반 추론치</span>
        </div>
        <table class="data-table" style="margin: 3px 0; font-size: 11px;">
          <thead>
            <tr>
              <th style="padding: 4px 8px; width: 28%;">업무 단계</th>
              <th style="padding: 4px 8px; width: 26%;">기존 수작업 방식</th>
              <th style="padding: 4px 8px; width: 26%;">운영 보드 활용 시</th>
              <th style="padding: 4px 8px; width: 20%;">절감 효과</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 4px 8px;">프로모션 및 상품 등록</td>
              <td style="padding: 4px 8px;">어드민 복사·붙여넣기<br><span style="font-size: 10px; color: #777777;">(약 60분)</span></td>
              <td style="padding: 4px 8px;">엑셀 일괄 자동 등록<br><span style="font-size: 10px; color: #777777;">(약 2분)</span></td>
              <td style="padding: 4px 8px;"><span style="color: #8C6D3B; font-weight: 700;">약 58분 단축<br><span style="font-size: 10px;">(96%↓)</span></span></td>
            </tr>
            <tr>
              <td style="padding: 4px 8px;">가격·쿠폰·단품 전수 점검</td>
              <td style="padding: 4px 8px;">수식 대조 & 링크 클릭<br><span style="font-size: 10px; color: #777777;">(약 90분)</span></td>
              <td style="padding: 4px 8px;">자동 검증 & 인라인 수정<br><span style="font-size: 10px; color: #777777;">(약 10분)</span></td>
              <td style="padding: 4px 8px;"><span style="color: #8C6D3B; font-weight: 700;">약 80분 단축<br><span style="font-size: 10px;">(88%↓)</span></span></td>
            </tr>
            <tr>
              <td style="padding: 4px 8px;">부서별 확인 요청 & 공유</td>
              <td style="padding: 4px 8px;">오류 취합 & 개별 작성<br><span style="font-size: 10px; color: #777777;">(약 40분)</span></td>
              <td style="padding: 4px 8px;">AI 분할 & 취합 리포트<br><span style="font-size: 10px; color: #777777;">(약 5분)</span></td>
              <td style="padding: 4px 8px;"><span style="color: #8C6D3B; font-weight: 700;">약 35분 단축<br><span style="font-size: 10px;">(87%↓)</span></span></td>
            </tr>
            <tr class="total-row">
              <td style="padding: 5px 8px; font-weight: 800;">합계</td>
              <td style="padding: 5px 8px;"><strong>약 3시간 10분<br><span style="font-size: 10px; font-weight: normal; color: #666666;">(190분)</span></strong></td>
              <td style="padding: 5px 8px;"><strong>약 17분<br><span style="font-size: 10px; font-weight: normal; color: #666666;">(17분)</span></strong></td>
              <td style="padding: 5px 8px;"><strong><span style="color: #8C6D3B; font-weight: 800;">약 91% 절감<br><span style="font-size: 10px;">(173분 단축)</span></span></strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 인동FN E-BIZ(자사몰) 경력직 입사 후 3대 기여 계획 -->
      <div class="card" style="border-left: 3px solid #8C6D3B; background: #FAF9F5; border-color: #E8E4DA; margin-top: 0; margin-bottom: 7px; padding: 10px 14px;">
        <div class="card-title" style="color: #111111; font-size: 13px; margin-bottom: 5px;">
          <span style="color: #8C6D3B; font-weight: 800;">🚀</span> 인동FN E-BIZ(자사몰) 경력직 입사 후 3대 기여 계획
        </div>
        <div style="font-size: 11.2px; color: #222222; line-height: 1.48;">
          <div style="margin-bottom: 4px;"><strong style="color: #8C6D3B;">① 무결점 시즌·프로모션 운영 & 유관부서 SOP 표준화</strong>: SHESMISS·LIST·SISTINA 브랜드별 시즌 상품 등록·진열·기획전 오픈 전 과정을 체계화하고, MD·디자인·마케팅·물류 간 요청 양식을 표준화해 오기재 0건과 리드타임 단축을 실현하겠습니다.</div>
          <div style="margin-bottom: 4px;"><strong style="color: #8C6D3B;">② 데이터 기반 매출·전환율·객단가 개선</strong>: 닐슨과 디올에서 검증한 퍼널 분석 역량으로 기획전 유입 ➔ 상세페이지 조회 ➔ 장바구니 ➔ 결제 전환 지표를 상시 트래킹하고, 진열 순서·배너 카피·세트 구성을 기민하게 최적화하겠습니다.</div>
          <div><strong style="color: #8C6D3B;">③ 회원·쿠폰·리텐션 CRM 고도화</strong>: 디올 상위 고객 비중 45% 확대 경험을 바탕으로, IDF몰 회원 등급·구매 주기·시즌별 이탈 방지 시나리오와 쿠폰 수익성(역마진 방지) 정합성을 정교하게 관리하여 자사몰 충성 고객의 LTV를 극대화하겠습니다.</div>
        </div>
      </div>

      <!-- 하단 기술 스택 및 라이브 데모 -->
      <div class="card" style="background: #FAF9F5; border: 1px solid #E8E4DA; margin-bottom: 0; padding: 6px 13px;">
        <div style="font-size: 10.8px; color: #444444; line-height: 1.5;">
          <div><strong style="color: #111111;">기술 스택:</strong> Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, SheetJS, Slack Webhook</div>
          <div style="margin-top: 2px;"><strong style="color: #111111;">라이브 데모:</strong> <a href="https://idf-theta.vercel.app/" target="_blank" class="btn-link">https://idf-theta.vercel.app/</a></div>
        </div>
      </div>
    </div>
    <div class="footer" style="margin-top: 6px; padding-top: 6px;">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 10 / 10</span>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, '../public/portfolio_presentation.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('portfolio_presentation.html updated with embedded Base64 images.');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    protocolTimeout: 300000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 0 });
  await new Promise(r => setTimeout(r, 2000));

  // Verify page overflow for all 10 pages
  const pageMeasurements = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.portfolio-page'));
    return pages.map((p, idx) => ({
      pageNum: idx + 1,
      clientHeight: p.clientHeight,
      scrollHeight: p.scrollHeight,
      overflow: p.scrollHeight - p.clientHeight,
      isOverflowing: p.scrollHeight > p.clientHeight
    }));
  });

  console.log('--- Page Measurements (A4 297mm check) ---');
  console.table(pageMeasurements);

  const hasOverflow = pageMeasurements.some(m => m.isOverflowing);
  if (hasOverflow) {
    console.error('WARNING: Some pages are overflowing! Adjust padding or image sizes.');
  } else {
    console.log('SUCCESS: All 10 pages fit perfectly with 0px overflow!');
  }

  // Take screenshots of each page to verify visually
  const pagesList = await page.$$('.portfolio-page');
  for (let i = 0; i < pagesList.length; i++) {
    await pagesList[i].screenshot({ path: path.join(__dirname, `../public/page_previews/page_${i + 1}.png`) });
  }
  console.log('Saved all 10 page previews to public/page_previews/');

  const pdfPath = path.join(__dirname, '../IDF_포트폴리오_박찬미.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    timeout: 0,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
  });

  console.log('PDF rendered successfully to:', pdfPath);

  await browser.close();
})();

