'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { ProductItem, Promotion, Brand } from '@/types/promotion';
import { exportToExcel, downloadMdStandardTemplate } from '@/utils/excelExporter';
import { runDeterministicQc } from '@/utils/qcEngine';
import * as XLSX from 'xlsx';
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
  UploadCloud,
  FileUp,
  ImageOff,
  CheckCircle,
} from 'lucide-react';

interface SkuMasterQcViewProps {
  onOpenDualDraftModal?: (productCode: string) => void;
}

export default function SkuMasterQcView({ onOpenDualDraftModal }: SkuMasterQcViewProps) {
  const {
    promotions,
    selectedBrand,
    setSelectedBrand,
    selectedPromotionId,
    updateProductAndRevalidate,
    runQcValidation,
    setIsDraftModalOpen,
    setSelectedDraftId,
    addPromotions,
  } = useOpsStore();

  const [onlySelectedPromo, setOnlySelectedPromo] = useState<boolean>(true);
  const selectedPromo = promotions.find((p) => p.id === selectedPromotionId);

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

  // 이미지 404/깨짐 동적 감지 상태 (클라이언트 img onError)
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({
    SWOPPB11010: true, // 목업 초기 상태 반영 (쉬즈미스 신년 플리츠 원피스)
  });

  // 엑셀 업로드 모달 상태
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모든 프로모션의 상품 목록을 평탄화 (Flat list of all SKUs with promotion metadata)
  const allSkuItems = useMemo(() => {
    const list: Array<{
      promo: Promotion;
      product: ProductItem;
      calculatedDiscount: number;
      isMathMismatch: boolean;
      isTrendAnomaly: boolean;
      isMultiDept: boolean;
      hasBrokenImage: boolean;
      hasBlocker: boolean;
    }> = [];

    promotions.forEach((promo) => {
      // 브랜드 필터
      if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return;
      if (onlySelectedPromo && selectedPromotionId && promo.id !== selectedPromotionId) return;

      promo.products.forEach((prod) => {
        const calculatedDiscount = prod.originalPrice > 0
          ? Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100)
          : 0;

        const isMathMismatch = calculatedDiscount !== prod.displayDiscountRate;
        const isTrendAnomaly = Boolean(prod.hasTrendAnomaly || prod.displayDiscountRate >= 75);
        const isMultiDept = Boolean(
          prod.productCode === 'SWBLPB21010' ||
          (prod.multiDeptIssueDepartments && prod.multiDeptIssueDepartments.length >= 2)
        );
        const hasBrokenImage = Boolean(
          prod.hasBrokenImage ||
          !prod.thumbnailUrl ||
          prod.thumbnailUrl.includes('broken') ||
          imageLoadErrors[prod.productCode]
        );
        const hasBlocker = Boolean(
          isMathMismatch ||
          !prod.isApproved ||
          (prod.detailUrl && prod.detailUrl.includes('broken-link')) ||
          isMultiDept ||
          hasBrokenImage
        );

        list.push({
          promo,
          product: prod,
          calculatedDiscount,
          isMathMismatch,
          isTrendAnomaly,
          isMultiDept,
          hasBrokenImage,
          hasBlocker,
        });
      });
    });

    return list;
  }, [promotions, selectedBrand, onlySelectedPromo, selectedPromotionId, imageLoadErrors]);

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

  // 엑셀 파싱 및 즉시 전수 QC 실행 핸들러
  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          alert('엑셀 파일 내 유효한 행 데이터가 없습니다.');
          return;
        }

        // 행 데이터를 ProductItem 배열로 파싱
        const parsedProducts: ProductItem[] = jsonRows.map((row, idx) => {
          const productCode = String(row['품번_SKU'] || row['품번'] || row['상품코드'] || `NEW_SKU_${idx + 1}`).trim();
          const productName = String(row['상품명'] || `기획 상품 ${idx + 1}`).trim();
          const originalPrice = Number(String(row['정상가'] || row['정가'] || 0).replace(/[^0-9]/g, '')) || 198000;
          const salePrice = Number(String(row['판매가'] || 0).replace(/[^0-9]/g, '')) || 138600;
          const displayDiscountRate = Number(String(row['표기할인율'] || row['할인율'] || 0).replace(/[^0-9]/g, '')) || 30;
          const couponApplicable = String(row['쿠폰적용가능'] || row['쿠폰'] || 'Y').toUpperCase().includes('Y');
          const detailUrl = String(row['상세URL'] || `https://idfn.co.kr/product/${productCode}`).trim();
          const thumbnailUrl = String(row['대표이미지URL'] || row['이미지'] || '').trim();
          const category = String(row['카테고리'] || '의류').trim();
          const isApproved = !String(row['사전승인여부'] || 'Y').toUpperCase().includes('N');

          const hasBrokenImage = !thumbnailUrl || thumbnailUrl.includes('broken');
          const isTrendAnomaly = displayDiscountRate >= 75;

          return {
            id: `prod-upload-${Date.now()}-${idx}`,
            productCode,
            productName,
            originalPrice,
            salePrice,
            displayDiscountRate,
            couponApplicable,
            isApproved,
            isLiveWeek: false,
            detailUrl,
            thumbnailUrl,
            category,
            categoryAvgDiscountRate: 30,
            hasTrendAnomaly: isTrendAnomaly,
            hasBrokenImage,
          };
        });

        // 새 기획전 인스턴스 생성 및 룰 엔진 검증 실행
        const brandFromExcel = (jsonRows[0]?.['브랜드'] || 'SHESMISS') as Brand;
        const uploadPromo: Promotion = {
          id: `promo-upload-${Date.now()}`,
          title: `[엑셀 업로드] ${file.name.replace(/\.[^/.]+$/, '')}`,
          brand: brandFromExcel,
          startDate: '2026-10-17',
          endDate: '2026-10-24',
          targetDiscountRate: parsedProducts[0]?.displayDiscountRate || 30,
          category: parsedProducts[0]?.category || '아우터',
          status: 'NEEDS_CHECK',
          currentBottleneckDept: 'MD',
          allowCoupon: true,
          products: parsedProducts,
          qcIssues: [],
          emailDraftIds: [],
          banner: {
            sourceImageUrl: parsedProducts[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
            copyTitle: `${file.name.replace(/\.[^/.]+$/, '')} 특가전`,
            copySubtitle: '인동FN 공식몰 단독 시즌 기획전',
            discountBadgeText: `${parsedProducts[0]?.displayDiscountRate || 30}%`,
            isConfirmed: true,
          },
          milestones: [],
          timestamps: {
            plannedAt: '2026-10-05 09:00',
            dataReceivedAt: '2026-10-15 14:00',
            issueDetectedAt: '2026-10-15 14:01',
          },
        };

        const issues = runDeterministicQc(uploadPromo);
        uploadPromo.qcIssues = issues;
        uploadPromo.status = issues.length > 0 ? 'NEEDS_CHECK' : 'QC_PASSED';

        addPromotions([uploadPromo]);
        setUploadSuccessMessage(`🎉 엑셀 [${file.name}] 업로드 완료! 총 ${parsedProducts.length}개 품번(SKU)이 즉시 룰 엔진 전수 검수되었습니다.`);
        setIsUploadModalOpen(false);
      } catch (err) {
        console.error(err);
        alert('엑셀 파싱 중 오류가 발생했습니다. 표준 엑셀 양식을 확인해 주세요.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 프리셋 시뮬레이션 업로드 로더
  const handleLoadPresetScenario = (scenarioType: 'LIST_MULTI' | 'ANOMALY_80' | 'IMAGE_404') => {
    let mockTitle = '';
    let mockProducts: ProductItem[] = [];

    if (scenarioType === 'LIST_MULTI') {
      mockTitle = '[업로드 시연] 26SS LIST 상품기획서 (다부서 복합 결함 포함)';
      mockProducts = [
        {
          id: `preset-${Date.now()}-1`,
          productCode: 'SWBLPB21010',
          productName: '쉬즈미스 클래식 싱글 트렌치코트',
          originalPrice: 198000,
          salePrice: 138600,
          displayDiscountRate: 40,
          couponApplicable: true,
          isApproved: true,
          isLiveWeek: false,
          detailUrl: 'https://idfn.co.kr/product/SWBLPB21010',
          thumbnailUrl: '/images/products/SWBLPB21010_main.jpg',
          category: '트렌치코트',
          categoryAvgDiscountRate: 30,
          hasTrendAnomaly: false,
          multiDeptIssueDepartments: ['MD', 'DESIGN'],
        },
        {
          id: `preset-${Date.now()}-2`,
          productCode: 'SWJCKB21020',
          productName: '쉬즈미스 베이직 맥 싱글 자켓',
          originalPrice: 258000,
          salePrice: 180600,
          displayDiscountRate: 30,
          couponApplicable: true,
          isApproved: true,
          isLiveWeek: false,
          detailUrl: 'https://idfn.co.kr/product/SWJCKB21020',
          thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600',
          category: '자켓',
          categoryAvgDiscountRate: 30,
        },
      ];
    } else if (scenarioType === 'ANOMALY_80') {
      mockTitle = '[업로드 시연] MD 원본 80% 극단치 오기입 기획서';
      mockProducts = [
        {
          id: `preset-${Date.now()}-3`,
          productCode: 'SWCTKB21030',
          productName: '쉬즈미스 벨티드 하프 트렌치 자켓',
          originalPrice: 358000,
          salePrice: 71600,
          displayDiscountRate: 80,
          couponApplicable: true,
          isApproved: true,
          isLiveWeek: false,
          detailUrl: 'https://idfn.co.kr/product/SWCTKB21030',
          thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600',
          category: '아우터',
          categoryAvgDiscountRate: 30,
          hasTrendAnomaly: true,
        },
      ];
    } else {
      mockTitle = '[업로드 시연] 404 썸네일 파일 유실 기획서';
      mockProducts = [
        {
          id: `preset-${Date.now()}-4`,
          productCode: 'SWOPPB11010',
          productName: '쉬즈미스 신년 플리츠 벨티드 원피스',
          originalPrice: 198000,
          salePrice: 138600,
          displayDiscountRate: 30,
          couponApplicable: true,
          isApproved: true,
          isLiveWeek: false,
          detailUrl: 'https://idfn.co.kr/product/SWOPPB11010',
          thumbnailUrl: '/images/products/SWOPPB11010_broken_404.jpg',
          category: '원피스',
          categoryAvgDiscountRate: 30,
          hasBrokenImage: true,
        },
      ];
    }

    const uploadPromo: Promotion = {
      id: `promo-preset-${Date.now()}`,
      title: mockTitle,
      brand: 'SHESMISS',
      startDate: '2026-03-12',
      endDate: '2026-03-25',
      targetDiscountRate: 30,
      category: '아우터',
      status: 'NEEDS_CHECK',
      currentBottleneckDept: 'MD',
      allowCoupon: true,
      products: mockProducts,
      qcIssues: [],
      emailDraftIds: [],
      banner: {
        sourceImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
        copyTitle: mockTitle,
        copySubtitle: '인동FN 공식몰 시즌 기획전',
        discountBadgeText: '30%',
        isConfirmed: true,
      },
      milestones: [],
      timestamps: {
        plannedAt: '2026-10-05 09:00',
        dataReceivedAt: '2026-10-15 14:00',
        issueDetectedAt: '2026-10-15 14:01',
      },
    };

    const issues = runDeterministicQc(uploadPromo);
    uploadPromo.qcIssues = issues;
    uploadPromo.status = issues.length > 0 ? 'NEEDS_CHECK' : 'QC_PASSED';

    addPromotions([uploadPromo]);
    setUploadSuccessMessage(`🎉 시나리오 [${mockTitle}] 불러오기 완료! 즉시 룰 엔진 검수가 실행되었습니다.`);
    setIsUploadModalOpen(false);
  };

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
      {/* 0. 현재 점검 대상 기획전 포커스 안내 바 */}
      {selectedPromo && (
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>현재 선택된 기획전:</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-black ${
                selectedPromo.brand === 'SHESMISS'
                  ? 'bg-purple-100 text-purple-800'
                  : selectedPromo.brand === 'LIST'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {selectedPromo.brand}
            </span>
            <span className="font-black text-slate-900 text-sm">
              {selectedPromo.title}
            </span>
            <span className="bg-white/90 font-mono text-[11px] text-slate-600 px-2 py-0.5 rounded-md border border-indigo-200 font-bold">
              ID: {selectedPromo.id}
            </span>
            <span className="text-indigo-900 font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-indigo-200">
              QC 센터 동기화: 등록 품번 {selectedPromo.products.length}종 전수 검사
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOnlySelectedPromo(!onlySelectedPromo)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              onlySelectedPromo
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
            }`}
          >
            {onlySelectedPromo
              ? `✓ 선택된 기획전 품번만 필터링 중 (${selectedPromo.products.length}종)`
              : '전체 기획전 품번 보기'}
          </button>
        </div>
      )}

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
              onClick={() => downloadMdStandardTemplate()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border border-slate-200"
              title="MD 기획자 표준 엑셀 양식 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>📥 MD 표준 양식 다운로드</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>📤 MD 기획 엑셀 업로드 &amp; 즉시 QC</span>
            </button>
            <button
              onClick={() => exportToExcel(promotions, '2026SS_전체_SKU_정합성_마스터_리포트')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>SKU 전수 엑셀 내보내기 (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 엑셀 업로드 성공 알림 토스트 배너 */}
        {uploadSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{uploadSuccessMessage}</span>
            </div>
            <button
              onClick={() => setUploadSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold cursor-pointer"
            >
              닫기 ✕
            </button>
          </div>
        )}

        {/* 2. 핵심 4대 SKU 상태 정합성 지표 카드 (정합 수식: 결함 4종 + 이상치 1종 + 정상 3종 = 전체 8종 100% 일치) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
          {/* 카드 1: 전체 검수 대상 SKU */}
          <div
            onClick={() => setFilterType('ALL')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-100/90 border-slate-400 ring-2 ring-slate-300'
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">전체 검수 대상 SKU</span>
              {filterType === 'ALL' && (
                <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-300">
                  전체 표시 중
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
              <span className="text-xs text-slate-500 font-bold">종</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">인동FN 3대 브랜드 통합 전수 검수</p>
          </div>

          {/* 카드 2: 즉시 조치 결함 (BLOCKER - 다부서 복합 1종 포함) */}
          <div
            onClick={() => setFilterType(filterType === 'BLOCKER' ? 'ALL' : 'BLOCKER')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              filterType === 'BLOCKER' || filterType === 'MULTI_DEPT'
                ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                즉시 조치 결함 (BLOCKER)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterType(filterType === 'MULTI_DEPT' ? 'ALL' : 'MULTI_DEPT');
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'MULTI_DEPT'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200'
                }`}
                title="다부서 복합 결함 품번만 필터링 (MD 가격오류 + 디자인 썸네일 해상도)"
              >
                <Layers className="w-3 h-3 text-purple-600" />
                <span>다부서 {multiDeptCount}종 포함</span>
              </button>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-rose-900 font-mono">{blockerCount}</span>
              <span className="text-xs text-rose-700 font-bold">종</span>
              <span className="text-[10px] text-rose-600 font-medium ml-1">
                (단품 4건)
              </span>
            </div>
            <p className="text-[10px] text-rose-700 mt-1 font-medium">
              가격불일치(1) · 미승인(1) · 404 URL(1) · 썸네일(1)
            </p>
          </div>

          {/* 카드 3: 트렌드 이상치 (WARNING) */}
          <div
            onClick={() => setFilterType(filterType === 'TREND_ANOMALY' ? 'ALL' : 'TREND_ANOMALY')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'TREND_ANOMALY'
                ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                트렌드 이상치 (WARNING)
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full">
                80% 오기입
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-amber-900 font-mono">{trendAnomalyCount}</span>
              <span className="text-xs text-amber-700 font-bold">종</span>
            </div>
            <p className="text-[10px] text-amber-700 mt-1 font-medium">
              시즌 평균(30%) 대비 MD 기획 원본 극단치 감지
            </p>
          </div>

          {/* 카드 4: 정합성 검증 완료 (PASSED) */}
          <div
            onClick={() => setFilterType(filterType === 'PASSED' ? 'ALL' : 'PASSED')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              filterType === 'PASSED'
                ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                정합성 검증 완료
              </span>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full">
                PASS
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-emerald-900 font-mono">{passedCount}</span>
              <span className="text-xs text-emerald-700 font-bold">종</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 font-medium">
              오류 없음 (스케줄 자동 게시 승인 가능)
            </p>
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
                <strong className="text-slate-900 block mb-1">3. 복수 부서 오류 원클릭 분할 요청</strong>
                <p className="text-slate-500">
                  단일 품번에 가격 오류(MD)와 썸네일 해상도 미달(디자인)이 함께 발생한 경우, <strong>'부서별 분할 메일'</strong> 화면을 통해 각 부서에 맞는 초안을 한 번에 확인하고 동시 발송할 수 있습니다.
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
                ⚠️ 비정상 할인율 ({trendAnomalyCount})
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
                filteredSkuItems.map(({ promo, product: prod, calculatedDiscount, isMathMismatch, isTrendAnomaly, isMultiDept, hasBrokenImage, hasBlocker }) => {
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
                              onError={() =>
                                setImageLoadErrors((prev) => ({
                                  ...prev,
                                  [prod.productCode]: true,
                                }))
                              }
                            />
                            {/* 이미지 404 / 엑스박스 결함 뱃지 */}
                            {hasBrokenImage && (
                              <div className="absolute inset-0 bg-rose-950/85 flex flex-col items-center justify-center text-[9px] text-white font-bold text-center leading-tight p-0.5 z-10">
                                <span className="text-xs">❌</span>
                                <span className="text-rose-200 mt-0.5">404 깨짐</span>
                                <span className="text-[8px] text-rose-300">엑스박스</span>
                              </div>
                            )}
                            {/* 다부서 이슈 상품(SWBLPB21010)의 썸네일 해상도 경고 뱃지 */}
                            {isMultiDept && !hasBrokenImage && (
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
                              <span>⚠️ 비정상 할인율 감지 (80% 오기입 의심)</span>
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
                                🚨 복수 부서 확인 필요 (MD+디자인)
                              </span>
                              <span className="text-[9px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                                2개 부서
                              </span>
                            </div>
                            <p className="text-[10px] text-purple-700 leading-snug">
                              • 기획MD팀: 표기 할인율 40% vs 실제 30%<br />
                              • 웹디자인팀: 썸네일 저화질(300x400) 교체
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenDualDraft(prod.productCode)}
                              className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>✉️ 부서별 맞춤 요청 메일 열기</span>
                            </button>
                          </div>
                        ) : hasBrokenImage ? (
                          <div className="bg-rose-50 border border-rose-300 p-2 rounded-lg text-rose-900 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-rose-900 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                🎨 웹디자인팀: 이미지 깨짐(404 / 엑스박스)
                              </span>
                              <span className="text-[9px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded">
                                오픈 불가
                              </span>
                            </div>
                            <p className="text-[10px] text-rose-700 leading-snug">
                              대표 썸네일 파일 경로 누락 또는 404 깨짐 감지. 룩북 에셋 교체 필요.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDraftId('draft-jan-design-img');
                                setIsDraftModalOpen(true);
                              }}
                              className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>✉️ 웹디자인팀 조치 요청 메일 작성 &gt;</span>
                            </button>
                          </div>
                        ) : isMathMismatch ? (
                          <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>👗 기획MD팀: 계산 불일치(수정 필요)</span>
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
                        ) : isTrendAnomaly ? (
                          <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-amber-900 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-amber-900 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                ⚠️ MD팀: 80% 트렌드 이상치 소명 필요
                              </span>
                              <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                확인 대기
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-700 leading-snug">
                              시즌 평균({prod.categoryAvgDiscountRate || 30}%) 대비 과도 할인. 원본 오기입 소명 필요.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDraftId('draft-trend-anomaly-md');
                                setIsDraftModalOpen(true);
                              }}
                              className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>✉️ MD팀 확인 요청 메일 작성 &gt;</span>
                            </button>
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
                              type="button"
                              onClick={() => setEditingKey(null)}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="수정 취소"
                              aria-label="인라인 수정 취소"
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

      {/* 6. MD 기획 엑셀 파일 업로드 & 즉시 전수 QC 모달 */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    MD 기획 엑셀 업로드 및 즉시 전수 QC
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    MD 기획 시트를 시스템에 업로드하여 계산 수식, 트렌드 이상치, 404 깨짐을 즉시 검수합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="엑셀 업로드 팝업 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 space-y-6">
              {/* 드래그 앤 드롭 영역 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleExcelUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleExcelUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-3">
                  <FileUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  기획 엑셀 파일을 여기로 드래그하거나 클릭하여 선택
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  지원 형식: .xlsx, .xls, .csv (인동FN 표준 기획전 양식 권장)
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMdStandardTemplate();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>MD 표준 엑셀 양식 다운로드 (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* 실무 검증용 원클릭 시나리오 프리셋 */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  💡 파일이 없는 경우 즉시 시연할 수 있는 샘플 프리셋
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLoadPresetScenario('LIST_MULTI')}
                    className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-purple-900">시나리오 1</span>
                      <span className="text-[9px] font-bold bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">
                        다부서 결함
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-medium">
                      26SS LIST 트렌치코트 기획서
                    </p>
                    <span className="text-[10px] text-purple-600/80 block mt-1">
                      MD 할인율 오류 + 디자인 해상도 미달
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadPresetScenario('ANOMALY_80')}
                    className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-900">시나리오 2</span>
                      <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                        비정상 할인율
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">
                      80% 극단치 오기입 기획서
                    </p>
                    <span className="text-[10px] text-amber-600/80 block mt-1">
                      아우터 30% 평균 대비 80% 오입력
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadPresetScenario('IMAGE_404')}
                    className="p-3 text-left rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-900">시나리오 3</span>
                      <span className="text-[9px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">
                        이미지 깨짐
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 font-medium">
                      404 썸네일 경로 유실 기획서
                    </p>
                    <span className="text-[10px] text-rose-600/80 block mt-1">
                      대표 룩북 404 Not Found 감지
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                업로드 즉시 6가지 사전 점검 기준이 자동 실행되어 상단 그리드에 반영됩니다.
              </span>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
