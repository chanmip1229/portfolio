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
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportToExcel } from '@/utils/excelExporter';

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
  const [editPriceStr, setEditPriceStr] = useState<string>('');
  const [editDiscountRateStr, setEditDiscountRateStr] = useState<string>('');
  const [editCouponApplicable, setEditCouponApplicable] = useState<boolean>(true);
  const [editUrl, setEditUrl] = useState<string>('');

  if (!promo) return null;

  const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
  const warningCount = promo.qcIssues.filter((i) => i.severity === 'WARNING').length;
  const isAllPassed = blockerCount === 0;

  const handleStartEdit = (
    prodId: string,
    salePrice: number,
    discountRate: number,
    couponApplicable: boolean,
    url: string
  ) => {
    setEditingProductId(prodId);
    setEditPriceStr(String(salePrice));
    setEditDiscountRateStr(String(discountRate));
    setEditCouponApplicable(couponApplicable);
    setEditUrl(url);
  };

  const handleSaveEdit = (prodId: string) => {
    const finalPrice = Number(editPriceStr.replace(/[^0-9]/g, '')) || 0;
    const finalRate = Number(editDiscountRateStr.replace(/[^0-9]/g, '')) || 0;

    updateProductAndRevalidate(promo.id, prodId, {
      salePrice: finalPrice,
      displayDiscountRate: finalRate,
      couponApplicable: editCouponApplicable,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">게시 예정 대상 상품 목록</span>
            <span className="text-xs text-slate-400">({promo.products.length}종)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 엑셀 파일 다운로드 버튼군 (전체 및 담당자별) */}
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_전체_QC리포트`)}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="해당 기획전의 모든 상품 및 오류 내역을 엑셀로 다운로드"
              >
                <Download className="w-3 h-3 text-indigo-600" />
                <span>전체 엑셀</span>
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_MD팀_오류품번`, 'MD')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="MD팀 확인 대상(할인율 불일치, 미승인 품번) 엑셀 다운로드"
              >
                MD팀용
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_디자인팀_배너오류`, 'DESIGN')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="디자인팀 확인 대상(배너 규격, 카피) 엑셀 다운로드"
              >
                디자인팀용
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_운영팀_URL쿠폰오류`, 'EBIZ_OPS')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="E-BIZ 운영팀 확인 대상(URL 404, 쿠폰 정책) 엑셀 다운로드"
              >
                운영팀용
              </button>
            </div>

            <button
              onClick={() => runQcValidation(promo.id)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>룰 엔진 강제 재검증</span>
            </button>
          </div>
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
                <th className="py-3 px-4 text-center">쿠폰 정책 및 정합성 QC</th>
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
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{prod.productName}</p>
                      {prod.isLiveWeek && (
                        <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                          <span>🔥</span>
                          <span>{prod.liveWeekBenefitText || '라이브위크 단 7일간의 특별한 혜택'}</span>
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {prod.originalPrice.toLocaleString()}원
                    </td>

                    {/* 판매가 */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {isEditing ? (
                        <div className="relative inline-block">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editPriceStr}
                            onChange={(e) => {
                              // 숫자만 입력 허용, 다 지우면 빈칸 유지
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setEditPriceStr(val);
                            }}
                            className="w-24 text-right pr-6 py-1 pl-1 border rounded bg-white font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                            placeholder="0"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">
                            원
                          </span>
                        </div>
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

                    {/* 표기 할인율 (숫자 지우면 0 안 남고 깔끔하게 지워지며 % 자동 부착) */}
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {isEditing ? (
                        <div className="relative inline-block">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editDiscountRateStr}
                            onChange={(e) => {
                              // 숫자만 허용, 다 지우면 빈칸 유지
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setEditDiscountRateStr(val);
                            }}
                            className="w-16 text-center pr-4 py-1 pl-1 border rounded bg-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 font-bold"
                            placeholder="0"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                            %
                          </span>
                        </div>
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

                    {/* 쿠폰 적용 여부 및 적용 쿠폰 상세 (다운로드 쿠폰, 등급 쿠폰) */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditCouponApplicable(!editCouponApplicable)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            editCouponApplicable
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {editCouponApplicable ? '쿠폰 가능 (O)' : '쿠폰 제외 (X)'}
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          {/* 쿠폰 정책 정합성 QC 뱃지 (사용자 요청: 정보 일치 vs 확인 필요) */}
                          {promo.allowCoupon === prod.couponApplicable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ 정보 일치
                            </span>
                          ) : !promo.allowCoupon && prod.couponApplicable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                              🚨 확인 필요 (쿠폰 불가 기획)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                              ⚠️ 확인 필요 (쿠폰 미적용)
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              prod.couponApplicable
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {prod.couponApplicable ? '쿠폰 적용 O' : '쿠폰 제외 X'}
                          </span>

                          {/* 적용 가능한 쿠폰 태그 목록 (다운로드 & 등급 쿠폰) */}
                          {prod.couponApplicable && prod.applicableCoupons && prod.applicableCoupons.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 max-w-[170px] pt-0.5">
                              {prod.applicableCoupons.map((c) => (
                                <span
                                  key={c.id}
                                  className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono"
                                  title={`${c.name} (${c.discountRate}%)`}
                                >
                                  {c.type === 'MEMBERSHIP_TIER' ? '👑' : '📥'}
                                  {c.discountRate}%
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
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
                              prod.couponApplicable,
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
