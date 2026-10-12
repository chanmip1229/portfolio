'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useOpsStore } from '@/store/useOpsStore';
import { ArrowLeft, ShoppingBag, Heart, Share2, Check, ShieldCheck, ChevronRight } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ code: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { code } = use(params);
  const { promotions } = useOpsStore();

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

  // 상품이 없는 경우 (가라 404 에러 화면 - 사용자 캡처와 유사하게 디자인)
  if (!foundProduct) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <header className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter text-slate-900">
            IDF <span className="text-xs font-semibold text-slate-400">MALL</span>
          </div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
            OpsPilot으로 돌아가기
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-3xl">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">다시 한번 확인해주세요!</h1>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            접근하신 주소의 상품 <code>({code})</code> 정보는<br />
            사라졌거나 아직 승인 등록되지 않은 페이지입니다.<br />
            품번 및 프로모션 세팅을 다시 확인해주세요.
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
              메인으로 가기
            </Link>
          </div>
        </main>

        <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400">
          © IN-DONG FN CO., LTD. ALL RIGHTS RESERVED. (IDF몰 가상 프리뷰)
        </footer>
      </div>
    );
  }

  // 상품이 존재하는 경우: 실제 IDF몰(SHESMISS, LIST, SISTINA) 스타일의 세련된 상품 상세 페이지 가라 뷰
  const brandName = foundPromo?.brand || 'LIST';
  const calculatedDiscount = Math.round(
    ((foundProduct.originalPrice - foundProduct.salePrice) / foundProduct.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 상단 IDF몰 헤더 */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="text-lg font-black tracking-tight text-slate-900">
              {brandName} <span className="text-xs font-normal text-slate-400">ON IDF MALL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              OpsPilot 가상 상품 프리뷰
            </span>
          </div>
        </div>
      </header>

      {/* 브레드크럼 */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-400 flex items-center gap-1 w-full">
        <span>홈</span>
        <ChevronRight className="w-3 h-3" />
        <span>{brandName}</span>
        <ChevronRight className="w-3 h-3" />
        <span>{foundProduct.category || '기획전'}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-medium font-mono">{foundProduct.productCode}</span>
      </div>

      {/* 본문 상품 상세 (좌: 룩북 컷 / 우: 가격 및 옵션) */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 좌측: 상품 화보 이미지 */}
        <div className="space-y-3">
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80"
              alt={foundProduct.productName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-bold rounded-md">
                2026 S/S NEW
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            * 본 이미지는 OpsPilot 프로모션 연동 가상 룩북 프리뷰입니다.
          </p>
        </div>

        {/* 우측: 상품 정보 & 가격표 */}
        <div className="flex flex-col justify-between py-2">
          <div className="space-y-5">
            {/* 브랜드 & 품번 */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {brandName}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                {foundProduct.productName}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                품번: <strong>{foundProduct.productCode}</strong>
              </p>
            </div>

            {/* 가격 정보 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>정상 소비자가</span>
                <span className="line-through font-mono">
                  {foundProduct.originalPrice.toLocaleString()}원
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    {foundProduct.displayDiscountRate}%
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {foundProduct.salePrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-700">원</span>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  쿠폰 적용 가능
                </span>
              </div>

              {/* OpsPilot 계산 검증 안내 박스 */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  OpsPilot 사전 QC 검증 완료 상품
                </span>
                <span className="font-mono text-slate-400">
                  수학 계산치: {calculatedDiscount}%
                </span>
              </div>
            </div>

            {/* 색상 및 사이즈 선택 가라 옵션 */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">컬러</label>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border-2 border-slate-900 rounded-lg font-semibold bg-white">
                    네이비 (NAVY)
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 bg-white hover:border-slate-300">
                    베이지 (BEIGE)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">사이즈</label>
                <div className="flex gap-2">
                  <button className="px-3.5 py-1.5 border border-slate-200 rounded-lg font-mono font-semibold bg-white hover:border-slate-300">
                    55 (S)
                  </button>
                  <button className="px-3.5 py-1.5 border-2 border-slate-900 rounded-lg font-mono font-bold bg-white">
                    66 (M)
                  </button>
                  <button className="px-3.5 py-1.5 border border-slate-200 rounded-lg font-mono text-slate-400 bg-slate-50 cursor-not-allowed">
                    77 (품절)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 구매 버튼 바 */}
          <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
            <button className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="flex-1 py-3.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>바로 구매하기</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 bg-slate-50">
        © IN-DONG FN CO., LTD. (SHESMISS · LIST · SISTINA) ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
