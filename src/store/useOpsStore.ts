import { create } from 'zustand';
import { Promotion, Brand, Department, PromotionStatus, EmailDraft, BannerInfo, ProductItem, QcIssue } from '@/types/promotion';
import { INITIAL_PROMOTIONS } from '@/data/mockPromotions';
import { runDeterministicQc } from '@/utils/qcEngine';

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

  // 4.5 & 4.4 상품 인라인 수정 및 재검증 트리거
  updateProductAndRevalidate: (promoId: string, productId: string, updatedFields: Partial<ProductItem>) => void;
  runQcValidation: (promoId: string) => void;

  // 최종 게시 준비 완료 승인
  approveForPublish: (promoId: string) => void;

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
    recipientName: 'MD1팀 김지현 대리',
    subject: '[긴급 재확인 요청] [LIST] 26SS 트렌치코트전 - 상품 정합성 다건 오류(4건) 확인의 건',
    body: `안녕하세요 김지현 대리님, E-BIZ 자사몰 운영팀입니다.

보내주신 [LIST] 26SS 트렌치코트 얼리버드 위크 상품 등록 엑셀에 대한 6대 룰 엔진 사전 QC 검증 결과, 즉시 조치가 필요한 오류 4건이 감지되어 회신드립니다.

수백 건 상품의 정확한 검토를 위해 상세 오류 내역을 정리한 엑셀 파일(MD팀_오류품번리스트.xlsx)을 함께 첨부해 드리오니 참조 부탁드립니다.

■ 주요 오류 적발 내역 (총 4건):
1. [할인율 계산 불일치] SWBLPB21010 (클래식 더블 버튼 트렌치코트)
   - 정가 198,000원 / 판매가 138,600원
   - 실제 수학적 계산 할인율은 30%이나, 표기 할인율이 40%로 기재됨.

2. [MD 사전 미승인 SKU] SWCTKB21099 (클래식 케이프 트렌치코트)
   - MD 승인 상품 리스트에 누락된 미확인 품번이 게시 목록에 포함되어 있음.

3. [상세 URL 형식 오류] SWBLPB21050 (숏 더블 트렌치 블루종)
   - 카페24 정상 연결 URL 대신 잘못된 도메인(http://broken-link.com) 기재 (접속 시 404 발생).

4. [기획 한도 초과 할인율] SWJCKB21060 (루즈핏 벨티드 하프 코트)
   - 기획서 기준 최대 할인율(40%)을 초과하는 55% 할인이 설정되어 역마진 위험 확인 필요.

■ 조치 요청 기한:
- 2026년 3월 8일(금) 17:00까지

■ 첨부 엑셀 리포트 (클라우드 즉시 다운로드 & 실시간 검증 시트):
👉 https://ops.indongfn.co.kr/reports/LIST_26SS_MD_ERRORS.xlsx
(※ 수신 담당자 확인용: 위 사내망 링크 클릭 시 4건의 오류 상세 품번 및 쿠폰 정책 검증 엑셀 시트가 즉시 다운로드/열람됩니다.)

행사 오픈 일정 준수를 위해 빠른 확인 및 엑셀 재전달 부탁드립니다.
감사합니다.

E-BIZ 운영팀 드림`,
    triggerReason: '품번 SWBLPB21010 외 3건의 다건 정합성 오류 감지 (BLOCKER 3건 / WARNING 1건)',
    status: 'DRAFT',
    createdAt: '2026-03-05 11:22',
  },
  {
    id: 'draft-list-trench-design',
    promotionId: 'promo-list-trench-2026',
    emailType: 'RECHECK_ERROR',
    toDepartment: 'DESIGN',
    recipientName: '디자인팀 박민지 책임',
    subject: '[긴급 수정 요청] [LIST] 26SS 트렌치코트전 - PC 메인 배너 해상도 규격 미달의 건',
    body: `안녕하세요 박민지 책임님, E-BIZ 자사몰 운영팀입니다.

전달주신 [LIST] 26SS 트렌치코트전 PC 배너 소재 사전 검수 결과, 권장 해상도 규격(1920x600 px)에 미달하는 저해상도 파일(1200x400 px)이 등록되어 모니터 출력 시 타이포그래피 깨짐 현상이 확인되었습니다.

■ 조치 요청 사항:
- PC 메인 배너 원본 고해상도(1920x600 px, 72dpi 이상, 1MB 이하) 재전달
- 조치 마감: 2026년 3월 8일(금) 15:00까지

행사 오픈 전 배너 교체를 위해 빠른 재송부 부탁드립니다. 감사합니다.
E-BIZ 운영팀 드림`,
    triggerReason: 'PC 메인 배너 규격 미달(1200x400)로 텍스트 가독성 불량 감지 (BLOCKER)',
    status: 'DRAFT',
    createdAt: '2026-03-05 11:25',
  },
  {
    id: 'draft-list-trench-dev',
    promotionId: 'promo-list-trench-2026',
    emailType: 'RECHECK_ERROR',
    toDepartment: 'DEV',
    recipientName: '웹개발/퍼블리싱팀 정우진 선임',
    subject: '[긴급 조치 요청] [LIST] 26SS 트렌치코트전 - 품번 SWBLPB21050 404 URL 단절의 건',
    body: `안녕하세요 정우진 선임님, E-BIZ 자사몰 운영팀입니다.

[LIST] 26SS 트렌치코트전 등록 상품 URL 유효성 검증 중, 품번 SWBLPB21050의 상세페이지 링크가 외부 테스트 도메인(http://broken-link.com)으로 기재되어 404 페이지 오류가 발생하고 있습니다.

■ 조치 요청 사항:
- 정상 카페24 자사몰 경로(https://www.idfmall.co.kr/product/SWBLPB21050)로 라우팅 수정
- 조치 마감: 즉시 조치 요망 (오픈 전 필수)

빠른 확인 및 서버 링크 갱신 부탁드립니다.
E-BIZ 운영팀 드림`,
    triggerReason: '상세페이지 URL 404 단절 오류 감지 (BLOCKER)',
    status: 'DRAFT',
    createdAt: '2026-03-05 11:28',
  },
  {
    id: 'draft-list-trench-mkt',
    promotionId: 'promo-list-trench-2026',
    emailType: 'RECHECK_ERROR',
    toDepartment: 'MARKETING',
    recipientName: '마케팅팀 최현우 팀장',
    subject: '[정책 확인 요청] [LIST] 26SS 트렌치코트전 - LIVE WEEK 쿠폰 중복 적용 플래그 검토의 건',
    body: `안녕하세요 최현우 팀장님, E-BIZ 자사몰 운영팀입니다.

[LIST] 26SS 트렌치코트전 프로모션 정책 검증 중, LIVE WEEK 한정 특가 상품군에 신규회원 웰컴 쿠폰 중복 적용 허용 플래그가 활성화되어 있어 마진율 역전 위험이 감지되었습니다.

■ 검토 요청 사항:
- LIVE WEEK 특가 상품의 중복 쿠폰 적용 허용 여부 최종 승인
- 기획서 원안대로 '중복 불가'로 변경할지 여부 회신 요망

확인 후 메일 또는 슬랙으로 회신 부탁드립니다. 감사합니다.
E-BIZ 운영팀 드림`,
    triggerReason: '특가 상품군 쿠폰 중복 적용 플래그 설정 검토 (WARNING)',
    status: 'DRAFT',
    createdAt: '2026-03-05 11:30',
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

  simulateReceiveLookbook: (promoId) => {
    const promo = get().promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

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

        const tempPromo = { ...p, banner: nextBanner };
        const issues = runDeterministicQc(tempPromo);

        return {
          ...tempPromo,
          qcIssues: issues,
          status: issues.length > 0 ? 'NEEDS_CHECK' : 'QC_PASSED',
        };
      }),
    }));
  },

  // 4.5 & 4.4 상품 인라인 수정 및 실시간 재검증
  updateProductAndRevalidate: (promoId, productId, updatedFields) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== promoId) return p;

        const nextProducts = p.products.map((prod) =>
          prod.id === productId ? { ...prod, ...updatedFields } : prod
        );

        const tempPromo: Promotion = {
          ...p,
          products: nextProducts,
        };

        // 6대 룰 엔진 즉시 재검증
        const newIssues = runDeterministicQc(tempPromo);
        const hasBlocker = newIssues.some((issue) => issue.severity === 'BLOCKER');

        return {
          ...tempPromo,
          qcIssues: newIssues,
          status: hasBlocker ? 'NEEDS_CHECK' : 'QC_PASSED',
          timestamps: {
            ...p.timestamps,
            qcPassedAt: !hasBlocker ? nowStr : p.timestamps.qcPassedAt,
          },
        };
      }),
    }));
  },

  // 강제 재검증 트리거
  runQcValidation: (promoId) => {
    const promo = get().promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const newIssues = runDeterministicQc(promo);
    const hasBlocker = newIssues.some((i) => i.severity === 'BLOCKER');
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== promoId) return p;
        return {
          ...p,
          qcIssues: newIssues,
          status: hasBlocker ? 'NEEDS_CHECK' : 'QC_PASSED',
          timestamps: {
            ...p.timestamps,
            issueDetectedAt: hasBlocker ? nowStr : p.timestamps.issueDetectedAt,
            qcPassedAt: !hasBlocker ? nowStr : p.timestamps.qcPassedAt,
          },
        };
      }),
    }));
  },

  // 최종 게시 준비 완료 승인
  approveForPublish: (promoId) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    set((state) => ({
      promotions: state.promotions.map((p) => {
        if (p.id !== promoId) return p;
        return {
          ...p,
          status: 'READY_TO_PUBLISH',
          currentBottleneckDept: 'EBIZ_OPS',
          timestamps: {
            ...p.timestamps,
            publishedAt: nowStr,
          },
          milestones: p.milestones.map((m) =>
            m.code === 'D_MINUS_1' || m.code === 'D_DAY'
              ? { ...m, isCompleted: true, completedAt: nowStr }
              : m
          ),
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
