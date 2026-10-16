'use client';

import React, { useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Brand,
  Department,
  PromotionStatus,
  EventLifecycle,
  getPromotionLifecycle,
  getPromotionMonth,
} from '@/types/promotion';
import {
  Filter,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  CalendarDays,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const BRANDS: { value: Brand | 'ALL'; label: string; desc: string }[] = [
  { value: 'ALL', label: '전체 브랜드', desc: 'SHESMISS / LIST / SISTINA' },
  { value: 'SHESMISS', label: 'SHESMISS (쉬즈미스)', desc: '모던 & 컨템포러리' },
  { value: 'LIST', label: 'LIST (리스트)', desc: '영 캐주얼 셀렉션' },
  { value: 'SISTINA', label: 'SISTINA (시스티나)', desc: '트렌디 영 베이직' },
];

const DEPARTMENTS: { value: Department | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체 부서' },
  { value: 'MD', label: '기획MD팀 (상품/가격)' },
  { value: 'DESIGN', label: '웹디자인팀 (배너/화보)' },
  { value: 'EBIZ_OPS', label: 'E-BIZ 자사몰운영팀 (QC/오픈)' },
];

const LIFECYCLES: {
  value: EventLifecycle;
  label: string;
  badgeText: string;
  badgeClass: string;
  activeClass: string;
}[] = [
  {
    value: 'ALL',
    label: '전체 행사',
    badgeText: '18건',
    badgeClass: 'bg-slate-200 text-slate-700',
    activeClass: 'bg-slate-900 text-white',
  },
  {
    value: 'ACTIVE',
    label: '🔥 진행 중인 행사',
    badgeText: '당월 집중 대응',
    badgeClass: 'bg-rose-100 text-rose-800 font-bold',
    activeClass: 'bg-rose-600 text-white shadow-xs',
  },
  {
    value: 'UPCOMING',
    label: '⏳ 진행 예정 행사',
    badgeText: '사전 기획',
    badgeClass: 'bg-sky-100 text-sky-800',
    activeClass: 'bg-sky-600 text-white shadow-xs',
  },
  {
    value: 'ENDED',
    label: '✅ 종료된 행사',
    badgeText: '운영 완료',
    badgeClass: 'bg-slate-100 text-slate-600',
    activeClass: 'bg-slate-700 text-white shadow-xs',
  },
];

const STATUSES: { value: PromotionStatus | 'ALL'; label: string; icon: React.ReactNode }[] = [
  { value: 'ALL', label: '전체 업무 세부 상태', icon: null },
  { value: 'PLANNING', label: '1. 기획/등록', icon: <Clock className="w-3 h-3 text-slate-400" /> },
  { value: 'ASSET_REQUESTED', label: '2. 회신 대기 (소재 요청됨)', icon: <Clock className="w-3 h-3 text-blue-500" /> },
  { value: 'DATA_RECEIVED', label: '3. 회신 도착', icon: <CheckCircle2 className="w-3 h-3 text-indigo-500" /> },
  { value: 'NEEDS_CHECK', label: '4. 🚨 오류 재확인 필요', icon: <AlertTriangle className="w-3 h-3 text-rose-500" /> },
  { value: 'QC_PASSED', label: '5. 사전 QC 통과', icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
  { value: 'READY_TO_PUBLISH', label: '6. 게시 준비 완료', icon: <CheckCircle2 className="w-3 h-3 text-teal-600" /> },
];

export default function MatrixFilterBar() {
  const {
    selectedBrand,
    selectedDepartment,
    selectedStatus,
    selectedLifecycle,
    selectedMonth,
    setSelectedBrand,
    setSelectedDepartment,
    setSelectedStatus,
    setSelectedLifecycle,
    setSelectedMonth,
    promotions,
  } = useOpsStore();

  // 라이프사이클별 건수 계산
  const lifecycleCounts = useMemo(() => {
    return {
      ALL: promotions.length,
      ACTIVE: promotions.filter((p) => getPromotionLifecycle(p) === 'ACTIVE').length,
      UPCOMING: promotions.filter((p) => getPromotionLifecycle(p) === 'UPCOMING').length,
      ENDED: promotions.filter((p) => getPromotionLifecycle(p) === 'ENDED').length,
    };
  }, [promotions]);

  // 월별 건수 계산 (1월~12월)
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    promotions.forEach((p) => {
      const m = getPromotionMonth(p);
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [promotions]);

  const isFilterActive =
    selectedBrand !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedLifecycle !== 'ALL' ||
    selectedMonth !== 'ALL';

  const handleResetFilters = () => {
    setSelectedBrand('ALL');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setSelectedLifecycle('ALL');
    setSelectedMonth('ALL');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8 space-y-5">
      {/* 타이틀 및 리셋 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              4-Way 멀티 필터 매트릭스 (행사 진행 단계 · 브랜드 · 협업부서 · 월별)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              현재 진행 중인 핵심 업무에 집중하거나, 월별/단계별로 연간 프로모션을 필터링합니다.
            </p>
          </div>
        </div>

        {isFilterActive && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>필터 전체 초기화</span>
          </button>
        )}
      </div>

      {/* 핵심 1. 행사 진행 단계 관점 (종료된 / 진행중 / 진행 예정 이벤트 완벽 구분) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>1. 행사 진행 단계 관점 (업무 우선순위 식별)</span>
          </label>
          <span className="text-[11px] text-slate-400">
            현재 집중 관리: <strong className="text-rose-600 font-bold">10월 당월 진행 3건</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LIFECYCLES.map((lc) => {
            const isSelected = selectedLifecycle === lc.value;
            const count = lifecycleCounts[lc.value];

            return (
              <button
                key={lc.value}
                onClick={() => setSelectedLifecycle(lc.value)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${lc.activeClass} border-transparent ring-2 ring-indigo-300`
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold">{lc.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : lc.badgeClass
                    }`}
                  >
                    {count}건
                  </span>
                </div>
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {lc.badgeText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 핵심 2. 월별 빠른 탐색 바 (1월 ~ 12월) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>2. 월별 탐색 관점 (2026 연간 캘린더)</span>
          </label>
          {selectedMonth !== 'ALL' && (
            <button
              onClick={() => setSelectedMonth('ALL')}
              className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              전체 월 보기
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* 전체 월 버튼 */}
          <button
            onClick={() => setSelectedMonth('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedMonth === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>전체 월</span>
            <span className="ml-1 text-[10px] opacity-70">({promotions.length})</span>
          </button>

          {/* 1월 ~ 12월 버튼군 */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isSelected = selectedMonth === m;
            const count = monthCounts[m] || 0;
            const isCurrentMonth = m === 10; // 시뮬레이션 기준 10월이 현재 당월

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : isCurrentMonth
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                    : count > 0
                    ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-100 border border-slate-100'
                }`}
              >
                {isCurrentMonth && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
                <span>{m}월</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isCurrentMonth
                      ? 'bg-indigo-200/80 text-indigo-900 font-extrabold'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
                {isCurrentMonth && !isSelected && (
                  <span className="text-[9px] bg-rose-500 text-white px-1 py-0.2 rounded font-extrabold">
                    당월
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 & 4. 브랜드별 / 협업 부서별 / 세부 업무 상태 3분할 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
        {/* 브랜드별 관점 */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            3. 브랜드별 관점
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.map((b) => {
              const isSelected = selectedBrand === b.value;
              const count =
                b.value === 'ALL'
                  ? promotions.length
                  : promotions.filter((p) => p.brand === b.value).length;

              return (
                <button
                  key={b.value}
                  onClick={() => setSelectedBrand(b.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{b.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 협업 부서(병목) 관점 */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            4. 협업 부서(병목) 관점
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDepartment === dept.value;
              const count =
                dept.value === 'ALL'
                  ? promotions.length
                  : promotions.filter((p) => p.currentBottleneckDept === dept.value).length;

              return (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDepartment(dept.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{dept.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 업무 세부 상태 관점 */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            5. 세부 마일스톤 상태
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PromotionStatus | 'ALL')}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
