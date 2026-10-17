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
      border-bottom: 2px solid #111111;
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
      letter-spacing: 0.08em;
    }
    .page-header .page-num {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
    }
    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
      line-height: 1.35;
    }
    .page-subtitle {
      font-size: 13.5px;
      color: #4b5563;
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
      border-top: 1px solid #f3f4f6;
      padding-top: 10px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9ca3af;
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
      background: #eef2ff;
      color: #4338ca;
      font-size: 13.5px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      margin-bottom: 22px;
      align-self: flex-start;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.25;
      color: #111827;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
    }
    .cover-subtitle {
      font-size: 21px;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }
    .cover-desc {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 26px;
    }
    .meta-table th, .meta-table td {
      padding: 14px 16px;
      text-align: left;
      font-size: 13.5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .meta-table th {
      background: #f9fafb;
      color: #374151;
      font-weight: 700;
      width: 22%;
    }
    .meta-table td {
      color: #1f2937;
    }
    .btn-link {
      color: #4f46e5;
      font-weight: 700;
      text-decoration: underline;
    }

    /* Common Card Styles */
    .card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #111827;
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
      color: #374151;
      line-height: 1.65;
    }
    .bullet-list li:last-child {
      margin-bottom: 0;
    }
    .bullet-list li::before {
      content: '•';
      position: absolute;
      left: 2px;
      color: #4f46e5;
      font-weight: bold;
      font-size: 15px;
    }
    .highlight {
      font-weight: 700;
      color: #111827;
    }

    /* Images */
    .img-box {
      width: 100%;
      margin: 8px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      background: #f8fafc;
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
      color: #6b7280;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
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
      padding: 9px 12px;
      border: 1px solid #e5e7eb;
      text-align: left;
    }
    .data-table th {
      background: #f3f4f6;
      font-weight: 700;
      color: #374151;
    }
    .data-table tr.total-row {
      background: #eef2ff;
      font-weight: 800;
      color: #312e81;
    }

    .notice-box {
      font-size: 12px;
      color: #6b7280;
      background: #f9fafb;
      border: 1px dashed #d1d5db;
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
      <span class="cover-tag">E-Commerce Promotion Operations Tool</span>
      <h1 class="cover-title">IDF E-Biz 운영 보드</h1>
      <div class="cover-subtitle">인동FN 자사몰 프로모션 일정·점검 도구</div>
      <p class="cover-desc">
        인동FN 자사몰을 가정해, 프로모션 일정을 등록하고 진행 상황을 관리하며<br>
        오픈 전에 가격·이미지·링크·배너를 점검하는 도구를 만들었습니다.<br>
        반복해서 되묻고 다시 확인하는 데 드는 시간과 노력을 줄이고 싶었습니다.
      </p>

      <table class="meta-table">
        <tr>
          <th>프로젝트 구분</th>
          <td>개인 실무 기획 프로젝트 (인동FN 자사몰 가정 시연용 가상 데이터)</td>
        </tr>
        <tr>
          <th>담당 역할</th>
          <td>
            <strong>기획 및 운영 프로세스 설계 100% (단독 수행)</strong><br>
            • 실무 문제 정의 (디올·닐슨 경험 기반 커뮤니케이션 및 확인 병목 도출)<br>
            • 연간 일정 관제 및 오픈 전 3단계 무결점 점검 파이프라인 설계<br>
            • 점검 기준(수식 검증, 트렌드 이상치, 쿠폰 중복, 데드링크, 규격) 및 부서별 협업 체계 수립
          </td>
        </tr>
        <tr>
          <th>구현 방식</th>
          <td>Google Antigravity 바이브코딩 (Next.js 16 App Router, TypeScript, Tailwind CSS, Zustand)</td>
        </tr>
        <tr>
          <th>라이브 시연 링크</th>
          <td><a href="https://idf-theta.vercel.app/" target="_blank" class="btn-link">https://idf-theta.vercel.app/</a></td>
        </tr>
      </table>

      <div class="card" style="background: #f8fafc; border-left: 4px solid #4f46e5; margin-top: 14px; padding: 18px 22px;">
        <div class="card-title" style="color: #4338ca; font-size: 15px;">💡 기획 핵심 가치: "도구는 찾고 정리하고, 판단과 결정은 사람이 한다"</div>
        <p style="font-size: 13.5px; color: #4b5563; line-height: 1.65;">
          반복 확인과 데이터 누락은 실무자의 집중력을 떨어뜨리고 피로도를 가중시킵니다. 시스템이 룰 기반으로 정합성을 1차 자동 검증하고, 사람은 예외 사항 검토와 최종 승인에 집중하는 협업 체계를 구현하고자 했습니다.
        </p>
      </div>

      <div class="notice-box" style="margin-top: 18px;">
        ※ 본 프로젝트는 시연용 가상 데이터가 포함된 개인 프로젝트이며, 실제 인동FN 임직원 정보나 운영 데이터를 사용하지 않았습니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 01 / 09</span>
    </div>
  </div>

  <!-- PAGE 2: 시작점 (예상한 문제 6가지) -->
  <div class="portfolio-page">
    <div class="page-header" style="margin-bottom: 14px; padding-bottom: 8px;">
      <span class="category">Background & Problem Definition</span>
      <span class="page-num">PAGE 02 / 09</span>
    </div>
    <div class="content-area">
      <h2 class="page-title" style="margin-bottom: 6px; font-size: 22px;">되묻고 다시 확인하는 일이 가장 오래 걸렸습니다</h2>
      <p class="page-subtitle" style="margin-bottom: 12px; font-size: 13px; line-height: 1.5;">
        이 프로젝트는 특정 회사의 실제 시스템을 재현한 것이 아닙니다.<br>
        이전 업무에서 반복해서 겪은 확인 과정을 바탕으로, 이커머스 운영 프로세스를 가정해 만든 프로젝트입니다.
      </p>

      <div class="card" style="margin-bottom: 10px; padding: 12px 16px;">
        <div class="card-title" style="font-size: 14px; margin-bottom: 6px;">🔍 이전 업무 경험에서 출발한 문제의식</div>
        <ul class="bullet-list">
          <li style="margin-bottom: 5px; font-size: 12.3px; line-height: 1.48;"><span class="highlight">디올(Dior) 코스메틱 EDM·이벤트</span>: 백화점 행사와 프로모션을 준비하며 PR팀에 공식 노출 사진을 요청하고, MD팀에 상품 정보와 이미지를 받아 다시 확인하는 일이 시즌마다 반복됐습니다.</li>
          <li style="margin-bottom: 5px; font-size: 12.3px; line-height: 1.48;"><span class="highlight">닐슨(Nielsen) 데이터 딜리버리</span>: 필수 정보가 빠진 요청 때문에 되묻는 메일이 자주 오가며 업무가 지연되는 경우가 많았습니다.</li>
          <li style="font-size: 12.3px; line-height: 1.48;"><span class="highlight">인동FN 가상 적용</span>: 이커머스 현업 경험은 없지만, 인동FN 자사몰 관련 업무를 한다고 생각했을 때 이와 유사한 확인 과정을 겪을 수 있다고 가정했습니다.</li>
        </ul>
      </div>

      <div style="font-size: 14px; font-weight: 800; color: #111827; margin: 10px 0 8px 0;">
        📌 이커머스 프로모션 운영 시 예상한 6가지 핵심 문제
      </div>

      <div class="grid-2" style="gap: 10px; margin-bottom: 8px;">
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">1. 기획서 자체의 수치 오류와 할인율 불일치</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">전달받은 기획 엑셀에 애초부터 0이 빠졌거나(예: 198,000원 ➔ 19,800원), 계산식과 다른 할인율이 기재되어 올 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">사전 QC 필요성</span>: 어드민에 옮기기 전 원천 데이터를 걸러내는 사전 점검이 필수적입니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">2. 수작업 엑셀 등록의 번거로움과 입력 실수</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">수십 개 행사와 수백 개 품번을 어드민에 일일이 복사·붙여넣기하며 많은 시간과 인력이 소모됩니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">오류 가중</span>: 단순 반복 작업이 길어질수록 실무자의 피로도가 높아져 0 누락 등 입력 실수가 가중됩니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">3. 상세 링크(404)와 대표 이미지 누락</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">상품 코드는 정상 등록되어 있지만, 실제 고객이 클릭할 상세 페이지 링크가 깨져 있거나(404) 썸네일이 누락될 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">고객 이탈</span>: 대표 썸네일 해상도가 깨지거나 링크가 단절되면 즉각적인 고객 이탈로 이어집니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">4. 배너의 내용과 해상도 규격 불일치</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">배너 속 헤드카피나 표기 할인율(예: UP TO 50%)이 실제 진열 상품 내용과 다를 수 있습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">규격 불일치</span>: PC(1920×600)와 모바일(750×900) 규격이 달라 화면에서 깨져 보일 수 있습니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">5. 다중 행사 동시 관제와 지연 파악 한계</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">수많은 브랜드 기획전이 동시 진행될 때, 오픈이 임박한 행사를 놓치기 쉽습니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">공정 추적 한계</span>: D-7(소재 요청)부터 D-Day까지 어느 단계에서 딜레이가 생기는지 추적하기 어렵습니다.</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 11px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13px; margin-bottom: 5px;">6. 재확인 메일 작성 소모와 확인 누락</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.8px; line-height: 1.45;">오류 발견 시 담당 부서별로 내용을 정리해 건건이 메일을 쓰느라 많은 시간이 낭비됩니다.</li>
            <li style="font-size: 11.8px; line-height: 1.45;"><span class="highlight">요청 누락</span>: 쏟아지는 업무 메일 속에서 중요 확인 요청이 묻혀 제때 조치되지 못할 수 있습니다.</li>
          </ul>
        </div>
      </div>

      <div class="card" style="background: #eef2ff; border-left: 4px solid #4f46e5; border-color: #c7d2fe; padding: 11px 16px; margin-top: 6px; margin-bottom: 0;">
        <p style="font-size: 12px; color: #312e81; font-weight: 700; line-height: 1.5;">
          💡 "기준이 명확한 데이터 검증과 일정 관리는 시스템이 1차로 확인하고 정리해 줌으로써, 실무자의 소통 피로와 대형 사고 위험을 원천 차단하고자 했습니다."
        </p>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 02 / 09</span>
    </div>
  </div>

  <!-- PAGE 3: 해결 방향 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">Solution & Operation Flow</span>
      <span class="page-num">PAGE 03 / 09</span>
    </div>
    <div class="content-area">
      <h2 class="page-title">일정 등록부터 오픈 전 확인까지, 한 흐름으로 연결했습니다</h2>
      <p class="page-subtitle">
        프로모션을 등록하고, 진행 상황을 확인하고, 오픈 전에 빠진 내용을 점검하는 순서로 화면을 나눴습니다.
      </p>

      <div class="card" style="border-left: 4px solid #4f46e5; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 6px;">STEP 01. 일정 등록과 진행 관제 (딜레이 지점 파악)</div>
        <ul class="bullet-list">
          <li><span class="highlight">연간 프로모션 일정을 쉽게 등록</span>하고, D-30 이내 오픈 임박 행사를 상단에 모아 집중 관리합니다.</li>
          <li><span class="highlight">진행 상황 & 딜레이 확인</span>: D-7부터 D-Day까지 5단계 마일스톤으로 업무가 얼마나 진행되었는지, 어디서 지연이 생기는지 실시간으로 파악합니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 4px solid #0284c7; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="color: #0369a1; font-size: 14.5px; margin-bottom: 6px;">STEP 02. 사전 점검과 정합성 검증 (트렌드 이상치 감지)</div>
        <ul class="bullet-list">
          <li><span class="highlight">가격·할인율 3단 수식 검증</span>: 단순 계산 일치뿐 아니라, 카테고리/시즌 트렌드 대비 비정상적으로 튀는 숫자(이상치)를 감지해 오기입 의심 경고(WARNING)를 띄웁니다.</li>
          <li><span class="highlight">쿠폰 성격 매핑 & 중복 정책</span>: 다운로드/장바구니 쿠폰 적용 범위와 특가 상품 역마진 방지 정책을 사전 검수합니다.</li>
          <li><span class="highlight">단품·링크·이미지 전수 확인</span>: 404 데드링크와 이미지 규격을 점검하고, 표에서 바로 값을 고치면 실시간으로 재계산됩니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 4px solid #10b981; margin-bottom: 12px; padding: 14px 18px;">
        <div class="card-title" style="color: #047857; font-size: 14.5px; margin-bottom: 6px;">STEP 03. 오픈 전 미리보기 & 배너 검수</div>
        <ul class="bullet-list">
          <li><span class="highlight">모바일과 PC에서 상품과 배너가 어떻게 보이는지</span> 고객 화면으로 오픈 직전 최종 확인합니다.</li>
          <li>배너 문구 및 표기 할인율(예: UP TO 50%)을 시스템이 실제 상품 최고 할인율과 자동 비교 검증하고, 화면에서 육안 확인 후 즉시 문구 수정 및 승인합니다.</li>
        </ul>
      </div>

      <div class="card" style="border-left: 4px solid #8b5cf6; margin-bottom: 14px; padding: 14px 18px; background: #faf5ff;">
        <div class="card-title" style="color: #6d28d9; font-size: 14.5px; margin-bottom: 6px;">협업 소통 & 피로도 방지 (재확인 시간 단축 및 누락 방지)</div>
        <ul class="bullet-list">
          <li><span class="highlight">재확인 메일 작성 시간 대폭 단축</span>: AI가 오류 유형별 맞춤 초안을 자동 작성하여 여러 번 되묻고 메일을 쓰는 시간을 줄입니다.</li>
          <li><span class="highlight">부서별 1통 취합으로 메일 피로도 감소</span>: 오류마다 건건이 메일을 쏟아내지 않고, 부서별 모든 오류를 1통의 메일(표 서식)로 깔끔하게 묶어 보냅니다.</li>
          <li><span class="highlight">소통 히스토리 기록 & Slack 리마인더</span>: 발송 내역과 조치 상태를 타임라인으로 기록하고, Slack #qc 채널로 알림을 보내 담당자가 중요한 요청을 놓치지 않게 합니다.</li>
        </ul>
      </div>

      <div class="card" style="background: #eef2ff; border-color: #c7d2fe; margin-bottom: 0; padding: 13px 18px;">
        <p style="font-size: 13px; color: #312e81; font-weight: 700; line-height: 1.55;">
          🎯 "오류를 찾는 데서 끝나지 않고, 누가 무엇을 확인할지 보이게 하며, 담당자의 소통 피로와 재확인 비용을 줄이는 데 집중했습니다."
        </p>
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 03 / 09</span>
    </div>
  </div>

  <!-- PAGE 4: STEP 1 연간 일정 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 01 — Annual Schedule</span>
      <span class="page-num">PAGE 04 / 09</span>
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
        <div class="card-title" style="font-size: 14.5px;">📌 연간 프로모션 일정 관리 핵심 기능</div>
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
      <span>PAGE 04 / 09</span>
    </div>
  </div>

  <!-- PAGE 5: STEP 2 오류 확인 (기획전 & 부서별 사전 점검) -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 02 — Pre-launch Promotion QC</span>
      <span class="page-num">PAGE 05 / 09</span>
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

      <!-- 위쪽으로 쏠린 느낌 없도록 한줄~두줄 정도(22px) 간격과 넉넉한 내부 패딩 적용 -->
      <div class="card" style="margin-top: 22px; margin-bottom: 0; padding: 22px 24px;">
        <div class="card-title" style="font-size: 15px; margin-bottom: 14px;">🔍 사전 점검 항목 3가지 & 역할별 분기 기준</div>
        <ul class="bullet-list">
          <li style="margin-bottom: 14px; font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">가격과 할인율 정합성 (MD)</span>: <code style="background:#e5e7eb; padding:2px 5px; border-radius:3px;">(정가 − 판매가) ÷ 정가</code>가 표기 할인율과 일치하는지 전수 검산합니다. 단순 계산은 맞아도 카테고리나 시즌 트렌드 대비 비정상적으로 튀는 숫자(예: 80%)는 오기입 가능성(0 누락 등)으로 경고(WARNING)를 띄워 확인을 유도합니다.
          </li>
          <li style="margin-bottom: 14px; font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">쿠폰 적용 및 중복 정책 검수 (마케팅/MD)</span>: 상품에 적용 가능한 쿠폰이 제대로 등록되었는지 확인합니다. 특히 다운로드 쿠폰, 장바구니 쿠폰 등 각 쿠폰의 성격에 맞게 등록되었는지 점검하고, 중복 적용 허용 범위와 쿠폰 제외 상품의 역마진 방지 정책을 검수합니다.
          </li>
          <li style="font-size: 13.5px; line-height: 1.7;">
            <span class="highlight">상품과 이미지 규격 (디자인/퍼블리셔)</span>: 상품 번호 유효성, 승인 여부, 상세 링크(404 데드링크), 대표 썸네일 이미지 해상도 및 엑스박스 여부를 전수 점검합니다.
          </li>
        </ul>
      </div>

      <!-- 위쪽으로 쏠린 느낌 없도록 한줄~두줄 정도(20px) 간격 확보 -->
      <div class="notice-box" style="margin-top: 20px; padding: 13px 18px; font-size: 12.5px;">
        ※ 확인하는 부서와 역할은 실제 인동FN의 조직도가 아니라, 이 프로젝트에서 설정한 가상의 협업 역할(MD, 디자인, 퍼블리셔 등)입니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 05 / 09</span>
    </div>
  </div>

  <!-- PAGE 6: 상품 단위 점검 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 02 — SKU Master Table & Inline QC</span>
      <span class="page-num">PAGE 06 / 09</span>
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

      <!-- 위쪽으로 쏠린 느낌 없도록 한줄~두줄 정도(22px) 간격과 넉넉한 내부 패딩 적용 -->
      <div class="card" style="margin-top: 22px; margin-bottom: 0; padding: 22px 24px;">
        <div class="card-title" style="font-size: 15px; margin-bottom: 14px;">📌 단품 전수 점검 핵심 기능 & 운영 효율화</div>
        <ul class="bullet-list">
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">오류 상품 필터</span>: 문제가 있는 상품(BLOCKER / WARNING)만 모아 긴급 조치 대상을 우선적으로 파악합니다.</li>
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">인라인 즉시 수정 & 실시간 재계산</span>: 어드민 화면으로 돌아갈 필요 없이, 점검 테이블에서 잘못된 값을 바로 고치면(예: 판매가 19,800원 ➔ 198,000원) 즉시 재계산되어 정상(초록색)으로 전환됩니다.</li>
          <li style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;"><span class="highlight">엑셀(.xlsx) 내려받기</span>: 점검 결과 및 정정된 품번 리스트를 엑셀 파일로 바로 내려받아 유관 부서 및 외부 협력사와 간편하게 공유할 수 있습니다.</li>
          <li style="font-size: 13.5px; line-height: 1.7;"><span class="highlight">품번별 원클릭 확인 요청</span>: 각 행 우측의 [확인 요청] 버튼을 누르면 해당 부서(MD, 디자인) 메일 초안 팝업이 바로 연결되어 메일 작성 시간을 대폭 줄입니다.</li>
        </ul>
      </div>

      <!-- 위쪽으로 쏠린 느낌 없도록 한줄~두줄 정도(20px) 간격 확보 -->
      <div class="notice-box" style="margin-top: 20px; padding: 13px 18px; font-size: 12.5px;">
        💡 잘못된 수치를 어드민에 다시 들어가지 않고 점검 화면 표에서 바로 고칠 수 있어, 사소한 수치 정정으로 인한 왕복 소통 시간을 최소화했습니다.
      </div>
    </div>
    <div class="footer">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 06 / 09</span>
    </div>
  </div>

  <!-- PAGE 7: 확인 요청 & 소통 히스토리 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">Collaboration & Communication History</span>
      <span class="page-num">PAGE 07 / 09</span>
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
      <span>PAGE 07 / 09</span>
    </div>
  </div>

  <!-- PAGE 8: STEP 3 전시 미리보기 -->
  <div class="portfolio-page">
    <div class="page-header">
      <span class="category">STEP 03 — Live Storefront Preview</span>
      <span class="page-num">PAGE 08 / 09</span>
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
        <div class="card-title" style="font-size: 14.5px; margin-bottom: 12px;">📌 고객 화면 및 배너 최종 크로스 체크 포인트</div>
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
      <span>PAGE 08 / 09</span>
    </div>
  </div>

  <!-- PAGE 9: 마무리 & 포부 -->
  <div class="portfolio-page" style="padding: 14mm 22mm 12mm 22mm;">
    <div class="page-header" style="margin-bottom: 12px; padding-bottom: 8px;">
      <span class="category">Reflection & Aspirations</span>
      <span class="page-num">PAGE 09 / 09</span>
    </div>
    <div class="content-area">
      <h2 class="page-title" style="font-size: 21px; margin-bottom: 4px;">프로젝트를 마치며</h2>
      <p class="page-subtitle" style="font-size: 12.5px; margin-bottom: 10px; line-height: 1.45;">
        반복되는 확인 업무를 줄이고 업무 퀄리티를 높이기 위해 고민하고 구현한 과정의 기록입니다.
      </p>

      <div class="grid-2" style="gap: 10px; margin: 0 0 8px 0;">
        <div class="card" style="margin-bottom: 0; padding: 10px 14px;">
          <div class="card-title" style="color: #4338ca; font-size: 13.5px; margin-bottom: 4px;">👤 제가 한 일</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 3px; font-size: 11.5px; line-height: 1.4;"><span class="highlight">문제 정의</span>: 디올·닐슨 경험에서 출발한 업무 병목 분석</li>
            <li style="margin-bottom: 3px; font-size: 11.5px; line-height: 1.4;"><span class="highlight">운영 흐름 설계</span>: 일정 관리와 오픈 전 3단계 점검 흐름 수립</li>
            <li style="margin-bottom: 3px; font-size: 11.5px; line-height: 1.4;"><span class="highlight">점검 기준 정하기</span>: 가격 계산식, 트렌드 이상치 경고, 쿠폰 중복/역마진 방지, 링크/이미지 규격</li>
            <li style="margin-bottom: 3px; font-size: 11.5px; line-height: 1.4;"><span class="highlight">확인 요청 체계</span>: MD, 디자인 등 역할별 분할 및 취합 메일 기획</li>
            <li style="font-size: 11.5px; line-height: 1.4;"><span class="highlight">구현 방식</span>: Google Antigravity 바이브코딩 (직접 코딩 미수행)</li>
          </ul>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 10px 14px;">
          <div class="card-title" style="color: #d97706; font-size: 13.5px; margin-bottom: 4px;">⚠️ 프로젝트의 한계</div>
          <ul class="bullet-list">
            <li style="margin-bottom: 4px; font-size: 11.5px; line-height: 1.45;">실제 인동FN 시스템과 연동되어 있지 않으며, 데이터와 점검 기준, 업무 프로세스, 확인 요청 부서는 가정한 것입니다.</li>
            <li style="margin-bottom: 4px; font-size: 11.5px; line-height: 1.45;">사전 점검은 정해진 규칙(Rule-based)으로 동작하며, AI는 메일 초안 작성에만 사용하였습니다.</li>
            <li style="font-size: 11.5px; line-height: 1.45;">시연 날짜 또한 10월 15일로 고정하여 구성하였습니다.</li>
          </ul>
        </div>
      </div>

      <!-- 소요 시간 절감 표: 전체소요시간합계 -> 합계 한줄 표기, 괄호 부분은 줄바꿈 처리 -->
      <div class="card" style="margin-top: 0; margin-bottom: 8px; padding: 10px 14px;">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
          <span style="font-size: 13.5px;">⏱️ 소요 시간 절감 효과 추론 (행사 1건 기준)</span>
          <span style="font-size: 10.5px; font-weight: normal; color: #6b7280;">※ 실제 측정값이 아닌, 인동FN 행사 규모(약 50 SKU) 가상 시나리오 기반 추론치</span>
        </div>
        <table class="data-table" style="margin: 4px 0; font-size: 11.5px;">
          <thead>
            <tr>
              <th style="padding: 5px 8px; width: 28%;">업무 단계</th>
              <th style="padding: 5px 8px; width: 26%;">기존 수작업 방식</th>
              <th style="padding: 5px 8px; width: 26%;">운영 보드 활용 시</th>
              <th style="padding: 5px 8px; width: 20%;">절감 효과</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 5px 8px;">프로모션 및 상품 등록</td>
              <td style="padding: 5px 8px;">어드민 복사·붙여넣기<br><span style="font-size: 10.5px; color: #6b7280;">(약 60분)</span></td>
              <td style="padding: 5px 8px;">엑셀 일괄 자동 등록<br><span style="font-size: 10.5px; color: #6b7280;">(약 2분)</span></td>
              <td style="padding: 5px 8px;"><span style="color: #dc2626; font-weight: 700;">약 58분 단축<br><span style="font-size: 10.5px;">(96%↓)</span></span></td>
            </tr>
            <tr>
              <td style="padding: 5px 8px;">가격·쿠폰·단품 전수 점검</td>
              <td style="padding: 5px 8px;">수식 대조 & 링크 클릭<br><span style="font-size: 10.5px; color: #6b7280;">(약 90분)</span></td>
              <td style="padding: 5px 8px;">자동 검증 & 인라인 수정<br><span style="font-size: 10.5px; color: #6b7280;">(약 10분)</span></td>
              <td style="padding: 5px 8px;"><span style="color: #dc2626; font-weight: 700;">약 80분 단축<br><span style="font-size: 10.5px;">(88%↓)</span></span></td>
            </tr>
            <tr>
              <td style="padding: 5px 8px;">부서별 확인 요청 & 공유</td>
              <td style="padding: 5px 8px;">오류 취합 & 개별 작성<br><span style="font-size: 10.5px; color: #6b7280;">(약 40분)</span></td>
              <td style="padding: 5px 8px;">AI 분할 & 취합 리포트<br><span style="font-size: 10.5px; color: #6b7280;">(약 5분)</span></td>
              <td style="padding: 5px 8px;"><span style="color: #dc2626; font-weight: 700;">약 35분 단축<br><span style="font-size: 10.5px;">(87%↓)</span></span></td>
            </tr>
            <tr class="total-row">
              <td style="padding: 6px 8px; font-weight: 800;">합계</td>
              <td style="padding: 6px 8px;"><strong>약 3시간 10분<br><span style="font-size: 10.5px; font-weight: normal; color: #4338ca;">(190분)</span></strong></td>
              <td style="padding: 6px 8px;"><strong>약 17분<br><span style="font-size: 10.5px; font-weight: normal; color: #4338ca;">(17분)</span></strong></td>
              <td style="padding: 6px 8px;"><strong><span style="color: #dc2626; font-weight: 800;">약 91% 절감<br><span style="font-size: 10.5px;">(173분 단축)</span></span></strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 만들면서 생각한 것 & 입사 후 포부: 잘림 없이 100% 온전하게 노출 -->
      <div class="card" style="border-left: 4px solid #4f46e5; margin-top: 0; margin-bottom: 8px; padding: 11px 15px;">
        <div class="card-title" style="color: #4338ca; font-size: 13.5px; margin-bottom: 5px;">💬 만들면서 생각한 것 & 입사 후 포부</div>
        <p style="font-size: 11.5px; color: #374151; line-height: 1.5; margin-bottom: 6px;">
          "찾고 정리하는 일은 도구가 하고, 판단과 결정은 사람이 한다." 같은 확인을 반복하느라 드는 시간과 실수가 가장 힘들었던 경험에서 출발했습니다. 트렌드 대비 튀는 숫자는 오류로 단정 짓지 않고 경고로 보여주며, 메일도 사람이 확인한 뒤 발송하도록 설계했습니다. 또한 소통 히스토리 기록과 Slack 리마인더로 바쁜 업무 속에서도 메일과 요청을 놓치지 않도록 안전망을 만들었습니다.
        </p>
        <p style="font-size: 11.5px; color: #1e3a8a; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 10px; border-radius: 4px; line-height: 1.5;">
          <strong>🎯 입사 후 기대:</strong> 단순 반복 확인 시간을 줄여 프로모션 기획 분석과 고객 경험 개선 등 본질적인 업무에 더 집중할 수 있습니다. 인동FN에 입사하게 된다면 이처럼 반복 업무의 비효율을 적극 발굴하고, 팀원들의 실질적인 업무 부담을 덜어주는 맞춤형 운영 도구와 표준 프로세스를 구축하여 비즈니스 성장에 기여하겠습니다.
        </p>
      </div>

      <div class="card" style="background: #f8fafc; margin-bottom: 0; padding: 6px 12px;">
        <div style="font-size: 11px; color: #4b5563; line-height: 1.45;">
          <strong>기술 스택:</strong> Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, SheetJS, Slack Webhook · <strong>라이브 데모:</strong> <a href="https://idf-theta.vercel.app/" target="_blank" class="btn-link">https://idf-theta.vercel.app/</a>
        </div>
      </div>
    </div>
    <div class="footer" style="margin-top: 8px; padding-top: 8px;">
      <span>IDF E-Biz 운영 보드 포트폴리오</span>
      <span>PAGE 09 / 09</span>
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 0 });
  await new Promise(r => setTimeout(r, 2000));

  // Verify page overflow for all 9 pages
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
    console.log('SUCCESS: All 9 pages fit perfectly with 0px overflow!');
  }

  // Take screenshots of each page to verify visually
  const pagesList = await page.$$('.portfolio-page');
  for (let i = 0; i < pagesList.length; i++) {
    await pagesList[i].screenshot({ path: path.join(__dirname, `../public/page_previews/page_${i + 1}.png`) });
  }
  console.log('Saved all 9 page previews to public/page_previews/');

  // Also save specific previews for quick inspection
  await pagesList[4].screenshot({ path: path.join(__dirname, '../public/page5_preview.png') });
  await pagesList[8].screenshot({ path: path.join(__dirname, '../public/page9_preview.png') });

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
