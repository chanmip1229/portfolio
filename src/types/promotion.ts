export type Brand = 'SHESMISS' | 'LIST' | 'SISTINA';

export type Department = 'MD' | 'DESIGN' | 'DEV' | 'MARKETING' | 'EBIZ_OPS';

export type PromotionStatus =
  | 'PLANNING'          // 1. 기획/등록됨
  | 'ASSET_REQUESTED'   // 2. 소재 요청 완료
  | 'DATA_RECEIVED'     // 3. 회신 수신 완료
  | 'NEEDS_CHECK'       // 4. 오류 감지 (재확인 메일 대기)
  | 'QC_PASSED'         // 5. 사전 검증 완료
  | 'READY_TO_PUBLISH'; // 6. 게시 준비 완료

export interface Milestone {
  code: 'D_MINUS_7' | 'D_MINUS_5' | 'D_MINUS_2' | 'D_MINUS_1' | 'D_DAY';
  label: string;
  targetDate: string; // YYYY-MM-DD
  department: Department;
  isCompleted: boolean;
  completedAt?: string;
}

export interface BannerInfo {
  sourceImageUrl?: string;
  sourceImageName?: string;
  pcBannerUrl?: string; // 1920x600 canvas data url or mock
  moBannerUrl?: string; // 750x900 canvas data url or mock
  copyTitle: string;
  copySubtitle: string;
  discountBadgeText: string;
  isConfirmed: boolean;
  confirmedAt?: string;
}

export interface CouponDetail {
  id: string;
  name: string; // 예: 10월 신상 5%, LIVE WEEK 10%, VIP 등급쿠폰
  discountRate: number; // 예: 5, 10
  type: 'DOWNLOADABLE' | 'MEMBERSHIP_TIER' | 'LIVE_WEEK';
  period: string; // 예: 2026-10-01 ~ 2026-11-01
  daysLeft?: number;
  condition?: string; // 예: 제한 없음, 전 등급 적용, 5만원 이상 구매 시
  isMemberOnly?: boolean;
}

export interface ProductItem {
  id: string;
  productCode: string; // 예: SWBLPB21010
  productName: string;
  originalPrice: number;
  salePrice: number;
  displayDiscountRate: number; // 표기 할인율 (%)
  detailUrl: string;
  isApproved: boolean;
  couponApplicable: boolean; // 쿠폰 적용 가능 여부
  category?: string;
  thumbnailUrl?: string;
  isLiveWeek?: boolean; // LIVE WEEK 특별관 해당 여부
  liveWeekBenefitText?: string; // 예: 라이브위크 단 7일간의 특별한 혜택
  applicableCoupons?: CouponDetail[]; // 적용 가능한 상세 쿠폰 목록

  // 신규: 카테고리/시즌 트렌드 기준 할인율 및 이상치(Anomaly) 노티스
  categoryAvgDiscountRate?: number; // 해당 카테고리/시즌 평균 할인율 (예: 30%)
  anomalyNotice?: string; // 예: "카테고리 시즌 평균(30%) 대비 80%로 극단치 감지 (오기입 의심)"
  hasTrendAnomaly?: boolean; // 트렌드 이상치 여부

  // 신규: 다부서 복합 이슈 여부
  multiDeptIssueDepartments?: Department[]; // 예: ['MD', 'DESIGN']
  hasBrokenImage?: boolean; // 대표 이미지 404 / 깨짐 여부
}

export interface QcIssue {
  id: string;
  department?: Department;
  secondaryDepartment?: Department; // 다부서 이슈일 경우 추가 부서
  isMultiDeptIssue?: boolean;
  relatedDepartments?: Department[];
  ruleCode:
    | 'DATE_ORDER_INVALID'
    | 'MATH_DISCOUNT_MISMATCH'
    | 'PLAN_DISCOUNT_MISMATCH'
    | 'UNAPPROVED_SKU'
    | 'INVALID_URL'
    | 'BANNER_SPEC_MISMATCH'
    | 'COUPON_POLICY_MISMATCH'
    | 'BANNER_COPY_MISMATCH'
    | 'TREND_OUTLIER_NOTICE' // 신규: 원본 기획 데이터 트렌드 이상치 (예: 30% 평균 대비 80% 극단치 오기입)
    | 'IMAGE_SPEC_MISMATCH' // 신규: 상품 단품 썸네일/룩북 해상도 규격 미달
    | 'IMAGE_LOAD_FAILED' // 신규: 상품 썸네일 링크 깨짐 / 404 / 엑스박스 오류
    | 'MULTI_DEPT_BLOCKER'; // 신규: 단일 품번에 복수 부서 결함 동시 발생
  severity: 'BLOCKER' | 'WARNING';
  targetField: string;
  message: string;
  details?: {
    productCode?: string;
    expected?: string | number | boolean;
    actual?: string | number | boolean;
    categoryAvg?: number; // 카테고리 평균치
  };
}

