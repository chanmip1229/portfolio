const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-preview-'));
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${tmpDir}`
    ]
  });

  const outDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // 1. Desktop Capture
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    await pageDesktop.screenshot({ path: path.join(outDir, 'idf_design_desktop_main.png') });
    console.log('Saved idf_design_desktop_main.png');

    // 2. Mobile Capture (iPhone 14/15 Pro: 393 x 852)
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    await pageMobile.screenshot({ path: path.join(outDir, 'idf_design_mobile_main.png') });
    console.log('Saved idf_design_mobile_main.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
