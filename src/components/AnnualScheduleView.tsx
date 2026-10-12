'use client';

import React, { useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { Brand, Promotion } from '@/types/promotion';
import { exportToExcel } from '@/utils/excelExporter';
import {
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Download,
  ChevronRight,
  TrendingUp,
  Sliders,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function AnnualScheduleView() {
  const {
    promotions,
    selectedBrand,
    setSelectedBrand,
    setSelectedPromotionId,
  } = useOpsStore();

  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL');

  // 분기 판정 헬퍼
  const getQuarter = (dateStr: string): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
    const month = parseInt(dateStr.slice(5, 7), 10);
    if (month >= 1 && month <= 3) return 'Q1';
    if (month >= 4 && month <= 6) return 'Q2';
    if (month >= 7 && month <= 9) return 'Q3';
    return 'Q4';
  };

  // 진행률 (완료 정도 %) 계산 헬퍼
  const calculateProgress = (promo: Promotion): number => {
    if (promo.status === 'READY_TO_PUBLISH') return 100;
    const completedMilestones = promo.milestones.filter((m) => m.isCompleted).length;
    const totalMilestones = promo.milestones.length || 5;

    // 마일스톤 완료 비율 (최대 80%)
    let score = Math.round((completedMilestones / totalMilestones) * 70);

    // QC 통과 여부 반영
    const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
    if (promo.banner.isConfirmed) score += 15;
    if (promo.products.length > 0 && blockerCount === 0) score += 15;

    return Math.min(Math.max(score, 10), 95);
  };

  // 필터링된 프로모션 목록
  const filteredPromos = useMemo(() => {
    return promotions.filter((promo) => {
      // 브랜드 필터
      if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return false;

      // 분기 필터
      if (selectedQuarter !== 'ALL' && getQuarter(promo.startDate) !== selectedQuarter) return false;

      // 상태 필터
      const isCompleted = promo.status === 'READY_TO_PUBLISH';
      if (selectedStatusFilter === 'COMPLETED' && !isCompleted) return false;
      if (selectedStatusFilter === 'IN_PROGRESS' && isCompleted) return false;

      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [promotions, selectedBrand, selectedQuarter, selectedStatusFilter]);

  // 연간 종합 요약 통계
  const totalCount = promotions.length;
  const completedCount = promotions.filter((p) => p.status === 'READY_TO_PUBLISH').length;
  const inProgressCount = totalCount - completedCount;
  const avgProgress = Math.round(
    promotions.reduce((acc, curr) => acc + calculateProgress(curr), 0) / (totalCount || 1)
  );

  const months = [
    { num: '01', name: '1월', q: 'Q1' },
    { num: '02', name: '2월', q: 'Q1' },
    { num: '03', name: '3월', q: 'Q1' },
    { num: '04', name: '4월', q: 'Q2' },
    { num: '05', name: '5월', q: 'Q2' },
    { num: '06', name: '6월', q: 'Q2' },
    { num: '07', name: '7월', q: 'Q3' },
    { num: '08', name: '8월', q: 'Q3' },
    { num: '09', name: '9월', q: 'Q3' },
    { num: '10', name: '10월', q: 'Q4' },
    { num: '11', name: '11월', q: 'Q4' },
    { num: '12', name: '12월', q: 'Q4' },
  ];

  const [viewMode, setViewMode] = useState<'GANTT' | 'CARDS' | 'BOTH'>('GANTT');

  // 타임라인 좌표 계산 헬퍼 (1~12월 365일 비례 계산)
  const getTimelineCoordinates = (startDate: string, endDate: string) => {
    const sMonth = parseInt(startDate.slice(5, 7), 10) - 1; // 0 to 11
    const sDay = parseInt(startDate.slice(8, 10), 10) || 1;
    const eMonth = parseInt(endDate.slice(5, 7), 10) - 1;
    const eDay = parseInt(endDate.slice(8, 10), 10) || 28;

    const startRatio = (sMonth + Math.min(sDay, 30) / 30) / 12;
    const endRatio = (eMonth + Math.min(eDay, 30) / 30) / 12;

    const leftPercent = Math.max(0, Math.min(94, startRatio * 100));
    const rawWidth = (endRatio - startRatio) * 100;
    const widthPercent = Math.max(5.5, Math.min(100 - leftPercent, rawWidth));

    return {
      left: `${leftPercent.toFixed(1)}%`,
      width: `${widthPercent.toFixed(1)}%`,
    };
  };

  // 현재 시점 (2026년 3월 2주차) 위치 퍼센트
  const currentTimelinePos = '19.4%';

  return (
    <div className="space-y-6">
      {/* 1. 상단 통계 카드 & 연간 로드맵 컨트롤러 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                2026 연간 프로모션 마스터 캘린더 & 간트차트 로드맵
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              인동FN 3대 브랜드(SHESMISS, LIST, SISTINA)의 1~12월 실제 일정 위치와 마일스톤 완료 진척도를 일치시켜 관리합니다.
            </p>
          </div>

          {/* 뷰 모드 토글 & 엑셀 일괄 다운로드 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('GANTT')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'GANTT' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                📊 간트차트 뷰
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                📋 월별 카드 뷰
              </button>
              <button
                type="button"
                onClick={() => setViewMode('BOTH')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'BOTH' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                통합 뷰
              </button>
            </div>

            <button
              onClick={() => exportToExcel(promotions, '2026_연간_프로모션_마스터_리포트')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>연간 전체 엑셀 (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 4대 KPI 요약 게이지 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase">연간 총 기획전</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
              <span className="text-xs text-slate-500">개 행사</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">게시 완료 (100% 달성)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-800 font-mono">{completedCount}</span>
              <span className="text-xs text-emerald-600">개 행사</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700 uppercase">운영·QC 진행 중</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-800 font-mono">{inProgressCount}</span>
              <span className="text-xs text-amber-600">개 행사</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-700 uppercase">연간 종합 평균 완료도</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-800 font-mono">{avgProgress}%</span>
              <div className="flex-1 ml-2 bg-indigo-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${avgProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 툴바 (브랜드, 분기, 완료상태) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 브랜드 필터 */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 font-bold text-slate-600">
              <button
                onClick={() => setSelectedBrand('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                전체 브랜드
              </button>
              <button
                onClick={() => setSelectedBrand('SHESMISS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SHESMISS' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SHESMISS
              </button>
              <button
                onClick={() => setSelectedBrand('LIST')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                LIST
              </button>
              <button
                onClick={() => setSelectedBrand('SISTINA')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SISTINA' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SISTINA
              </button>
            </div>

            {/* 분기 필터 */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 font-bold text-slate-600">
              <button
                onClick={() => setSelectedQuarter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                연간 전체
              </button>
              <button
                onClick={() => setSelectedQuarter('Q1')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q1' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                1분기 (Q1)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q2')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q2' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                2분기 (Q2)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q3')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q3' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                3분기 (Q3)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q4')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q4' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                4분기 (Q4)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">완료도 필터:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="ALL">전체 상태</option>
              <option value="COMPLETED">100% 완료된 행사만</option>
              <option value="IN_PROGRESS">진행 중 / 검수 대기</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 실제 일정 연동 정밀 간트차트 뷰 (True Calendar-Aligned Gantt Chart) */}
      {(viewMode === 'GANTT' || viewMode === 'BOTH') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>📊</span>
                <span>2026 연간 타임라인 간트 차트 (실제 일정 비례 배치)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                행사의 시작일~종료일에 맞춰 12개월 타임라인 상의 실제 위치에 바가 배치되며, 진행률이 바 내부에 실시간 충전됩니다.
              </p>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                게시 완료(100%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                오류 적발(조치대기)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
                정상 진행 중
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                현재 시점 (3월)
              </span>
            </div>
          </div>

          {/* 간트 차트 컨테이너 (가로 스크롤 가능) */}
          <div className="overflow-x-auto">
            <div className="min-w-[950px]">
              {/* 헤더: 좌측 프로모션 정보 열 + 우측 12개월 캘린더 그리드 */}
              <div className="flex items-end border-b border-slate-300 pb-3 font-bold text-xs">
                <div className="w-72 shrink-0 pr-4 text-slate-500 uppercase tracking-wider">
                  프로모션 / 브랜드 / D-Day
                </div>
                <div className="flex-1 grid grid-cols-12 text-center text-slate-600 relative">
                  {months.map((m) => (
                    <div
                      key={m.num}
                      className="border-l border-slate-200/80 first:border-none px-1"
                    >
                      <div className="text-slate-900 font-extrabold text-xs">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{m.q}</div>
                    </div>
                  ))}

                  {/* 현재 시점 헤더 핀 */}
                  <div
                    className="absolute -top-3.5 z-20 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
                    style={{ left: currentTimelinePos }}
                  >
                    <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                      오늘
                    </span>
                    <span className="w-1.5 h-1.5 bg-rose-500 rotate-45 -mt-0.5"></span>
                  </div>
                </div>
              </div>

              {/* 간트 차트 행 목록 */}
              <div className="divide-y divide-slate-100 relative">
                {/* 12개월 타임라인 배경 그리드 및 오늘 기준선 (전체 행 관통) */}
                <div className="absolute inset-0 left-72 pointer-events-none grid grid-cols-12 z-0">
                  {months.map((m, idx) => (
                    <div
                      key={idx}
                      className="border-l border-slate-100 first:border-none h-full bg-slate-50/20"
                    />
                  ))}
                  {/* 오늘 기준선 (붉은 세로선) */}
                  <div
                    className="absolute top-0 bottom-0 z-10 border-l-2 border-dashed border-rose-400 opacity-70"
                    style={{ left: currentTimelinePos }}
                  />
                </div>

                {filteredPromos.map((promo) => {
                  const progress = calculateProgress(promo);
                  const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
                  const isCompleted = promo.status === 'READY_TO_PUBLISH';
                  const coords = getTimelineCoordinates(promo.startDate, promo.endDate);

                  return (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromotionId(promo.id)}
                      className="flex items-center py-3.5 hover:bg-slate-50/80 transition-colors group cursor-pointer relative z-10"
                    >
                      {/* 좌측 정보 컬럼 */}
                      <div className="w-72 shrink-0 pr-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              promo.brand === 'SHESMISS'
                                ? 'bg-purple-100 text-purple-800'
                                : promo.brand === 'LIST'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {promo.brand}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {promo.startDate.slice(5)} ~ {promo.endDate.slice(5)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate mb-1">
                          {promo.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-[10px]">
                          {blockerCount > 0 ? (
                            <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              오류 {blockerCount}건 조치대기
                            </span>
                          ) : isCompleted ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              100% 승인완료
                            </span>
                          ) : (
                            <span className="bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">
                              진척도 {progress}%
                            </span>
                          )}
                          <span className="text-slate-400 font-mono">
                            {promo.targetDiscountRate}% / {promo.allowCoupon ? '쿠폰O' : '쿠폰X'}
                          </span>
                        </div>
                      </div>

                      {/* 우측 간트 트랙 & 날짜 비례 바 */}
                      <div className="flex-1 relative h-9 flex items-center">
                        <div
                          className="absolute h-8 rounded-lg shadow-xs transition-all duration-300 group-hover:shadow-md flex items-center justify-between px-2.5 overflow-hidden border cursor-pointer"
                          style={{
                            left: coords.left,
                            width: coords.width,
                            backgroundColor: isCompleted
                              ? '#ecfdf5'
                              : blockerCount > 0
                              ? '#fff1f2'
                              : '#eef2ff',
                            borderColor: isCompleted
                              ? '#a7f3d0'
                              : blockerCount > 0
                              ? '#fecdd3'
                              : '#c7d2fe',
                          }}
                          title={`${promo.title} (${promo.startDate} ~ ${promo.endDate}) - 완료도 ${progress}%`}
                        >
                          {/* 내부 진행률 충전 게이지 (Progress fill bar) */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 opacity-25 rounded-l-lg transition-all duration-500 ${
                              isCompleted
                                ? 'bg-emerald-600'
                                : blockerCount > 0
                                ? 'bg-rose-600'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />

                          {/* 바 내부 레이블 */}
                          <div className="relative z-10 flex items-center gap-1.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600'
                                  : blockerCount > 0
                                  ? 'bg-rose-600'
                                  : 'bg-indigo-600'
                              }`}
                            />
                            <span className="text-[11px] font-bold text-slate-900 truncate">
                              {promo.title}
                            </span>
                          </div>

                          <div className="relative z-10 flex items-center gap-1 shrink-0 ml-1">
                            <span
                              className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : blockerCount > 0
                                  ? 'bg-rose-200 text-rose-900'
                                  : 'bg-indigo-200 text-indigo-900'
                              }`}
                            >
                              {progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 12개월 월별 카드 그리드 뷰 (12-Month Card Grid) */}
      {(viewMode === 'CARDS' || viewMode === 'BOTH') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>월별 프로모션 세부 카드 뷰 ({filteredPromos.length}건)</span>
            </h3>
            <span className="text-xs text-slate-500">
              카드를 클릭하면 실시간 오류 검증 및 쿠폰 QC 워크스페이스로 이동합니다.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.map((promo) => {
              const progress = calculateProgress(promo);
              const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;

              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* 상단 뱃지 바 */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            promo.brand === 'SHESMISS'
                              ? 'bg-purple-100 text-purple-800'
                              : promo.brand === 'LIST'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {promo.brand}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {promo.startDate.slice(5, 7)}월 행사
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          progress === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : blockerCount > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        진척도 {progress}%
                      </span>
                    </div>

                    {/* 타이틀 & 행사 일정 */}
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                      {promo.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      {promo.startDate} ~ {promo.endDate}
                    </p>

                    {/* 이벤트 완료 정도 프로그레스 바 */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>이벤트 완료 진척도</span>
                        <span className="font-mono text-slate-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress === 100
                              ? 'bg-emerald-500'
                              : blockerCount > 0
                              ? 'bg-rose-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 마일스톤 및 QC 상태 요약 */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>마일스톤 완료율:</span>
                        <strong className="font-mono text-slate-800">
                          {promo.milestones.filter((m) => m.isCompleted).length} / {promo.milestones.length}단계
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>배너 소재 컨펌:</span>
                        <span className={promo.banner.isConfirmed ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                          {promo.banner.isConfirmed ? '✓ 컨펌 완료' : '대기 중'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>쿠폰 정책 QC:</span>
                        <span className="font-semibold text-slate-800">
                          {promo.allowCoupon ? '쿠폰 허용' : '쿠폰 제외(특가)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 하단 이동 버튼 */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => exportToExcel([promo], `${promo.id}_이벤트리포트`)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                      title="해당 이벤트 엑셀 다운로드"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>엑셀</span>
                    </button>

                    <button
                      onClick={() => setSelectedPromotionId(promo.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>QC 워크스페이스 열기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

