'use client';

import React, { useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { Brand, Promotion, EventType } from '@/types/promotion';
import { exportToExcel } from '@/utils/excelExporter';
import CalendarUploader from '@/components/CalendarUploader';
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
  Plus,
  Eye,
  EyeOff,
  HelpCircle,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AnnualScheduleViewProps {
  onNavigateToQc?: (promoId: string) => void;
}

export default function AnnualScheduleView({ onNavigateToQc }: AnnualScheduleViewProps) {
  const {
    promotions,
    selectedBrand,
    setSelectedBrand,
    setSelectedPromotionId,
  } = useOpsStore();

  // 1. 뷰 모드: [통합 뷰] -> [간트차트 뷰] -> [월별 카드 뷰] 순서 (기본값: BOTH)
  const [viewMode, setViewMode] = useState<'BOTH' | 'GANTT' | 'CARDS'>('BOTH');
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<'ALL' | EventType>('ALL');
  const [hideEndedEvents, setHideEndedEvents] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showCriteriaGuide, setShowCriteriaGuide] = useState(true);

  // 실무 기준 라이프사이클 카드 필터 (D-30 오픈 집중 준비 vs 실시간 라이브 vs 연간 편성 vs 마감 종료)
  const [activeLifecycleFilter, setActiveLifecycleFilter] = useState<
    'ALL' | 'ACTIVE_PREP' | 'RUNNING' | 'PLANNED' | 'ENDED'
  >('ALL');

  // 상단 카드 클릭 시 해당 행사 기간/타임라인으로 부드러운 스크롤 이동
  const handleCardClick = (type: 'ACTIVE_PREP' | 'RUNNING' | 'PLANNED' | 'ENDED') => {
    const next = activeLifecycleFilter === type ? 'ALL' : type;
    setActiveLifecycleFilter(next);
    setTimeout(() => {
      const section = document.getElementById('gantt-chart-section') || document.getElementById('cards-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // 뷰 모드(간트차트 뷰 / 월별 카드 뷰 / 통합 뷰) 전환 시 해당 영역으로 자동 부드러운 화면 이동
  const handleViewModeChange = (mode: 'BOTH' | 'GANTT' | 'CARDS') => {
    setViewMode(mode);
    setTimeout(() => {
      const targetId = mode === 'CARDS' ? 'cards-section' : 'gantt-chart-section';
      const el = document.getElementById(targetId) || document.getElementById('gantt-chart-section') || document.getElementById('cards-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 70);
  };

  // 분기 판정 헬퍼
  const getQuarter = (dateStr: string): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
    const month = parseInt(dateStr.slice(5, 7), 10);
    if (month >= 1 && month <= 3) return 'Q1';
    if (month >= 4 && month <= 6) return 'Q2';
    if (month >= 7 && month <= 9) return 'Q3';
    return 'Q4';
  };

  // 행사 기간, 오늘 진행 일차, 마감 D-Day 계산 헬퍼 (시연 기준일: 2026-10-15 고정 시뮬레이션)
  // 오픈 1달 전(D-30 이내)은 '실제 집중 준비 대상'으로 분류, 30일 초과는 '연간 기획 편성'으로 분리
  const getPromoTiming = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date('2026-10-15');

    // 총 행사 일수
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (end < today) {
      return {
        statusType: 'ENDED' as const,
        totalDays,
        badgeText: '행사 종료',
        subText: `${totalDays}일간 진행 완료 (${endDate.slice(5)} 마감)`,
        isEnded: true,
        isD30Active: false,
      };
    } else if (start <= today && today <= end) {
      const elapsedDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysLeft = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        statusType: 'RUNNING' as const,
        totalDays,
        elapsedDays,
        daysLeft,
        badgeText: `진행 ${elapsedDays}일차 (D-${daysLeft})`,
        subText: `총 ${totalDays}일 중 오늘 ${elapsedDays}일째 (마감까지 ${daysLeft}일 남음)`,
        isEnded: false,
        isD30Active: false,
      };
    } else {
      const daysUntil = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isD30Active = daysUntil <= 30;
      return {
        statusType: isD30Active ? ('UPCOMING_ACTIVE' as const) : ('UPCOMING_PLANNED' as const),
        totalDays,
        daysUntil,
        isD30Active,
        badgeText: isD30Active ? `오픈 D-${daysUntil}` : `D-${daysUntil} (편성)`,
        subText: isD30Active
          ? `오픈 1달 이내 집중 준비 (오픈까지 ${daysUntil}일)`
          : `연간 기획 편성 대기 (오픈까지 ${daysUntil}일)`,
        isEnded: false,
      };
    }
  };

  // 진행률 (완료 정도 %) 계산 헬퍼
  const calculateProgress = (promo: Promotion): number => {
    const timing = getPromoTiming(promo.startDate, promo.endDate);
    if (timing.isEnded || promo.status === 'READY_TO_PUBLISH') return 100;

    const completedMilestones = promo.milestones.filter((m) => m.isCompleted).length;
    const totalMilestones = promo.milestones.length || 5;

    let score = Math.round((completedMilestones / totalMilestones) * 70);
    const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
    if (promo.banner.isConfirmed) score += 15;
    if (promo.products.length > 0 && blockerCount === 0) score += 15;

    return Math.min(Math.max(score, 10), 95);
  };

  // 행사 성격 라벨 헬퍼
  const getEventTypeLabel = (type?: EventType) => {
    switch (type) {
      case 'SEASON_SALE':
        return { label: '🌸 시즌 정기 세일', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'LIVE_WEEK':
        return { label: '🔥 LIVE WEEK 특가', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'SPECIAL_EVENT':
        return { label: '🎁 시즌/명절 특별기획', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'BRAND_WEEK':
        return { label: '💼 브랜드 단독 위크', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: '일반 기획전', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // 필터링된 프로모션 목록 (라이프사이클 4단계 필터 포함)
  const filteredPromos = useMemo(() => {
    return promotions.filter((promo) => {
      const timing = getPromoTiming(promo.startDate, promo.endDate);

      // 종료된 행사 숨기기 토글
      if (hideEndedEvents && timing.isEnded) return false;

      // 상단 카드 클릭에 따른 라이프사이클 4단계 필터
      if (activeLifecycleFilter === 'ACTIVE_PREP' && timing.statusType !== 'UPCOMING_ACTIVE') return false;
      if (activeLifecycleFilter === 'RUNNING' && timing.statusType !== 'RUNNING') return false;
      if (activeLifecycleFilter === 'PLANNED' && timing.statusType !== 'UPCOMING_PLANNED') return false;
      if (activeLifecycleFilter === 'ENDED' && !timing.isEnded) return false;

      // 브랜드 필터
      if (selectedBrand !== 'ALL' && promo.brand !== selectedBrand) return false;

      // 분기 필터
      if (selectedQuarter !== 'ALL' && getQuarter(promo.startDate) !== selectedQuarter) return false;

      // 행사 성격 필터 (Event Type)
      if (selectedEventType !== 'ALL' && promo.eventType !== selectedEventType) return false;

      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [promotions, selectedBrand, selectedQuarter, selectedEventType, hideEndedEvents, activeLifecycleFilter]);

  // 브랜드별 통계
  const totalCount = promotions.length;
  const shesmissCount = promotions.filter((p) => p.brand === 'SHESMISS').length;
  const listCount = promotions.filter((p) => p.brand === 'LIST').length;
  const sistinaCount = promotions.filter((p) => p.brand === 'SISTINA').length;

  // 상태별 통계 (실무 기준 4단계 분리)
  const runningCount = promotions.filter((p) => getPromoTiming(p.startDate, p.endDate).statusType === 'RUNNING').length;
  const activePrepCount = promotions.filter((p) => getPromoTiming(p.startDate, p.endDate).statusType === 'UPCOMING_ACTIVE').length;
  const plannedCount = promotions.filter((p) => getPromoTiming(p.startDate, p.endDate).statusType === 'UPCOMING_PLANNED').length;
  const endedCount = promotions.filter((p) => getPromoTiming(p.startDate, p.endDate).isEnded).length;
  const blockerPromoCount = promotions.filter((p) => p.qcIssues.some((i) => i.severity === 'BLOCKER') && !getPromoTiming(p.startDate, p.endDate).isEnded).length;

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

  // 타임라인 좌표 계산 헬퍼 (1~12월 365일 비례 계산)
  const getTimelineCoordinates = (startDate: string, endDate: string) => {
    const sMonth = parseInt(startDate.slice(5, 7), 10) - 1;
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
      leftRatio: startRatio,
    };
  };

  // 현재 시점 (2026년 10월 15일 기준) 위치 퍼센트 (10월 중순: 79.0%)
  const currentTimelinePos = '79.0%';

  const handleSelectPromotion = (promoId: string) => {
    setSelectedPromotionId(promoId);
    if (onNavigateToQc) {
      onNavigateToQc(promoId);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 통계 카드 & 연간 로드맵 컨트롤러 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                2026 연간 프로모션 마스터 캘린더 & 간트차트 로드맵
              </h2>
              <span className="text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>📅 시연 기준일: <strong>2026.10.15</strong> (오픈 D-2 고정 시뮬레이션)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              인동FN 3대 브랜드(SHESMISS, LIST, SISTINA)의 1~12월 실제 일정 위치와 마일스톤 완료 진척도를 일치시켜 관리합니다.
            </p>
          </div>

          {/* 뷰 모드 토글: [통합 뷰] -> [간트차트 뷰] -> [월별 카드 뷰] 순서 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => handleViewModeChange('BOTH')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'BOTH' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
                title="간트차트와 월별 카드를 함께 보고 타임라인으로 이동"
              >
                통합 뷰
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('GANTT')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'GANTT' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
                title="간트차트 전용 뷰로 전환 및 해당 위치로 자동 스크롤"
              >
                📊 간트차트 뷰
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('CARDS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
                title="월별 카드 전용 뷰로 전환 및 해당 위치로 자동 스크롤"
              >
                📋 월별 카드 뷰
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowUploader(!showUploader)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                showUploader
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{showUploader ? '업로더 닫기' : '➕ 연간 행사 등록 (엑셀 업로드)'}</span>
            </button>

            <button
              onClick={() => exportToExcel(promotions, '2026_연간_프로모션_마스터_리포트')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>연간 엑셀 (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 연간 캘린더 엑셀 업로더 (통합 인라인) */}
        {showUploader && (
          <div className="pt-6 border-b border-slate-100 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CalendarUploader />
          </div>
        )}

        {/* 2. 브랜드 요약 바 & 실무 4단계 운영 라이프사이클 카드 (클릭 시 해당 기간 타임라인으로 부드럽게 이동) */}
        <div className="pt-6 space-y-4">
          {/* 브랜드별 등록 현황 & 인터랙션 안내 툴팁 바 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>🏷️</span>
                <span>연간 등록 기획전 <strong className="text-slate-900 font-mono">{totalCount}</strong>건</span>
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBrand(selectedBrand === 'SHESMISS' ? 'ALL' : 'SHESMISS')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    selectedBrand === 'SHESMISS'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  }`}
                  title="쉬즈미스 행사만 필터링"
                >
                  SHESMISS <span className="font-mono">{shesmissCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(selectedBrand === 'LIST' ? 'ALL' : 'LIST')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    selectedBrand === 'LIST'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                  title="리스트 행사만 필터링"
                >
                  LIST <span className="font-mono">{listCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(selectedBrand === 'SISTINA' ? 'ALL' : 'SISTINA')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    selectedBrand === 'SISTINA'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                  title="시스티나 행사만 필터링"
                >
                  SISTINA <span className="font-mono">{sistinaCount}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
              <span>💡</span>
              <span>아래 상태 카드를 클릭하면 해당 행사 기간 타임라인으로 바로 이동합니다.</span>
            </div>
          </div>

          {/* 4대 운영 라이프사이클 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 카드 1: 🔥 오픈 집중 준비 (D-30 이내) - 실무 최우선순위 */}
            <div
              onClick={() => handleCardClick('ACTIVE_PREP')}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                activeLifecycleFilter === 'ACTIVE_PREP'
                  ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/80 shadow-md -translate-y-0.5'
                  : 'bg-rose-50/40 border-rose-200 hover:border-rose-300 hover:shadow-xs hover:bg-rose-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  🔥 오픈 집중 준비 (D-30)
                </span>
                {blockerPromoCount > 0 ? (
                  <span className="text-[10px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-2xs">
                    결함 감지 {blockerPromoCount}개 행사
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full">
                    집중 검수
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-rose-900 font-mono">{activePrepCount}</span>
                <span className="text-xs text-rose-700 font-bold">개 행사</span>
                {activeLifecycleFilter === 'ACTIVE_PREP' && (
                  <span className="text-[10px] font-bold text-rose-600 bg-white px-1.5 py-0.2 rounded border border-rose-300 ml-auto">
                    ✓ 필터 적용 중
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-800/80 mt-2.5 pt-2.5 border-t border-rose-200/60 leading-tight">
                오픈 30일 이내 · 가격/배너/쿠폰 집중 QC 대상
              </p>
              <div className="mt-2 text-[10px] font-bold text-rose-600 group-hover:text-rose-700 flex items-center gap-1">
                <span>👉 3~4월 타임라인 바로가기</span>
              </div>
            </div>

            {/* 카드 2: 🟢 실시간 라이브 운영 중 */}
            <div
              onClick={() => handleCardClick('RUNNING')}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                activeLifecycleFilter === 'RUNNING'
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/80 shadow-md -translate-y-0.5'
                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:shadow-xs hover:bg-amber-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  실시간 라이브 운영
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded-full">
                  사이트 노출
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-amber-900 font-mono">{runningCount}</span>
                <span className="text-xs text-amber-700 font-bold">개 행사</span>
                {activeLifecycleFilter === 'RUNNING' && (
                  <span className="text-[10px] font-bold text-amber-700 bg-white px-1.5 py-0.2 rounded border border-amber-300 ml-auto">
                    ✓ 필터 적용 중
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800/80 mt-2.5 pt-2.5 border-t border-amber-200/60 leading-tight">
                시작일 ≤ 오늘 ≤ 종료일 · 현재 정상 판매 중
              </p>
              <div className="mt-2 text-[10px] font-bold text-amber-700 group-hover:text-amber-800 flex items-center gap-1">
                <span>👉 라이브 행사 타임라인 바로가기</span>
              </div>
            </div>

            {/* 카드 3: 📅 연간 기획 편성 (D-30 초과) */}
            <div
              onClick={() => handleCardClick('PLANNED')}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                activeLifecycleFilter === 'PLANNED'
                  ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500/80 shadow-md -translate-y-0.5'
                  : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 hover:shadow-xs hover:bg-indigo-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  연간 기획 편성 (D-30 초과)
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/90 px-1.5 py-0.2 rounded-full">
                  편성 대기
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-indigo-900 font-mono">{plannedCount}</span>
                <span className="text-xs text-indigo-700 font-bold">개 행사</span>
                {activeLifecycleFilter === 'PLANNED' && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.2 rounded border border-indigo-300 ml-auto">
                    ✓ 필터 적용 중
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-800/80 mt-2.5 pt-2.5 border-t border-indigo-200/60 leading-tight">
                5~12월 편성 대기 · 오픈 30일 전 집중 준비 자동 전환
              </p>
              <div className="mt-2 text-[10px] font-bold text-indigo-700 group-hover:text-indigo-800 flex items-center gap-1">
                <span>👉 5~12월 연간 로드맵 바로가기</span>
              </div>
            </div>

            {/* 카드 4: 🏁 게시 완료 & 행사 종료 */}
            <div
              onClick={() => handleCardClick('ENDED')}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                activeLifecycleFilter === 'ENDED'
                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/80 shadow-md -translate-y-0.5'
                  : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-xs hover:bg-emerald-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  게시 완료 & 행사 종료
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                  100% 마감
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-emerald-900 font-mono">{endedCount}</span>
                <span className="text-xs text-emerald-700 font-bold">개 행사</span>
                {activeLifecycleFilter === 'ENDED' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-300 ml-auto">
                    ✓ 필터 적용 중
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-2.5 pt-2.5 border-t border-emerald-200/60 leading-tight">
                종료일 &lt; 오늘 · 1~2월 정상 종료 및 정산/리뷰 이관
              </p>
              <div className="mt-2 text-[10px] font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
                <span>👉 1~2월 종료 행사 바로가기</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 행사 상태 판정 기준 및 마일스톤 운영 안내 (설명란) */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCriteriaGuide(!showCriteriaGuide)}>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>ℹ️ 프로모션 상태 판정 기준 및 운영 마일스톤 가이드</span>
              <span className="text-[11px] font-normal text-slate-500">(시연 기준일: 2026년 10월 15일 · 오픈 D-2 고정)</span>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600">
              {showCriteriaGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showCriteriaGuide && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200 text-[11px] leading-relaxed text-slate-600">
              <div className="p-2.5 bg-white rounded-lg border border-rose-200/70">
                <div className="font-bold text-rose-700 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  🔥 오픈 집중 준비 (D-30 이내)
                </div>
                <p className="text-slate-500">
                  <strong className="text-slate-700">오늘 &lt; 시작일 ≤ 30일</strong><br />
                  실무 작업이 착수되는 D-30 진입 행사입니다. MD 가격 승인, 배너 디자인 검수, 개발 링크 확인, 쿠폰 매트릭스 점검 등 집중 QC 대상입니다.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200/70">
                <div className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  🟢 실시간 라이브 운영 중
                </div>
                <p className="text-slate-500">
                  <strong className="text-slate-700">시작일 ≤ 오늘 ≤ 종료일</strong><br />
                  현재 IDF몰 공식몰 및 앱에 배너가 노출되고 할인가 및 쿠폰이 적용되어 고객 주문이 발생하는 실시간 모니터링 대상 행사입니다.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-indigo-200/70">
                <div className="font-bold text-indigo-700 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  📅 연간 기획 편성 (D-30 초과)
                </div>
                <p className="text-slate-500">
                  <strong className="text-slate-700">시작일 - 오늘 &gt; 30일 (편성 대기)</strong><br />
                  연간 캘린더에 일정만 편성된 사전 기획전으로, 불필요한 차트 혼잡을 방지하며 오픈 30일 전 도달 시 자동으로 집중 준비로 전환됩니다.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-emerald-200/70">
                <div className="font-bold text-emerald-700 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  🏁 게시 완료 & 행사 종료
                </div>
                <p className="text-slate-500">
                  <strong className="text-slate-700">종료일 &lt; 오늘 (진행률 100%)</strong><br />
                  행사 기간이 만료되어 정상 마감 처리된 프로모션입니다. 불필요한 차트 혼선을 방지하기 위해 '종료된 행사 숨기기' 필터가 제공됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. 필터 툴바 (브랜드 필터, 분기 필터, 행사 성격 필터, 종료 행사 숨기기) */}
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
                전체 브랜드 ({totalCount})
              </button>
              <button
                onClick={() => setSelectedBrand('SHESMISS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SHESMISS' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SHESMISS ({shesmissCount})
              </button>
              <button
                onClick={() => setSelectedBrand('LIST')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                LIST ({listCount})
              </button>
              <button
                onClick={() => setSelectedBrand('SISTINA')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedBrand === 'SISTINA' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                SISTINA ({sistinaCount})
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
                Q1 (1~3월)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q2')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q2' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Q2 (4~6월)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q3')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q3' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Q3 (7~9월)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q4')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedQuarter === 'Q4' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Q4 (10~12월)
              </button>
            </div>

            {/* 행사 성격 필터 (기존 중복되던 '100% 완료 상태' 제거 후 실무 맞춤 행사 성격 필터로 고도화) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-bold text-slate-600">
              <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> 성격:
              </span>
              <button
                type="button"
                onClick={() => setSelectedEventType('ALL')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  selectedEventType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('SEASON_SALE')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  selectedEventType === 'SEASON_SALE' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                🌸 시즌 정기
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('LIVE_WEEK')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  selectedEventType === 'LIVE_WEEK' ? 'bg-white text-rose-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                🔥 LIVE 특가
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('SPECIAL_EVENT')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  selectedEventType === 'SPECIAL_EVENT' ? 'bg-white text-amber-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                🎁 특별 기획
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('BRAND_WEEK')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  selectedEventType === 'BRAND_WEEK' ? 'bg-white text-indigo-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                💼 브랜드 위크
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* 종료된 행사 숨기기 토글 필터 */}
            <button
              type="button"
              onClick={() => setHideEndedEvents(!hideEndedEvents)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                hideEndedEvents
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {hideEndedEvents ? (
                <EyeOff className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{hideEndedEvents ? '종료 행사 숨김 적용 중' : '종료된 행사 숨기기'}</span>
              <span className="text-[10px] opacity-75 font-mono">({endedCount}건)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. 실제 일정 연동 정밀 간트차트 뷰 (글자 잘림 현상 완벽 해결 & 클릭 시 QC 워크스페이스 연동) */}
      {(viewMode === 'GANTT' || viewMode === 'BOTH') && (
        <div id="gantt-chart-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 overflow-hidden scroll-mt-28">
          {/* 상단 카드 필터 적용 시 안내 배너 */}
          {activeLifecycleFilter !== 'ALL' && (
            <div className="mb-5 p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {activeLifecycleFilter === 'ACTIVE_PREP' && '🔥'}
                  {activeLifecycleFilter === 'RUNNING' && '🟢'}
                  {activeLifecycleFilter === 'PLANNED' && '📅'}
                  {activeLifecycleFilter === 'ENDED' && '🏁'}
                </span>
                <div>
                  <span className="font-bold text-indigo-950">
                    {activeLifecycleFilter === 'ACTIVE_PREP' && '오픈 집중 준비 (D-30 이내) 행사만 필터링되어 타임라인에 표시 중입니다.'}
                    {activeLifecycleFilter === 'RUNNING' && '실시간 라이브 운영 중인 행사만 타임라인에 표시 중입니다.'}
                    {activeLifecycleFilter === 'PLANNED' && '연간 기획 편성 (D-30 초과) 대기 행사만 타임라인에 표시 중입니다.'}
                    {activeLifecycleFilter === 'ENDED' && '게시 완료 및 행사 종료된 프로모션만 표시 중입니다.'}
                  </span>
                  <span className="text-indigo-600 font-semibold font-mono ml-1.5">
                    ({filteredPromos.length}건)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLifecycleFilter('ALL')}
                className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>전체 연간 로드맵 보기</span>
                <span className="text-indigo-400 font-normal">✕</span>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>📊</span>
                <span>2026 연간 타임라인 간트 차트 (행사 기간·진행 일차·마감 D-Day 실시간 연동)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                행사명을 막대기 바깥 트랙에 명확히 표기하여 텍스트 잘림 없이 확인 가능하며, 행사를 클릭하면 해당 행사의 사전 QC 워크스페이스로 즉시 연결됩니다.
              </p>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 animate-pulse"></span>
                🔥 D-30 집중준비
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                📅 D-30 초과(편성)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                완료/승인(100%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span>
                행사 종료
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                시연 기준일 (10월 15일)
              </span>
            </div>
          </div>

          {/* 간트 차트 컨테이너 (가로 스크롤 가능) */}
          <div className="overflow-x-auto">
            <div className="min-w-[1020px]">
              {/* 헤더: 좌측 프로모션 정보 열 + 우측 12개월 캘린더 그리드 */}
              <div className="flex items-end border-b border-slate-300 pb-3 font-bold text-xs">
                <div className="w-80 shrink-0 pr-4 text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>프로모션 / 기간(일수) / 마감 현황</span>
                  <span className="text-[10px] text-slate-400 font-normal">행사 성격</span>
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
                    <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs whitespace-nowrap">
                      시연 기준일 (10/15 · D-2)
                    </span>
                    <span className="w-1.5 h-1.5 bg-rose-500 rotate-45 -mt-0.5"></span>
                  </div>
                </div>
              </div>

              {/* 간트 차트 행 목록 */}
              <div className="divide-y divide-slate-100 relative">
                {/* 12개월 타임라인 배경 그리드 및 오늘 기준선 (전체 행 관통) */}
                <div className="absolute inset-0 left-80 pointer-events-none grid grid-cols-12 z-0">
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

                {filteredPromos.map((promo, index) => {
                  const timing = getPromoTiming(promo.startDate, promo.endDate);
                  const progress = calculateProgress(promo);
                  const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
                  const isCompleted = promo.status === 'READY_TO_PUBLISH';
                  const coords = getTimelineCoordinates(promo.startDate, promo.endDate);
                  const eventTypeInfo = getEventTypeLabel(promo.eventType);

                  // 텍스트를 막대 우측에 둘지 좌측에 둘지 결정 (연말 행사는 좌측으로 배치하여 잘림 방지)
                  const isLateYear = coords.leftRatio > 0.65;

                  // 섹션 구분 판정 (종료 행사 vs D-30 집중 준비 구간 vs D-30 초과 연간 편성 구간)
                  const prevTiming = index > 0 ? getPromoTiming(filteredPromos[index - 1].startDate, filteredPromos[index - 1].endDate) : null;
                  const nextTiming = index < filteredPromos.length - 1 ? getPromoTiming(filteredPromos[index + 1].startDate, filteredPromos[index + 1].endDate) : null;

                  const isFirstActivePrep = timing.statusType === 'UPCOMING_ACTIVE' && (!prevTiming || prevTiming.statusType !== 'UPCOMING_ACTIVE');
                  const isLastActivePrep = timing.statusType === 'UPCOMING_ACTIVE' && (!nextTiming || nextTiming.statusType !== 'UPCOMING_ACTIVE');
                  const isFirstPlanned = timing.statusType === 'UPCOMING_PLANNED' && (!prevTiming || prevTiming.statusType !== 'UPCOMING_PLANNED');

                  return (
                    <React.Fragment key={promo.id}>
                      {/* 1. 🔥 D-30 집중 준비 구간 시작 강조 배너 (강렬한 시각적 박스 헤더) */}
                      {isFirstActivePrep && (
                        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white px-4 py-2.5 my-2 flex items-center justify-between z-20 relative rounded-xl shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                            <span className="font-black text-white flex items-center gap-1.5 text-xs sm:text-sm tracking-tight">
                              🔥 오픈 집중 준비 구간 (D-30 이내) — 실무 최우선 조치 대상 ({activePrepCount}건)
                            </span>
                            <span className="bg-white/20 text-white font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-xs">
                              우선 점검 대상
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-rose-100 hidden lg:inline">
                            시작일 30일 전 도달 · MD 가격/할인율 확정 · 배너 검수 · 쿠폰 매트릭스 사전 검증 필수
                          </span>
                        </div>
                      )}

                      {/* 2. 📅 5~12월 연간 기획 편성 구간 시작 구분 헤더 */}
                      {isFirstPlanned && (
                        <div className="bg-slate-100/90 border-y border-slate-200/90 px-4 py-2 my-2 flex items-center justify-between text-xs z-20 relative rounded-l-xl text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              📅 연간 기획 편성 (D-30 초과) — 5~12월 스케줄 사전 편성
                            </span>
                            <span className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {plannedCount}건
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 hidden lg:inline">
                            연간 캘린더 편성 대기 상태이며, 오픈 30일 전 도달 시 자동으로 위 집중 준비 구간으로 전환됩니다.
                          </span>
                        </div>
                      )}

                      {/* 간트 차트 행 (D-30 집중 준비 행은 로즈 틴트 박스 + 볼드 강조 스타일링) */}
                      <div
                        onClick={() => handleSelectPromotion(promo.id)}
                        className={`flex items-center py-3.5 transition-all group cursor-pointer relative z-10 ${
                          timing.statusType === 'UPCOMING_ACTIVE'
                            ? `bg-rose-50/70 hover:bg-rose-100/80 border-l-4 border-l-rose-500 border-r-2 border-r-rose-400 pl-3 pr-2 ${
                                isFirstActivePrep ? 'border-t-2 border-t-rose-400 rounded-t-xl' : ''
                              } ${
                                isLastActivePrep ? 'border-b-2 border-b-rose-400 rounded-b-xl shadow-xs' : ''
                              }`
                            : timing.isEnded
                            ? 'opacity-70 bg-slate-50/40 hover:bg-slate-100/60 border-l-4 border-transparent pl-3'
                            : 'hover:bg-slate-50/90 border-l-4 border-transparent pl-3'
                        }`}
                        title="클릭 시 해당 행사의 사전 QC 워크스페이스로 이동합니다"
                      >
                        {/* 좌측 정보 컬럼 (너비 320px) */}
                        <div className="w-80 shrink-0 pr-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
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

                            {/* 행사 총 일수 뱃지 */}
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              총 {timing.totalDays}일간
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4
                              className={`text-xs font-bold truncate ${
                                timing.statusType === 'UPCOMING_ACTIVE'
                                  ? 'text-rose-950 font-black group-hover:text-rose-600'
                                  : 'text-slate-900 group-hover:text-indigo-600'
                              }`}
                            >
                              {promo.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                            {/* 행사 성격 태그 */}
                            <span className={`px-1.5 py-0.2 rounded border font-semibold ${eventTypeInfo.color}`}>
                              {eventTypeInfo.label}
                            </span>

                            {/* 오늘 기준 상태 태그 */}
                            {timing.isEnded ? (
                              <span className="bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                                ✓ 행사 종료
                              </span>
                            ) : timing.statusType === 'RUNNING' ? (
                              <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3 text-amber-600" />
                                진행 {timing.elapsedDays}일차 (D-{timing.daysLeft})
                              </span>
                            ) : timing.isD30Active ? (
                              <span className="bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                🔥 오픈 D-{timing.daysUntil} (집중준비)
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 font-medium px-1.5 py-0.2 rounded">
                                D-{timing.daysUntil} (편성)
                              </span>
                            )}

                            {blockerCount > 0 && !timing.isEnded ? (
                              <span
                                className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 text-[11px]"
                                title={`단품 결함 3종 (복합 결함 포함) + 배너 결함 1건 = 부서별 총 ${blockerCount}건 조치 대상`}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>결함 {blockerCount}건 <span className="font-normal text-rose-600 text-[10px]">(단품 3종 · 배너 1건)</span></span>
                              </span>
                            ) : null}

                            <span className="text-slate-400 font-mono">
                              {promo.targetDiscountRate}% / {promo.allowCoupon ? '쿠폰O' : '쿠폰X'}
                            </span>
                          </div>
                        </div>

                        {/* 우측 간트 트랙 & 날짜 비례 바 (글자 잘림 현상 완벽 해결) */}
                        <div className="flex-1 relative h-10 flex items-center">
                          {/* 간트 바 (최소 너비 56px 확보 + 콤팩트 상태 뱃지만 내부에 배치) */}
                          <div
                            className={`absolute h-8 rounded-lg shadow-xs transition-all duration-300 group-hover:shadow-md flex items-center justify-center px-2 border cursor-pointer ${
                              timing.isEnded ? 'grayscale-[35%]' : ''
                            } ${timing.isD30Active ? 'ring-2 ring-rose-400/80 shadow-sm' : ''}`}
                            style={{
                              left: coords.left,
                              width: coords.width,
                              minWidth: '56px',
                              backgroundColor: timing.isEnded
                                ? '#f1f5f9'
                                : isCompleted
                                ? '#ecfdf5'
                                : blockerCount > 0
                                ? '#fff1f2'
                                : timing.statusType === 'RUNNING'
                                ? '#fff7ed'
                                : timing.isD30Active
                                ? '#ffe4e6'
                                : '#f8fafc',
                              borderColor: timing.isEnded
                                ? '#cbd5e1'
                                : isCompleted
                                ? '#a7f3d0'
                                : blockerCount > 0
                                ? '#fecdd3'
                                : timing.statusType === 'RUNNING'
                                ? '#fdba74'
                                : timing.isD30Active
                                ? '#f43f5e'
                                : '#e2e8f0',
                            }}
                            title={`${promo.title} (${promo.startDate} ~ ${promo.endDate}) - 클릭하여 QC 열기`}
                          >
                            {/* 내부 진행률 충전 게이지 (Progress fill bar) */}
                            <div
                              className={`absolute left-0 top-0 bottom-0 opacity-25 rounded-l-lg transition-all duration-500 ${
                                timing.isEnded
                                  ? 'bg-slate-500'
                                  : isCompleted
                                  ? 'bg-emerald-600'
                                  : blockerCount > 0
                                  ? 'bg-rose-600'
                                  : timing.statusType === 'RUNNING'
                                  ? 'bg-amber-600'
                                  : timing.isD30Active
                                  ? 'bg-rose-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />

                            {/* 바 내부에는 핵심 상태 뱃지만 간결하게 표기 */}
                            <div className="relative z-10 flex items-center justify-center gap-1 text-[10px] font-bold font-mono">
                              {timing.isEnded ? (
                                <span className="text-slate-600">✓ 종료</span>
                              ) : timing.statusType === 'RUNNING' ? (
                                <span className="text-amber-800 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                                  {timing.elapsedDays}일차
                                </span>
                              ) : blockerCount > 0 ? (
                                <span className="text-rose-700">🚨 {blockerCount}건</span>
                              ) : timing.isD30Active ? (
                                <span className="text-rose-800 font-extrabold flex items-center gap-0.5">
                                  🔥 D-{timing.daysUntil}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium">D-{timing.daysUntil}</span>
                              )}
                            </div>

                            {/* 중요: 막대기 외부 트랙에 행사 전체 제목과 총 일수를 잘림 없이 명확하게 배치 */}
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none whitespace-nowrap z-20 ${
                                isLateYear
                                  ? 'right-[calc(100%+8px)] text-right'
                                  : 'left-[calc(100%+8px)] text-left'
                              }`}
                            >
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded shadow-2xs border flex items-center gap-1 ${
                                  timing.isD30Active
                                    ? 'bg-white text-rose-950 font-black border-rose-300 ring-1 ring-rose-200'
                                    : 'bg-white/95 text-slate-800 border-slate-200/60'
                                }`}
                              >
                                <span>{promo.title}</span>
                                <span
                                  className={`text-[10px] font-mono ${
                                    timing.isD30Active ? 'text-rose-600 font-bold' : 'text-slate-500 font-normal'
                                  }`}
                                >
                                  ({timing.totalDays}일간)
                                </span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold hidden md:inline">
                                {promo.startDate.slice(5)}~{promo.endDate.slice(5)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* D-30 구간 마감 선 */}
                      {isLastActivePrep && (
                        <div className="border-b-2 border-dashed border-rose-300 my-0.5 opacity-80" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 12개월 월별 카드 그리드 뷰 (12-Month Card Grid) */}
      {(viewMode === 'CARDS' || viewMode === 'BOTH') && (
        <div id="cards-section" className="space-y-4 scroll-mt-28">
          {/* 간트차트 숨김 모드(CARDS 단독)일 때도 필터 배너 표시 */}
          {viewMode === 'CARDS' && activeLifecycleFilter !== 'ALL' && (
            <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {activeLifecycleFilter === 'ACTIVE_PREP' && '🔥'}
                  {activeLifecycleFilter === 'RUNNING' && '🟢'}
                  {activeLifecycleFilter === 'PLANNED' && '📅'}
                  {activeLifecycleFilter === 'ENDED' && '🏁'}
                </span>
                <div>
                  <span className="font-bold text-indigo-950">
                    {activeLifecycleFilter === 'ACTIVE_PREP' && '오픈 집중 준비 (D-30 이내) 행사만 필터링되어 표시 중입니다.'}
                    {activeLifecycleFilter === 'RUNNING' && '실시간 라이브 운영 중인 행사만 표시 중입니다.'}
                    {activeLifecycleFilter === 'PLANNED' && '연간 기획 편성 (D-30 초과) 대기 행사만 표시 중입니다.'}
                    {activeLifecycleFilter === 'ENDED' && '게시 완료 및 행사 종료된 프로모션만 표시 중입니다.'}
                  </span>
                  <span className="text-indigo-600 font-semibold font-mono ml-1.5">
                    ({filteredPromos.length}건)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLifecycleFilter('ALL')}
                className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>전체 연간 로드맵 보기</span>
                <span className="text-indigo-400 font-normal">✕</span>
              </button>
            </div>
          )}

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
              const timing = getPromoTiming(promo.startDate, promo.endDate);
              const progress = calculateProgress(promo);
              const blockerCount = promo.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
              const eventTypeInfo = getEventTypeLabel(promo.eventType);

              return (
                <div
                  key={promo.id}
                  onClick={() => handleSelectPromotion(promo.id)}
                  className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                    timing.isEnded
                      ? 'border-slate-200 opacity-80 hover:border-slate-300'
                      : timing.isD30Active
                      ? 'border-2 border-rose-400 ring-2 ring-rose-200/60 shadow-md hover:border-rose-500 hover:shadow-xl bg-gradient-to-b from-rose-50/40 via-white to-white'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* D-30 이내 강조 상단 리본 */}
                  {timing.isD30Active && (
                    <div className="-mt-5 -mx-5 mb-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-black tracking-tight shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <span>🔥 오픈 집중 준비 (D-30 이내)</span>
                      </div>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono text-[10px]">
                        D-{timing.daysUntil} 우선 검수
                      </span>
                    </div>
                  )}

                  <div>
                    {/* 상단 뱃지 바 */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${eventTypeInfo.color}`}>
                          {eventTypeInfo.label}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          총 {timing.totalDays}일간
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          timing.isEnded
                            ? 'bg-slate-200 text-slate-700'
                            : timing.statusType === 'RUNNING'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : timing.isD30Active
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {timing.isD30Active ? `🔥 ${timing.badgeText}` : timing.badgeText}
                      </span>
                    </div>

                    {/* 타이틀 & 행사 일정 */}
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                      {promo.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      {promo.startDate} ~ {promo.endDate} ({timing.totalDays}일간)
                    </p>

                    {/* 이벤트 완료 정도 프로그레스 바 */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>마일스톤 진행률</span>
                        <span className="font-mono text-slate-900">{timing.isEnded ? '100% (행사 종료)' : `${progress}%`}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            timing.isEnded
                              ? 'bg-slate-500'
                              : progress === 100
                              ? 'bg-emerald-500'
                              : blockerCount > 0
                              ? 'bg-rose-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${timing.isEnded ? 100 : progress}%` }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToExcel([promo], `${promo.id}_이벤트리포트`);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                      title="해당 이벤트 엑셀 다운로드"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>엑셀</span>
                    </button>

                    <button
                      onClick={() => handleSelectPromotion(promo.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        timing.isD30Active
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
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
