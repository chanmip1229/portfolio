import { Promotion, QcIssue, ProductItem } from '@/types/promotion';

/**
 * 결정론적 6대 QC 룰 엔진
 * 순수 함수로 구성되어 100% 신뢰성과 일관성을 보장합니다.
 */
export function runDeterministicQc(promotion: Promotion): QcIssue[] {
  const issues: QcIssue[] = [];

  // 1. 일자 순서 검증 (시작일시 >= 종료일시)
  if (promotion.startDate && promotion.endDate) {
    const start = new Date(promotion.startDate).getTime();
    const end = new Date(promotion.endDate).getTime();
    if (start >= end) {
      issues.push({
        id: `qc-date-${Date.now()}`,
        ruleCode: 'DATE_ORDER_INVALID',
        severity: 'BLOCKER',
        targetField: 'startDate/endDate',
        message: `행사 시작일(${promotion.startDate})이 종료일(${promotion.endDate})보다 늦거나 같습니다.`,
        details: { expected: `< ${promotion.endDate}`, actual: promotion.startDate },
      });
    }
  }

  // 2 & 3 & 4 & 5. 상품 목록 관련 검증
  promotion.products.forEach((product, idx) => {
    // 2. 수학적 할인율 일치 검증: Math.round(((정가 - 판매가) / 정가) * 100)
    if (product.originalPrice > 0 && product.salePrice > 0) {
      const calculatedDiscount = Math.round(
        ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
      );

      if (calculatedDiscount !== product.displayDiscountRate) {
        issues.push({
          id: `qc-math-${product.id}-${idx}`,
          ruleCode: 'MATH_DISCOUNT_MISMATCH',
          severity: 'BLOCKER',
          targetField: `${product.productCode}.displayDiscountRate`,
          message: `[${product.productCode}] 수학적 할인율 불일치: 정가(${product.originalPrice.toLocaleString()}원) 대비 판매가(${product.salePrice.toLocaleString()}원)의 실제 할인율은 ${calculatedDiscount}%이나, 표기 할인율이 ${product.displayDiscountRate}%로 기재되었습니다.`,
          details: {
            productCode: product.productCode,
            expected: calculatedDiscount,
            actual: product.displayDiscountRate,
          },
        });
      }

      // 3. 기획서 기준 할인율 대비 초과/미달 경고
      if (product.displayDiscountRate > promotion.targetDiscountRate) {
        issues.push({
          id: `qc-plan-${product.id}-${idx}`,
          ruleCode: 'PLAN_DISCOUNT_MISMATCH',
          severity: 'WARNING',
          targetField: `${product.productCode}.displayDiscountRate`,
          message: `[${product.productCode}] 기획 할인율 초과: 행사 기준 최대 할인율(${promotion.targetDiscountRate}%)을 초과하는 ${product.displayDiscountRate}% 할인율이 설정되었습니다. 마케팅팀 확인이 권장됩니다.`,
          details: {
            productCode: product.productCode,
            expected: promotion.targetDiscountRate,
            actual: product.displayDiscountRate,
          },
        });
      }
    }

    // 4. 승인 품번(SKU) 매핑 검증
    if (!product.isApproved) {
      issues.push({
        id: `qc-sku-${product.id}-${idx}`,
        ruleCode: 'UNAPPROVED_SKU',
        severity: 'BLOCKER',
        targetField: `${product.productCode}.isApproved`,
        message: `[${product.productCode}] MD팀 승인 미완료 품번: 승인 목록에 포함되지 않은 미확인 상품이 게시 예정 목록에 포함되어 있습니다.`,
        details: { productCode: product.productCode },
      });
    }

    // 5. URL 유효성 및 파라미터 검증
    if (!isValidProductUrl(product.detailUrl, product.productCode)) {
      issues.push({
        id: `qc-url-${product.id}-${idx}`,
        ruleCode: 'INVALID_URL',
        severity: 'BLOCKER',
        targetField: `${product.productCode}.detailUrl`,
        message: `[${product.productCode}] 잘못된 상품 상세 URL: 정상적인 https 프로토콜 또는 품번 매핑 형식이 유효하지 않습니다. (${product.detailUrl || '누락됨'})`,
        details: {
          productCode: product.productCode,
          expected: `https://www.idfmall.co.kr/product/${product.productCode}`,
          actual: product.detailUrl,
        },
      });
    }

    // 6. 쿠폰 적용 여부 정합성 검증 (쿠폰 제외 특가전인데 쿠폰 가능으로 잘못 세팅된 경우 적발)
    if (promotion.allowCoupon === false && product.couponApplicable === true) {
      issues.push({
        id: `qc-coupon-${product.id}-${idx}`,
        ruleCode: 'COUPON_POLICY_MISMATCH',
        severity: 'BLOCKER',
        targetField: `${product.productCode}.couponApplicable`,
        message: `[${product.productCode}] 쿠폰 정책 불일치: 본 프로모션은 [쿠폰 적용 제외/불가] 기획전이나, 해당 상품에 [쿠폰 사용 가능]으로 잘못 설정되어 중복 할인 역마진 위험이 있습니다.`,
        details: {
          productCode: product.productCode,
          expected: '쿠폰 미적용 (false)',
          actual: '쿠폰 적용 중 (true)',
        },
      });
    }
  });

  // 6. 배너 컨펌 상태 검증
  if (!promotion.banner.isConfirmed) {
    issues.push({
      id: `qc-banner-spec-${Date.now()}`,
      ruleCode: 'BANNER_SPEC_MISMATCH',
      severity: 'WARNING',
      targetField: 'banner.isConfirmed',
      message: '배너 소재가 아직 운영자 최종 컨펌되지 않았습니다. 배너 스튜디오에서 원클릭 컨펌을 완료해주세요.',
    });
  }

  // 7. 메인 배너 문구(카피)와 실제 행사/상품 정합성 검증 (허위·과장 카피 및 혜택 오기재 방지)
  const bannerText = `${promotion.banner.copyTitle} ${promotion.banner.copySubtitle} ${promotion.banner.discountBadgeText}`.toLowerCase();

  // (1) 배너 문구에 "쿠폰" 언급이 있는데 행사 쿠폰 정책이 [쿠폰 미적용]인 경우
  if ((bannerText.includes('쿠폰') || bannerText.includes('coupon')) && promotion.allowCoupon === false) {
    issues.push({
      id: `qc-banner-coupon-${Date.now()}`,
      ruleCode: 'BANNER_COPY_MISMATCH',
      severity: 'BLOCKER',
      targetField: 'banner.copySubtitle',
      message: `[메인화면 배너 카피 오류] 배너 문구에 '쿠폰' 혜택이 표기되어 있으나, 본 기획전은 [쿠폰 적용 제외(특가)] 정책입니다. 고객 불만(CS) 및 허위광고 방지를 위해 배너 카피를 수정하거나 쿠폰 정책을 변경해주세요.`,
      details: {
        expected: '쿠폰 미언급 또는 쿠폰 허용',
        actual: promotion.banner.copySubtitle,
      },
    });
  }

  // (2) 배너 뱃지 할인율(예: UP TO 40%) 대비 실제 상품 최대 할인율 불일치 검증
  const badgeNumberMatch = promotion.banner.discountBadgeText.match(/(\d+)%/);
  if (badgeNumberMatch && promotion.products.length > 0) {
    const bannerBadgeRate = parseInt(badgeNumberMatch[1], 10);
    const maxProductDiscount = Math.max(...promotion.products.map((p) => p.displayDiscountRate));

    if (bannerBadgeRate > maxProductDiscount) {
      issues.push({
        id: `qc-banner-discount-${Date.now()}`,
        ruleCode: 'BANNER_COPY_MISMATCH',
        severity: 'BLOCKER',
        targetField: 'banner.discountBadgeText',
        message: `[메인화면 배너 할인율 과장] 배너 뱃지 표기 할인율(${bannerBadgeRate}%)보다 실제 등록 상품의 최대 할인율(${maxProductDiscount}%)이 낮습니다. 공정위 표시광고법 위반 위험이 있으므로 배너 문구를 수정해주세요.`,
        details: {
          expected: `최대 ${maxProductDiscount}%`,
          actual: `${bannerBadgeRate}%`,
        },
      });
    }
  }

  return issues;
}

/**
 * URL 검증 헬퍼
 */
function isValidProductUrl(url: string, productCode: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('https://')) return false;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('idfmall.co.kr')) return false;
    // URL에 품번이 포함되어 있는지 확인
    return url.includes(productCode);
  } catch {
    return false;
  }
}
