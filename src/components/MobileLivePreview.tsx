'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Smartphone,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Play,
  Pause,
} from 'lucide-react';

import { ProductItem, Promotion } from '@/types/promotion';

interface MobileLivePreviewProps {
  promotionId: string;
}

const getFallbackProducts = (promo: Promotion): ProductItem[] => {
  const discount = promo.targetDiscountRate || 35;
  return [
    {
      id: `${promo.id}-fb-1`,
      productCode: `${promo.brand.slice(0, 2)}JK26010`,
      productName: `[${promo.brand}] 시그니처 테일러드 싱글 자켓`,
      originalPrice: 249000,
      salePrice: Math.round((249000 * (100 - discount)) / 1000) * 10,
      displayDiscountRate: discount,
      detailUrl: `https://www.idfmall.co.kr/product/${promo.brand.slice(0, 2)}JK26010`,
      isApproved: true,
      couponApplicable: promo.allowCoupon,
      category: '자켓',
      categoryAvgDiscountRate: 30,
      thumbnailUrl: '/images/products/SWJCKB21020_main.jpg',
      isLiveWeek: true,
      applicableCoupons: promo.allowCoupon
        ? [
            {
              id: 'cp-fb-1',
              name: '10% 스페셜 쿠폰',
              discountRate: 10,
              type: 'DOWNLOADABLE',
              period: '2026-10-01 ~ 2026-10-31',
            },
          ]
        : undefined,
    },
    {
      id: `${promo.id}-fb-2`,
      productCode: `${promo.brand.slice(0, 2)}CT26020`,
      productName: `[${promo.brand}] 프리미엄 캐시미어 울 벨티드 코트`,
      originalPrice: 389000,
      salePrice: Math.round((389000 * (100 - discount)) / 1000) * 10,
      displayDiscountRate: discount,
      detailUrl: `https://www.idfmall.co.kr/product/${promo.brand.slice(0, 2)}CT26020`,
      isApproved: true,
      couponApplicable: promo.allowCoupon,
      category: '코트',
      categoryAvgDiscountRate: 35,
      thumbnailUrl: '/images/products/SWBLPB21010_main.jpg',
      applicableCoupons: promo.allowCoupon
        ? [
            {
              id: 'cp-fb-1',
              name: '10% 스페셜 쿠폰',
              discountRate: 10,
              type: 'DOWNLOADABLE',
              period: '2026-10-01 ~ 2026-10-31',
            },
          ]
        : undefined,
    },
    {
      id: `${promo.id}-fb-3`,
      productCode: `${promo.brand.slice(0, 2)}OP26030`,
      productName: `[${promo.brand}] 플리츠 버튼업 롱 원피스 (품절임박)`,
      originalPrice: 219000,
      salePrice: Math.round((219000 * (100 - discount)) / 1000) * 10,
      displayDiscountRate: discount,
      detailUrl: `https://www.idfmall.co.kr/product/${promo.brand.slice(0, 2)}OP26030`,
      isApproved: true,
      couponApplicable: promo.allowCoupon,
      category: '원피스',
      categoryAvgDiscountRate: 25,
      thumbnailUrl: '/images/products/SWCTKB21030_main.jpg',
      applicableCoupons: promo.allowCoupon
        ? [
            {
              id: 'cp-fb-1',
              name: '10% 스페셜 쿠폰',
              discountRate: 10,
              type: 'DOWNLOADABLE',
              period: '2026-10-01 ~ 2026-10-31',
            },
          ]
        : undefined,
    },
    {
      id: `${promo.id}-fb-4`,
      productCode: `${promo.brand.slice(0, 2)}KT26040`,
      productName: `[${promo.brand}] 파인 울 케이블 브이넥 니트`,
      originalPrice: 159000,
      salePrice: Math.round((159000 * (100 - discount)) / 1000) * 10,
      displayDiscountRate: discount,
      detailUrl: `https://www.idfmall.co.kr/product/${promo.brand.slice(0, 2)}KT26040`,
      isApproved: true,
      couponApplicable: promo.allowCoupon,
      category: '니트',
      categoryAvgDiscountRate: 30,
      thumbnailUrl: '/images/products/AWWJKQ31060_main.jpg',
      applicableCoupons: promo.allowCoupon
        ? [
            {
              id: 'cp-fb-1',
              name: '10% 스페셜 쿠폰',
              discountRate: 10,
              type: 'DOWNLOADABLE',
              period: '2026-10-01 ~ 2026-10-31',
            },
          ]
        : undefined,
    },
  ];
};

