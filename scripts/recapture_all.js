const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OUTPUT_DIR = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAll() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    userDataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-recapture-')),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  console.log('Navigating to local production app (http://localhost:3000)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Helper to click button by text
  async function clickButtonText(text) {
    const clicked = await page.evaluate((t) => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const target = btns.find(b => b.innerText && b.innerText.includes(t));
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, text);
    await new Promise(r => setTimeout(r, 1200));
    return clicked;
  }

  // Collapse the top intro briefing banner and AnnualScheduleView guide box so screenshots focus cleanly on the actual workspace UI
  await clickButtonText('소개 접기');
  await clickButtonText('프로모션 상태 분류 기준');
  await new Promise(r => setTimeout(r, 500));

  // 1. Step 1: Default Gantt View (scroll so D-30 & Gantt bars are centered)
  await page.evaluate(() => window.scrollTo({ top: 520, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));
  console.log('Capturing 01_step1_gantt.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_step1_gantt.png') });

  // 2. Step 1: Monthly Cards View
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  console.log('Switching to Monthly Cards...');
  await clickButtonText('월별 카드 뷰');
  await page.evaluate(() => window.scrollTo({ top: 580, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_step1_monthly_cards.png') });

  // 3. Step 1: Filter LIST brand
  console.log('Filtering LIST...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const listBtn = btns.find(b => b.innerText && b.innerText.trim() === 'LIST');
    if (listBtn) listBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_step1_brand_filter.png') });

  // Reset brand filter to ALL ('전체 브랜드 보기' or '전체')
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const allBtn = btns.find(b => b.innerText && (b.innerText.includes('전체 브랜드') || b.innerText.trim() === '전체'));
    if (allBtn) allBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  // 4. Switch to Step 2 QC Center
  console.log('Switching to STEP 02 QC Center...');
  await clickButtonText('정합성 통합 검증');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturing 04_step2_qc_overview.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_step2_qc_overview.png') });

  // 5. Open History / Communication Modal while in Step 2 Campaign QC
  console.log('Opening History Modal in Step 2...');
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));
  const openedHistory = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const histSpan = spans.find(el => el.innerText && el.innerText.trim() === '전사 소통 & 메일 히스토리');
    if (histSpan) {
      histSpan.click();
      return true;
    }
    return false;
  });
  console.log('Opened History Modal:', openedHistory);
  if (openedHistory) {
    await new Promise(r => setTimeout(r, 1200));
    console.log('Capturing 11_common_history_modal.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_common_history_modal.png') });
    // Close History Modal by clicking its close button or Escape
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.innerText && b.innerText.includes('창 닫기'));
      if (closeBtn) closeBtn.click();
    });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));
  }

  // 6. Subtab 2: Single item SKU QC
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  console.log('Clicking SKU QC subtab...');
  const clickedSubTab = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const target = tabs.find(t => t.innerText && t.innerText.includes('단품(SKU) 마스터 전수 QC'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  console.log('Clicked SKU QC subtab:', clickedSubTab);
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => window.scrollTo({ top: 280, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 600));
  console.log('Capturing 06_step2_sku_table.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_step2_sku_table.png') });

  // 7. Open EmailDraftModal via Header '임시보관함' button
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  console.log('Opening EmailDraftModal via 임시보관함...');
  const openedDraftModal = await clickButtonText('임시보관함');
  console.log('Opened EmailDraftModal:', openedDraftModal);
  if (openedDraftModal) {
    await new Promise(r => setTimeout(r, 800));
    // 7a. Switch to '부서별 종합 취합' for 09_common_grouped_mail.png
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sumBtn = btns.find(b => b.innerText && b.innerText.includes('부서별 종합 취합'));
      if (sumBtn) sumBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Capturing 09_common_grouped_mail.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_common_grouped_mail.png') });

    // 7b. Switch to '건별 개별 초안' and select SWBLPB21010 for 2-column Dual Mail (05_step2_dual_mail_modal.png)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const indBtn = btns.find(b => b.innerText && b.innerText.includes('건별 개별 초안'));
      if (indBtn) indBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const dualItem = btns.find(b => b.innerText && (b.innerText.includes('SWBLPB21010') || b.innerText.includes('복수부서')));
      if (dualItem) dualItem.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Capturing 05_step2_dual_mail_modal.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_step2_dual_mail_modal.png') });

    // Close EmailDraftModal
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));
  }

  // 8. Switch to Step 3 Live Preview
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  console.log('Switching to STEP 03 Live Preview...');
  await clickButtonText('최종 전시 프리뷰');
  await new Promise(r => setTimeout(r, 1200));

  // Capture 08_step3_desktop_preview.png (Banner Studio 1920x600 & Preview)
  await page.evaluate(() => window.scrollTo({ top: 140, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 800));
  console.log('Capturing 08_step3_desktop_preview.png (Banner Studio)...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_step3_desktop_preview.png') });

  // Scroll down to Mobile Live Preview (375px phone frame) for 07_step3_mobile_preview.png
  await page.evaluate(() => {
    window.scrollTo({ top: 760, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturing 07_step3_mobile_preview.png (Mobile 375px viewer)...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_step3_mobile_preview.png') });

  // 9. Open Common: Slack Webhook Modal
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));
  console.log('Opening Slack Modal...');
  await clickButtonText('Slack');
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturing 10_common_slack_webhook.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_common_slack_webhook.png') });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  console.log('All 11 screenshots re-captured successfully with newest design system!');
  await browser.close();
}

captureAll().catch(err => {
  console.error('Error during recapture:', err);
  process.exit(1);
});
