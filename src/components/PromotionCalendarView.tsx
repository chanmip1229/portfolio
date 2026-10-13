'use client';

import React, { useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BellRing,
  History,
  Send,
  Sparkles,
  Flame,
  CheckCircle,
  Hourglass,
  Layers,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PromotionStatus,
  EventLifecycle,
  getPromotionLifecycle,
  getPromotionMonth,
} from '@/types/promotion';

const STATUS_BADGE: Record<PromotionStatus, { label: string; color: string }> = {
  PLANNING: { label: '기획 등록', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ASSET_REQUESTED: { label: '소재 요청 완료 (회신 대기)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  DATA_RECEIVED: { label: '회신 수신 완료', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  NEEDS_CHECK: { label: '🚨 오류 재확인 필요', color: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse' },
  QC_PASSED: { label: '사전 QC 통과', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  READY_TO_PUBLISH: { label: '게시 준비 완료', color: 'bg-teal-50 text-teal-800 border-teal-300 font-bold' },
};

const BRAND_COLORS: Record<string, string> = {
  SHESMISS: 'bg-slate-900 text-white',
  LIST: 'bg-blue-900 text-white',
  SISTINA: 'bg-amber-900 text-white',
};

export default function PromotionCalendarView() {
  const {
    promotions,
    selectedPromotionId,
    setSelectedPromotionId,
    selectedBrand,
    selectedDepartment,
    selectedStatus,
    selectedLifecycle,
    selectedMonth,
    createReminderDraft,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  // 1. 최상단 실시간 집중 대응 대상: 현재 진행 중인 행사 (ACTIVE: 3월 당월)
  const activePromotions = useMemo(() => {
    return promotions.filter((promo) => getPromotionLifecycle(promo) === 'ACTIVE');
  }, [promotions]);

  // 2. 4-Way 필터링 적용 (브랜드 · 부서 · 마일스톤상태 · 진행단계 · 월별)
  const filteredPromotions = useMemo(() => {
    return promotions
      .filter((promo) => {
        if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return false;
        if (selectedDepartment !== 'ALL' && promo.currentBottleneckDept !== selectedDepartment) return false;
        if (selectedStatus !== 'ALL' && promo.status !== selectedStatus) return false;
        if (selectedLifecycle !== 'ALL' && getPromotionLifecycle(promo) !== selectedLifecycle) return false;
        if (selectedMonth !== 'ALL' && getPromotionMonth(promo) !== selectedMonth) return false;
        return true;
      })
      .sort((a, b) => {
        // 진행 중(ACTIVE)을 우선 배치하고, 이후 오픈 일자 오름차순 정렬
        const order: Record<'ACTIVE' | 'UPCOMING' | 'ENDED', number> = {
          ACTIVE: 0,
          UPCOMING: 1,
          ENDED: 2,
        };
        const lifeA = getPromotionLifecycle(a);
        const lifeB = getPromotionLifecycle(b);
        if (order[lifeA] !== order[lifeB]) {
          return order[lifeA] - order[lifeB];
        }
        return a.startDate.localeCompare(b.startDate);
      });
  }, [
    promotions,
    selectedBrand,
    selectedDepartment,
    selectedStatus,
    selectedLifecycle,
    selectedMonth,
  ]);

  return (
    <div className="space-y-8">
      {/* 🚀 상단 고정: 실시간 집중 대응 — 현재 진행 중인 행사 워크보드 (스크롤 없이 즉시 파악) */}
      <div className="rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md border border-indigo-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  실시간 집중 대응 — 현재 진행 중인 행사 (Active Operations Board)
                </h3>
                <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                  당월 집중 3건
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                오류 재확인·소재 회신 대기 등 실시간 조치가 필요한 행사를 상단에 우선 배치하여 스크롤 없이 즉시 원클릭 대응합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>2026년 3월 실시간 관제 중</span>
          </div>
        </div>

        {/* 현재 진행 중인 3대 행사 퀵 액션 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePromotions.map((promo) => {
            const isSelected = promo.id === selectedPromotionId;
            const isNeedsCheck = promo.status === 'NEEDS_CHECK';
            const isDelay = promo.status === 'ASSET_REQUESTED';

            return (
              <div
                key={promo.id}
                onClick={() => setSelectedPromotionId(promo.id)}
                className={`rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-white/15 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                        BRAND_COLORS[promo.brand] || 'bg-slate-800 text-white'
                      }`}
                    >
                      {promo.brand}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isNeedsCheck
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : isDelay
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {isNeedsCheck ? '🚨 오류 재확인' : isDelay ? '⏳ 회신 대기 (D-3)' : '📋 기획 등록'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                    {promo.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      오픈: <strong>{promo.startDate}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-amber-300 font-semibold">
                      병목: [{promo.currentBottleneckDept}팀]
                    </span>
                  </div>
                </div>

                {/* 상황별 즉각 조치 액션 버튼 */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {isNeedsCheck && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPromotionId(promo.id);
                          setSelectedDraftId(promo.emailDraftIds[0] || 'draft-multi-dept-md');
                          setIsDraftModalOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        title="다부서 재확인 듀얼 메일 모달 열기"
                      >
                        <Send className="w-3 h-3" />
                        <span>재확인 듀얼 메일</span>
                      </button>
                      <button
                        onClick={() => setSelectedPromotionId(promo.id)}
                        className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                        title="해당 기획전 QC 워크스페이스 선택"
                      >
                        QC 선택
                      </button>
                    </>
                  )}

                  {isDelay && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPromotionId(promo.id);
                          createReminderDraft(promo.id);
                        }}
                        className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        title="D-3 지연 방지 리마인더 메일 작성"
                      >
                        <BellRing className="w-3 h-3" />
                        <span>리마인더 메일</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPromotionId(promo.id);
                          useOpsStore.getState().simulateReceiveLookbook(promo.id);
                        }}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="화보 회신 수신 시뮬레이션"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>화보도착</span>
                      </button>
                    </>
                  )}

                  {!isNeedsCheck && !isDelay && (
                    <button
                      onClick={() => setSelectedPromotionId(promo.id)}
                      className="w-full py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>QC 워크스페이스에서 검수 진행</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📋 프로모션 전체 타임라인 & 상세 마일스톤 리스트 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                프로모션 타임라인 & 상세 마일스톤
                {selectedMonth !== 'ALL' && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                    {selectedMonth}월 프로모션
                  </span>
                )}
                {selectedLifecycle !== 'ALL' && (
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {selectedLifecycle === 'ACTIVE'
                      ? '진행 중'
                      : selectedLifecycle === 'UPCOMING'
                      ? '진행 예정'
                      : '행사 종료'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                D-7 소재요청부터 D-Day 오픈까지 분 단위 타임스탬프와 마일스톤 완료 여부를 실시간 추적합니다.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium shrink-0">
            필터링된 프로모션: <strong className="text-indigo-600 font-bold">{filteredPromotions.length}</strong> / 전체 {promotions.length}건
          </div>
        </div>

        {filteredPromotions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            선택한 조건(진행단계 · 월별 · 브랜드 · 부서)에 해당하는 프로모션이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promo) => {
              const isSelected = promo.id === selectedPromotionId;
              const badge = STATUS_BADGE[promo.status];
              const lifecycle = getPromotionLifecycle(promo);
              const isEnded = lifecycle === 'ENDED';
              const isActive = lifecycle === 'ACTIVE';
              const isDelayPending = promo.status === 'ASSET_REQUESTED';

              return (
                <div
                  key={promo.id}
                  onClick={() => setSelectedPromotionId(promo.id)}
                  className={`rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20 shadow-sm'
                      : isEnded
                      ? 'bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-100'
                      : isActive
                      ? 'bg-white border-indigo-200 hover:border-indigo-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* 상단 헤더 정보: 브랜드 · 제목 · 진행단계 배지 · 업무상태 배지 */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          BRAND_COLORS[promo.brand] || 'bg-slate-800 text-white'
                        }`}
                      >
                        {promo.brand}
                      </span>

                      {/* 1. 종료/진행중/진행예정 라이프사이클 배지 (명확한 구분) */}
                      {isActive && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600" />
                          <span>진행 중 (당월 집중)</span>
                        </span>
                      )}
                      {lifecycle === 'UPCOMING' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-sky-500" />
                          <span>진행 예정</span>
                        </span>
                      )}
                      {isEnded && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-slate-500" />
                          <span>행사 종료 (운영 완료)</span>
                        </span>
                      )}

                      <h3 className={`text-base font-bold ${isEnded ? 'text-slate-600 line-through md:no-underline' : 'text-slate-900'}`}>
                        {promo.title}
                      </h3>

                      {/* 2. 업무 세부 상태 배지 */}
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>

                      {/* 오류 재확인 메일 알림 뱃지 */}
                      {promo.status === 'NEEDS_CHECK' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDraftId(promo.emailDraftIds[0] || null);
                            setIsDraftModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2.5 py-0.5 rounded-full border border-rose-300 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>재확인 메일 초안 보기</span>
                        </button>
                      )}

                      {/* 회신 지연 경고 & 리마인더 발송 & 회신 도착 시뮬레이션 버튼 */}
                      {isDelayPending && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            회신 대기 중 (D-3)
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              createReminderDraft(promo.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 transition-colors cursor-pointer"
                          >
                            <BellRing className="w-3 h-3" />
                            <span>리마인더 메일 작성</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              useOpsStore.getState().simulateReceiveLookbook(promo.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>⚡ [시뮬레이션] 화보 회신 도착</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        오픈: {promo.startDate}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-indigo-600 rotate-90 md:rotate-0' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 분 단위 상태 타임스탬프 히스토리 바 */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>진행 타임스탬프:</span>
                    </div>
                    <span>• 기획: <strong>{promo.timestamps.plannedAt}</strong></span>
                    {promo.timestamps.assetRequestedAt && (
                      <span>• 소재요청: <strong>{promo.timestamps.assetRequestedAt}</strong></span>
                    )}
                    {promo.timestamps.dataReceivedAt && (
                      <span>• 회신수신: <strong>{promo.timestamps.dataReceivedAt}</strong></span>
                    )}
                    {promo.timestamps.issueDetectedAt && (
                      <span className="text-rose-600 font-bold">• 오류발견: <strong>{promo.timestamps.issueDetectedAt}</strong></span>
                    )}
                    {promo.timestamps.qcPassedAt && (
                      <span className="text-emerald-600 font-bold">• QC통과: <strong>{promo.timestamps.qcPassedAt}</strong></span>
                    )}
                    {promo.timestamps.publishedAt && (
                      <span className="text-teal-700 font-bold">• 게시완료: <strong>{promo.timestamps.publishedAt}</strong></span>
                    )}
                  </div>

                  {/* D-Day 마일스톤 파이프라인 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {promo.milestones.map((m) => {
                      const isDone = m.isCompleted;
                      return (
                        <div
                          key={m.code}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                            isDone
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {m.code.replace('_MINUS_', '-').replace('_DAY', '-Day')}
                            </span>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">대기</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium leading-snug line-clamp-2 my-1">
                            {m.label}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                            <span>{m.targetDate}</span>
                            <span className="font-semibold text-slate-500">[{m.department}]</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
