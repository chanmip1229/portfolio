'use client';

import React from 'react';
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
} from 'lucide-react';
import { PromotionStatus } from '@/types/promotion';

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
    createReminderDraft,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  // 3-Way 필터링 적용
  const filteredPromotions = promotions.filter((promo) => {
    if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return false;
    if (selectedDepartment !== 'ALL' && promo.currentBottleneckDept !== selectedDepartment) return false;
    if (selectedStatus !== 'ALL' && promo.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">프로모션 타임라인 & 업무 상태 (Timestamp Tracked)</h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          필터링된 프로모션: <strong>{filteredPromotions.length}</strong> / 전체 {promotions.length}건
        </span>
      </div>

      {filteredPromotions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
          선택한 필터 조건에 해당하는 프로모션이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPromotions.map((promo) => {
            const isSelected = promo.id === selectedPromotionId;
            const badge = STATUS_BADGE[promo.status];

            // 회신 지연 조건: ASSET_REQUESTED 상태인데 아직 회신 안 옴
            const isDelayPending = promo.status === 'ASSET_REQUESTED';

            return (
              <div
                key={promo.id}
                onClick={() => setSelectedPromotionId(promo.id)}
                className={`rounded-xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* 상단 헤더 정보 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                        BRAND_COLORS[promo.brand] || 'bg-slate-800 text-white'
                      }`}
                    >
                      {promo.brand}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{promo.title}</h3>
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2.5 py-0.5 rounded-full border border-rose-300 transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>재확인 메일 초안 보기</span>
                      </button>
                    )}

                    {/* 회신 지연 경고 & 리마인더 발송 버튼 */}
                    {isDelayPending && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          회신 대기 중 (D-3)
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createReminderDraft(promo.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 transition-colors"
                        >
                          <BellRing className="w-3 h-3" />
                          <span>리마인더 메일 초안 작성</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
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
  );
}
