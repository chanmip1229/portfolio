'use client';

import React, { useEffect, useState, useTransition } from 'react';
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

  // 렌더링된 Data URL (PC 1920x600, MO 750x900)
  const [pcDataUrl, setPcDataUrl] = useState<string>('');
  const [moDataUrl, setMoDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PC' | 'MO'>('PC');
  const [isRendering, setIsRendering] = useState(false);

  // 프로모션이 바뀌면 텍스트 동기화
  useEffect(() => {
    if (promo) {
      setCopyTitle(promo.banner.copyTitle);
      setCopySubtitle(promo.banner.copySubtitle);
      setDiscountBadge(promo.banner.discountBadgeText);
    }
  }, [promo?.id, promo?.banner.copyTitle, promo?.banner.copySubtitle, promo?.banner.discountBadgeText]);

  // 배너 실시간 Canvas 렌더링 함수
  const triggerRender = async () => {
    if (!promo) return;
    setIsRendering(true);

    const periodStr = `${promo.startDate.replace(/-/g, '.')} - ${promo.endDate.slice(5).replace(/-/g, '.')}`;

    try {
      // 1. PC 메인 배너 (1920 x 600)
      const pcUrl = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: copyTitle || promo.title,
        copySubtitle: copySubtitle || `${promo.brand} SEASON SPECIAL`,
        discountBadgeText: discountBadge || `UP TO ${promo.targetDiscountRate}%`,
        periodText: periodStr,
        width: 1920,
        height: 600,
        bgImageUrl: promo.banner.sourceImageUrl,
      });
      setPcDataUrl(pcUrl);

      // 2. 모바일 메인 배너 (750 x 900)
      const moUrl = await renderBannerToDataUrl({
        brand: promo.brand,
        copyTitle: copyTitle || promo.title,
        copySubtitle: copySubtitle || `${promo.brand} SEASON SPECIAL`,
        discountBadgeText: discountBadge || `UP TO ${promo.targetDiscountRate}%`,
        periodText: periodStr,
        width: 750,
        height: 900,
        bgImageUrl: promo.banner.sourceImageUrl,
      });
      setMoDataUrl(moUrl);

      // store에도 저장
      updatePromotion(promo.id, {
        banner: {
          ...promo.banner,
          pcBannerUrl: pcUrl,
          moBannerUrl: moUrl,
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

  // 배경 이미지나 텍스트가 바뀔 때 자동 렌더링
  useEffect(() => {
    triggerRender();
  }, [promo?.banner.sourceImageUrl, copyTitle, copySubtitle, discountBadge]);

  if (!promo) return null;

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
              배너 스튜디오 (HTML5 Canvas 1초 자동 합성 & 원클릭 컨펌)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            디자인팀 회신 룩북 사진 위에 브랜드 규격의 타이틀·할인율이 자동 합성되었습니다. 실시간 카피 수정 후 원클릭으로 컨펌하세요.
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow transition-all animate-pulse"
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              배너 카피 인라인 수정 (실시간 반영)
            </span>
            <button
              onClick={triggerRender}
              disabled={isRendering}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRendering ? 'animate-spin' : ''}`} />
              재렌더링
            </button>
          </div>

          {/* 소스 화보 정보 */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>수신된 룩북 화보:</span>
              <span className="font-semibold text-slate-800">{promo.brand} 공식 룩북</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              파일명: {promo.banner.sourceImageName || '기본 화보 템플릿'}
            </p>
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

          <div className="pt-2">
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              💡 <strong>디자이너 작업 불필요:</strong> 긴급 할인율 변경(예: 30% ➔ 40%) 시 위 입력창을 고치면 캔버스 엔진이 배너를 1초 만에 새로 합성합니다.
            </div>
          </div>
        </div>

        {/* 우측: 배너 프리뷰 & 규격 탭 (8 cols) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-white">
          <div>
            {/* 상단 탭: PC vs Mobile */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('PC')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    activeTab === 'PC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC 메인 배너 (1920 x 600)</span>
                </button>
                <button
                  onClick={() => setActiveTab('MO')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    activeTab === 'MO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>모바일 메인 배너 (750 x 900)</span>
                </button>
              </div>

              {/* 다운로드 버튼 */}
              <a
                href={activeTab === 'PC' ? pcDataUrl : moDataUrl}
                download={`${promo.brand}_${promo.title}_${activeTab}.png`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG 다운로드</span>
              </a>
            </div>

            {/* 실제 배너 렌더링 프리뷰 뷰어 */}
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[260px] max-h-[380px]">
              {activeTab === 'PC' ? (
                pcDataUrl ? (
                  <img
                    src={pcDataUrl}
                    alt="PC 배너 프리뷰"
                    className="w-full h-auto max-h-[340px] object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-xs text-slate-400">배너 렌더링 중...</div>
                )
              ) : moDataUrl ? (
                <img
                  src={moDataUrl}
                  alt="모바일 배너 프리뷰"
                  className="h-[340px] w-auto object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-xs text-slate-400">배너 렌더링 중...</div>
              )}

              {isRendering && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  실시간 캔버스 재합성 중...
                </div>
              )}
            </div>
          </div>

          {/* 하단 배너 메타 정보 */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              규격: <strong>{activeTab === 'PC' ? '1920 × 600 px (가로형 메인)' : '750 × 900 px (세로형 모바일)'}</strong>
            </span>
            <span>
              적용 브랜드 템플릿: <strong>{promo.brand}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
