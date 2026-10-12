import { create } from 'zustand';
import { Promotion, Brand, Department, PromotionStatus, EmailDraft, BannerInfo } from '@/types/promotion';
import { INITIAL_PROMOTIONS } from '@/data/mockPromotions';

interface OpsStore {
  promotions: Promotion[];
  emailDrafts: EmailDraft[];
  selectedPromotionId: string | null;

  // 3-Way 필터 상태
  selectedBrand: Brand | 'ALL';
  selectedDepartment: Department | 'ALL';
  selectedStatus: PromotionStatus | 'ALL';

  // 모달 제어 상태
  isDraftModalOpen: boolean;
  selectedDraftId: string | null;

  // 필터 및 모달 액션
  setSelectedBrand: (brand: Brand | 'ALL') => void;
  setSelectedDepartment: (dept: Department | 'ALL') => void;
  setSelectedStatus: (status: PromotionStatus | 'ALL') => void;
  setSelectedPromotionId: (id: string | null) => void;
  setIsDraftModalOpen: (open: boolean) => void;
  setSelectedDraftId: (id: string | null) => void;

  // 프로모션 일괄 추가 (엑셀 업로드 시)
  addPromotions: (newPromos: Promotion[]) => void;

  // 프로모션 갱신
  updatePromotion: (id: string, updater: Partial<Promotion> | ((prev: Promotion) => Promotion)) => void;

  // 4.3 메일 회신 시뮬레이션 및 배너 자동 생성/컨펌
  simulateReceiveLookbook: (promoId: string) => void;
  confirmBanner: (promoId: string, updatedBanner?: Partial<BannerInfo>) => void;

  // 이메일 초안 생성 (리마인더 / 재확인 / 요청)
  createReminderDraft: (promoId: string) => void;
  updateDraft: (id: string, updater: Partial<EmailDraft>) => void;
  markDraftAsSent: (id: string) => void;

  // 시연용 리셋
  resetToDefault: () => void;
}

const INITIAL_DRAFTS: EmailDraft[] = [
  {
    id: 'draft-list-trench-1',
    promotionId: 'promo-list-trench-2026',
    emailType: 'RECHECK_ERROR',
    toDepartment: 'MD',
    recipientName: 'MD팀 김지현 대리',
    subject: '[재확인 요청] [LIST] 26SS 트렌치코트전 - 상품 할인율 계산 불일치 확인의 건',
    body: `안녕하세요, E-BIZ 자사몰 운영팀입니다.

보내주신 [LIST] 26SS 트렌치코트전 상품 엑셀 데이터 사전 QC 검증 결과 아래 품번의 계산 정합성 불일치가 감지되어 회신드립니다.

■ 확인 필요 사항:
- 대상 품번: SWBLPB21010 (클래식 더블 버튼 트렌치코트)
- 정가: 198,000원 / 판매가: 138,600원
- 실제 계산 할인율: 30% (차액: 59,400원)
- 엑셀 기재 표기 할인율: 40% (오류)

기획하신 판매가가 138,600원(30% 할인)이 맞는지, 혹은 40% 적용 판매가(118,800원)로 수정이 필요한지 금일 17:00까지 확인 부탁드립니다.

감사합니다.
E-BIZ 운영팀 드림`,
    triggerReason: '품번 SWBLPB21010 할인율 계산 불일치 감지 (30% vs 40%)',
    status: 'DRAFT',
    createdAt: '2026-03-05 11:22',
  },
  {
    id: 'draft-shesmiss-reminder-1',
    promotionId: 'promo-shesmiss-suit-2026',
    emailType: 'REMINDER_DELAY',
    toDepartment: 'DESIGN',
    recipientName: '디자인팀 이수민 과장',
    subject: '[리마인드] [SHESMISS] 26SS 모던 수트전 - 배너 키비주얼 회신 요청의 건 (D-3 마감 임박)',
    body: `안녕하세요 이수민 과장님, E-BIZ 자사몰 운영팀입니다.

지난 3월 4일에 요청드린 [SHESMISS] 26SS 모던 수트전 배너 소재와 관련하여,
사전 검수 및 3월 18일 오픈 일정 준수를 위해 내일 14:00까지 룩북 시안 회신을 부탁드리고자 리마인드 메일 드립니다.

■ 요청 배너 규격:
- PC 메인 배너: 1920 x 600 px
- 모바일 메인 배너: 750 x 900 px
- 행사 타이틀: MODERN SUIT & TAILORED SET-UP (UP TO 35%)

일정상 이슈가 있으시면 언제든 편하게 말씀 부탁드립니다. 감사합니다!
E-BIZ 운영팀 드림`,
    triggerReason: '소재 요청 후 48시간 이상 미회신 & 행사 D-3 도래에 따른 지연 방지 리마인더',
    status: 'DRAFT',
    createdAt: '2026-03-06 09:30',
  },
];

