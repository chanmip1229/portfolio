import * as XLSX from 'xlsx';
import { Promotion, Department } from '@/types/promotion';

export interface ExportRow {
  행사ID: string;
  브랜드: string;
  기획전명: string;
  행사시작일: string;
  행사종료일: string;
  담당부서: string;
  품번_SKU: string;
  상품명: string;
  정상가: number;
  판매가: number;
  수학적계산할인율: string;
  표기할인율: string;
  쿠폰적용여부: string;
  쿠폰정책_QC: string;
  적발오류코드: string;
  심각도: string;
  상세오류내용: string;
  조치요청사항: string;
}

/**
 * 프로모션 목록으로부터 엑셀 추출용 평탄화 데이터 생성
 */
export function buildExportData(
  promotions: Promotion[],
  filterDept?: Department
): ExportRow[] {
  const rows: ExportRow[] = [];

  promotions.forEach((promo) => {
    // 상품별 이슈 매핑
    promo.products.forEach((prod) => {
      // 해당 상품에 관련된 QC 이슈 찾기
      const productIssues = promo.qcIssues.filter((issue) =>
        issue.targetField?.includes(prod.productCode)
      );

      const calculatedRate = Math.round(
        ((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100
      );

      // 쿠폰 정책 일치 여부 판정
      let couponQcStatus = '✓ 정보 일치';
      if (promo.allowCoupon === false && prod.couponApplicable === true) {
        couponQcStatus = '🚨 확인 필요 (쿠폰불가 기획)';
      } else if (promo.allowCoupon === true && prod.couponApplicable === false) {
        couponQcStatus = '⚠️ 확인 필요 (쿠폰미적용)';
      }

      // 부서 필터링 (MD: 가격/할인율/품번, DESIGN: 배너, EBIZ_OPS: URL/쿠폰)
      const targetDept: Department = productIssues.some(
        (i) => i.ruleCode === 'MATH_DISCOUNT_MISMATCH' || i.ruleCode === 'UNAPPROVED_SKU'
      )
        ? 'MD'
        : productIssues.some((i) => i.ruleCode === 'COUPON_POLICY_MISMATCH' || i.ruleCode === 'INVALID_URL')
        ? 'EBIZ_OPS'
        : promo.currentBottleneckDept;

      if (filterDept && targetDept !== filterDept) {
        return;
      }

      if (productIssues.length > 0) {
        productIssues.forEach((issue) => {
          let actionNeeded = 'MD팀: 표기 할인율 수정 또는 판매가 재책정 필요';
          if (issue.ruleCode === 'COUPON_POLICY_MISMATCH') {
            actionNeeded = '운영팀/MD팀: 쿠폰 적용 여부 토글 또는 기획서 재확인 필요';
          } else if (issue.ruleCode === 'INVALID_URL') {
            actionNeeded = '운영팀: 상품 상세 URL 카페24 품번 링크 확인 필요';
          } else if (issue.ruleCode === 'UNAPPROVED_SKU') {
            actionNeeded = 'MD팀: MD 승인 승인표에 해당 SKU 추가 필요';
          }

          rows.push({
            행사ID: promo.id,
            브랜드: promo.brand,
            기획전명: promo.title,
            행사시작일: promo.startDate,
            행사종료일: promo.endDate,
            담당부서: targetDept,
            품번_SKU: prod.productCode,
            상품명: prod.productName,
            정상가: prod.originalPrice,
            판매가: prod.salePrice,
            수학적계산할인율: `${calculatedRate}%`,
            표기할인율: `${prod.displayDiscountRate}%`,
            쿠폰적용여부: prod.couponApplicable ? '쿠폰적용 O' : '쿠폰제외 X',
            쿠폰정책_QC: couponQcStatus,
            적발오류코드: issue.ruleCode,
            심각도: issue.severity,
            상세오류내용: issue.message,
            조치요청사항: actionNeeded,
          });
        });
      } else {
        // 정상 상품인 경우도 보고서에 포함 (선택)
        if (!filterDept) {
          rows.push({
            행사ID: promo.id,
            브랜드: promo.brand,
            기획전명: promo.title,
            행사시작일: promo.startDate,
            행사종료일: promo.endDate,
            담당부서: targetDept,
            품번_SKU: prod.productCode,
            상품명: prod.productName,
            정상가: prod.originalPrice,
            판매가: prod.salePrice,
            수학적계산할인율: `${calculatedRate}%`,
            표기할인율: `${prod.displayDiscountRate}%`,
            쿠폰적용여부: prod.couponApplicable ? '쿠폰적용 O' : '쿠폰제외 X',
            쿠폰정책_QC: couponQcStatus,
            적발오류코드: '정상 (PASS)',
            심각도: '정상',
            상세오류내용: '6대 룰 엔진 사전 검증 통과 (이상 없음)',
            조치요청사항: '게시 승인 가능',
          });
        }
      }
    });

    // 배너 이슈가 있는 경우 배너 행 추가
    const bannerIssues = promo.qcIssues.filter((i) =>
      i.ruleCode === 'BANNER_COPY_MISMATCH' || i.ruleCode === 'BANNER_SPEC_MISMATCH'
    );
    if (bannerIssues.length > 0 && (!filterDept || filterDept === 'DESIGN')) {
      bannerIssues.forEach((issue) => {
        rows.push({
          행사ID: promo.id,
          브랜드: promo.brand,
          기획전명: promo.title,
          행사시작일: promo.startDate,
          행사종료일: promo.endDate,
          담당부서: 'DESIGN',
          품번_SKU: 'BANNER_ASSET',
          상품명: promo.banner.sourceImageName || '메인 배너 시안',
          정상가: 0,
          판매가: 0,
          수학적계산할인율: '-',
          표기할인율: promo.banner.discountBadgeText,
          쿠폰적용여부: promo.allowCoupon ? '쿠폰허용' : '쿠폰불가',
          쿠폰정책_QC: '-',
          적발오류코드: issue.ruleCode,
          심각도: issue.severity,
          상세오류내용: issue.message,
          조치요청사항: '디자인팀: 배너 카피 문구 수정 및 배너스튜디오 원클릭 컨펌 필요',
        });
      });
    }
  });

  return rows;
}

/**
 * 엑셀 파일 생성 및 브라우저 다운로드 실행
 */
export function exportToExcel(
  promotions: Promotion[],
  filenamePrefix: string,
  filterDept?: Department
) {
  const data = buildExportData(promotions, filterDept);

  if (data.length === 0) {
    alert('해당 조건에 해당하는 다운로드 데이터가 없습니다.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  // 컬럼 너비 자동 설정
  const columnWidths = [
    { wch: 18 }, // 행사ID
    { wch: 10 }, // 브랜드
    { wch: 32 }, // 기획전명
    { wch: 12 }, // 행사시작일
    { wch: 12 }, // 행사종료일
    { wch: 10 }, // 담당부서
    { wch: 15 }, // 품번_SKU
    { wch: 30 }, // 상품명
    { wch: 10 }, // 정상가
    { wch: 10 }, // 판매가
    { wch: 15 }, // 수학적계산할인율
    { wch: 12 }, // 표기할인율
    { wch: 14 }, // 쿠폰적용여부
    { wch: 22 }, // 쿠폰정책_QC
    { wch: 24 }, // 적발오류코드
    { wch: 10 }, // 심각도
    { wch: 50 }, // 상세오류내용
    { wch: 45 }, // 조치요청사항
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = filterDept ? `${filterDept}_오류리포트` : '전체_QC_오류리포트';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStr = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filenamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fullFilename);
}