const getProductStatusBadge = (prod: ProductItem) => {
  const calculatedDiscount =
    prod.originalPrice > 0
      ? Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100)
      : 0;
  const isMathMismatch = calculatedDiscount !== prod.displayDiscountRate;
  const isBrokenUrl = Boolean(prod.detailUrl && prod.detailUrl.includes('broken-link'));
  const isUnapproved = !prod.isApproved;

  if (isMathMismatch) {
    return {
      type: 'ERROR',
      label: '🚨 가격불일치',
      desc: `계산 ${calculatedDiscount}% ≠ 표기 ${prod.displayDiscountRate}%`,
      bg: 'bg-rose-600 text-white',
    };
  }
  if (isBrokenUrl) {
    return {
      type: 'ERROR',
      label: '🚨 404 URL',
      desc: '외부 테스트 링크',
      bg: 'bg-rose-600 text-white',
    };
  }
  if (isUnapproved) {
    return {
      type: 'ERROR',
      label: '⚠️ 미승인 품번',
      desc: 'MD 사전 승인 누락',
      bg: 'bg-amber-600 text-white',
    };
  }
  if (prod.hasTrendAnomaly) {
    return {
      type: 'WARNING',
      label: '⚡ 이상치 감지',
      desc: '카테고리 평균 대비 극단값',
      bg: 'bg-amber-500 text-white',
    };
  }
  return {
    type: 'PASS',
    label: '✓ QC 통과',
    desc: '사전 정합성 통과',
    bg: 'bg-emerald-600 text-white',
  };
};

