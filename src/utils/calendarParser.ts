import { Brand, Department, Milestone, Promotion } from '@/types/promotion';
import * as XLSX from 'xlsx';

/**
 * 시작일(YYYY-MM-DD)로부터 N일 전 날짜 문자열 계산 (YYYY-MM-DD)
 */
export function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * 시작일 기준 자동 마일스톤 생성 (D-7, D-5, D-2, D-1, D-Day)
 */
export function generateMilestones(startDate: string): Milestone[] {
  return [
    {
      code: 'D_MINUS_7',
      label: 'MD팀 대상 상품 확정 엑셀 요청',
      targetDate: subtractDays(startDate, 7),
      department: 'MD',
      isCompleted: false,
    },
    {
      code: 'D_MINUS_5',
      label: '디자인팀 배너 소재/키비주얼 요청',
      targetDate: subtractDays(startDate, 5),
      department: 'DESIGN',
      isCompleted: false,
    },
    {
      code: 'D_MINUS_2',
      label: '자료 회신 확인 및 배너 자동 합성',
      targetDate: subtractDays(startDate, 2),
      department: 'EBIZ_OPS',
      isCompleted: false,
    },
    {
      code: 'D_MINUS_1',
      label: '사전 QC 룰 검증 및 최종 컨펌',
      targetDate: subtractDays(startDate, 1),
      department: 'EBIZ_OPS',
      isCompleted: false,
    },
    {
      code: 'D_DAY',
      label: '프로모션 오픈 및 라이브 모니터링',
      targetDate: startDate,
      department: 'EBIZ_OPS',
      isCompleted: false,
    },
  ];
}

/**
 * 업로드된 엑셀/CSV 워크북 파싱하여 프로모션 배열 생성
 */
export interface ExcelRow {
  brand?: string;
  브랜드?: string;
  title?: string;
  행사명?: string;
  startDate?: string;
  시작일?: string;
  endDate?: string;
  종료일?: string;
  discountRate?: number | string;
  할인율?: number | string;
  category?: string;
  카테고리?: string;
}

export function parseExcelCalendar(fileBuffer: ArrayBuffer): Promotion[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const promotions: Promotion[] = rawRows.map((row, index) => {
    // 필드 매핑 (한글/영문 지원)
    const rawBrand = (row['브랜드'] || row['brand'] || 'LIST').toUpperCase();
    let brand: Brand = 'LIST';
    if (rawBrand.includes('SHES') || rawBrand.includes('쉬즈')) brand = 'SHESMISS';
    else if (rawBrand.includes('SIS') || rawBrand.includes('시스')) brand = 'SISTINA';

    const title = String(row['행사명'] || row['title'] || `프로모션 #${index + 1}`).trim();
    const startDate = String(row['시작일'] || row['startDate'] || '2026-03-10').trim();
    const endDate = String(row['종료일'] || row['endDate'] || '2026-03-17').trim();
    const rawDiscount = row['할인율'] || row['discountRate'] || 40;
    const targetDiscountRate = Number(String(rawDiscount).replace('%', '')) || 40;
    const category = String(row['카테고리'] || row['category'] || '전품목').trim();

    const id = `promo-${Date.now()}-${index}`;

    return {
      id,
      brand,
      title,
      startDate,
      endDate,
      targetDiscountRate,
      allowCoupon: true, // 기본값: 쿠폰 허용
      status: 'PLANNING',
      currentBottleneckDept: 'MD',
      category,
      timestamps: {
        plannedAt: nowStr,
      },
      milestones: generateMilestones(startDate),
      banner: {
        copyTitle: title,
        copySubtitle: `${brand} 2026 SEASON SPECIAL`,
        discountBadgeText: `UP TO ${targetDiscountRate}%`,
        isConfirmed: false,
      },
      products: [],
      qcIssues: [],
      emailDraftIds: [],
    };
  });

  return promotions;
}

/**
 * 엑셀 파일 다운로드용 샘플 연간 캘린더 생성 (사용자가 다운로드해볼 수 있는 템플릿)
 */
export function createSampleCalendarTemplate(): Uint8Array {
  const sampleData = [
    { 브랜드: 'LIST', 행사명: '26SS 트렌치코트 얼리버드 위크', 시작일: '2026-03-10', 종료일: '2026-03-17', 할인율: '40%', 카테고리: '아우터' },
    { 브랜드: 'SHESMISS', 행사명: '스프링 모던 수트 & 블라우스 기획전', 시작일: '2026-03-15', 종료일: '2026-03-22', 할인율: '35%', 카테고리: '셋업/자켓' },
    { 브랜드: 'SISTINA', 행사명: '시스티나 데일리 니트 & 팬츠 브랜드데이', 시작일: '2026-03-20', 종료일: '2026-03-27', 할인율: '50%', 카테고리: '니트/팬츠' },
    { 브랜드: 'LIST', 행사명: '주말 48시간 타임세일 파이널', 시작일: '2026-03-28', 종료일: '2026-03-30', 할인율: '30%', 카테고리: '전품목' },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '2026_프로모션_연간일정');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}
