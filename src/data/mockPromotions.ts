import { Promotion } from '@/types/promotion';
import { generateMilestones } from '@/utils/calendarParser';

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-list-trench-2026',
    brand: 'LIST',
    title: '[LIST] 26SS 트렌치코트 얼리버드 위크',
    startDate: '2026-03-10',
    endDate: '2026-03-17',
    targetDiscountRate: 40,
    allowCoupon: true, // 리스트 얼리버드 위크는 쿠폰 적용 가능 기획
    status: 'NEEDS_CHECK',
    currentBottleneckDept: 'MD',
    category: '아우터',
    timestamps: {
      plannedAt: '2026-03-01 09:30',
      assetRequestedAt: '2026-03-03 14:15',
      dataReceivedAt: '2026-03-05 11:20',
      issueDetectedAt: '2026-03-05 11:22',
    },
    milestones: generateMilestones('2026-03-10').map((m) => {
      if (m.code === 'D_MINUS_7' || m.code === 'D_MINUS_5') {
        return { ...m, isCompleted: true, completedAt: '2026-03-03 14:15' };
      }
      return m;
    }),
    banner: {
      sourceImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
      sourceImageName: 'LIST_26SS_lookbook_trench_main.jpg',
      copyTitle: '2026 SPRING TRENCH COLLECTION',
      copySubtitle: '리스트 봄 시그니처 아우터 특가전',
      discountBadgeText: 'UP TO 40%',
      isConfirmed: false,
    },
    products: [
      {
        id: 'p-1',
        productCode: 'SWBLPB21010',
        productName: '클래식 더블 버튼 트렌치코트 (네이비)',
        originalPrice: 198000,
        salePrice: 138600, // 30% 할인이나 시트에 40%로 기재됨 (오류 케이스!)
        displayDiscountRate: 40,
        detailUrl: 'https://www.idfmall.co.kr/product/SWBLPB21010',
        isApproved: true,
        couponApplicable: true,
        category: '트렌치코트',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'p-2',
        productCode: 'SWJCKB21020',
        productName: '오버핏 싱글 맥코트 (베이지)',
        originalPrice: 248000,
        salePrice: 148800,
        displayDiscountRate: 40, // 40% 정상
        detailUrl: 'https://www.idfmall.co.kr/product/SWJCKB21020',
        isApproved: true,
        couponApplicable: true,
        category: '트렌치코트',
        thumbnailUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'p-3',
        productCode: 'SWCTKB21030',
        productName: '벨티드 하프 트렌치 자켓 (카키)',
        originalPrice: 178000,
        salePrice: 106800,
        displayDiscountRate: 40,
        detailUrl: 'https://www.idfmall.co.kr/product/SWCTKB21030',
        isApproved: true,
        couponApplicable: true,
        category: '자켓',
        thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&auto=format&fit=crop&q=80',
      },
    ],
    qcIssues: [
      {
        id: 'qc-err-1',
        ruleCode: 'MATH_DISCOUNT_MISMATCH',
        severity: 'BLOCKER',
        targetField: 'SWBLPB21010.displayDiscountRate',
        message: '품번 SWBLPB21010: 정가(198,000) 대비 판매가(138,600)의 실제 계산 할인율은 30%이나 표기 할인율이 40%로 기재되었습니다.',
        details: {
          productCode: 'SWBLPB21010',
          expected: 30,
          actual: 40,
        },
      },
    ],
    emailDraftIds: ['draft-list-trench-1'],
  },
  {
    id: 'promo-shesmiss-suit-2026',
    brand: 'SHESMISS',
    title: '[SHESMISS] 26SS 모던 비즈니스 수트 & 셋업전',
    startDate: '2026-03-18',
    endDate: '2026-03-25',
    targetDiscountRate: 35,
    allowCoupon: false, // 쉬즈미스 수트전은 노세일/특가로 쿠폰 제외 기획
    status: 'ASSET_REQUESTED',
    currentBottleneckDept: 'DESIGN',
    category: '셋업/자켓',
    timestamps: {
      plannedAt: '2026-03-02 10:00',
      assetRequestedAt: '2026-03-04 15:30',
    },
    milestones: generateMilestones('2026-03-18').map((m) => {
      if (m.code === 'D_MINUS_7') {
        return { ...m, isCompleted: true, completedAt: '2026-03-04 15:30' };
      }
      return m;
    }),
    banner: {
      copyTitle: 'MODERN SUIT & TAILORED SET-UP',
      copySubtitle: '쉬즈미스 프리미엄 워크웨어 셀렉션',
      discountBadgeText: 'UP TO 35%',
      isConfirmed: false,
    },
    products: [],
    qcIssues: [],
    emailDraftIds: [],
  },
  {
    id: 'promo-sistina-knit-2026',
    brand: 'SISTINA',
    title: '[SISTINA] 시스티나 컬러풀 소프트 니트 브랜드위크',
    startDate: '2026-03-24',
    endDate: '2026-03-31',
    targetDiscountRate: 50,
    allowCoupon: true,
    status: 'PLANNING',
    currentBottleneckDept: 'MD',
    category: '니트',
    timestamps: {
      plannedAt: '2026-03-05 11:00',
    },
    milestones: generateMilestones('2026-03-24'),
    banner: {
      copyTitle: 'SISTINA COLORFUL KNIT WEEK',
      copySubtitle: '봄을 부르는 컬러풀 소프트 니트',
      discountBadgeText: 'UP TO 50%',
      isConfirmed: false,
    },
    products: [],
    qcIssues: [],
    emailDraftIds: [],
  },
];
