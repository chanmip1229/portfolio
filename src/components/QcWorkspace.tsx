'use client';

import React, { useState } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Edit2,
  RefreshCw,
  Rocket,
  Mail,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QcWorkspaceProps {
  promotionId: string;
}

export default function QcWorkspace({ promotionId }: QcWorkspaceProps) {
  const {
    promotions,
    updateProductAndRevalidate,
    runQcValidation,
    approveForPublish,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  const promo = promotions.find((p) => p.id === promotionId);

  // 인라인 수정 모드 상태 (productId)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscountRate, setEditDiscountRate] = useState<number>(0);
  const [editUrl, setEditUrl] = useState<string>('');

  if (!promo) return null;

  const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
  const warningCount = promo.qcIssues.filter((i) => i.severity === 'WARNING').length;
  const isAllPassed = blockerCount === 0;

  const handleStartEdit = (prodId: string, salePrice: number, discountRate: number, url: string) => {
    setEditingProductId(prodId);
    setEditPrice(salePrice);
    setEditDiscountRate(discountRate);
    setEditUrl(url);
  };

  const handleSaveEdit = (prodId: string) => {
    updateProductAndRevalidate(promo.id, prodId, {
      salePrice: Number(editPrice),
      displayDiscountRate: Number(editDiscountRate),
      detailUrl: editUrl,
    });
    setEditingProductId(null);
  };

  const handlePublish = () => {
    approveForPublish(promo.id);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* QC 헤더 */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                isAllPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isAllPassed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              게시 전 사전 QC 검증 & 상품 정합성 워크스페이스
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            결정론적 6대 룰 엔진이 가격 계산 정합성, 기획서 대조, 승인 품번 매핑, 404 URL, 배너 컨펌 상태를 100% 코드로 자동 검증합니다.
          </p>
        </div>

        {/* 종합 QC 결과 뱃지 & 게시 승인 버튼 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {blockerCount > 0 ? (
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                BLOCKER 에러 {blockerCount}건 적발
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                모든 사전 QC 룰 통과 (PASS)
              </span>
            )}

            {warningCount > 0 && (
              <span className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                경고 {warningCount}건
              </span>
            )}
          </div>

          {promo.status === 'READY_TO_PUBLISH' ? (
            <span className="px-4 py-2 text-xs font-black text-teal-800 bg-teal-100 rounded-xl border border-teal-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              게시 준비 완료됨 ({promo.timestamps.publishedAt})
            </span>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!isAllPassed}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
                isAllPassed
                  ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer hover:shadow'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>최종 게시 준비 완료 승인</span>
            </button>
          )}
        </div>
      </div>

      {/* 실시간 감지된 QC 이슈 리포트 영역 */}
      {promo.qcIssues.length > 0 && (
        <div className="p-5 bg-rose-50/40 border-b border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              검출된 정합성 오류 상세 리포트 ({promo.qcIssues.length}건)
            </span>

            {/* 재확인 요청 메일 연동 버튼 */}
            {promo.emailDraftIds.length > 0 && (
              <button
                onClick={() => {
                  setSelectedDraftId(promo.emailDraftIds[0]);
                  setIsDraftModalOpen(true);
                }}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>MD팀 재확인 요청 메일 초안 확인 (임시보관함)</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {promo.qcIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  issue.severity === 'BLOCKER'
                    ? 'bg-white border-rose-200 text-rose-900 shadow-xs'
                    : 'bg-white border-amber-200 text-amber-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mt-0.5 shrink-0 ${
                      issue.severity === 'BLOCKER'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {issue.ruleCode}
                  </span>
                  <div>
                    <p className="font-semibold leading-relaxed">{issue.message}</p>
                    {issue.details && (
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        기대값(Expected): {String(issue.details.expected)} / 현재값(Actual):{' '}
                        <span className="text-rose-600 font-bold">{String(issue.details.actual)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    issue.severity === 'BLOCKER'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대상 상품 테이블 & 인라인 수정 인터페이스 */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">게시 예정 대상 상품 목록</span>
            <span className="text-xs text-slate-400">({promo.products.length}종)</span>
          </div>

          <button
            onClick={() => runQcValidation(promo.id)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>룰 엔진 강제 재검증</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">품번 (SKU)</th>
                <th className="py-3 px-4">상품명</th>
                <th className="py-3 px-4 text-right">정가</th>
                <th className="py-3 px-4 text-right">실제 판매가</th>
                <th className="py-3 px-4 text-center">수학적 계산치</th>
                <th className="py-3 px-4 text-center">표기 할인율</th>
                <th className="py-3 px-4">연결 상세 URL</th>
                <th className="py-3 px-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promo.products.map((prod) => {
                const isEditing = editingProductId === prod.id;
                const calculated = Math.round(
                  ((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100
                );
                const isMismatch = calculated !== prod.displayDiscountRate;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isMismatch ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{prod.productCode}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{prod.productName}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {prod.originalPrice.toLocaleString()}원
                    </td>

                    {/* 판매가 */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 text-right p-1 border rounded bg-white font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span>{prod.salePrice.toLocaleString()}원</span>
                      )}
                    </td>

                    {/* 실제 수학적 계산치 */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {calculated}%
                      </span>
                    </td>

                    {/* 표기 할인율 */}
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editDiscountRate}
                          onChange={(e) => setEditDiscountRate(Number(e.target.value))}
                          className="w-16 text-center p-1 border rounded bg-white font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded ${
                            isMismatch
                              ? 'bg-rose-600 text-white font-black animate-pulse'
                              : 'bg-emerald-100 text-emerald-800 font-bold'
                          }`}
                        >
                          {prod.displayDiscountRate}%
                        </span>
                      )}
                    </td>

                    {/* URL (클릭 시 가라 IDF몰 상세 페이지로 이동) */}
                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="w-full p-1 border rounded bg-white text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <a
                          href={`/product/${prod.productCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                          title="가라 IDF몰 상세 페이지 열기"
                        >
                          <span className="truncate">{prod.detailUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </td>

                    {/* 액션 (수정 / 저장) */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(prod.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        >
                          저장 & 재검증
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStartEdit(
                              prod.id,
                              prod.salePrice,
                              prod.displayDiscountRate,
                              prod.detailUrl
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 p-1 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>수정</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 실무자 팁 안내 */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>원클릭 수정 & 자동 재검증 시연:</strong> 위 테이블에서 오류가 있는 품번(<code>SWBLPB21010</code>)의 [수정] 버튼을 누르고 표기 할인율을 <strong>30%</strong>로 변경 후 [저장 & 재검증]을 누르면, 룰 엔진이 즉시 재검증하여 초록색 <code>PASS</code> 상태로 전환됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