export interface EmailDraft {
  id: string;
  promotionId: string;
  emailType: 'REQUEST' | 'RECHECK_ERROR' | 'REMINDER_DELAY';
  toDepartment: Department;
  recipientName: string;
  subject: string;
  body: string;
  triggerReason: string;
  status: 'DRAFT' | 'REVIEWED' | 'SENT';
  createdAt: string;
  sentAt?: string;
  relatedProductCode?: string; // 관련 품번 (예: SWBLPB21010)
  isMultiDeptSplitDraft?: boolean; // 듀얼 분할 발송 초안 여부
  pairedDraftId?: string; // 짝이 되는 다른 부서 초안 ID (예: MD <-> DESIGN)
}

export type EventType =
  | 'SEASON_SALE'   // 시즌 정기 행사 (신상/클리어런스/시즌오프/얼리버드)
  | 'LIVE_WEEK'     // LIVE 행사 (라이브위크 스페셜 특가)
  | 'SPECIAL_EVENT' // 특별 행사 (설맞이/가정의달/추석/블랙프라이데이)
  | 'BRAND_WEEK';   // 브랜드 위크 (단독 수트/니트/원피스 브랜드 기획전)

export interface Promotion {
  id: string;
  brand: Brand;
  title: string;
  startDate: string; // YYYY-MM-DD or ISO
  endDate: string;
  targetDiscountRate: number; // 기획 기준 할인율 (예: 40)
  allowCoupon: boolean; // 기획서 쿠폰 적용 허용 정책 (true: 가능, false: 특가전 제외)
  status: PromotionStatus;
  currentBottleneckDept: Department;
  category: string; // 예: 아우터, 원피스, 전품목
  eventType?: EventType;

  // 타임스탬프 히스토리
  timestamps: {
    plannedAt: string;
    assetRequestedAt?: string;
    dataReceivedAt?: string;
    issueDetectedAt?: string;
    qcPassedAt?: string;
    publishedAt?: string;
  };

  // 자동 스케줄링 마일스톤
  milestones: Milestone[];

  // 배너 및 소재 정보
  banner: BannerInfo;

  // 상품 리스트
  products: ProductItem[];

  // 감지된 QC 이슈 목록
  qcIssues: QcIssue[];

  // 연결된 이메일 초안 ID 목록
  emailDraftIds: string[];
}

export type EventLifecycle = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'ENDED';

export function getPromotionLifecycle(promo: Promotion): 'ACTIVE' | 'UPCOMING' | 'ENDED' {
  // 1. 종료된 행사: 시연 기준 시점(2026년 10월 15일) 이전 종료된 행사
  if (promo.endDate < '2026-10-15') {
    return 'ENDED';
  }
  // 2. 진행 중인 행사 (당월 집중 대응): 10월 오픈 및 현재 실시간 조치/대기 중인 행사
  if (
    promo.startDate.startsWith('2026-10') ||
    promo.status === 'NEEDS_CHECK' ||
    promo.status === 'ASSET_REQUESTED' ||
    promo.status === 'DATA_RECEIVED'
  ) {
    return 'ACTIVE';
  }
  // 3. 진행 예정 행사: 11월 이후 오픈 예정 로드맵
  return 'UPCOMING';
}

export function getPromotionMonth(promo: Promotion): number {
  const parts = promo.startDate.split('-');
  return parts.length >= 2 ? parseInt(parts[1], 10) : 1;
}