export const useOpsStore = create<OpsStore>((set, get) => ({
  promotions: INITIAL_PROMOTIONS,
  emailDrafts: INITIAL_DRAFTS,
  selectedPromotionId: 'promo-list-trench-2026',

  selectedBrand: 'ALL',
  selectedDepartment: 'ALL',
  selectedStatus: 'ALL',

  isDraftModalOpen: false,
  selectedDraftId: null,

  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedPromotionId: (id) => set({ selectedPromotionId: id }),
  setIsDraftModalOpen: (open) => set({ isDraftModalOpen: open }),
  setSelectedDraftId: (id) => set({ selectedDraftId: id }),

  addPromotions: (newPromos) =>
    set((state) => ({
      promotions: [...newPromos, ...state.promotions],
      selectedPromotionId: newPromos[0]?.id || state.selectedPromotionId,
    })),

  updatePromotion: (id, updater) =>
    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== id) return p;
        if (typeof updater === 'function') {
          return updater(p);
        }
        return { ...p, ...updater };
      }),
    })),

  // 4.3 디자인팀 회신 수신 시뮬레이션
  simulateReceiveLookbook: (promoId) => {
    const promo = get().promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 브랜드별 고화질 모의 룩북 이미지 URL 매핑
    const LOOKBOOK_MAP: Record<Brand, { url: string; filename: string }> = {
      LIST: {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        filename: 'LIST_26SS_TRENCH_LOOKBOOK_FINAL.jpg',
      },
      SHESMISS: {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
        filename: 'SHESMISS_SUIT_EDITORIAL_V1.jpg',
      },
      SISTINA: {
        url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&auto=format&fit=crop&q=80',
        filename: 'SISTINA_KNIT_COLLECTION_MAIN.jpg',
      },
    };

    const asset = LOOKBOOK_MAP[promo.brand];

    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== promoId) return p;
        return {
          ...p,
          status: 'DATA_RECEIVED',
          currentBottleneckDept: 'EBIZ_OPS',
          timestamps: {
            ...p.timestamps,
            dataReceivedAt: nowStr,
          },
          milestones: p.milestones.map((m) =>
            m.code === 'D_MINUS_2'
              ? { ...m, isCompleted: true, completedAt: nowStr }
              : m
          ),
          banner: {
            ...p.banner,
            sourceImageUrl: asset.url,
            sourceImageName: asset.filename,
            isConfirmed: false,
          },
        };
      }),
    }));
  },

  // 4.3 배너 원클릭 컨펌
  confirmBanner: (promoId, updatedBanner) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== promoId) return p;
        const nextBanner = {
          ...p.banner,
          ...updatedBanner,
          isConfirmed: true,
          confirmedAt: nowStr,
        };
        return {
          ...p,
          banner: nextBanner,
          // 배너 컨펌 후 상품 검증이 남아있으면 NEEDS_CHECK/DATA_RECEIVED, 상품도 정상이면 QC_PASSED
          status: p.qcIssues.length > 0 ? 'NEEDS_CHECK' : 'QC_PASSED',
        };
      }),
    }));
  },

  createReminderDraft: (promoId) => {
    const promo = get().promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const dept = promo.currentBottleneckDept || 'DESIGN';
    const deptName = dept === 'DESIGN' ? '디자인팀' : dept === 'MD' ? 'MD팀' : '마케팅팀';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newDraft: EmailDraft = {
      id: `draft-reminder-${Date.now()}`,
      promotionId: promo.id,
      emailType: 'REMINDER_DELAY',
      toDepartment: dept,
      recipientName: `${deptName} 담당자님`,
      subject: `[리마인드] ${promo.title} - 행사 자료 회신 요청의 건 (마감 임박)`,
      body: `안녕하세요 ${deptName} 담당자님, E-BIZ 자사몰 운영팀입니다.

${promo.startDate} 오픈 예정인 [${promo.title}]과 관련하여,
사전 검증(QC) 및 배너 세팅 일정을 맞추기 위해 요청드린 자료의 회신 여부를 확인하고자 리마인드 메일 드립니다.

■ 행사 개요:
- 브랜드: ${promo.brand}
- 행사명: ${promo.title}
- 오픈 예정일: ${promo.startDate}

안정적인 행사 오픈을 위해 금일 17:00까지 자료 회신 부탁드립니다.
일정상 변동 사항이 있으시면 회신 부탁드리겠습니다. 감사합니다!

E-BIZ 운영팀 드림`,
      triggerReason: `운영자가 [${promo.title}] 회신 지연에 따른 긴급 리마인더 초안 생성 트리거`,
      status: 'DRAFT',
      createdAt: nowStr,
    };

    set((state) => ({
      emailDrafts: [newDraft, ...state.emailDrafts],
      isDraftModalOpen: true,
      selectedDraftId: newDraft.id,
    }));
  },

  updateDraft: (id, updater) =>
    set((state) => ({
      emailDrafts: state.emailDrafts.map((d) => (d.id === id ? { ...d, ...updater } : d)),
    })),

  markDraftAsSent: (id) =>
    set((state) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      return {
        emailDrafts: state.emailDrafts.map((d) =>
          d.id === id ? { ...d, status: 'SENT', sentAt: nowStr } : d
        ),
      };
    }),

  resetToDefault: () =>
    set({
      promotions: INITIAL_PROMOTIONS,
      emailDrafts: INITIAL_DRAFTS,
      selectedPromotionId: 'promo-list-trench-2026',
      selectedBrand: 'ALL',
      selectedDepartment: 'ALL',
      selectedStatus: 'ALL',
      isDraftModalOpen: false,
      selectedDraftId: null,
    }),
}));
