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

  // 1. Step 1: Default Gantt View
  console.log('Capturing 01_step1_gantt.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_step1_gantt.png') });

  // 2. Step 1: Monthly Cards View
  console.log('Switching to Monthly Cards...');
  await clickButtonText('월별 카드 뷰');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_step1_monthly_cards.png') });

  // 3. Step 1: Filter LIST brand
  console.log('Filtering LIST...');
  await clickButtonText('LIST');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_step1_brand_filter.png') });

  // Switch back to All brands and Gantt
  await clickButtonText('통합 뷰');

  // 4. Switch to Step 2 QC Center
  console.log('Switching to STEP 02 QC Center...');
  await clickButtonText('정합성 통합 검증');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_step2_qc_overview.png') });

  // 5. Open Dual Mail Modal
  console.log('Opening Dual Mail Modal in Step 2...');
  const openedDual = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dualBtn = btns.find(b => b.innerText && (b.innerText.includes('초안') || b.innerText.includes('수정 요청') || b.innerText.includes('메일')));
    if (dualBtn) {
      dualBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1200));
  if (openedDual) {
    console.log('Capturing 05_step2_dual_mail_modal.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_step2_dual_mail_modal.png') });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));
  }

  // 6. Subtab 2: Single item SKU QC
  console.log('Clicking SKU QC subtab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const target = tabs.find(t => t.innerText && (t.innerText.includes('단품') || t.innerText.includes('SKU')));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturing 06_step2_sku_table.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_step2_sku_table.png') });

  // 7. Switch to Step 3 Live Preview
  console.log('Switching to STEP 03 Live Preview...');
  await clickButtonText('최종 전시 프리뷰');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_step3_mobile_preview.png') });

  // 8. Toggle desktop device view in Step 3
  console.log('Checking desktop toggle in Step 3...');
  const desktopToggled = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pcBtn = btns.find(b => b.innerText && (b.innerText.includes('PC') || b.innerText.includes('데스크톱') || b.innerText.includes('Desktop')));
    if (pcBtn) {
      pcBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1200));
  if (desktopToggled) {
    console.log('Capturing 08_step3_desktop_preview.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_step3_desktop_preview.png') });
  }

  // 9. Open Common: Grouped Mail Modal (임시보관함)
  console.log('Opening Grouped Mail Modal...');
  await clickButtonText('임시보관함');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_common_grouped_mail.png') });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // 10. Open Common: Slack Webhook Modal
  console.log('Opening Slack Modal...');
  await clickButtonText('Slack');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_common_slack_webhook.png') });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // 11. Open History / Communication Modal
  console.log('Opening History Modal if exists...');
  const openedHistory = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const histBtn = btns.find(b => b.innerText && (b.innerText.includes('히스토리') || b.innerText.includes('발송 이력') || b.innerText.includes('소통 이력')));
    if (histBtn) {
      histBtn.click();
      return true;
    }
    return false;
  });
  if (openedHistory) {
    await new Promise(r => setTimeout(r, 1000));
    console.log('Capturing 11_common_history_modal.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_common_history_modal.png') });
    await page.keyboard.press('Escape');
  }

  console.log('All 11 screenshots re-captured successfully with newest design system!');
  await browser.close();
}

captureAll().catch(err => {
  console.error('Error during recapture:', err);
  process.exit(1);
});
