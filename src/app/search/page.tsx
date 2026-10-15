'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Search,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronRight,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Flame,
} from 'lucide-react';

const POPULAR_QUERIES = [
  '🔥 라이브위크 단 7일간의 특별 혜택',
  '🧥 26SS 신상 트렌치코트',
  '🎫 쿠폰 적용 가능한 상품',
  '💼 출근룩 모던 비즈니스 자켓 & 셋업',
  '🏷️ 40% 이상 파격 할인 아우터',
  'LIST 오버핏 맥코트',
];

export default function AiSearchPage() {
  const { promotions } = useOpsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'ALL' | 'SHESMISS' | 'LIST' | 'SISTINA'>('ALL');
  const [onlyLiveWeek, setOnlyLiveWeek] = useState(false);
  const [onlyCoupon, setOnlyCoupon] = useState(false);

  // 모든 프로모션의 상품 풀 취합
  const allProducts = useMemo(() => {
    return promotions.flatMap((promo) =>
      promo.products.map((prod) => ({
        ...prod,
        brand: promo.brand,
        promoTitle: promo.title,
      }))
    );
  }, [promotions]);

  // AI 스마트 검색 필터링
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allProducts.filter((item) => {
      // 1. 브랜드 필터
      if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) {
        return false;
      }

      // 2. LIVE WEEK 필터
      if (onlyLiveWeek && !item.isLiveWeek) {
        return false;
      }

      // 3. 쿠폰 적용 가능 필터
      if (onlyCoupon && !item.couponApplicable) {
        return false;
      }

      // 4. 검색어가 없는 경우 전체 표시
      if (!q) return true;

      // 5. 검색어 시맨틱 매칭 (키워드, 품번, 카테고리, 라이브위크, 쿠폰)
      if (q.includes('라이브') || q.includes('live')) {
        if (item.isLiveWeek) return true;
      }

      if (q.includes('쿠폰')) {
        if (item.couponApplicable) return true;
      }

      if (q.includes('40%') || q.includes('40퍼')) {
        if (item.displayDiscountRate >= 40) return true;
      }

      if (q.includes('30%') || q.includes('30퍼')) {
        if (item.displayDiscountRate >= 30) return true;
      }

      const matchName = item.productName.toLowerCase().includes(q);
      const matchCode = item.productCode.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      const matchBrand = item.brand.toLowerCase().includes(q);
      const matchPromo = item.promoTitle.toLowerCase().includes(q);

      return matchName || matchCode || matchCategory || matchBrand || matchPromo;
    });
  }, [allProducts, searchQuery, selectedBrand, onlyLiveWeek, onlyCoupon]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 1. 상단 IDF몰 헤더 */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xs z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              <span>IDF</span>
              <span className="text-sm font-normal text-slate-400">Mall</span>
            </Link>

            {/* 브랜드 필터 탭 */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-500 pl-4 border-l border-slate-200">
              <button
                onClick={() => setSelectedBrand('ALL')}
                className={`cursor-pointer ${
                  selectedBrand === 'ALL' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                전체 브랜드
              </button>
              <button
                onClick={() => setSelectedBrand('SHESMISS')}
                className={`cursor-pointer ${
                  selectedBrand === 'SHESMISS' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                SHESMISS
              </button>
              <button
                onClick={() => setSelectedBrand('LIST')}
                className={`cursor-pointer ${
                  selectedBrand === 'LIST' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                LIST
              </button>
              <button
                onClick={() => setSelectedBrand('SISTINA')}
                className={`cursor-pointer ${
                  selectedBrand === 'SISTINA' ? 'text-slate-900 underline underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                SISTINA
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>E-Biz 운영 보드</span>
            </Link>
          </div>
        </div>

        {/* 하단 카테고리 탭 */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 text-xs font-semibold text-slate-600 overflow-x-auto h-10 border-t border-slate-100">
          <button
            onClick={() => setOnlyLiveWeek(!onlyLiveWeek)}
            className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
              onlyLiveWeek ? 'text-rose-600 underline underline-offset-4' : 'text-slate-700 hover:text-rose-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            LIVE WEEK {onlyLiveWeek ? '✓' : ''}
          </button>
          <span className="text-rose-600 font-bold">아울렛 특가</span>
          <span>베스트</span>
          <span>신상품</span>
          <span>아울렛</span>
          <span>기획전</span>
          <span>매거진</span>
        </div>
      </header>

      {/* 2. AI 검색 히어로 섹션 */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>IDF Mall AI 스마트 상품 검색</span>
            <span className="font-mono text-[10px] text-slate-400">https://www.idfmall.co.kr/product/search.html</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            원하는 스타일과 혜택을 자연어로 검색해보세요
          </h1>
          <p className="text-xs text-slate-500">
            브랜드(SHESMISS, LIST, SISTINA), LIVE WEEK 상품, 쿠폰 적용 여부, 원하는 할인율까지 스마트하게 찾아드립니다.
          </p>

          {/* 메인 검색바 */}
          <div className="relative max-w-2xl mx-auto mt-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-indigo-600 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예: 라이브위크 자켓, 40% 이상 할인 트렌치코트, 쿠폰 적용 상품"
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-hidden shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  지우기
                </button>
              )}
              <button
                onClick={() => {}}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                검색
              </button>
            </div>
          </div>

          {/* AI 추천 검색어 칩스 */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">추천 검색:</span>
            {POPULAR_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setSearchQuery(q.replace(/^[^\w가-힣]+/, '').trim())}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 transition-colors shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 검색 결과 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 필터 바 & 결과 건수 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">검색 결과</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold font-mono text-slate-700">
              {filteredProducts.length}개 상품
            </span>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                &quot;<strong>{searchQuery}</strong>&quot; 키워드
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setOnlyLiveWeek(!onlyLiveWeek)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyLiveWeek
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>LIVE WEEK 전용</span>
            </button>

            <button
              onClick={() => setOnlyCoupon(!onlyCoupon)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyCoupon
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>쿠폰 적용 가능</span>
            </button>
          </div>
        </div>

        {/* 상품 그리드 리스트 */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-800">일치하는 상품을 찾지 못했습니다</h3>
            <p className="text-xs text-slate-400">
              검색어를 변경하거나 필터를 초기화해보세요.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('ALL');
                setOnlyLiveWeek(false);
                setOnlyCoupon(false);
              }}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              검색 필터 전체 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-6">
            {filteredProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.productCode}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* 썸네일 */}
                <div className="aspect-3/4 bg-slate-100 relative overflow-hidden">
                  <img
                    src={prod.thumbnailUrl || '/images/products/SWBLPB21010_main.jpg'}
                    alt={prod.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* LIVE WEEK 배지 */}
                  {prod.isLiveWeek && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded shadow-xs tracking-wider">
                        LIVE WEEK
                      </span>
                    </div>
                  )}

                  {/* 할인율 */}
                  <span className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-black px-2 py-0.5 rounded font-mono">
                    {prod.displayDiscountRate}% OFF
                  </span>
                </div>

                {/* 상품 메타 */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {/* LIVE WEEK 빨간 글씨 문구 */}
                    {prod.isLiveWeek && (
                      <p className="text-[11px] font-bold text-rose-600 mb-1 leading-tight">
                        {prod.liveWeekBenefitText || '라이브위크 단 7일간의 특별한 혜택'}
                      </p>
                    )}

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-indigo-600 leading-snug">
                      {prod.productName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {prod.productCode}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {/* 가격 */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {prod.salePrice.toLocaleString()}원
                      </span>
                      <span className="text-[11px] text-slate-400 line-through font-mono">
                        {prod.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* 적용 쿠폰 정보 태그 */}
                    <div className="flex flex-wrap gap-1">
                      {prod.couponApplicable ? (
                        <>
                          {prod.applicableCoupons && prod.applicableCoupons.length > 0 ? (
                            prod.applicableCoupons.map((c) => (
                              <span
                                key={c.id}
                                className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {c.name.split(' ')[0]} {c.discountRate}%
                              </span>
                            ))
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              쿠폰적용가
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                          쿠폰제외
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 bg-slate-50">
        © IN-DONG FN CO., LTD. (SHESMISS · LIST · SISTINA) ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
