'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import MatrixFilterBar from '@/components/MatrixFilterBar';
import PromotionCalendarView from '@/components/PromotionCalendarView';
import BannerStudio from '@/components/BannerStudio';
import QcWorkspace from '@/components/QcWorkspace';
import MobileLivePreview from '@/components/MobileLivePreview';
import EmailDraftModal from '@/components/EmailDraftModal';
import SlackSettingsModal from '@/components/SlackSettingsModal';
import AnnualScheduleView from '@/components/AnnualScheduleView';
import SkuMasterQcView from '@/components/SkuMasterQcView';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Sparkles,
  Calendar,
  LayoutDashboard,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';

export default function Home() {
  const {
    promotions,
    emailDrafts,
    selectedPromotionId,
    setSelectedPromotionId,
    resetToDefault,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const [showDemoToast, setShowDemoToast] = useState(false);

  const handleLoadDemo = () => {
    resetToDefault();
    setSelectedPromotionId('promo-list-trench-2026');
    setShowDemoToast(true);
  };

  // 기능별 그룹화: 3단계 이커머스 운영 파이프라인
  // 1. 프로모션 기획 & 연간 로드맵
  // 2. 정합성 통합 검증 (QC 센터) - [서브탭 1: 기획전·부서별 사전 QC / 서브탭 2: 단품(SKU) 마스터 전수 QC]
  // 3. 최종 전시 프리뷰 & 배너 검수
  const [activeTab, setActiveTab] = useState<'ANNUAL_GANTT' | 'QC_CENTER' | 'LIVE_PREVIEW'>('ANNUAL_GANTT');
  const [qcSubTab, setQcSubTab] = useState<'CAMPAIGN_QC' | 'SKU_MASTER_QC'>('CAMPAIGN_QC');

  const activeDraftCount = emailDrafts.filter((d) => d.status === 'DRAFT').length;
  const selectedPromo = promotions.find((p) => p.id === selectedPromotionId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onLoadDemo={handleLoadDemo}
        onOpenDrafts={() => setIsDraftModalOpen(true)}
        draftCount={activeDraftCount}
      />

      {/* 데모 시나리오 로드 완료 토스트 팝업 (Floating Toast) */}
      {showDemoToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/60 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>시연 시나리오 로드 완료</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                    READY
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowDemoToast(false)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                  title="닫기"
                  aria-label="시연 시나리오 안내 닫기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                <strong>[LIST] 26FW 트렌치 & 캐시미어 코트전</strong> 사전 QC 데이터가 정상 세팅되었습니다.
              </p>
              <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 bg-slate-800/80 p-2.5 rounded-lg font-mono border border-slate-700/60">
                <div className="text-rose-400 font-bold">• 단품 결함: 계산 불일치(30%≠40%), 404 URL, 미승인 품번</div>
                <div className="text-amber-400 font-bold">• 배너 결함: PC 메인 배너 권장 규격(1920x600) 미달</div>
                <div className="text-indigo-300 font-bold">• 협업 자동화: 다부서 2분할 듀얼 메일 4건 생성</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('QC_CENTER');
                    setQcSubTab('CAMPAIGN_QC');
                    setShowDemoToast(false);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>STEP 02 QC 센터에서 검수하기</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowDemoToast(false)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 0. 포트폴리오 프로젝트 소개 & 기획자 브리핑 배너 (Collapsible) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[11px] font-black tracking-wider uppercase text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded">
                  PORTFOLIO BRIEFING
                </span>
                <span className="text-xs font-bold text-slate-200 truncate">
                  E-Biz 자사몰 프로모션 운영 기획 · 1인 단독 프로젝트 (기획 100% · UI/UX 100% · 로직 100%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  handleLoadDemo();
                  setActiveTab('QC_CENTER');
                  setQcSubTab('CAMPAIGN_QC');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>🚀 시연 시나리오 즉시 시작</span>
              </button>

              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              >
                <span>{isIntroExpanded ? '소개 접기' : '프로젝트 소개 펼치기'}</span>
                {isIntroExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {isIntroExpanded && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
              {/* 프로젝트 헤드라인 */}
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>패션 자사몰 프로모션 운영의 누락과 오픈 오류를 줄이기 위한 E-Biz 운영 보드</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
                  인동FN(SHESMISS, LIST, SISTINA) 패션 자사몰의 연간 프로모션 오픈 과정에서 발생하는 <strong>수기 엑셀 계산 착오(역마진)·404 링크 깨짐·배너 규격 불일치·소통 지연</strong>을 사전에 원천 차단하기 위해, 6대 결정론적 룰 엔진과 다부서 듀얼 이메일 자동화 시스템을 1인 단독으로 기획·설계·구현한 프로덕트입니다.
                </p>
              </div>

              {/* 4대 핵심 요약 카드 그리드 (문제, 해결, 역할, 성과) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. 문제 정의 */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>1. 해결한 문제 (Problem)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    오픈 직전 엑셀 수기 취합 시 할인율 오기입으로 인한 역마진, 테스트 URL 잔존(404), 배너 해상도 미달 및 부서 간(기획MD·웹디자인·전산·마케팅) 메신저 누락 문제 해결
                  </p>
                </div>

                {/* 2. 해결 방식 */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span>2. 해결 방식 (Solution)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    6대 결정론적 룰 엔진(코드 100%)으로 업로드 즉시 단품 전수 검증, 단일 품번 다부서 복합 결함 2분할 듀얼 메일 자동 발송, 실시간 모바일/PC 크로스 뷰어
                  </p>
                </div>

                {/* 3. 본인 역할 */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>3. 담당 역할 (Role & Contrib)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    <strong>1인 단독 기획·설계·개발 (기여도 100%)</strong><br />
                    패션 이커머스 실무 워크플로우 정의, UI/UX 설계, Next.js 풀스택 프로토타입 구현 및 실시간 슬랙 웹훅 연동
                  </p>
                </div>

                {/* 4. 개선 성과 */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>4. 개선 성과 (Impact)</span>
                    </div>
                    <span className="text-[9px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-bold">
                      시연 데이터 기준
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    사전 검수 소요시간 <strong>91% 단축</strong> (기존 120분 ➔ 10분), 오픈 당일 크리티컬 결함 <strong>0건 달성</strong>, 다부서 커뮤니케이션 리드타임 50% 단축
                    <span className="block mt-1 text-[10px] text-emerald-300/80">※ 시연 시나리오 데이터 측정 기준</span>
                  </p>
                </div>
              </div>

              {/* 하단 기술 스택 및 시연 가이드라인 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-semibold">사용한 기술:</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">Next.js 15 (App Router)</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">TypeScript</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">Tailwind CSS</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">Zustand</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">SheetJS(XLSX)</span>
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">Slack Webhook</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-amber-300 font-medium">추천 시연 순서:</span>
                  <span className="text-white font-bold">STEP 01 (간트) ➔ STEP 02 (QC 센터) ➔ STEP 03 (전시 프리뷰)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상단 3단계 운영 파이프라인 메인 네비게이션 (시인성 극대화 워크플로우 탭) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-14 z-20 shadow-xs py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* 좌측 안내 라벨 (사용자 가이드용) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0 pr-2 border-r border-slate-200">
              <span className="text-[11px] font-black tracking-wider uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                운영 파이프라인
              </span>
              <span className="text-[11px] text-slate-500 font-medium">3단계 업무 이동</span>
            </div>

            {/* 3단계 인터랙티브 스텝 탭 컨테이너 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
              {/* STEP 1: 프로모션 기획 & 연간 로드맵 */}
              <button
                type="button"
                onClick={() => setActiveTab('ANNUAL_GANTT')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                  activeTab === 'ANNUAL_GANTT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'ANNUAL_GANTT'
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded ${
                          activeTab === 'ANNUAL_GANTT'
                            ? 'bg-white/20 text-white font-extrabold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        STEP 01
                      </span>
                      {activeTab === 'ANNUAL_GANTT' && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                          현재 화면
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'ANNUAL_GANTT' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      프로모션 기획 & 연간 로드맵
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'ANNUAL_GANTT' ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      2026 연간 캘린더 · 간트 일정
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'ANNUAL_GANTT' ? 'text-white/70' : 'text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5'
                }`} />
              </button>

              {/* STEP 2: 정합성 통합 검증 (QC 센터) */}
              <button
                type="button"
                onClick={() => setActiveTab('QC_CENTER')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                  activeTab === 'QC_CENTER'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'QC_CENTER'
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded ${
                          activeTab === 'QC_CENTER'
                            ? 'bg-white/20 text-white font-extrabold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        STEP 02
                      </span>
                      {activeTab === 'QC_CENTER' ? (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                          현재 화면
                        </span>
                      ) : (
                        <span className="text-[9px] bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.2 rounded border border-rose-200">
                          QC 통합
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'QC_CENTER' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      정합성 통합 검증 (QC 센터)
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'QC_CENTER' ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      기획전 마일스톤 + 단품 SKU 전수
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'QC_CENTER' ? 'text-white/70' : 'text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5'
                }`} />
              </button>

              {/* STEP 3: 최종 전시 프리뷰 & 배너 검수 */}
              <button
                type="button"
                onClick={() => setActiveTab('LIVE_PREVIEW')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                  activeTab === 'LIVE_PREVIEW'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'LIVE_PREVIEW'
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded ${
                          activeTab === 'LIVE_PREVIEW'
                            ? 'bg-white/20 text-white font-extrabold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        STEP 03
                      </span>
                      {activeTab === 'LIVE_PREVIEW' && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                          현재 화면
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'LIVE_PREVIEW' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      최종 전시 프리뷰 & 배너 검수
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'LIVE_PREVIEW' ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      모바일/PC 실시간 자사몰 화면
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'LIVE_PREVIEW' ? 'text-white/70' : 'text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* STEP 1: 2026 연간 프로모션 간트 로드맵 & 캘린더 */}
        {activeTab === 'ANNUAL_GANTT' && (
          <AnnualScheduleView
            onNavigateToQc={(promoId) => {
              setSelectedPromotionId(promoId);
              setActiveTab('QC_CENTER');
              setQcSubTab('CAMPAIGN_QC');
            }}
          />
        )}

        {/* STEP 2: 정합성 통합 검증 (QC 센터) */}
        {activeTab === 'QC_CENTER' && (
          <div className="space-y-6">
            {/* QC 센터 통합 브리핑 배너 */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    E-BIZ 프로모션 & SKU 마스터 사전 검증 엔진
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    정합성 통합 검증 (QC 센터)
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    기획전 전체 마일스톤 및 다부서(기획MD·웹디자인·전산·마케팅) 협업 조치부터 단품(SKU) 품번 전수 검사(엑셀 업로드, 80% 이상치 감지, 404 이미지)까지 한 화면에서 검증합니다.
                  </p>
                </div>

                {activeDraftCount > 0 && (
                  <button
                    onClick={() => setIsDraftModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    <span>🔔 검토 대기 발송건 {activeDraftCount}건 확인하기</span>
                  </button>
                )}
              </div>
            </div>

            {/* QC 센터 서브탭 세그먼트 컨트롤러 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                {/* 서브탭 1: 기획전·부서별 사전 QC */}
                <button
                  onClick={() => setQcSubTab('CAMPAIGN_QC')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    qcSubTab === 'CAMPAIGN_QC'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>1. 기획전·부서별 사전 QC</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      qcSubTab === 'CAMPAIGN_QC'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    마일스톤 & 듀얼메일
                  </span>
                </button>

                {/* 서브탭 2: 단품(SKU) 마스터 전수 QC */}
                <button
                  onClick={() => setQcSubTab('SKU_MASTER_QC')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    qcSubTab === 'SKU_MASTER_QC'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>2. 단품(SKU) 마스터 전수 QC</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      qcSubTab === 'SKU_MASTER_QC'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    엑셀업로드 · 80%이상치 · 404
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex-wrap">
                <span className="font-bold text-slate-500 shrink-0">선택된 기획전:</span>
                {selectedPromo ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        selectedPromo.brand === 'SHESMISS'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedPromo.brand === 'LIST'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedPromo.brand}
                    </span>
                    <span className="font-black text-slate-900 truncate max-w-[240px] sm:max-w-[360px]">
                      {selectedPromo.title}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                      ID: {selectedPromo.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
                      ({selectedPromo.startDate} ~ {selectedPromo.endDate})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 font-mono">선택된 기획전 없음 (전체)</span>
                )}
              </div>
            </div>

            {/* 서브탭 1 본문: 기획전·부서별 사전 QC */}
            {qcSubTab === 'CAMPAIGN_QC' && (
              <div className="space-y-6">
                {selectedPromotionId && (
                  <QcWorkspace
                    promotionId={selectedPromotionId}
                    onNavigateToSkuQc={() => setQcSubTab('SKU_MASTER_QC')}
                  />
                )}
                <MatrixFilterBar />
                <PromotionCalendarView />
              </div>
            )}

            {/* 서브탭 2 본문: 단품(SKU) 마스터 전수 QC */}
            {qcSubTab === 'SKU_MASTER_QC' && (
              <SkuMasterQcView
                onOpenDualDraftModal={() => {
                  setSelectedDraftId('draft-multi-dept-md');
                  setIsDraftModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* STEP 3: IDF몰 앱/웹 멀티 디바이스 라이브 프리뷰 & 배너 검수 */}
        {activeTab === 'LIVE_PREVIEW' && (
          <div className="space-y-6">
            {/* STEP 3 선택된 기획전 동기화 안내 바 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>STEP 03 프리뷰 연동 기획전:</span>
                </span>
                {selectedPromo ? (
                  <>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        selectedPromo.brand === 'SHESMISS'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedPromo.brand === 'LIST'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedPromo.brand}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {selectedPromo.title}
                    </span>
                    <span className="bg-slate-100 font-mono text-[11px] text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
                      {selectedPromo.products.length}종 상품 편성
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>STEP 01·02와 100% 데이터 동기화됨</span>
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">선택된 기획전이 없습니다.</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('QC_CENTER');
                  setQcSubTab('CAMPAIGN_QC');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>STEP 02 QC 센터 결과 확인하기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {selectedPromotionId && (
              <>
                <BannerStudio promotionId={selectedPromotionId} />
                <MobileLivePreview promotionId={selectedPromotionId} />
              </>
            )}
          </div>
        )}
      </main>

      {/* 메일 임시보관함 모달 (Human-in-the-Loop 검토 & 다부서 2분할 듀얼 뷰) */}
      <EmailDraftModal />

      {/* 실제 Slack 실시간 연동 및 테스트 모달 */}
      <SlackSettingsModal />

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-700">
          IDF E-Biz 운영 보드 — 인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검
        </p>
        <p className="text-[11px] text-slate-400 max-w-2xl mx-auto px-4 leading-relaxed">
          ※ <strong>Data Compliance Note:</strong> 본 프로토타입에 수록된 행사 기획, 상품 단가, 임직원 성명 및 이메일(@indongfn.co.kr)은 포트폴리오 시연 목적으로 구성된 <strong>가상 데이터(Mock Data)</strong>입니다.
        </p>
      </footer>
    </div>
  );
}
