const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const filePath = path.join(__dirname, '../public/portfolio_presentation.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle2' });

  const pdfPath = path.join(__dirname, '../IDF_포트폴리오_박찬미.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  console.log('PDF successfully generated at:', pdfPath);
  await browser.close();
})();
