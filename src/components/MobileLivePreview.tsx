'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Smartphone,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
} from 'lucide-react';

interface MobileLivePreviewProps {
  promotionId: string;
}

export default function MobileLivePreview({ promotionId }: MobileLivePreviewProps) {
  const { promotions } = useOpsStore();
  const promo = promotions.find((p) => p.id === promotionId);

  const [deviceType, setDeviceType] = useState<'IPHONE' | 'GALAXY' | 'DESKTOP'>('IPHONE');

  if (!promo) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* 헤더 */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              IDF몰 앱/웹 실시간 라이브 프리뷰 (Live Multi-Device Viewer)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            아이폰(iOS), 갤럭시(안드로이드), 데스크톱 PC 웹 환경별로 배너 노출과 쿠폰 적용 상품 진열을 실시간 교차 검수합니다.
          </p>
        </div>

        {/* 디바이스 전환 컨트롤러 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setDeviceType('IPHONE')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'IPHONE' ? 'bg-white text-slate-950 shadow-2xs font-extrabold' : 'hover:text-slate-950'
              }`}
            >
              <span>🍎 iPhone (iOS)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('GALAXY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'GALAXY' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'hover:text-slate-950'
              }`}
            >
              <span>🤖 Galaxy (Android)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('DESKTOP')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                deviceType === 'DESKTOP' ? 'bg-white text-indigo-900 shadow-2xs font-extrabold' : 'hover:text-slate-950'
              }`}
            >
              <span>💻 데스크톱 PC 웹</span>
            </button>
          </div>

          <span className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded-lg text-[11px] shrink-0">
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

              {/* PC 와이드 메인 배너 (1920x600 규격) */}
              <div className="w-full relative aspect-16/5 bg-slate-900 overflow-hidden shrink-0">
                {promo.banner.pcBannerUrl ? (
                  <img
                    src={promo.banner.pcBannerUrl}
                    alt="PC 배너"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900">
                    <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                    <p className="text-sm font-bold">{promo.title}</p>
                    <p className="text-xs text-slate-400 mt-1">PC 메인 배너 (1920 x 600 px) 실시간 노출</p>
                  </div>
                )}
                <div className="absolute top-3 right-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md text-white ${promo.banner.isConfirmed ? 'bg-emerald-600/90' : 'bg-amber-600/90'}`}>
                    {promo.banner.isConfirmed ? '✓ PC 배너 컨펌 완료' : '시안 검토 중'}
                  </span>
                </div>
              </div>

              {/* PC 상품 4열 그리드 */}
              <div className="max-w-5xl mx-auto p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-900">{promo.title} 행사 상품 ({promo.products.length}종)</h4>
                  <span className="text-xs text-slate-500">목표 할인율 {promo.targetDiscountRate}%</span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {promo.products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.productCode}`}
                      target="_blank"
                      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-3/4 bg-slate-100 relative overflow-hidden">
                        <img
                          src={prod.thumbnailUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80'}
                          alt={prod.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded">
                          {prod.displayDiscountRate}%
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">{promo.brand}</span>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                          {prod.productName}
                        </p>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {prod.salePrice.toLocaleString()}원
                          </span>
                          <span className="text-[10px] text-slate-300 line-through font-mono">
                            {prod.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
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
              {/* 1. 모바일 앱 상단 헤더 */}
              <div
                className={`sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 z-30 pb-2.5 px-4 flex items-center justify-between ${
                  deviceType === 'IPHONE' ? 'pt-7' : 'pt-5'
                }`}
              >
                <div className="text-sm font-black tracking-tight text-slate-900">
                  {promo.brand} <span className="text-[10px] font-normal text-slate-400">
                    {deviceType === 'GALAXY' ? 'Android App' : 'IDF App'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>

              {/* 2. 브랜드 카테고리 탭 */}
              <div className="px-3 py-2 flex items-center gap-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 overflow-x-auto shrink-0 scrollbar-none">
                <span className="text-slate-950 font-bold border-b-2 border-slate-950 pb-1">기획전</span>
                <span>베스트</span>
                <span>신상품</span>
                <span>아우터</span>
                <span>원피스</span>
              </div>

              {/* 3. 모바일 메인 룩북 배너 영역 */}
              <div className="w-full relative aspect-4/5 bg-slate-900 overflow-hidden shrink-0">
                {promo.banner.moBannerUrl ? (
                  <img
                    src={promo.banner.moBannerUrl}
                    alt="모바일 배너"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
                    <Sparkles className="w-6 h-6 text-indigo-400 mb-2 animate-bounce" />
                    <p className="text-xs font-bold">{promo.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">배너 스튜디오에서 합성된 배너가 이곳에 노출됩니다.</p>
                  </div>
                )}

                {/* 배너 컨펌 상태 뱃지 */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                      promo.banner.isConfirmed
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}
                  >
                    {promo.banner.isConfirmed ? '✓ 컨펌 완료 배너' : '시안 검토 중'}
                  </span>
                </div>
              </div>

              {/* 4. 행사 타이틀 및 기획전 인트로 */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-indigo-600">SEASON SPECIAL</span>
                  <span>{promo.startDate} ~ {promo.endDate}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{promo.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {promo.allowCoupon ? '쿠폰 중복 사용 가능' : '특가전 (쿠폰 적용 제외)'}
                </p>
              </div>

              {/* 5. 행사 상품 2열 그리드 리스트 */}
              <div className="p-3 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-2.5">
                  <span>기획전 상품 ({promo.products.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">추천순</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {promo.products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.productCode}`}
                      target="_blank"
                      className="group flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      {/* 상품 썸네일 */}
                      <div className="aspect-3/4 bg-slate-100 relative overflow-hidden">
                        <img
                          src={prod.thumbnailUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80'}
                          alt={prod.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                          {prod.displayDiscountRate}%
                        </span>
                      </div>

                      {/* 상품 메타 정보 */}
                      <div className="p-2 space-y-1">
                        {prod.isLiveWeek && (
                          <p className="text-[8px] font-bold text-rose-600 leading-tight flex items-center gap-0.5">
                            <span>🔥</span>
                            <span>라이브위크 혜택</span>
                          </p>
                        )}
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">
                          {promo.brand}
                        </span>
                        <p className="text-[10px] font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                          {prod.productName}
                        </p>

                        <div className="flex items-baseline justify-between pt-0.5">
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {prod.salePrice.toLocaleString()}원
                          </span>
                          <span className="text-[9px] text-slate-300 line-through font-mono">
                            {prod.originalPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* 쿠폰 뱃지 */}
                        <div className="pt-1 flex flex-wrap gap-1">
                          {prod.couponApplicable ? (
                            <>
                              <span className="inline-block text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                쿠폰적용
                              </span>
                              {prod.applicableCoupons && prod.applicableCoupons.slice(0, 2).map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-block text-[7px] font-semibold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded"
                                >
                                  {c.discountRate}%
                                </span>
                              ))}
                            </>
                          ) : (
                            <span className="inline-block text-[8px] font-semibold text-slate-400 bg-slate-50 px-1 py-0.2 rounded">
                              쿠폰제외
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 6. 모바일 하단 네비게이션 바 */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-100 py-2 px-6 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-slate-900 font-bold">홈</span>
                <span>카테고리</span>
                <span>검색</span>
                <span>마이</span>
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
