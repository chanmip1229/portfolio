import { Brand } from '@/types/promotion';

export interface BannerRenderOptions {
  brand: Brand;
  copyTitle: string;
  copySubtitle: string;
  discountBadgeText: string;
  periodText: string; // 예: 2026.03.10 - 03.17
  width: number;
  height: number;
  bgImageUrl?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  verticalPosition?: 'top' | 'middle' | 'bottom';
  horizontalAlign?: 'left' | 'center' | 'right';
}

const BRAND_THEMES: Record<
  Brand,
  {
    logoText: string;
    primaryColor: string;
    badgeBg: string;
    fontFamily: string;
    overlayGradient: string;
  }
> = {
  SHESMISS: {
    logoText: 'SHESMISS',
    primaryColor: '#ffffff',
    badgeBg: '#1e293b', // slate-800
    fontFamily: 'serif, "Playfair Display", -apple-system',
    overlayGradient: 'rgba(15, 23, 42, 0.55)',
  },
  LIST: {
    logoText: 'LIST',
    primaryColor: '#ffffff',
    badgeBg: '#1e3a8a', // blue-900
    fontFamily: '"Montserrat", "Pretendard", sans-serif',
    overlayGradient: 'rgba(15, 23, 42, 0.45)',
  },
  SISTINA: {
    logoText: 'SISTINA',
    primaryColor: '#ffffff',
    badgeBg: '#78350f', // amber-900
    fontFamily: '"Pretendard", sans-serif',
    overlayGradient: 'rgba(30, 27, 75, 0.5)',
  },
};

/**
 * HTML5 Canvas를 이용해 PC/MO 배너를 고해상도로 합성 렌더링하고 Data URL(PNG) 반환
 */
export async function renderBannerToDataUrl(options: BannerRenderOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const theme = BRAND_THEMES[options.brand];
  const isMobile = options.height > options.width; // 750x900 등 세로형인 경우

  // 1. 배경 이미지 로드 또는 감성 그라데이션 폴백
  if (options.bgImageUrl) {
    try {
      const img = await loadImage(options.bgImageUrl);
      // Cover 비율로 그리기
      drawImageCover(ctx, img, 0, 0, options.width, options.height);
    } catch {
      drawFallbackGradient(ctx, options);
    }
  } else {
    drawFallbackGradient(ctx, options);
  }

  // 2. 가독성을 위한 어두운 오버레이 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, isMobile ? 0 : options.width, options.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, options.width, options.height);

  // 상/하 위치 옵션 계산
  const vPos = options.verticalPosition || 'middle';
  let centerY = isMobile ? options.height * 0.42 : options.height * 0.48;
  if (vPos === 'top') {
    centerY = isMobile ? options.height * 0.30 : options.height * 0.34;
  } else if (vPos === 'bottom') {
    centerY = isMobile ? options.height * 0.56 : options.height * 0.60;
  }

  // 좌/우 정렬 옵션 계산
  const hAlign = options.horizontalAlign || 'center';
  let centerX = options.width / 2;
  let canvasTextAlign: CanvasTextAlign = 'center';
  if (hAlign === 'left') {
    centerX = options.width * 0.12;
    canvasTextAlign = 'left';
  } else if (hAlign === 'right') {
    centerX = options.width * 0.88;
    canvasTextAlign = 'right';
  }

  // 3. 상단 브랜드 로고
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isMobile ? 24 : 20}px ${theme.fontFamily}`;
  ctx.letterSpacing = '4px';
  ctx.textAlign = canvasTextAlign;
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(theme.logoText, centerX, isMobile ? 60 : 40);
  ctx.restore();

  // 4. 메인 카피 타이틀
  ctx.save();
  ctx.fillStyle = '#ffffff';
  const titleFontSize = isMobile ? 48 : 52;
  ctx.font = `900 ${titleFontSize}px "Pretendard", -apple-system, sans-serif`;
  ctx.textAlign = canvasTextAlign;
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;

  wrapText(ctx, options.copyTitle, centerX, centerY, options.width * 0.82, titleFontSize * 1.25);
  ctx.restore();

  // 5. 서브 카피
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  const subFontSize = isMobile ? 22 : 20;
  ctx.font = `500 ${subFontSize}px "Pretendard", sans-serif`;
  ctx.textAlign = canvasTextAlign;
  ctx.textBaseline = 'middle';
  const subY = centerY + (isMobile ? 70 : 60);
  ctx.fillText(options.copySubtitle, centerX, subY);
  ctx.restore();

  // 6. 할인율 뱃지 (Highlight Badge)
  if (options.discountBadgeText) {
    ctx.save();
    const badgeText = options.discountBadgeText;
    ctx.font = `bold ${isMobile ? 26 : 24}px "Pretendard", sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const badgePadX = 24;
    const badgeH = isMobile ? 52 : 46;
    const badgeW = textWidth + badgePadX * 2;
    let badgeX = (options.width - badgeW) / 2;
    let badgeTextX = options.width / 2;
    if (hAlign === 'left') {
      badgeX = centerX;
      badgeTextX = centerX + badgeW / 2;
    } else if (hAlign === 'right') {
      badgeX = centerX - badgeW;
      badgeTextX = centerX - badgeW / 2;
    }
    const badgeY = subY + (isMobile ? 50 : 45);

    // 뱃지 배경 (원형 모서리)
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill();

    // 뱃지 텍스트
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeTextX, badgeY + badgeH / 2);
    ctx.restore();
  }

  // 7. 하단 행사 기간 텍스트
  if (options.periodText) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = `400 ${isMobile ? 18 : 16}px "Pretendard", sans-serif`;
    ctx.textAlign = canvasTextAlign;
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.periodText, centerX, options.height - (isMobile ? 50 : 30));
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

/**
 * 텍스트 줄바꿈 렌더링 헬퍼
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), x, startY + i * lineHeight);
  }
}

/**
 * 이미지 로드 비동기 헬퍼
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 이미지 Cover 비율 그리기
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > canvasRatio) {
    sWidth = img.height * canvasRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / canvasRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * 폴백 감성 그라데이션 배경
 */
function drawFallbackGradient(ctx: CanvasRenderingContext2D, options: BannerRenderOptions) {
  const gradient = ctx.createLinearGradient(0, 0, options.width, options.height);
  if (options.brand === 'SHESMISS') {
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
  } else if (options.brand === 'LIST') {
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#172554');
  } else {
    gradient.addColorStop(0, '#78350f');
    gradient.addColorStop(1, '#451a03');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, options.width, options.height);
}