const getStockBadge = (prod: ProductItem) => {
  if (prod.productCode === 'SWCTKB21099' || prod.id.includes('soldout')) {
    return { label: '일시품절 (SOLDOUT)', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
  }
  if (
    prod.productCode === 'SWCTKB21030' ||
    prod.id.includes('p3') ||
    prod.id.includes('p-3') ||
    prod.id.includes('fb-3')
  ) {
    return { label: '⚡ 품절임박 (잔여 3개)', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  return { label: '재고여유 (정상판매)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
};

export default function MobileLivePreview({ promotionId }: MobileLivePreviewProps) {
  const { promotions } = useOpsStore();
  const promo = promotions.find((p) => p.id === promotionId);

  const [deviceType, setDeviceType] = useState<'IPHONE' | 'GALAXY' | 'DESKTOP'>('IPHONE');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoRolling, setIsAutoRolling] = useState(false);

  // 3.5초 자동 롤링 타이머
  useEffect(() => {
    if (!isAutoRolling) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoRolling]);

  if (!promo) return null;

  const displayProducts =
    promo.products && promo.products.length > 0 ? promo.products : getFallbackProducts(promo);

  return (
    <div className="bg-white rounded-md border border-zinc-200 shadow-sm overflow-hidden mb-6 sm:mb-8">
      {/* 헤더 */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F7F4EE] text-[#9A7B4F] border border-[#E6DCCE] rounded-md">
              <Smartphone className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#111111]">
              IDF몰 앱/웹 실시간 라이브 프리뷰 (Live Multi-Device Viewer)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            아이폰(iOS), 갤럭시(안드로이드), 데스크톱 PC 웹 환경별로 배너 노출과 쿠폰 적용 상품 진열을 실시간 교차 검수합니다.
          </p>
        </div>

        {/* 디바이스 전환 컨트롤러 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-200/80 p-1 rounded-md text-xs font-bold text-zinc-600">
            <button
              type="button"
              onClick={() => setDeviceType('IPHONE')}
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'IPHONE' ? 'bg-[#111111] text-white shadow-2xs font-extrabold' : 'hover:text-[#111111]'
              }`}
            >
              <span>🍎 iPhone (iOS)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('GALAXY')}
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'GALAXY' ? 'bg-[#111111] text-white shadow-2xs font-extrabold' : 'hover:text-[#111111]'
              }`}
            >
              <span>🤖 Galaxy (Android)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('DESKTOP')}
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'DESKTOP' ? 'bg-[#111111] text-white shadow-2xs font-extrabold' : 'hover:text-[#111111]'
              }`}
            >
              <span>💻 데스크톱 PC 웹</span>
            </button>
          </div>

          <span className="px-2.5 py-1 bg-[#111111] text-[#B69F76] font-brand tracking-wider font-bold rounded-md text-[11px] shrink-0 border border-zinc-800">
            {promo.brand} MALL
          </span>
        </div>
      </div>

      {/* 디바이스 목업 프레임 뷰어 컨테이너 */}
      <div className="p-8 bg-slate-100 flex items-center justify-center min-h-[680px]">
        {/* 1. 데스크톱 PC 웹 뷰 */}
        {deviceType === 'DESKTOP' && (
          <div className="w-full max-w-4xl h-[660px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 브라우저 상단 윈도우 바 */}
            <div className="bg-slate-200 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <div className="flex-1 max-w-md mx-4 bg-white px-3 py-1 rounded-lg text-xs font-mono text-slate-600 flex items-center justify-between border border-slate-300 shadow-2xs">
                <span className="truncate">https://www.idfmall.co.kr/event/{promo.id}</span>
                <span className="text-[10px] text-slate-400">🔒 보안 연결됨</span>
              </div>
              <span className="text-xs font-bold text-slate-500">PC 데스크톱 (1920x1080)</span>
            </div>

            {/* PC 웹 브라우저 본문 (스크롤) */}
            <div className="flex-1 overflow-y-auto bg-slate-50 font-sans">
              {/* PC 상단 네비게이션 */}
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-6">
                  <span className="text-lg font-black tracking-tight text-slate-900">{promo.brand}</span>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="text-slate-950 font-bold border-b-2 border-slate-950 pb-1">기획전</span>
                    <span>베스트</span>
                    <span>신상품</span>
                    <span>아우터</span>
                    <span>원피스</span>
                  </div>
                </div>
                <ShoppingBag className="w-5 h-5 text-slate-700" />
              </div>

              {/* PC 와이드 메인 롤링 배너 (1920x600 규격) */}
              <div className="w-full relative aspect-16/5 bg-slate-900 overflow-hidden shrink-0 group">
                <div
                  className="w-full h-full flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* 슬라이드 1 */}
                  <div className="w-full h-full shrink-0 relative">
                    <img
                      src={promo.banner.pcBannerUrl || '/images/products/SWBLPB21010_main.jpg'}
                      alt="PC 배너 슬라이드 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* 슬라이드 2 */}
                  <div className="w-full h-full shrink-0 relative bg-slate-800">
                    <img
                      src="/images/products/SWBLPB21010_detail_profile.jpg"
                      alt="PC 배너 슬라이드 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                      <span className="text-xs tracking-widest uppercase text-amber-400 font-bold mb-1">2026 SPRING COLLECTION</span>
                      <h3 className="text-2xl font-black">{promo.brand} SIGNATURE OUTER WEEK</h3>
                      <p className="text-xs text-white/80 mt-1">단 7일간 전 상품 10% 추가 쿠폰팩 제공</p>
                    </div>
                  </div>
                  {/* 슬라이드 3 */}
                  <div className="w-full h-full shrink-0 relative bg-slate-800">
                    <img
                      src="/images/products/SWBLPB21010_detail_fabric.jpg"
                      alt="PC 배너 슬라이드 3"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                      <span className="text-xs tracking-widest uppercase text-indigo-400 font-bold mb-1">PREMIUM TAILORED</span>
                      <h3 className="text-2xl font-black">HIGH-END FABRIC & TAILORING</h3>
                      <p className="text-xs text-white/80 mt-1">인동FN 독점 수입 원단 & 프리미엄 아우터 라인업</p>
                    </div>
                  </div>
                </div>

                {/* 슬라이드 좌우 수동 이동 화살표 */}
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                  aria-label="이전 배너 슬라이드"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                  aria-label="다음 배너 슬라이드"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* 우측 상단 컨펌 뱃지 */}
                <div className="absolute top-3 right-4 z-20">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md text-white ${promo.banner.isConfirmed ? 'bg-emerald-600/90' : 'bg-amber-600/90'}`}>
                    {promo.banner.isConfirmed ? '✓ PC 배너 컨펌 완료' : '시안 검토 중'}
                  </span>
                </div>

                {/* 하단 우측 롤링 인디케이터 (01 / 03 ❚❚) */}
                <div className="absolute bottom-3 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => setIsAutoRolling(!isAutoRolling)}
                    aria-label={isAutoRolling ? "배너 롤링 일시정지" : "배너 롤링 자동재생"}
                    className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md cursor-pointer select-none"
                  >
                    <span>0{currentSlide + 1} / 03</span>
                    <span className="text-slate-400">|</span>
                    {isAutoRolling ? <Pause className="w-2.5 h-2.5 text-amber-400" /> : <Play className="w-2.5 h-2.5 text-emerald-400" />}
                  </button>
                </div>

                {/* 하단 중앙 점 인디케이터 */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`배너 슬라이드 ${idx + 1}번으로 이동`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PC 상품 4열 그리드 */}
              <div className="max-w-5xl mx-auto p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{promo.title} 행사 상품</span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                        {displayProducts.length}종
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      사전 QC 룰엔진 검증: 정상가·할인가·쿠폰 적용·재고 상태·정합성 오류 교차 검수
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg shrink-0 self-start sm:self-auto">
                    목표 할인율 {promo.targetDiscountRate}% · {promo.allowCoupon ? '쿠폰 중복 허용' : '쿠폰 제외(특가)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displayProducts.map((prod) => {
                    const statusBadge = getProductStatusBadge(prod);
                    const stockBadge = getStockBadge(prod);
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.productCode}`}
                        target="_blank"
                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="aspect-3/4 bg-slate-100 relative overflow-hidden">
                          <img
                            src={prod.thumbnailUrl || '/images/products/SWBLPB21010_main.jpg'}
                            alt={prod.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* 할인율 뱃지 */}
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-xs">
                            {prod.displayDiscountRate}%
                          </span>

                          {/* 정합성 검증 상태 뱃지 (오류/정상) */}
                          <span
                            className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${statusBadge.bg}`}
                            title={statusBadge.desc}
                          >
                            {statusBadge.label}
                          </span>

                          {/* 라이브위크 뱃지 */}
                          {prod.isLiveWeek && (
                            <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              🔥 라이브위크
                            </span>
                          )}
                        </div>

                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-400">{promo.brand}</span>
                              <span className="font-mono text-slate-400">{prod.productCode}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 mt-0.5">
                              {prod.productName}
                            </p>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-slate-100">
                            {/* 정상가 & 할인가 */}
                            <div className="flex items-baseline justify-between">
                              <span className="text-sm font-black text-slate-900 font-mono">
                                {prod.salePrice.toLocaleString()}원
                              </span>
                              <span className="text-[11px] text-slate-400 line-through font-mono">
                                {prod.originalPrice.toLocaleString()}원
                              </span>
                            </div>

                            {/* 쿠폰 & 재고 뱃지 */}
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              {prod.couponApplicable ? (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                  쿠폰적용 [10%]
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  쿠폰제외(특가)
                                </span>
                              )}

                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${stockBadge.bg}`}>
                                {stockBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 아이폰 15 Pro & 안드로이드 갤럭시 S24 Ultra 모바일 뷰 */}
        {deviceType !== 'DESKTOP' && (
          <div
            className={`w-[360px] h-[720px] bg-slate-950 p-3 shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              deviceType === 'IPHONE'
                ? 'rounded-[48px] ring-1 ring-slate-800'
                : 'rounded-[34px] ring-2 ring-slate-700'
            }`}
          >
            {/* 상단 카메라 / 스피커 UI */}
            {deviceType === 'IPHONE' ? (
              /* 아이폰 다이내믹 아일랜드 */
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-2.5">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
              </div>
            ) : (
              /* 갤럭시 안드로이드 센터 펀치홀 카메라 & 상태바 */
              <>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 ring-1 ring-slate-800"></div>
                <div className="absolute top-2 left-6 right-6 flex items-center justify-between text-[10px] font-mono font-bold text-slate-800 z-30 pointer-events-none">
                  <span>12:45</span>
                  <div className="flex items-center gap-1 text-[9px]">
                    <span>5G</span>
                    <span>94%</span>
                  </div>
                </div>
              </>
            )}

            {/* 모바일 화면 내부 (Screen Content) */}
            <div
              className={`w-full h-full bg-white overflow-y-auto overflow-x-hidden flex flex-col relative font-sans text-slate-900 select-none ${
                deviceType === 'IPHONE' ? 'rounded-[38px]' : 'rounded-[26px]'
              }`}
            >
              {/* 1. 모바일 앱 상단 헤더 (IDF MALL 공식몰 스타일) */}
              <div
                className={`sticky top-0 bg-white/98 backdrop-blur-xs border-b border-zinc-200 z-30 pb-2 px-3.5 flex items-center justify-between ${
                  deviceType === 'IPHONE' ? 'pt-7' : 'pt-5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-brand font-black text-xs tracking-wider text-[#111111]">
                    IDF MALL
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B69F76]"></span>
                  <span className="text-[10px] font-brand font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    {promo.brand}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-800">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>

              {/* 2. 브랜드 카테고리 탭 */}
              <div className="px-3 py-2 flex items-center gap-3 border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 overflow-x-auto shrink-0 scrollbar-none">
                <span className="text-[#111111] font-bold border-b-2 border-[#111111] pb-1">기획전</span>
                <span>베스트</span>
                <span>신상품</span>
                <span>아울렛</span>
                <span>컬렉션</span>
                <span>LOOKBOOK</span>
              </div>

              {/* 3. 모바일 메인 룩북 롤링 배너 영역 */}
              <div className="w-full relative aspect-4/5 bg-zinc-900 overflow-hidden shrink-0 group">
                <div
                  className="w-full h-full flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* 모바일 슬라이드 1 */}
                  <div className="w-full h-full shrink-0 relative">
                    <img
                      src={promo.banner.moBannerUrl || '/images/products/SWBLPB21010_main.jpg'}
                      alt="모바일 배너 슬라이드 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* 모바일 슬라이드 2 */}
                  <div className="w-full h-full shrink-0 relative bg-zinc-800">
                    <img
                      src="/images/products/SWBLPB21010_detail_profile.jpg"
                      alt="모바일 배너 슬라이드 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center text-white">
                      <span className="text-[10px] font-brand tracking-widest uppercase text-[#B69F76] font-bold mb-1">LOOKBOOK #2</span>
                      <h4 className="text-sm font-black font-brand">{promo.brand} SIGNATURE OUTER</h4>
                      <p className="text-[10px] text-white/80 mt-1">10% 추가 쿠폰팩 혜택</p>
                    </div>
                  </div>
                  {/* 모바일 슬라이드 3 */}
                  <div className="w-full h-full shrink-0 relative bg-zinc-800">
                    <img
                      src="/images/products/SWBLPB21010_detail_fabric.jpg"
                      alt="모바일 배너 슬라이드 3"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center text-white">
                      <span className="text-[10px] font-brand tracking-widest uppercase text-[#B69F76] font-bold mb-1">LOOKBOOK #3</span>
                      <h4 className="text-sm font-black font-brand">HIGH-END TAILORED</h4>
                      <p className="text-[10px] text-white/80 mt-1">프리미엄 원단 단독 라인업</p>
                    </div>
                  </div>
                </div>

                {/* 슬라이드 좌우 수동 이동 화살표 */}
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer z-20"
                  aria-label="이전 배너 슬라이드"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer z-20"
                  aria-label="다음 배너 슬라이드"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* 배너 컨펌 상태 뱃지 */}
                <div className="absolute top-2 right-2 z-20">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                      promo.banner.isConfirmed
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-amber-600/90 text-white'
                    }`}
                  >
                    {promo.banner.isConfirmed ? '✓ 컨펌 배너' : '시안 검토'}
                  </span>
                </div>

                {/* 하단 우측 롤링 인디케이터 (01 / 03 ❚❚) */}
                <div className="absolute bottom-2 right-2 z-20">
                  <button
                    type="button"
                    onClick={() => setIsAutoRolling(!isAutoRolling)}
                    aria-label={isAutoRolling ? "배너 롤링 일시정지" : "배너 롤링 자동재생"}
                    className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-md cursor-pointer select-none"
                  >
                    <span>0{currentSlide + 1} / 03</span>
                    <span className="text-zinc-400">|</span>
                    {isAutoRolling ? <Pause className="w-2 h-2 text-amber-400" /> : <Play className="w-2 h-2 text-emerald-400" />}
                  </button>
                </div>

                {/* 하단 중앙 점 인디케이터 */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`배너 슬라이드 ${idx + 1}번으로 이동`}
                      className={`h-1 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-4 bg-white' : 'w-1 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 4. 행사 타이틀 및 기획전 인트로 */}
              <div className="p-3.5 border-b border-zinc-100 bg-zinc-50/70">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-brand">
                  <span className="font-bold text-[#B69F76] tracking-wider">SEASON SPECIAL</span>
                  <span className="font-mono">{promo.startDate} ~ {promo.endDate}</span>
                </div>
                <h4 className="text-xs font-bold text-[#111111] leading-snug">{promo.title}</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {promo.allowCoupon ? '쿠폰 중복 사용 가능' : '특가전 (쿠폰 적용 제외)'}
                </p>
              </div>

              {/* 5. 행사 상품 2열 그리드 리스트 */}
              <div className="p-3 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span>기획전 상품</span>
                    <span className="bg-zinc-100 text-zinc-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                      {displayProducts.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-normal">추천순</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {displayProducts.map((prod) => {
                    const statusBadge = getProductStatusBadge(prod);
                    const stockBadge = getStockBadge(prod);
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.productCode}`}
                        target="_blank"
                        className="group flex flex-col bg-white rounded-md border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        {/* 상품 썸네일 */}
                        <div className="aspect-3/4 bg-zinc-100 relative overflow-hidden">
                          <img
                            src={prod.thumbnailUrl || '/images/products/SWBLPB21010_main.jpg'}
                            alt={prod.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* 할인율 뱃지 (IDF Mall Deep Burgundy) */}
                          <span className="absolute top-1.5 left-1.5 bg-[#881337] text-white text-[10px] font-black px-1.5 py-0.2 rounded-sm shadow-xs font-brand">
                            {prod.displayDiscountRate}%
                          </span>

                          {/* 정합성 검증 상태 뱃지 (오류/정상) */}
                          <span
                            className={`absolute top-1.5 right-1.5 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs ${statusBadge.bg}`}
                            title={statusBadge.desc}
                          >
                            {statusBadge.label}
                          </span>

                          {/* 라이브위크 뱃지 */}
                          {prod.isLiveWeek && (
                            <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-[#B69F76] text-[8px] font-bold px-1.5 py-0.2 rounded font-brand">
                              LIVE WEEK
                            </span>
                          )}
                        </div>

                        {/* 상품 메타 정보 */}
                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between text-[8px] text-zinc-400 font-brand">
                            <span className="font-bold uppercase tracking-wider text-zinc-600">{promo.brand}</span>
                            <span className="font-mono">{prod.productCode}</span>
                          </div>
                          <p className="text-[10px] font-medium text-zinc-900 line-clamp-1 group-hover:text-[#B69F76] transition-colors">
                            {prod.productName}
                          </p>

                          <div className="flex items-baseline justify-between pt-0.5 font-brand">
                            <span className="text-xs font-bold text-[#111111]">
                              {prod.salePrice.toLocaleString()}원
                            </span>
                            <span className="text-[9px] text-zinc-400 line-through">
                              {prod.originalPrice.toLocaleString()}
                            </span>
                          </div>

                          {/* 쿠폰 & 재고 뱃지 */}
                          <div className="pt-1 flex flex-wrap gap-1">
                            {prod.couponApplicable ? (
                              <span className="inline-block text-[8px] font-bold text-[#9A7B4F] bg-[#F7F4EE] border border-[#E6DCCE] px-1 py-0.2 rounded-sm">
                                쿠폰10%
                              </span>
                            ) : (
                              <span className="inline-block text-[8px] font-medium text-zinc-400 bg-zinc-100 px-1 py-0.2 rounded-sm">
                                쿠폰제외
                              </span>
                            )}

                            <span className={`inline-block text-[8px] font-bold px-1 py-0.2 rounded-sm border ${stockBadge.bg}`}>
                              {stockBadge.label}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 6. 모바일 하단 네비게이션 바 */}
              <div className="sticky bottom-0 bg-white/98 backdrop-blur-xs border-t border-zinc-200 py-2 px-6 flex items-center justify-between text-[10px] text-zinc-400 font-brand font-medium">
                <span className="text-[#111111] font-bold">홈</span>
                <span>카테고리</span>
                <span>검색</span>
                <span>MY</span>
              </div>

              {/* 안드로이드 전용 소프트웨어 네비게이션 키 (||| ▢ <) */}
              {deviceType === 'GALAXY' && (
                <div className="bg-white py-1 px-12 border-t border-slate-100 flex items-center justify-around text-slate-400 text-xs">
                  <span className="font-bold">|||</span>
                  <span className="font-bold">▢</span>
                  <span className="font-bold">&lt;</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
