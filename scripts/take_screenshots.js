const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAll() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  console.log('Navigating to live app...');
  await page.goto('https://idf-theta.vercel.app/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Helper to click by button text
  async function clickButtonText(text) {
    const clicked = await page.evaluate((t) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.innerText.includes(t));
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, text);
    await new Promise(r => setTimeout(r, 1000));
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
  await clickButtonText('LIST (6)');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_step1_brand_filter.png') });

  // 4. Switch to Step 2
  console.log('Switching to STEP 02 QC Center...');
  await clickButtonText('STEP 02');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_step2_qc_overview.png') });

  // Subtab 1: Dual mail popup
  console.log('Opening Dual Mail Modal in Step 2...');
  const openedDual = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dualBtn = btns.find(b => b.innerText.includes('듀얼') || b.innerText.includes('메일') || b.innerText.includes('초안'));
    if (dualBtn) {
      dualBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));
  if (openedDual) {
    console.log('Capturing 05_step2_dual_mail_modal.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_step2_dual_mail_modal.png') });
    // Close modal (Escape or click close button)
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));
  }

  // Subtab 2: Single item SKU QC
  console.log('Clicking SKU QC subtab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const target = tabs.find(t => t.innerText.includes('단품') || t.innerText.includes('SKU'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturing 06_step2_sku_table.png...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_step2_sku_table.png') });

  // 5. Switch to Step 3
  console.log('Switching to STEP 03 Live Preview...');
  await clickButtonText('STEP 03');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_step3_mobile_preview.png') });

  // Toggle desktop device view if available
  console.log('Checking desktop toggle in Step 3...');
  const desktopToggled = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pcBtn = btns.find(b => b.innerText.includes('PC') || b.innerText.includes('데스크톱') || b.innerText.includes('Desktop'));
    if (pcBtn) {
      pcBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));
  if (desktopToggled) {
    console.log('Capturing 08_step3_desktop_preview.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_step3_desktop_preview.png') });
  }

  // 6. Open Common: Grouped Mail Modal (임시보관함)
  console.log('Opening Grouped Mail Modal...');
  await clickButtonText('임시보관함');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_common_grouped_mail.png') });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // 7. Open Common: Slack Webhook Modal
  console.log('Opening Slack Modal...');
  await clickButtonText('Slack');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_common_slack_webhook.png') });
  await page.keyboard.press('Escape');

  console.log('All screenshots captured successfully!');
  await browser.close();
}

captureAll().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
