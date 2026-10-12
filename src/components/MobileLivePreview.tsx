'use client';

import React from 'react';
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
              IDF몰 모바일 라이브 프리뷰 (Live Mobile Mockup)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            운영자가 컨펌한 배너와 등록한 상품들이 실제 IDF몰 모바일 앱/웹 화면에 어떻게 실시간 노출되는지 실시간으로 검수할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded-lg text-[11px]">
            {promo.brand} MALL
          </span>
          <span className="text-slate-400">아이폰 15 규격 프리뷰</span>
        </div>
      </div>

      {/* 모바일 목업 프레임 뷰어 컨테이너 */}
      <div className="p-8 bg-slate-100 flex items-center justify-center min-h-[680px]">
        {/* 아이폰 외곽 쉘 (iPhone Frame) */}
        <div className="w-[360px] h-[700px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800/80 relative flex flex-col overflow-hidden">
          {/* 다이내믹 아일랜드 & 상단 스피커 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-2.5">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
          </div>

          {/* 모바일 화면 내부 (Screen Content) */}
          <div className="w-full h-full bg-white rounded-[38px] overflow-y-auto overflow-x-hidden flex flex-col relative font-sans text-slate-900 select-none">
            {/* 1. 모바일 앱 상단 헤더 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-100 z-30 pt-7 pb-2.5 px-4 flex items-center justify-between">
              <div className="text-sm font-black tracking-tight text-slate-900">
                {promo.brand} <span className="text-[10px] font-normal text-slate-400">IDF</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>

            {/* 2. 브랜드 카테고리 탭 (쉬즈미스 / 리스트 / 시스티나 감성) */}
            <div className="px-3 py-2 flex items-center gap-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-slate-950 font-bold border-b-2 border-slate-950 pb-1">기획전</span>
              <span>베스트</span>
              <span>신상품</span>
              <span>아우터</span>
              <span>원피스</span>
            </div>

            {/* 3. 모바일 메인 룩북 배너 영역 (배너 스튜디오와 100% 실시간 연동) */}
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
                  <p className="text-[10px] text-slate-400 mt-1">배너 스튜디오에서 합성된 배너가 이곳에 라이브로 노출됩니다.</p>
                </div>
              )}

              {/* 배너 컨펌 상태 뱃지 오버레이 */}
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

            {/* 4. 행사 타이틀 및 실시간 기획전 인트로 */}
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

            {/* 5. 행사 상품 2열 그리드 리스트 (실제 IDF몰 상품 카드 레이아웃) */}
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
                      {/* 할인율 배지 */}
                      <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                        {prod.displayDiscountRate}%
                      </span>
                    </div>

                    {/* 상품 메타 정보 */}
                    <div className="p-2 space-y-1">
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
                      <div className="pt-1">
                        {prod.couponApplicable ? (
                          <span className="inline-block text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                            쿠폰혜택
                          </span>
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
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-100 py-2.5 px-6 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-slate-900 font-bold">홈</span>
              <span>카테고리</span>
              <span>검색</span>
              <span>마이</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
