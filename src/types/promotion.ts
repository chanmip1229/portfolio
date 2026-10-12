export type Brand = 'SHESMISS' | 'LIST' | 'SISTINA';

export type Department = 'MD' | 'DESIGN' | 'EBIZ_OPS';

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
}

export interface QcIssue {
  id: string;
  ruleCode:
    | 'DATE_ORDER_INVALID'
    | 'MATH_DISCOUNT_MISMATCH'
    | 'PLAN_DISCOUNT_MISMATCH'
    | 'UNAPPROVED_SKU'
    | 'INVALID_URL'
    | 'BANNER_SPEC_MISMATCH'
    | 'COUPON_POLICY_MISMATCH';
  severity: 'BLOCKER' | 'WARNING';
  targetField: string;
  message: string;
  details?: {
    productCode?: string;
    expected?: string | number | boolean;
    actual?: string | number | boolean;
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
}

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
