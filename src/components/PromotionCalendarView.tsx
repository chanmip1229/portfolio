'use client';

import React, { useMemo, useState } from 'react';
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
  Search,
  MessageSquare,
} from 'lucide-react';
import {
  Promotion,
  PromotionStatus,
  EventLifecycle,
  getPromotionLifecycle,
  getPromotionMonth,
} from '@/types/promotion';
import CommunicationHistoryModal from './CommunicationHistoryModal';
import { sendSlackMessage } from '@/utils/slackNotifier';

const STATUS_BADGE: Record<PromotionStatus, { label: string; color: string }> = {
  PLANNING: { label: '기획안 접수 등록', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ASSET_REQUESTED: { label: '소재 요청 완료 (회신 대기)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  DATA_RECEIVED: { label: '기획 엑셀·화보 회신 완료', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  NEEDS_CHECK: { label: '🚨 사전 QC 결함 재확인 필요', color: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse' },
  QC_PASSED: { label: '사전 QC 전수 통과 (PASS)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  READY_TO_PUBLISH: { label: '자사몰 게시 준비 완료', color: 'bg-teal-50 text-teal-800 border-teal-300 font-bold' },
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

  const [historyModalPromo, setHistoryModalPromo] = useState<Promotion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 상단 QC 워크스페이스로 스무스 스크롤 & 해당 기획전 선택
  const handleScrollToQc = (promoId: string) => {
    setSelectedPromotionId(promoId);
    const target = document.getElementById('qc-workspace-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 슬랙 실시간 넛지 발송 핸들러
  const handleSendSlackNudge = async (promo: Promotion) => {
    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const result = await sendSlackMessage({
      text: `[긴급 리마인더] [${promo.brand}] ${promo.title} 행사 오픈 D-5 소재 회신 요청`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `⏳ [소재 요청 리마인더] [${promo.brand}] ${promo.title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*수신 대상:* 디자인 담당 & 기획MD 담당\n*발신:* E-Biz 운영 담당 박찬미 (${now})\n*상태:* 행사 오픈(${promo.startDate}) 일정 준수를 위해 배너 화보 및 단품 엑셀 회신을 요청드립니다.`,
          },
        },
      ],
    });

    if (result.success) {
      setToastMessage(`⚡ [${promo.brand}] 디자인 담당 채널로 리마인더 알림을 실시간 발송했습니다!`);
    } else {
      setToastMessage(`⚠️ 슬랙 발송 완료 (시뮬레이션 모드 작동)`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. 최상단 실시간 집중 대응 대상: 현재 진행 중인 행사 (ACTIVE: 10월 당월)
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
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

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
                오류 재확인·소재 회신 대기 등 실시간 조치가 필요한 행사를 상단에 우선 배치하여 원클릭으로 상단 QC 검수실로 이동합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>📅 시연 기준일: <strong>2026.10.15</strong> (오픈 D-2 고정 시뮬레이션)</span>
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
                onClick={() => handleScrollToQc(promo.id)}
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
                      {isNeedsCheck
                        ? `🚨 사전 QC 결함 (${promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length}건)`
                        : isDelay
                        ? '⏳ 디자인 담당 소재 회신 대기 (D-5)'
                        : '📋 기획안 접수 등록'}
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
                      대기: [{promo.currentBottleneckDept === 'MD' ? '기획MD' : promo.currentBottleneckDept === 'DESIGN' ? '디자인' : promo.currentBottleneckDept === 'DEV' ? '전산' : '운영'} 담당]
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
                        title="부서별 듀얼 메일 모달 열기"
                      >
                        <Send className="w-3 h-3" />
                        <span>부서별 듀얼 메일</span>
                      </button>
                      <button
                        onClick={() => handleScrollToQc(promo.id)}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        title="상단 QC 워크스페이스로 스크롤하여 결함 검수 진행"
                      >
                        <Search className="w-3 h-3" />
                        <span>QC 검수 이동 ⬆️</span>
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
                        title="디자인 담당 D-5 지연 방지 리마인더 메일 작성"
                      >
                        <BellRing className="w-3 h-3" />
                        <span>리마인더 메일</span>
                      </button>
                      <button
                        onClick={() => handleSendSlackNudge(promo)}
                        className="py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="디자인 담당 채널로 실시간 슬랙 넛지 발송"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>슬랙 넛지</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPromotionId(promo.id);
                          useOpsStore.getState().simulateReceiveLookbook(promo.id);
                        }}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="화보 회신 수신 시뮬레이션 (마일스톤 정상 처리)"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>화보도착</span>
                      </button>
                    </>
                  )}

                  {!isNeedsCheck && !isDelay && (
                    <button
                      onClick={() => handleScrollToQc(promo.id)}
                      className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>🔍 상단 QC 워크스페이스에서 검수 진행 ⬆️</span>
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
                  onClick={() => handleScrollToQc(promo.id)}
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

                      <h3 className={`text-base font-bold ${isEnded ? 'text-slate-600' : 'text-slate-900'}`}>
                        {promo.title}
                      </h3>

                      {/* 2. 업무 세부 상태 배지 (종료 행사에서는 '게시 준비 완료'를 숨기고 '아카이빙 완료'만 표기) */}
                      {isEnded ? (
                        <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-100 text-slate-600 border-slate-300 font-medium">
                          아카이빙 (결산 완료)
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      )}

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
                        <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            디자인 담당 회신 대기 (D-5)
                          </span>
                          <button
                            onClick={() => createReminderDraft(promo.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 transition-colors cursor-pointer"
                          >
                            <BellRing className="w-3 h-3" />
                            <span>✉️ 리마인더 메일</span>
                          </button>
                          <button
                            onClick={() => handleSendSlackNudge(promo)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>⚡ 슬랙 넛지</span>
                          </button>
                          <button
                            onClick={() => useOpsStore.getState().simulateReceiveLookbook(promo.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>⚡ 화보 회신 도착</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleScrollToQc(promo.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>QC 검수 ⬆️</span>
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-indigo-600 rotate-90 md:rotate-0' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 분 단위 상태 타임스탬프 히스토리 바 (클릭 시 전사 소통 & 메일 히스토리 모달 오픈) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistoryModalPromo(promo);
                    }}
                    className="bg-slate-50 hover:bg-indigo-50/50 rounded-lg p-3 border border-slate-200/80 mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 cursor-pointer transition-colors group"
                    title="클릭 시 기획 접수부터 메일·슬랙 발송까지 전체 소통 로그를 팝업으로 엽니다"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        <span>진행 타임스탬프:</span>
                      </div>
                      <span>• 기획안 접수: <strong>{promo.timestamps.plannedAt}</strong></span>
                      {promo.timestamps.assetRequestedAt && (
                        <span>• 단품/배너 소재 요청: <strong>{promo.timestamps.assetRequestedAt}</strong></span>
                      )}
                      {promo.timestamps.dataReceivedAt && (
                        <span>• 기획 엑셀·화보 회신: <strong>{promo.timestamps.dataReceivedAt}</strong></span>
                      )}
                      {promo.timestamps.issueDetectedAt && (
                        <span className="text-rose-600 font-bold">• 사전 QC 결함 발견: <strong>{promo.timestamps.issueDetectedAt}</strong></span>
                      )}
                      {promo.timestamps.qcPassedAt && (
                        <span className="text-emerald-600 font-bold">• 사전 QC 통과: <strong>{promo.timestamps.qcPassedAt}</strong></span>
                      )}
                      {promo.timestamps.publishedAt && (
                        <span className="text-teal-700 font-bold">• 자사몰 오픈 완료: <strong>{promo.timestamps.publishedAt}</strong></span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white group-hover:bg-indigo-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-indigo-200 transition-all shadow-2xs">
                      <History className="w-3 h-3" />
                      <span>📜 전사 소통 & 메일 히스토리</span>
                    </span>
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

      {/* 전사 소통 & 메일 발송 히스토리 팝업 모달 */}
      {historyModalPromo && (
        <CommunicationHistoryModal
          promotion={historyModalPromo}
          isOpen={Boolean(historyModalPromo)}
          onClose={() => setHistoryModalPromo(null)}
          onOpenDraft={(draftId) => {
            setSelectedPromotionId(historyModalPromo.id);
            setSelectedDraftId(draftId);
            setIsDraftModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
