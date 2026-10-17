const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const fs = require('fs');
  const os = require('os');
  const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-pdf-'));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${tmpUserDataDir}`,
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const filePath = path.join(__dirname, '../public/portfolio_presentation.html');
  const htmlContent = fs.readFileSync(filePath, 'utf-8');

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 0 });
    await new Promise(r => setTimeout(r, 2000));

    const pdfPath = path.join(__dirname, '../IDF_포트폴리오_박찬미.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      timeout: 0,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });

    console.log('PDF successfully generated at:', pdfPath);
  } finally {
    await browser.close();
    try {
      fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
