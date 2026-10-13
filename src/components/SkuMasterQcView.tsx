'use client';

import React, { useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { ProductItem, Promotion, Brand } from '@/types/promotion';
import { exportToExcel } from '@/utils/excelExporter';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Edit2,
  Check,
  X,
  ExternalLink,
  Flame,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SkuMasterQcViewProps {
  onOpenDualDraftModal?: (productCode: string) => void;
}

export default function SkuMasterQcView({ onOpenDualDraftModal }: SkuMasterQcViewProps) {
  const {
    promotions,
    selectedBrand,
    setSelectedBrand,
    updateProductAndRevalidate,
    runQcValidation,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'ALL' | 'MULTI_DEPT' | 'TREND_ANOMALY' | 'BLOCKER' | 'PASSED'
  >('ALL');

  // 인라인 수정 모드 상태
  const [editingKey, setEditingKey] = useState<string | null>(null); // promoId_prodId
  const [editPriceStr, setEditPriceStr] = useState<string>('');
  const [editDiscountRateStr, setEditDiscountRateStr] = useState<string>('');
  const [editCouponApplicable, setEditCouponApplicable] = useState<boolean>(true);
  const [editUrl, setEditUrl] = useState<string>('');

  const [showTrendGuide, setShowTrendGuide] = useState(true);

  // 모든 프로모션의 상품 목록을 평탄화 (Flat list of all SKUs with promotion metadata)
  const allSkuItems = useMemo(() => {
    const list: Array<{
      promo: Promotion;
      product: ProductItem;
      calculatedDiscount: number;
      isMathMismatch: boolean;
      isTrendAnomaly: boolean;
      isMultiDept: boolean;
      hasBlocker: boolean;
    }> = [];

    promotions.forEach((promo) => {
      // 브랜드 필터
      if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return;

      promo.products.forEach((prod) => {
        const calculatedDiscount = prod.originalPrice > 0
          ? Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100)
          : 0;

        const isMathMismatch = calculatedDiscount !== prod.displayDiscountRate;
        const isTrendAnomaly = Boolean(prod.hasTrendAnomaly || prod.displayDiscountRate >= 75);
        const isMultiDept = Boolean(prod.productCode === 'SWBLPB21010' || (prod.multiDeptIssueDepartments && prod.multiDeptIssueDepartments.length >= 2));
        const hasBlocker = Boolean(isMathMismatch || !prod.isApproved || (prod.detailUrl && prod.detailUrl.includes('broken-link')) || isMultiDept);

        list.push({
          promo,
          product: prod,
          calculatedDiscount,
          isMathMismatch,
          isTrendAnomaly,
          isMultiDept,
          hasBlocker,
        });
      });
    });

    return list;
  }, [promotions, selectedBrand]);

  // 검색 및 필터링 적용
  const filteredSkuItems = useMemo(() => {
    return allSkuItems.filter((item) => {
      // 텍스트 검색
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = item.product.productCode.toLowerCase().includes(q);
        const nameMatch = item.product.productName.toLowerCase().includes(q);
        const promoMatch = item.promo.title.toLowerCase().includes(q);
        if (!codeMatch && !nameMatch && !promoMatch) return false;
      }

      // 상태 필터
      if (filterType === 'MULTI_DEPT') return item.isMultiDept;
      if (filterType === 'TREND_ANOMALY') return item.isTrendAnomaly;
      if (filterType === 'BLOCKER') return item.hasBlocker;
      if (filterType === 'PASSED') return !item.hasBlocker && !item.isTrendAnomaly;

      return true;
    });
  }, [allSkuItems, searchQuery, filterType]);

  // KPI 통계 카운트
  const totalCount = allSkuItems.length;
  const multiDeptCount = allSkuItems.filter((i) => i.isMultiDept).length;
  const trendAnomalyCount = allSkuItems.filter((i) => i.isTrendAnomaly).length;
  const blockerCount = allSkuItems.filter((i) => i.hasBlocker).length;
  const passedCount = allSkuItems.filter((i) => !i.hasBlocker && !i.isTrendAnomaly).length;

  const handleStartEdit = (
    promoId: string,
    prod: ProductItem
  ) => {
    setEditingKey(`${promoId}_${prod.id}`);
    setEditPriceStr(String(prod.salePrice));
    setEditDiscountRateStr(String(prod.displayDiscountRate));
    setEditCouponApplicable(prod.couponApplicable);
    setEditUrl(prod.detailUrl);
  };

  const handleSaveEdit = (promoId: string, prodId: string) => {
    const finalPrice = Number(editPriceStr.replace(/[^0-9]/g, '')) || 0;
    const finalRate = Number(editDiscountRateStr.replace(/[^0-9]/g, '')) || 0;

    updateProductAndRevalidate(promoId, prodId, {
      salePrice: finalPrice,
      displayDiscountRate: finalRate,
      couponApplicable: editCouponApplicable,
      detailUrl: editUrl,
    });
    setEditingKey(null);
  };

  const handleOpenDualDraft = (productCode: string) => {
    setSelectedDraftId('draft-multi-dept-md');
    setIsDraftModalOpen(true);
    if (onOpenDualDraftModal) {
      onOpenDualDraftModal(productCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 브리핑 & 헤더 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  단품(SKU) 마스터 정합성 QC 워크스페이스
                </h2>
                <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  품번 단위 전수 검수 · 트렌드 이상치 감지 · 다부서 복합 결함 관리
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              기획전 단위 업무와 분리하여 수백 개 개별 품번(SKU)의 가격·할인율·마진·상세링크·대표이미지 정합성을 1:1 전수 검증하고 즉시 인라인 수정합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToExcel(promotions, '2026SS_전체_SKU_정합성_마스터_리포트')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>SKU 전수 엑셀 내보내기 (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 2. 5대 핵심 SKU 상태 지표 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase">전체 검수 대상 SKU</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
              <span className="text-xs text-slate-500">종</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">인동FN 3대 브랜드 통합</p>
          </div>

          {/* 다부서 복합 결함 카드 */}
          <div
            onClick={() => setFilterType(filterType === 'MULTI_DEPT' ? 'ALL' : 'MULTI_DEPT')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterType === 'MULTI_DEPT'
                ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-300'
                : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                다부서 복합 결함
              </span>
              <span className="text-[10px] font-bold bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded-full">
                MD+디자인
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-purple-900 font-mono">{multiDeptCount}</span>
              <span className="text-xs text-purple-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-purple-700 mt-1 font-semibold">2개 이상 부서 동시 확인</p>
          </div>

          {/* 트렌드 이상치 (80% 등) 카드 */}
          <div
            onClick={() => setFilterType(filterType === 'TREND_ANOMALY' ? 'ALL' : 'TREND_ANOMALY')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterType === 'TREND_ANOMALY'
                ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                트렌드 이상치
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full">
                80% 오기입
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-900 font-mono">{trendAnomalyCount}</span>
              <span className="text-xs text-amber-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-amber-700 mt-1 font-semibold">시즌 평균(30%) 대비 극단치</p>
          </div>

          {/* 단일 차단 결함 카드 */}
          <div
            onClick={() => setFilterType(filterType === 'BLOCKER' ? 'ALL' : 'BLOCKER')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterType === 'BLOCKER'
                ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              즉시 조치 결함 (BLOCKER)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-rose-900 font-mono">{blockerCount}</span>
              <span className="text-xs text-rose-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-rose-700 mt-1">미승인·404·할인율 불일치</p>
          </div>

          {/* 정상 검증 완료 카드 */}
          <div
            onClick={() => setFilterType(filterType === 'PASSED' ? 'ALL' : 'PASSED')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterType === 'PASSED'
                ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              정합성 검증 완료
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-900 font-mono">{passedCount}</span>
              <span className="text-xs text-emerald-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1">오류 없음 (게시 승인 가능)</p>
          </div>
        </div>

        {/* 3. 트렌드 이상치(원본 기획 오류) 판정 안내 가이드 */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowTrendGuide(!showTrendGuide)}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>💡 원본 기획 데이터 트렌드 이상치(Anomaly) 사전 감지 가이드</span>
              <span className="text-[11px] font-normal text-slate-500">
                (보통 할인율 30% 카테고리인데 80%로 초기 오기입된 휴먼 에러 방지)
              </span>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600">
              {showTrendGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showTrendGuide && (
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] leading-relaxed text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">1. 왜 원본 이상치 감지가 필요한가?</strong>
                <p className="text-slate-500">
                  계산 수식은 맞아도, MD 담당자가 엑셀 작성 단계에서 <strong>'0'을 잘못 치거나(198,000원 ➔ 19,800원), 평균 30% 상품에 80%를 오기입</strong>하여 업로드하면 대규모 역마진과 가격 사고가 발생합니다.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">2. 시스템의 이상치 감지 기준</strong>
                <p className="text-slate-500">
                  과거 동시즌/동일 카테고리(트렌치코트, 자켓 등) 평균 할인율(25~35%)을 기준으로, <strong>기획 할인율이 75% 이상이거나 평균 대비 +40%p 이상 극단적 편차</strong>를 보일 경우 경고 알림을 표시합니다.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">3. 다부서 복합 결함 원클릭 분할 처리</strong>
                <p className="text-slate-500">
                  단일 품번에 가격 오류(MD)와 썸네일 해상도 미달(디자인)이 함께 발생한 경우, <strong>'2분할 듀얼 메일'</strong> 화면을 통해 각 부서에 맞는 초안을 한 번에 확인하고 동시 발송할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. 필터 및 검색 툴바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* 브랜드 필터 */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 font-bold text-slate-600">
              <button
                onClick={() => setSelectedBrand('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                전체 브랜드
              </button>
              <button
                onClick={() => setSelectedBrand('SHESMISS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SHESMISS' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SHESMISS
              </button>
              <button
                onClick={() => setSelectedBrand('LIST')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                LIST
              </button>
              <button
                onClick={() => setSelectedBrand('SISTINA')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SISTINA' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SISTINA
              </button>
            </div>

            {/* 상태 필터 버튼군 */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 font-bold text-slate-600">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                전체 SKU ({totalCount})
              </button>
              <button
                onClick={() => setFilterType('MULTI_DEPT')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'MULTI_DEPT' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                🚨 다부서 복합 ({multiDeptCount})
              </button>
              <button
                onClick={() => setFilterType('TREND_ANOMALY')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'TREND_ANOMALY' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                ⚠️ 트렌드 이상치 ({trendAnomalyCount})
              </button>
              <button
                onClick={() => setFilterType('BLOCKER')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'BLOCKER' ? 'bg-white text-rose-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                ❌ 결함 품번 ({blockerCount})
              </button>
              <button
                onClick={() => setFilterType('PASSED')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'PASSED' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                ✅ 정상 통과 ({passedCount})
              </button>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="품번(SWBLPB21010) 또는 상품명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 5. 단품(SKU) 전수 정합성 데이터 그리드 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              전수 검수 상품 목록 ({filteredSkuItems.length}종)
            </span>
            {filterType !== 'ALL' && (
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                필터: {filterType}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            실제 판매가와 표기 할인율을 인라인으로 직접 수정하여 즉시 재검증할 수 있습니다.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">품번 (SKU)</th>
                <th className="py-3 px-4">상품 정보 / 룩북 이미지</th>
                <th className="py-3 px-4 text-right">정가</th>
                <th className="py-3 px-4 text-right">실제 판매가</th>
                <th className="py-3 px-4 text-center">수학 계산치</th>
                <th className="py-3 px-4 text-center">표기 할인율</th>
                <th className="py-3 px-4">카테고리 트렌드 vs 원본 기입 (이상치)</th>
                <th className="py-3 px-4">부서별 정합성 상태 & 다부서 확인</th>
                <th className="py-3 px-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkuItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    검색 조건에 일치하는 상품(SKU)이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredSkuItems.map(({ promo, product: prod, calculatedDiscount, isMathMismatch, isTrendAnomaly, isMultiDept, hasBlocker }) => {
                  const editKey = `${promo.id}_${prod.id}`;
                  const isEditing = editingKey === editKey;

                  return (
                    <tr
                      key={editKey}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isMultiDept
                          ? 'bg-purple-50/30'
                          : isTrendAnomaly
                          ? 'bg-amber-50/30'
                          : isMathMismatch
                          ? 'bg-rose-50/30'
                          : ''
                      }`}
                    >
                      {/* 1. 품번 & 브랜드 & 기획전 */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 text-xs">{prod.productCode}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold w-fit ${
                              promo.brand === 'SHESMISS'
                                ? 'bg-purple-100 text-purple-800'
                                : promo.brand === 'LIST'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {promo.brand}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={promo.title}>
                            {promo.title}
                          </span>
                        </div>
                      </td>

                      {/* 2. 상품명 & 썸네일 */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                            <img
                              src={prod.thumbnailUrl}
                              alt={prod.productName}
                              className="w-full h-full object-cover"
                            />
                            {/* 다부서 이슈 상품(SWBLPB21010)의 썸네일 해상도 경고 뱃지 */}
                            {isMultiDept && (
                              <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center text-[9px] text-white font-bold text-center leading-tight p-0.5">
                                300x400
                                <br />
                                저화질
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{prod.productName}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                                {prod.category || '의류'}
                              </span>
                              {prod.isLiveWeek && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <span>🔥</span> LIVE WEEK
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. 정가 */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {prod.originalPrice.toLocaleString()}원
                      </td>

                      {/* 4. 판매가 (인라인 수정 가능) */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editPriceStr}
                            onChange={(e) => setEditPriceStr(e.target.value)}
                            className="w-24 px-2 py-1 text-right font-mono text-xs border border-indigo-500 rounded bg-indigo-50/50 font-bold text-indigo-900 focus:outline-none"
                          />
                        ) : (
                          <span className={isMathMismatch ? 'text-rose-700' : 'text-slate-900'}>
                            {prod.salePrice.toLocaleString()}원
                          </span>
                        )}
                      </td>

                      {/* 5. 수학적 계산 할인율 */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                          {calculatedDiscount}%
                        </span>
                      </td>

                      {/* 6. 표기 할인율 */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDiscountRateStr}
                            onChange={(e) => setEditDiscountRateStr(e.target.value)}
                            className="w-16 px-1 py-1 text-center font-mono text-xs border border-indigo-500 rounded bg-indigo-50/50 font-bold text-indigo-900 focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isMathMismatch
                                ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prod.displayDiscountRate}%
                          </span>
                        )}
                      </td>

                      {/* 7. [핵심] 카테고리 트렌드 vs 원본 기입 (이상치 감지 알림) */}
                      <td className="py-3.5 px-4">
                        {isTrendAnomaly ? (
                          <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-amber-900">
                            <div className="flex items-center gap-1 font-bold text-[11px] text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>⚠️ 트렌드 이상치 감지 (80% 극단치)</span>
                            </div>
                            <p className="text-[10px] text-amber-700 mt-0.5 leading-snug">
                              카테고리 시즌 평균({prod.categoryAvgDiscountRate || 30}%) 대비 과도한 할인.
                              <br />
                              <strong className="text-rose-700">MD 초기 원본 오입력(0 누락 등) 확인 요망</strong>
                            </p>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono">평균: {prod.categoryAvgDiscountRate || 30}%</span>
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                              ✓ 정상 범위
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 8. [핵심] 부서별 정합성 상태 & 다부서 확인 */}
                      <td className="py-3.5 px-4">
                        {isMultiDept ? (
                          <div className="bg-purple-50 border border-purple-300 p-2 rounded-lg text-purple-900 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-purple-900 flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                🚨 다부서 복합 결함 (MD+디자인)
                              </span>
                              <span className="text-[9px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                                2개 부서
                              </span>
                            </div>
                            <p className="text-[10px] text-purple-700 leading-snug">
                              • MD팀: 표기 할인율 40% vs 실제 30%<br />
                              • 디자인팀: 썸네일 저화질(300x400) 교체
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenDualDraft(prod.productCode)}
                              className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>✉️ 2분할 듀얼 메일 초안 열기</span>
                            </button>
                          </div>
                        ) : isMathMismatch ? (
                          <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>👗 MD팀: 계산 불일치(수정 필요)</span>
                          </div>
                        ) : !prod.isApproved ? (
                          <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>👗 MD팀: 사전 미승인 품번</span>
                          </div>
                        ) : prod.detailUrl.includes('broken-link') ? (
                          <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>💻 개발팀: 404 URL 단절</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>전체 검증 통과 (정상)</span>
                          </div>
                        )}
                      </td>

                      {/* 9. 액션 */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(promo.id, prod.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              title="수정 완료 및 재검증"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="수정 취소"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(promo.id, prod)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="가격/할인율/URL 인라인 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
