'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { renderBannerToDataUrl } from '@/utils/bannerRenderer';
import {
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Download,
  AlertCircle,
  Eye,
  Smartphone,
  Monitor,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BannerStudioProps {
  promotionId: string;
}

export default function BannerStudio({ promotionId }: BannerStudioProps) {
  const { promotions, confirmBanner, updatePromotion } = useOpsStore();
  const promo = promotions.find((p) => p.id === promotionId);

  // 로컬 편집 상태 (카피 및 할인 뱃지 텍스트)
  const [copyTitle, setCopyTitle] = useState(promo?.banner.copyTitle || '');
  const [copySubtitle, setCopySubtitle] = useState(promo?.banner.copySubtitle || '');
  const [discountBadge, setDiscountBadge] = useState(promo?.banner.discountBadgeText || '');

  // 위치 및 정렬 상태 (움직이는 위치 조절 기능)
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'middle' | 'bottom'>('middle');
  const [horizontalAlign, setHorizontalAlign] = useState<'left' | 'center' | 'right'>('center');

  // 슬라이드 선택 및 정적 편집 상태 (자동 롤링 제거하여 작업 집중도 향상)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enableMotion, setEnableMotion] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 렌더링된 Data URL (PC 1920x600, MO 750x900)
  const [slideUrls, setSlideUrls] = useState<{
    pc: string[];
    mo: string[];
  }>({ pc: [], mo: [] });
  const [pcDataUrl, setPcDataUrl] = useState<string>('');
  const [moDataUrl, setMoDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PC' | 'MO'>('PC');
  const [isRendering, setIsRendering] = useState(false);

  // 3개 룩북 화보 슬라이드 데이터셋
  const slidesMeta = useMemo(() => {
    return [
      {
        id: 0,
        badgeName: '01 메인 룩북 화보',
        subDesc: '메인 시그니처 컷',
        imageUrl: promo?.banner.sourceImageUrl || '/images/products/SWBLPB21010_main.jpg',
        title: copyTitle || promo?.title || '',
        subtitle: copySubtitle || '리스트 봄 시그니처 아우터 특가전',
        badge: discountBadge || 'UP TO 40%',
      },
      {
        id: 1,
        badgeName: '02 스타일링 풀샷 화보',
        subDesc: '모델 풀샷 & 아우터 스타일링',
        imageUrl: '/images/products/SWBLPB21010_detail_profile.jpg',
        title: '2026 SPRING SIGNATURE OUTER',
        subtitle: '단 7일간 전 상품 10% 추가 쿠폰팩',
        badge: 'SPECIAL BENEFIT',
      },
      {
        id: 2,
        badgeName: '03 프리미엄 소재 & 디테일',
        subDesc: '인동FN 독점 수입 원단 & 마감',
        imageUrl: '/images/products/SWBLPB21010_detail_fabric.jpg',
        title: 'HIGH-END TAILORED COLLECTION',
        subtitle: '인동FN 독점 수입 원단 & 프리미엄 라인',
        badge: 'EXCLUSIVE',
      },
    ];
  }, [promo, copyTitle, copySubtitle, discountBadge]);

  // 프로모션이 바뀌면 텍스트 동기화
  useEffect(() => {
    if (promo) {
      setCopyTitle(promo.banner.copyTitle);
      setCopySubtitle(promo.banner.copySubtitle);
      setDiscountBadge(promo.banner.discountBadgeText);
    }
  }, [promo?.id, promo?.banner.copyTitle, promo?.banner.copySubtitle, promo?.banner.discountBadgeText]);

  // 배너 실시간 Canvas 렌더링 함수 (3개 슬라이드 전체 합성)
  const triggerRender = async () => {
    if (!promo) return;
    setIsRendering(true);

    const periodStr = `${promo.startDate.replace(/-/g, '.')} - ${promo.endDate.slice(5).replace(/-/g, '.')}`;

    try {
      // Slide 0: 메인 화보
      const pc0 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: copyTitle || promo.title,
        copySubtitle: copySubtitle || `${promo.brand} SEASON SPECIAL`,
        discountBadgeText: discountBadge || `UP TO ${promo.targetDiscountRate}%`,
        periodText: periodStr,
        width: 1920,
        height: 600,
        bgImageUrl: promo.banner.sourceImageUrl,
        verticalPosition,
        horizontalAlign,
      });
      const mo0 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: copyTitle || promo.title,
        copySubtitle: copySubtitle || `${promo.brand} SEASON SPECIAL`,
        discountBadgeText: discountBadge || `UP TO ${promo.targetDiscountRate}%`,
        periodText: periodStr,
        width: 750,
        height: 900,
        bgImageUrl: promo.banner.sourceImageUrl,
        verticalPosition,
        horizontalAlign,
      });

      // Slide 1: 모델 스타일링 룩북
      const pc1 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: '2026 SPRING SIGNATURE OUTER',
        copySubtitle: '모던 클래식 실루엣 & 트렌치 프리뷰',
        discountBadgeText: '10% 추가 쿠폰',
        periodText: periodStr,
        width: 1920,
        height: 600,
        bgImageUrl: '/images/products/SWBLPB21010_detail_profile.jpg',
        verticalPosition,
        horizontalAlign,
      });
      const mo1 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: '2026 SPRING SIGNATURE OUTER',
        copySubtitle: '모던 클래식 실루엣 & 트렌치 프리뷰',
        discountBadgeText: '10% 추가 쿠폰',
        periodText: periodStr,
        width: 750,
        height: 900,
        bgImageUrl: '/images/products/SWBLPB21010_detail_profile.jpg',
        verticalPosition,
        horizontalAlign,
      });

      // Slide 2: 프리미엄 테일러링 & 소재 디테일
      const pc2 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: 'HIGH-END TAILORED COLLECTION',
        copySubtitle: '인동FN 독점 수입 원단 & 프리미엄 라인',
        discountBadgeText: 'EXCLUSIVE 40%',
        periodText: periodStr,
        width: 1920,
        height: 600,
        bgImageUrl: '/images/products/SWBLPB21010_detail_fabric.jpg',
        verticalPosition,
        horizontalAlign,
      });
      const mo2 = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: 'HIGH-END TAILORED COLLECTION',
        copySubtitle: '인동FN 독점 수입 원단 & 프리미엄 라인',
        discountBadgeText: 'EXCLUSIVE 40%',
        periodText: periodStr,
        width: 750,
        height: 900,
        bgImageUrl: '/images/products/SWBLPB21010_detail_fabric.jpg',
        verticalPosition,
        horizontalAlign,
      });

      setSlideUrls({
        pc: [pc0, pc1, pc2],
        mo: [mo0, mo1, mo2],
      });
      setPcDataUrl(pc0);
      setMoDataUrl(mo0);

      // store에도 저장
      updatePromotion(promo.id, {
        banner: {
          ...promo.banner,
          pcBannerUrl: pc0,
          moBannerUrl: mo0,
          copyTitle,
          copySubtitle,
          discountBadgeText: discountBadge,
        },
      });
    } catch (err) {
      console.error('배너 렌더링 실패:', err);
    } finally {
      setIsRendering(false);
    }
  };

  // 배경 이미지나 텍스트, 위치 설정이 바뀔 때 자동 렌더링
  useEffect(() => {
    triggerRender();
  }, [promo?.banner.sourceImageUrl, copyTitle, copySubtitle, discountBadge, verticalPosition, horizontalAlign]);

  // 직접 배너 사진 업로드 처리 (FileReader)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !promo) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updatePromotion(promo.id, {
          banner: {
            ...promo.banner,
            sourceImageUrl: dataUrl,
            sourceImageName: file.name,
          },
        });
        setCurrentSlide(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // 드래그 앤 드롭 파일 업로드 처리
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !promo || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updatePromotion(promo.id, {
          banner: {
            ...promo.banner,
            sourceImageUrl: dataUrl,
            sourceImageName: file.name,
          },
        });
        setCurrentSlide(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // 기본 룩북 이미지로 복구
  const handleResetToDefaultImage = () => {
    if (!promo) return;
    updatePromotion(promo.id, {
      banner: {
        ...promo.banner,
        sourceImageUrl: '/images/products/SWBLPB21010_main.jpg',
        sourceImageName: 'LIST_26SS_lookbook_trench_main.jpg',
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCurrentSlide(0);
  };

  const isCustomImage = Boolean(
    promo?.banner.sourceImageUrl &&
    promo?.banner.sourceImageUrl !== '/images/products/SWBLPB21010_main.jpg' &&
    !promo?.banner.sourceImageUrl.startsWith('/images/products/')
  );

  if (!promo) return null;

  // 이전 슬라이드
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };

  // 다음 슬라이드
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  // 원클릭 컨펌 처리
  const handleConfirm = () => {
    confirmBanner(promo.id, {
      pcBannerUrl: pcDataUrl,
      moBannerUrl: moDataUrl,
      copyTitle,
      copySubtitle,
      discountBadgeText: discountBadge,
    });

    // 축하 꽃가루 효과
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // 현재 표시할 배너 이미지
  const currentPcImage = slideUrls.pc[currentSlide] || pcDataUrl;
  const currentMoImage = slideUrls.mo[currentSlide] || moDataUrl;
  const currentImage = activeTab === 'PC' ? currentPcImage : currentMoImage;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* 상단 헤더 */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              배너 스튜디오 (실시간 카피 합성 & 이미지 직접 업로드)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원하는 화보 사진을 직접 업로드하거나 공식 룩북 위에 브랜드 타이틀·할인율을 실시간으로 합성하고 검수합니다.
          </p>
        </div>

        {/* 컨펌 상태 뱃지 및 액션 */}
        <div className="flex items-center gap-2">
          {promo.banner.isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              배너 컨펌 완료 ({promo.banner.confirmedAt})
            </span>
          ) : (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow transition-all animate-pulse cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>👍 배너 원클릭 컨펌 & 적용</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* 좌측: 실시간 텍스트 및 속성 컨트롤러 (4 cols) */}
        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-50/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              배너 카피 수정
            </span>

            {/* 랜더링 옆 직접 배너 넣을 사진 업로드 및 재렌더링 버튼 */}
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                title="내 PC에서 새로운 배너 사진 직접 업로드 (긴급 화보 교체)"
              >
                <Upload className="w-3 h-3 text-indigo-600" />
                <span>사진 직접 업로드</span>
              </button>
              <button
                type="button"
                onClick={triggerRender}
                disabled={isRendering}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer px-1.5 py-1"
                title="배너 캔버스 강제 재합성"
              >
                <RefreshCw className={`w-3 h-3 ${isRendering ? 'animate-spin' : ''}`} />
                <span>재렌더링</span>
              </button>
            </div>
          </div>

          {/* 소스 화보 정보 및 드롭존 */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
              isCustomImage
                ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-200/80 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">배너 적용 화보:</span>
                {isCustomImage ? (
                  <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    직접 업로드 사진 적용 중
                  </span>
                ) : (
                  <span className="font-semibold text-slate-800">{promo.brand} 공식 룩북</span>
                )}
              </div>

              {isCustomImage ? (
                <button
                  type="button"
                  onClick={handleResetToDefaultImage}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer flex items-center gap-0.5"
                  title="원래 공식 룩북 이미지로 되돌리기"
                >
                  <RotateCcw className="w-3 h-3" />
                  기본 복구
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                >
                  사진 변경
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <p className="text-slate-500 truncate max-w-[210px]" title={promo.banner.sourceImageName || '기본 화보'}>
                파일명: <span className="font-mono font-semibold text-slate-700">{promo.banner.sourceImageName || 'LIST_26SS_lookbook_trench_main.jpg'}</span>
              </p>
              <span className="text-[10px] text-slate-400">드래그&드롭 지원</span>
            </div>
          </div>

          {/* 메인 타이틀 카피 */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">메인 타이틀 카피</label>
            <input
              type="text"
              value={copyTitle}
              onChange={(e) => setCopyTitle(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="행사 대표 타이틀 입력"
            />
          </div>

          {/* 서브 카피 */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">서브 카피</label>
            <input
              type="text"
              value={copySubtitle}
              onChange={(e) => setCopySubtitle(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="서브 설명 문구"
            />
          </div>

          {/* 할인율 뱃지 */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">할인율 뱃지 문구</label>
            <input
              type="text"
              value={discountBadge}
              onChange={(e) => setDiscountBadge(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: UP TO 40%"
            />
          </div>

          {/* 움직이는 기능 제어 툴킷: 위치 이동 & 자동 롤링 */}
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-indigo-600" />
                배너 위치 & 움직임 제어
              </span>
              <span className="text-[10px] text-slate-400 font-medium">실시간 캔버스 합성</span>
            </div>

            {/* 수직 위치 조정 (상 / 중 / 하) */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">카피 세로 위치</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVerticalPosition('top')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    verticalPosition === 'top'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  상단 배치
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalPosition('middle')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    verticalPosition === 'middle'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  중앙 배치
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalPosition('bottom')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    verticalPosition === 'bottom'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  하단 배치
                </button>
              </div>
            </div>

            {/* 수평 정렬 조정 (좌 / 중 / 우) */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">카피 가로 정렬</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setHorizontalAlign('left')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    horizontalAlign === 'left'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlignLeft className="w-3 h-3" />
                  <span>좌측</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHorizontalAlign('center')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    horizontalAlign === 'center'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlignCenter className="w-3 h-3" />
                  <span>중앙</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHorizontalAlign('right')}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    horizontalAlign === 'right'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlignRight className="w-3 h-3" />
                  <span>우측</span>
                </button>
              </div>
            </div>

            {/* 모션 효과 토글 */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <span>✨</span>
                <span>숨쉬는 모션(Ken Burns 줌)</span>
              </span>
              <button
                type="button"
                onClick={() => setEnableMotion(!enableMotion)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  enableMotion
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {enableMotion ? '모션 활성' : '모션 꺼짐'}
              </button>
            </div>
          </div>
        </div>

        {/* 우측: 움직이는 배너 프리뷰 & 규격 탭 (8 cols) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-white">
          <div>
            {/* 상단 탭: PC vs Mobile & 롤링 컨트롤러 */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('PC')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'PC' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC 메인 배너 (1920 x 600)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MO')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'MO' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>모바일 메인 배너 (750 x 900)</span>
                </button>
              </div>

              {/* 정적 편집 안내 & 다운로드 */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>정적 편집 모드</span>
                </span>

                <a
                  href={currentImage}
                  download={`${promo.brand}_${promo.title}_slide${currentSlide + 1}_${activeTab}.png`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG 다운로드</span>
                </a>
              </div>
            </div>

            {/* 실제 배너 렌더링 프리뷰 뷰어 (드래그 앤 드롭 파일 업로드 지원) */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="relative rounded-2xl border border-slate-300 overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[280px] max-h-[420px] group"
              title="사진 파일을 직접 드래그해서 올려놓으면 배너 배경으로 즉시 교체됩니다"
            >
              {currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={currentImage}
                    alt={`${slidesMeta[currentSlide].badgeName} 프리뷰`}
                    className={`object-contain rounded-xl shadow-lg transition-all duration-700 ease-out ${
                      activeTab === 'PC' ? 'w-full h-auto max-h-[350px]' : 'h-[350px] w-auto'
                    } ${enableMotion ? 'scale-[1.02] hover:scale-105 transition-transform duration-1000' : ''}`}
                  />

                  {/* 슬라이드 좌우 수동 이동 화살표 (Hover 시 선명하게 노출) */}
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-110 z-20"
                    title="이전 배너 슬라이드"
                    aria-label="이전 배너 슬라이드"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-110 z-20"
                    title="다음 배너 슬라이드"
                    aria-label="다음 배너 슬라이드"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* 상단 좌측: 배너 상태 인디케이터 */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{slidesMeta[currentSlide].badgeName}</span>
                    </span>
                    {isCustomImage && currentSlide === 0 && (
                      <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300/40 shadow-sm flex items-center gap-1">
                        📷 직접 업로드 사진 적용됨
                      </span>
                    )}
                  </div>

                  {/* 하단 우측: 슬라이드 번호 뱃지 */}
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    <div className="bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md select-none">
                      <span>0{currentSlide + 1} / 03</span>
                      <span className="text-slate-400 text-[10px] font-sans font-normal">(수동 선택)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>배너 캔버스 합성 중...</span>
                </div>
              )}

              {isRendering && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold z-30">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  실시간 캔버스 재합성 중...
                </div>
              )}
            </div>

            {/* 하단 3개 슬라이드 탭 선택 바 (인디케이터) */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {slidesMeta.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    currentSlide === idx
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[11px] font-bold ${currentSlide === idx ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {slide.badgeName}
                    </span>
                    {currentSlide === idx && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{slide.subDesc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 하단 배너 메타 정보 */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              규격: <strong>{activeTab === 'PC' ? '1920 × 600 px (가로형 메인)' : '750 × 900 px (세로형 모바일)'}</strong>
            </span>
            <span>
              적용 브랜드 템플릿: <strong>{promo.brand}</strong> · 위치: <strong>{verticalPosition === 'top' ? '상단' : verticalPosition === 'bottom' ? '하단' : '중앙'} / {horizontalAlign === 'left' ? '좌측' : horizontalAlign === 'right' ? '우측' : '중앙'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
