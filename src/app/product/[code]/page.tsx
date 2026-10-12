'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useOpsStore } from '@/store/useOpsStore';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  ChevronRight,
  Download,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailPageProps {
  params: Promise<{ code: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { code } = use(params);
  const { promotions } = useOpsStore();

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [downloadedCoupons, setDownloadedCoupons] = useState<string[]>([]);
  const [isAllDownloaded, setIsAllDownloaded] = useState(false);

  // 모든 프로모션에서 해당 품번의 상품 검색
  let foundProduct = null;
  let foundPromo = null;

  for (const promo of promotions) {
    const p = promo.products.find((prod) => prod.productCode === code);
    if (p) {
      foundProduct = p;
      foundPromo = promo;
      break;
    }
  }

  // 상품이 없는 경우 (사용자가 보내주신 스크린샷과 동일한 카페24 에러 화면 가라 구현)
  if (!foundProduct) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <header className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter text-slate-900">
            IDF <span className="text-xs font-semibold text-slate-400">Mall</span>
          </div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
            OpsPilot으로 돌아가기
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-xs">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">다시 한번 확인해주세요!</h1>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            접근하신 주소의 페이지는<br />
            사라졌거나 다른 페이지로 변경되었어요.<br />
            주소를 다시 확인해주세요.
          </p>

          <div className="flex items-center gap-3 w-full">
            <Link
              href="/"
              className="flex-1 py-3 px-4 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              이전 페이지로 가기
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              메인 페이지로 가기
            </Link>
          </div>
        </main>

        <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400">
          © IN-DONG FN CO., LTD. ALL RIGHTS RESERVED. (IDF몰 가상 프리뷰)
        </footer>
      </div>
    );
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isNewUserAccordionOpen, setIsNewUserAccordionOpen] = useState(true);
  const [couponTab, setCouponTab] = useState<'ALL' | 'DOWNLOAD' | 'TIER'>('ALL');

  const brandName = foundPromo?.brand || 'LIST';
  const calculatedDiscount = Math.round(
    ((foundProduct.originalPrice - foundProduct.salePrice) / foundProduct.originalPrice) * 100
  );

  // 8개 썸네일 스트립 이미지 (스크린샷과 동일한 착장 컷 시뮬레이션)
  const productImages = [
    foundProduct.thumbnailUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1000&auto=format&fit=crop&q=80',
  ];

  // 적용 가능한 쿠폰 목록 (다운로드 쿠폰 + 등급 쿠폰)
  const coupons: import('@/types/promotion').CouponDetail[] = foundProduct.applicableCoupons || [
    {
      id: 'cp-cord-1',
      name: '10월) 신상 5%',
      discountRate: 5,
      type: 'DOWNLOADABLE',
      period: '2026-10-01 ~ 2026-11-01',
      daysLeft: 21,
      condition: '제한 없음',
    },
    {
      id: 'cp-cord-2',
      name: 'LIVE WEEK 10%',
      discountRate: 10,
      type: 'LIVE_WEEK',
      period: '2026-10-02 ~ 2026-10-19',
      daysLeft: 8,
      condition: '제한 없음',
    },
    {
      id: 'cp-cord-3',
      name: '[VIP] 회원 등급 우대 15%',
      discountRate: 15,
      type: 'MEMBERSHIP_TIER',
      period: '2026-10-01 ~ 2026-10-31',
      daysLeft: 20,
      condition: 'VIP 등급 이상 전용',
      isMemberOnly: true,
    },
    {
      id: 'cp-cord-4',
      name: '[GOLD] 회원 등급 우대 10%',
      discountRate: 10,
      type: 'MEMBERSHIP_TIER',
      period: '2026-10-01 ~ 2026-10-31',
      daysLeft: 20,
      condition: 'GOLD 등급 이상 전용',
      isMemberOnly: true,
    },
  ];

  const downloadableCoupons = coupons.filter(
    (c) => c.type === 'DOWNLOADABLE' || c.type === 'LIVE_WEEK'
  );
  const tierCoupons = coupons.filter((c) => c.type === 'MEMBERSHIP_TIER');

  const filteredModalCoupons =
    couponTab === 'ALL'
      ? coupons
      : couponTab === 'DOWNLOAD'
      ? downloadableCoupons
      : tierCoupons;

  const handleDownloadSingle = (couponId: string) => {
    if (!downloadedCoupons.includes(couponId)) {
      setDownloadedCoupons([...downloadedCoupons, couponId]);
    }
  };

  const handleDownloadAll = () => {
    setDownloadedCoupons(downloadableCoupons.map((c) => c.id));
    setIsAllDownloaded(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 1. 실제 IDF몰 상단 헤더 & 카테고리 메뉴바 */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xs z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              <span>IDF</span>
              <span className="text-sm font-normal text-slate-400">Mall</span>
            </Link>

            {/* 브랜드 로고 탭 (SHESMISS · LIST · SISTINA) */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-500 pl-4 border-l border-slate-200">
              <span className={brandName === 'SHESMISS' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'}>
                SHESMISS
              </span>
              <span className={brandName === 'LIST' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'}>
                LIST
              </span>
              <span className={brandName === 'SISTINA' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'}>
                SISTINA
              </span>
            </div>
          </div>

          {/* 우측 아이콘 바 */}
          <div className="flex items-center gap-3 text-slate-600">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              title="IDF몰 AI 상품 검색"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI 상품 검색</span>
            </Link>
            <ShoppingBag className="w-4 h-4 cursor-pointer hover:text-slate-900" />
            <Link href="/" className="text-xs text-indigo-600 font-semibold hover:underline ml-2">
              OpsPilot 복귀
            </Link>
          </div>
        </div>

        {/* 하단 네비게이션 탭 (LIVE WEEK, 아울렛 특가 등) */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 text-xs font-semibold text-slate-600 overflow-x-auto h-10 border-t border-slate-100">
          <span className="text-rose-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
            LIVE WEEK
          </span>
          <span className="text-rose-600 font-bold">아울렛 특가</span>
          <span>베스트</span>
          <span>신상품</span>
          <span>아울렛</span>
          <span>컬렉션</span>
          <span>기획전</span>
          <span>매거진</span>
          <span>룩북</span>
          <span>LIVE</span>
        </div>
      </header>

      {/* 본문 상품 상세 */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* 좌측: IDF몰 실제 데스크톱 레이아웃 100% 일치 (8개 세로 썸네일 스트립 + 대형 화보 컷) */}
        <div className="md:col-span-6 flex gap-4">
          {/* 세로 썸네일 스트립 (8개 컷) */}
          <div className="flex flex-col gap-2 shrink-0 max-h-[580px] overflow-y-auto scrollbar-none">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="썸네일" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* 메인 대형 이미지 뷰어 */}
          <div className="flex-1 aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
            <img
              src={productImages[selectedImageIndex]}
              alt={foundProduct.productName}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            {foundProduct.isLiveWeek && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-md shadow-md tracking-wider">
                  LIVE WEEK
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 상품 정보 및 쿠폰 받기 영역 */}
        <div className="md:col-span-6 flex flex-col justify-between py-1">
          <div className="space-y-5">
            {/* 1. LIVE WEEK 빨간 글씨 특별 혜택 안내 (스크린샷 정확 일치!) */}
            {foundProduct.isLiveWeek && (
              <div className="text-xs font-bold text-rose-600 tracking-tight flex items-center gap-1.5">
                <span>🔥</span>
                <span>{foundProduct.liveWeekBenefitText || '라이브위크 단 7일간의 특별한 혜택'}</span>
              </div>
            )}

            {/* 브랜드 & 상품명 & 우측 위시/공유 아이콘 */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {brandName}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 leading-snug">
                  {foundProduct.productName}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  품번: <strong>{foundProduct.productCode}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <button className="p-2 hover:text-rose-600 transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 hover:text-slate-800 transition-colors cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 가격 정보 & 쿠폰 받기 버튼 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>정상 소비자가</span>
                <span className="line-through font-mono text-sm">
                  {foundProduct.originalPrice.toLocaleString()}원
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-600 font-mono">
                    {foundProduct.displayDiscountRate}%
                  </span>
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {foundProduct.salePrice.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-slate-700">원</span>
                </div>

                {/* 쿠폰 받기 버튼 (클릭 시 모달 오픈) */}
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>쿠폰 받기</span>
                </button>
              </div>

              {/* 신규 최대 20% 쿠폰 가격 토글 아코디언 (IDF몰 실화면 재현) */}
              <div className="pt-3 border-t border-slate-200/80">
                <button
                  onClick={() => setIsNewUserAccordionOpen(!isNewUserAccordionOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <span>신규 최대 20% 쿠폰 가격</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-700 text-sm">
                      {Math.round(foundProduct.salePrice * 0.8).toLocaleString()}원
                    </span>
                    <span className="text-slate-400">{isNewUserAccordionOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isNewUserAccordionOpen && (
                  <div className="mt-2 text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex justify-between">
                      <span>• 신규가입 웰컴 20% 쿠폰 적용 시:</span>
                      <strong className="text-slate-800">
                        {Math.round(foundProduct.salePrice * 0.8).toLocaleString()}원
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>• LIVE WEEK 10% 쿠폰 적용 시:</span>
                      <strong className="text-slate-800">
                        {Math.round(foundProduct.salePrice * 0.9).toLocaleString()}원
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 적용 가능한 쿠폰 상세 요약 카드 (다운로드 쿠폰 + 등급 쿠폰 안내 & QC 검증 상태) */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    본 상품에 적용 가능한 쿠폰 상세 ({coupons.length}종)
                  </span>

                  {/* 사용자 요청: 그 바로 옆에 QC란으로 두고 바로 확인 (정보 일치 vs 확인 필요) */}
                  {foundPromo?.allowCoupon && foundProduct.couponApplicable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      ✓ 정보 일치
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300 animate-pulse">
                      🚨 확인 필요 (기획서 불일치)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-semibold"
                >
                  쿠폰 받기 열기 &gt;
                </button>
              </div>

              {/* 다운로드 쿠폰 & 등급 쿠폰 분류 노출 */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    📥 다운로드 쿠폰 (누구나 받기 가능)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {downloadableCoupons.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-2xs"
                      >
                        <span className="text-rose-600 font-bold">{c.discountRate}%</span>
                        <span>{c.name}</span>
                        {downloadedCoupons.includes(c.id) && (
                          <span className="text-[10px] text-emerald-600 font-bold ml-1">✓보유</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {tierCoupons.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      👑 회원 등급 전용 쿠폰 (자동 지급)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tierCoupons.map((c) => (
                        <span
                          key={c.id}
                          className="px-2.5 py-1 rounded-md bg-amber-50/80 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-1 shadow-2xs"
                        >
                          <span className="text-amber-700 font-bold">{c.discountRate}%</span>
                          <span>{c.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 상품 상세 설명 & 혜택 안내 (IDF몰 스타일) */}
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 pt-1 border-t border-slate-100">
              <p>소재감이 돋보이는 모던 베이직 실루엣의 시즌 아우터/자켓입니다.</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="cursor-pointer hover:underline text-slate-600">멤버십 혜택 자세히 보기</span>
                <span>|</span>
                <span className="cursor-pointer hover:underline text-slate-600">카드혜택 카드사별 혜택 안내</span>
              </div>
            </div>

            {/* OpsPilot 사전 QC 통과 마크 */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                OpsPilot 6대 사전 QC 통과 완료
              </span>
              <span className="font-mono text-emerald-700 text-[11px]">
                정합치: {calculatedDiscount}% / 쿠폰 정책 적합
              </span>
            </div>
          </div>

          {/* 하단 구매 버튼 바 */}
          <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
            <button className="p-3.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="flex-1 py-4 px-6 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              <span>바로 구매하기</span>
            </button>
          </div>
        </div>
      </main>

      {/* 2. 실제 IDF몰 스크린샷 100% 재현: '쿠폰 받기' 모달 팝업 */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            {/* 모달 상단 헤더 */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">쿠폰 받기</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 탭 (전체 쿠폰 / 다운로드 쿠폰 / 회원 등급 쿠폰) */}
            <div className="flex border-b border-slate-100 px-6 pt-3 gap-4 text-xs font-bold text-slate-500">
              <button
                onClick={() => setCouponTab('ALL')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  couponTab === 'ALL'
                    ? 'text-slate-950 border-b-2 border-slate-950'
                    : 'hover:text-slate-800'
                }`}
              >
                전체 쿠폰 ({coupons.length})
              </button>
              <button
                onClick={() => setCouponTab('DOWNLOAD')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  couponTab === 'DOWNLOAD'
                    ? 'text-slate-950 border-b-2 border-slate-950'
                    : 'hover:text-slate-800'
                }`}
              >
                다운로드 쿠폰 ({downloadableCoupons.length})
              </button>
              <button
                onClick={() => setCouponTab('TIER')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  couponTab === 'TIER'
                    ? 'text-slate-950 border-b-2 border-slate-950'
                    : 'hover:text-slate-800'
                }`}
              >
                회원 등급 쿠폰 ({tierCoupons.length})
              </button>
            </div>

            {/* 모달 쿠폰 카드 목록 (스크린샷 정확 일치 디자인) */}
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              {filteredModalCoupons.map((coupon) => {
                const isDownloaded = downloadedCoupons.includes(coupon.id);
                const isTier = coupon.type === 'MEMBERSHIP_TIER';

                return (
                  <div
                    key={coupon.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{coupon.name}</span>
                        {isTier && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            등급전용
                          </span>
                        )}
                        {coupon.type === 'LIVE_WEEK' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                            LIVE WEEK
                          </span>
                        )}
                      </p>
                      <p className="text-xl font-black text-rose-600 font-mono">
                        {coupon.discountRate}% 할인
                      </p>
                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <p>{coupon.period}</p>
                        <p>{coupon.daysLeft ? `${coupon.daysLeft}일 남음` : '제한 없음'}</p>
                        <p>{coupon.condition || '제한 없음'}</p>
                      </div>
                    </div>

                    {/* 다운로드 버튼 or 등급 자동적용 뱃지 */}
                    {isTier ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        자동 적용
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDownloadSingle(coupon.id)}
                        disabled={isDownloaded}
                        className={`p-3 rounded-xl border transition-all ${
                          isDownloaded
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default'
                            : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 cursor-pointer'
                        }`}
                        title={isDownloaded ? '다운로드 완료됨' : '쿠폰 다운로드'}
                      >
                        {isDownloaded ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 모달 하단 '쿠폰 모두 받기' 블랙 버튼 (스크린샷 일치) */}
            <div className="p-6 pt-3 border-t border-slate-100 bg-white">
              <button
                onClick={handleDownloadAll}
                disabled={isAllDownloaded}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isAllDownloaded
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-black hover:bg-slate-800 text-white'
                }`}
              >
                {isAllDownloaded ? '모든 다운로드 쿠폰 받기 완료' : '쿠폰 모두 받기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 좌측 하단 실제 IDF몰 스타일의 'AI 상품 검색' 플로팅 알약 버튼 */}
      <Link
        href="/search"
        className="fixed bottom-6 left-6 z-30 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950/90 hover:bg-slate-900 text-white rounded-full shadow-xl backdrop-blur-md text-xs font-bold border border-white/10 transition-transform hover:scale-105"
      >
        <Search className="w-4 h-4 text-indigo-400" />
        <span>AI 상품 검색</span>
        <Heart className="w-3.5 h-3.5 text-rose-400 ml-1" />
      </Link>

      <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 bg-slate-50">
        © IN-DONG FN CO., LTD. (SHESMISS · LIST · SISTINA) ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
