'use client';

import React, { useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Rocket,
  Mail,
  Download,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportToExcel } from '@/utils/excelExporter';

interface QcWorkspaceProps {
  promotionId: string;
  onNavigateToSkuQc?: () => void;
}

export default function QcWorkspace({ promotionId, onNavigateToSkuQc }: QcWorkspaceProps) {
  const {
    promotions,
    runQcValidation,
    approveForPublish,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  const promo = promotions.find((p) => p.id === promotionId);

  const [selectedQcDeptFilter, setSelectedQcDeptFilter] = useState<
    'ALL' | 'MD' | 'DESIGN' | 'DEV' | 'MARKETING'
  >('ALL');

  if (!promo) return null;

  const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
  const warningCount = promo.qcIssues.filter((i) => i.severity === 'WARNING').length;
  const isAllPassed = blockerCount === 0;

  const handlePublish = () => {
    approveForPublish(promo.id);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // 상품별 정합성 메트릭 계산 (단품 마스터 QC 연동용)
  const skuMetrics = useMemo(() => {
    return promo.products.map((prod) => {
      const calculatedDiscount =
        prod.originalPrice > 0
          ? Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100)
          : 0;
      const isMathMismatch = calculatedDiscount !== prod.displayDiscountRate;
      const isTrendAnomaly = Boolean(prod.hasTrendAnomaly || prod.displayDiscountRate >= 75);
      const isMultiDept = Boolean(
        prod.productCode === 'SWBLPB21010' ||
          (prod.multiDeptIssueDepartments && prod.multiDeptIssueDepartments.length >= 2)
      );
      const hasBrokenImage = Boolean(
        prod.hasBrokenImage || !prod.thumbnailUrl || prod.thumbnailUrl.includes('broken')
      );
      const hasBlocker = Boolean(
        isMathMismatch ||
          !prod.isApproved ||
          (prod.detailUrl && prod.detailUrl.includes('broken-link')) ||
          isMultiDept ||
          hasBrokenImage
      );

      return {
        prod,
        calculatedDiscount,
        isMathMismatch,
        isTrendAnomaly,
        isMultiDept,
        hasBrokenImage,
        hasBlocker,
      };
    });
  }, [promo.products]);

  const totalSkuCount = promo.products.length;
  const multiDeptSkuCount = skuMetrics.filter((m) => m.isMultiDept).length;
  const trendAnomalySkuCount = skuMetrics.filter((m) => m.isTrendAnomaly).length;
  const blockerSkuCount = skuMetrics.filter((m) => m.hasBlocker).length;
  const passedSkuCount = skuMetrics.filter((m) => !m.hasBlocker && !m.isTrendAnomaly).length;

  // 부서별 이슈 카운트 계산
  const mdIssues = promo.qcIssues.filter((i) => (i.department || 'MD') === 'MD');
  const designIssues = promo.qcIssues.filter((i) => i.department === 'DESIGN');
  const devIssues = promo.qcIssues.filter((i) => i.department === 'DEV');
  const mktIssues = promo.qcIssues.filter((i) => i.department === 'MARKETING');

  const filteredQcIssues = promo.qcIssues.filter((issue) => {
    if (selectedQcDeptFilter === 'ALL') return true;
    return (issue.department || 'MD') === selectedQcDeptFilter;
  });

  const getDeptDraftId = (dept?: string) => {
    if (dept === 'DESIGN') return 'draft-list-trench-design';
    if (dept === 'DEV') return 'draft-list-trench-dev';
    if (dept === 'MARKETING') return 'draft-list-trench-mkt';
    return 'draft-list-trench-1';
  };

  const handleOpenDeptDraft = (dept?: string) => {
    const draftId = getDeptDraftId(dept);
    setSelectedDraftId(draftId);
    setIsDraftModalOpen(true);
  };

  return (
    <div id="qc-workspace-section" className="bg-white rounded-2xl border-2 border-indigo-500 shadow-md overflow-hidden mb-8 scroll-mt-28 transition-all">
      {/* 선택된 기획전 포커스 안내 바 */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-amber-300">🔍 현재 사전 QC 검수 대상:</span>
          <span className="font-extrabold uppercase px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
            {promo.brand}
          </span>
          <span className="font-black text-white">{promo.title}</span>
          <span className="text-[10px] font-mono text-indigo-200 bg-white/10 px-1.5 py-0.2 rounded">
            (ID: {promo.id})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span>오픈 예정일: <strong>{promo.startDate}</strong></span>
          <span>•</span>
          <span>현재 병목: <strong>[{promo.currentBottleneckDept}팀]</strong></span>
        </div>
      </div>

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
              게시 전 사전 QC 검증 & 부서별 정합성 워크스페이스
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

      {/* 실시간 감지된 부서별 QC 이슈 리포트 영역 */}
      {promo.qcIssues.length > 0 && (
        <div className="p-5 bg-rose-50/40 border-b border-rose-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                부서별 검출된 정합성 오류 상세 리포트 ({promo.qcIssues.length}건)
              </span>
              <span className="text-[11px] text-slate-500">
                (MD팀 외 디자인, 개발, 마케팅 부서 이슈를 탭으로 분리 확인 가능)
              </span>
            </div>

            {/* 부서별 즉시 조치 메일/슬랙 전송 버튼 그룹 */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* 신규: 다부서 복합 이슈(MD+디자인) 2분할 동시 요청 버튼 */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDraftId('draft-multi-dept-md');
                  setIsDraftModalOpen(true);
                }}
                className="text-[11px] font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-300 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="단일 품번(SWBLPB21010)에 가격과 해상도 2개 부서가 걸린 복합 결함 2분할 듀얼 메일 작성"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>👥 다부서(MD+디자인) 동시 요청 (1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeptDraft('MD')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="MD팀에 할인율/품번 재확인 메일 및 슬랙 발송"
              >
                <Mail className="w-3 h-3 text-blue-600" />
                <span>✉️ MD팀 요청 ({mdIssues.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeptDraft('DESIGN')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="웹디자인팀에 배너 규격 수정 요청 메일 발송"
              >
                <Mail className="w-3 h-3 text-purple-600" />
                <span>✉️ 웹디자인팀 요청 ({designIssues.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeptDraft('DEV')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="전산팀(IT)에 404 URL 단절 조치 요청 메일 발송"
              >
                <Mail className="w-3 h-3 text-emerald-600" />
                <span>✉️ 전산팀(IT) 요청 ({devIssues.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeptDraft('MARKETING')}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-white hover:bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                title="E-BIZ 마케팅팀에 쿠폰 중복 정책 확인 요청 메일 발송"
              >
                <Mail className="w-3 h-3 text-amber-600" />
                <span>✉️ E-BIZ 마케팅팀 요청 ({mktIssues.length})</span>
              </button>
            </div>
          </div>

          {/* 부서별 필터 탭 */}
          <div className="flex items-center gap-1.5 mb-3 bg-white/80 p-1 rounded-xl border border-rose-200/80 w-fit text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedQcDeptFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedQcDeptFilter === 'ALL'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 부서 ({promo.qcIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQcDeptFilter('MD')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                selectedQcDeptFilter === 'MD'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <span>👗 기획MD팀</span>
              <span className="text-[10px] opacity-80">({mdIssues.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedQcDeptFilter('DESIGN')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                selectedQcDeptFilter === 'DESIGN'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>🎨 웹디자인팀</span>
              <span className="text-[10px] opacity-80">({designIssues.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedQcDeptFilter('DEV')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                selectedQcDeptFilter === 'DEV'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>💻 전산팀 (IT)</span>
              <span className="text-[10px] opacity-80">({devIssues.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedQcDeptFilter('MARKETING')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                selectedQcDeptFilter === 'MARKETING'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span>📢 E-BIZ 마케팅팀</span>
              <span className="text-[10px] opacity-80">({mktIssues.length})</span>
            </button>
          </div>

          {/* 필터링된 이슈 목록 */}
          <div className="space-y-2">
            {filteredQcIssues.map((issue) => {
              const dept = issue.department || 'MD';

              return (
                <div
                  key={issue.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    issue.severity === 'BLOCKER'
                      ? 'bg-white border-rose-200 text-rose-900 shadow-xs'
                      : 'bg-white border-amber-200 text-amber-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* 부서 태그 */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 shrink-0 border ${
                        dept === 'MD'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : dept === 'DESIGN'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : dept === 'DEV'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {dept === 'MD'
                        ? '기획MD팀'
                        : dept === 'DESIGN'
                        ? '웹디자인팀'
                        : dept === 'DEV'
                        ? '전산팀'
                        : 'E-BIZ 마케팅팀'}
                    </span>

                    {/* 신규: 다부서 복합 이슈 태그 */}
                    {issue.isMultiDeptIssue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shrink-0">
                        <Layers className="w-3 h-3 text-purple-600" />
                        <span>다부서 복합 (기획MD+웹디자인)</span>
                      </span>
                    )}

                    {/* 신규: 트렌드 이상치 태그 */}
                    {issue.ruleCode === 'TREND_OUTLIER_NOTICE' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                        <span>⚠️ 80% 트렌드 이상치 감지</span>
                      </span>
                    )}

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
                      <p className="font-semibold leading-relaxed text-slate-900">{issue.message}</p>
                      {issue.details && (
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">
                          기대값(Expected): {String(issue.details.expected)} / 현재값(Actual):{' '}
                          <span className="text-rose-600 font-bold">{String(issue.details.actual)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {issue.isMultiDeptIssue ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDraftId('draft-multi-dept-md');
                          setIsDraftModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        title="기획MD팀과 웹디자인팀 2분할 듀얼 메일 작성창 열기"
                      >
                        <Mail className="w-3 h-3 text-white" />
                        <span>✉️ 2분할 듀얼 메일 &gt;</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenDeptDraft(dept)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="해당 부서 메일/슬랙 초안 열기"
                      >
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>
                          {dept === 'MD'
                            ? '기획MD'
                            : dept === 'DESIGN'
                            ? '웹디자인'
                            : dept === 'DEV'
                            ? '전산'
                            : 'E-BIZ마케팅'}팀 조치 요청 &gt;
                        </span>
                      </button>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.severity === 'BLOCKER'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📦 행사 대상 상품(SKU) 정합성 현황 요약 및 3번째 탭 전수 검수 연결 카드 */}
      <div className="p-6 bg-slate-50/70 border-t border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  행사 대상 상품(SKU) 정합성 요약 리포트
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    총 {totalSkuCount}종 편성
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  단품 단위의 가격·할인율 인라인 수정, 트렌드 이상치 소명, 엑셀 기획서 업로드 검수는 <strong>[단품(SKU) 마스터 전수 QC]</strong> 전용 서브탭으로 완전 일원화되었습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 엑셀 파일 다운로드 버튼군 */}
            <div className="flex items-center rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs text-xs">
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_전체_QC리포트`)}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="해당 기획전의 모든 상품 및 오류 내역을 엑셀로 다운로드"
              >
                <Download className="w-3 h-3 text-indigo-600" />
                <span>전체 엑셀</span>
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_기획MD팀_오류품번`, 'MD')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                title="기획MD팀 확인 대상 엑셀 다운로드"
              >
                기획MD팀용
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_웹디자인팀_배너오류`, 'DESIGN')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                title="웹디자인팀 확인 대상 엑셀 다운로드"
              >
                웹디자인팀용
              </button>
              <button
                onClick={() => exportToExcel([promo], `${promo.id}_운영팀_URL쿠폰오류`, 'EBIZ_OPS')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                title="운영팀 확인 대상 엑셀 다운로드"
              >
                운영팀용
              </button>
            </div>

            <button
              onClick={() => runQcValidation(promo.id)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>룰 엔진 재검증</span>
            </button>
          </div>
        </div>

        {/* 4대 SKU 핵심 상태 지표 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-5">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">전체 편성 SKU</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalSkuCount}</span>
              <span className="text-xs text-slate-500">종</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">기획전 포함 상품</p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                다부서 복합 결함
              </span>
              <span className="text-[10px] font-bold bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded-full">
                MD+디자인
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-purple-900 font-mono">{multiDeptSkuCount}</span>
              <span className="text-xs text-purple-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-purple-700 mt-0.5 font-semibold">SWBLPB21010 (할인율+저화질)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                트렌드 이상치
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full">
                80% 극단치
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-900 font-mono">{trendAnomalySkuCount}</span>
              <span className="text-xs text-amber-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 font-semibold">SWCTKB21030 (평균30% 대비)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              정합성 통과 완료
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-900 font-mono">{passedSkuCount}</span>
              <span className="text-xs text-emerald-700 font-bold">건</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">게시 승인 가능 정상 품번</p>
          </div>
        </div>

        {/* 품번 간이 미리보기 칩 리스트 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 mb-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              📋 편성 품번(SKU) 간이 상태 목록
            </span>
            <span className="text-[11px] text-slate-400">
              클릭 시 [단품 마스터 전수 QC] 서브탭으로 이동하여 해당 품번을 즉시 인라인 수정할 수 있습니다.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {skuMetrics.map(({ prod, isMultiDept, isTrendAnomaly, hasBrokenImage }) => (
              <div
                key={prod.id}
                onClick={onNavigateToSkuQc}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                  isMultiDept
                    ? 'bg-purple-50/60 border-purple-200 hover:bg-purple-100/60'
                    : hasBrokenImage
                    ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                    : isTrendAnomaly
                    ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className="w-8 h-10 rounded bg-slate-200 overflow-hidden shrink-0 relative">
                  <img
                    src={prod.thumbnailUrl}
                    alt={prod.productName}
                    className="w-full h-full object-cover"
                  />
                  {hasBrokenImage && (
                    <div className="absolute inset-0 bg-rose-900/80 flex items-center justify-center text-[8px] text-white font-bold">
                      404
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-[11px] text-slate-900 truncate">
                      {prod.productCode}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        isMultiDept
                          ? 'bg-purple-200 text-purple-900'
                          : hasBrokenImage
                          ? 'bg-rose-200 text-rose-900'
                          : isTrendAnomaly
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isMultiDept
                        ? '다부서'
                        : hasBrokenImage
                        ? '404'
                        : isTrendAnomaly
                        ? '80% 이상치'
                        : '정상'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{prod.productName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 서브탭 전환 CTA 배너 */}
        <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                단품(SKU) 단위 전수 정합성 검증 및 인라인 수정 워크스페이스
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                MD 기획 엑셀 업로드, 80% 트렌드 이상치 소명 메일 발송, 404 이미지 교체 요청을 전용 서브탭에서 진행하세요.
              </p>
            </div>
          </div>

          {onNavigateToSkuQc && (
            <button
              type="button"
              onClick={onNavigateToSkuQc}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-black transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>단품(SKU) 마스터 전수 QC 서브탭으로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
