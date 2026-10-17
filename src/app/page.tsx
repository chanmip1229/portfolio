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
  Flame,
  Layers,
} from 'lucide-react';
import { getPromotionLifecycle } from '@/types/promotion';

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
  const [isPromoDropdownOpen, setIsPromoDropdownOpen] = useState(false);

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
                <div className="text-indigo-300 font-bold">• 협업 자동화: 부서별(MD·디자인) 맞춤 요청 메일 4건 생성</div>
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

      {/* 0. 포트폴리오 프로젝트 소개 & 기획자 브리핑 배너 (밝고 우아한 인동FN 톤앤매너 & 높은 가독성) */}
      <div className="bg-[#FAF9F5] text-[#111111] border-b border-[#E8E4DA] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#B69F76] animate-pulse shrink-0"></span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[10px] sm:text-[11px] font-brand font-bold tracking-widest uppercase text-[#8C6D3B] bg-[#F0EBE1] border border-[#DDD5C5] px-2 py-0.5 rounded-sm">
                  PORTFOLIO BRIEFING
                </span>
                <span className="text-xs font-bold text-zinc-700 truncate">
                  인동FN E-Biz 프로모션 운영 보드 · 1인 단독 기획/개발 (100%)
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] hover:bg-[#27272a] text-white font-bold text-xs rounded-md transition-all shadow-xs cursor-pointer border border-zinc-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B69F76]" />
                <span>시연 시나리오 즉시 시작</span>
              </button>

              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 rounded-md transition-colors cursor-pointer border border-[#DDD5C5] shadow-xs"
              >
                <span>{isIntroExpanded ? '소개 접기' : '프로젝트 소개 펼치기'}</span>
                {isIntroExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>
          </div>

          {isIntroExpanded && (
            <div className="mt-3.5 pt-3.5 border-t border-[#E8E4DA] space-y-3.5 animate-in fade-in duration-200">
              {/* 프로젝트 헤드라인 */}
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] flex items-center gap-2 font-brand">
                  <span>인동FN 자사몰 프로모션 오픈 전 사전 검수 & 운영 솔루션</span>
                </h2>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed max-w-4xl font-medium">
                  인동FN 자사몰(SHESMISS·LIST·SISTINA)을 가상으로 설정해 제작한 프로모션 오픈 전 사전 점검 도구입니다. 엑셀 업로드 한 번으로 가격·이미지·링크 오류를 자동 검사하고, 부서별(MD·디자인) 수정 요청 메일 초안을 스마트하게 작성합니다.
                </p>
              </div>

              {/* 4대 핵심 요약 카드 그리드 (화이트 배경 + 파스텔 테마 헤더 + 또렷한 블랙/차콜 텍스트) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                {/* 1. 문제 정의 */}
                <div className="bg-white border border-rose-200/80 rounded-md p-3 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-rose-300 transition-all">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>1. 해결한 문제 (Problem)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    행사 오픈 직전까지 엑셀 수기로 가격·할인율을 맞추다 생기는 역마진 사고, 잘못 들어간 404 테스트 링크, 배너 사이즈 불일치, 부서 간 요청 누락
                  </p>
                </div>

                {/* 2. 해결 방식 */}
                <div className="bg-white border border-amber-200/80 rounded-md p-3 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-amber-300 transition-all">
                  <div className="flex items-center gap-1.5 font-bold text-[#8C6D3B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B69F76]"></span>
                    <span>2. 해결 방식 (Solution)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    엑셀만 올리면 6가지 핵심 기준(가격·쿠폰·이미지·배너 등)으로 즉시 전수 검사하고, 오류가 난 부서별로 수정 요청 메일을 딱 맞춰 자동 작성
                  </p>
                </div>

                {/* 3. 본인 역할 */}
                <div className="bg-white border border-indigo-200/80 rounded-md p-3 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>3. 담당 역할 (Role & Contrib)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    <strong className="text-zinc-900">1인 단독 기획·설계·개발 (기여도 100%)</strong><br />
                    자사몰 프로모션 운영 워크플로우 정의부터 화면 UI 설계, 프론트엔드/백엔드 로직 구현 및 슬랙 연동까지 혼자 완성
                  </p>
                </div>

                {/* 4. 개선 성과 */}
                <div className="bg-white border border-emerald-200/80 rounded-md p-3 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>4. 개선 성과 (Impact)</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      시연 데이터 기준
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    사전 검수 소요시간 <strong className="text-zinc-900">91% 단축</strong> (기존 120분 ➔ 10분), 오픈 당일 치명적 결함 <strong className="text-zinc-900">0건 달성</strong>, 부서 간 확인 소통 리드타임 50% 단축
                    <span className="block mt-1 text-[10px] text-emerald-600 font-medium">※ 시연 시나리오 데이터 측정 기준</span>
                  </p>
                </div>
              </div>

              {/* 하단 기술 스택 및 시연 가이드라인 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-[#E8E4DA] text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-zinc-600">기술 스택:</span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    Next.js 16 (App Router)
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    TypeScript
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    Tailwind CSS v4
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    Zustand
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    SheetJS(XLSX)
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700">
                    Slack Webhook
                  </span>
                </div>
                <div className="font-semibold text-zinc-700 flex items-center gap-1">
                  <span className="text-zinc-500">추천 시연 순서:</span>
                  <span className="text-[#8C6D3B] font-bold">
                    STEP 01 (간트) ➔ STEP 02 (QC 센터) ➔ STEP 03 (전시 프리뷰)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상단 3단계 운영 파이프라인 메인 네비게이션 (IDF Mall 디자인 시스템) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-14 sm:top-15 z-20 shadow-[0_2px_8px_rgba(0,0,0,0.03)] py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* 좌측 안내 라벨 (사용자 가이드용) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-200">
              <span className="text-[10px] font-brand font-bold tracking-widest uppercase text-[#111111] bg-[#F7F4EE] border border-[#E6DCCE] px-2 py-0.5 rounded-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B69F76] animate-pulse"></span>
                PIPELINE
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">3단계 업무 워크플로우</span>
            </div>

            {/* 3단계 인터랙티브 스텝 탭 컨테이너 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
              {/* STEP 1: 프로모션 기획 & 연간 로드맵 */}
              <button
                type="button"
                onClick={() => setActiveTab('ANNUAL_GANTT')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-md border transition-all cursor-pointer text-left relative ${
                  activeTab === 'ANNUAL_GANTT'
                    ? 'bg-[#111111] text-white border-[#111111] shadow-sm ring-1 ring-zinc-800'
                    : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'ANNUAL_GANTT'
                        ? 'bg-white/10 text-[#B69F76]'
                        : 'bg-zinc-100 text-zinc-700 group-hover:bg-[#F7F4EE] group-hover:text-[#9A7B4F]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-brand font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-sm ${
                          activeTab === 'ANNUAL_GANTT'
                            ? 'bg-[#B69F76] text-white font-extrabold'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        STEP 01
                      </span>
                      {activeTab === 'ANNUAL_GANTT' && (
                        <span className="text-[9px] text-[#B69F76] font-bold">
                          ● 활성
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'ANNUAL_GANTT' ? 'text-white' : 'text-zinc-900 group-hover:text-[#111111]'
                    }`}>
                      프로모션 기획 & 연간 로드맵
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'ANNUAL_GANTT' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      2026 연간 캘린더 · 간트 일정
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'ANNUAL_GANTT' ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5'
                }`} />
              </button>

              {/* STEP 2: 정합성 통합 검증 (QC 센터) */}
              <button
                type="button"
                onClick={() => setActiveTab('QC_CENTER')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-md border transition-all cursor-pointer text-left relative ${
                  activeTab === 'QC_CENTER'
                    ? 'bg-[#111111] text-white border-[#111111] shadow-sm ring-1 ring-zinc-800'
                    : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'QC_CENTER'
                        ? 'bg-white/10 text-[#B69F76]'
                        : 'bg-zinc-100 text-zinc-700 group-hover:bg-[#F7F4EE] group-hover:text-[#9A7B4F]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-brand font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-sm ${
                          activeTab === 'QC_CENTER'
                            ? 'bg-[#B69F76] text-white font-extrabold'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        STEP 02
                      </span>
                      {activeTab === 'QC_CENTER' ? (
                        <span className="text-[9px] text-[#B69F76] font-bold">
                          ● 활성
                        </span>
                      ) : (
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1 rounded border border-rose-200">
                          QC 통합
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'QC_CENTER' ? 'text-white' : 'text-zinc-900 group-hover:text-[#111111]'
                    }`}>
                      정합성 통합 검증 (QC 센터)
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'QC_CENTER' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      기획전 마일스톤 + 단품 SKU 전수
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'QC_CENTER' ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5'
                }`} />
              </button>

              {/* STEP 3: 최종 전시 프리뷰 & 배너 검수 */}
              <button
                type="button"
                onClick={() => setActiveTab('LIVE_PREVIEW')}
                className={`group flex items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 rounded-md border transition-all cursor-pointer text-left relative ${
                  activeTab === 'LIVE_PREVIEW'
                    ? 'bg-[#111111] text-white border-[#111111] shadow-sm ring-1 ring-zinc-800'
                    : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      activeTab === 'LIVE_PREVIEW'
                        ? 'bg-white/10 text-[#B69F76]'
                        : 'bg-zinc-100 text-zinc-700 group-hover:bg-[#F7F4EE] group-hover:text-[#9A7B4F]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-brand font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-sm ${
                          activeTab === 'LIVE_PREVIEW'
                            ? 'bg-[#B69F76] text-white font-extrabold'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        STEP 03
                      </span>
                      {activeTab === 'LIVE_PREVIEW' && (
                        <span className="text-[9px] text-[#B69F76] font-bold">
                          ● 활성
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${
                      activeTab === 'LIVE_PREVIEW' ? 'text-white' : 'text-zinc-900 group-hover:text-[#111111]'
                    }`}>
                      최종 전시 프리뷰 & 배너 검수
                    </p>
                    <p className={`text-[10px] truncate ${
                      activeTab === 'LIVE_PREVIEW' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      모바일/PC 실시간 자사몰 화면
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  activeTab === 'LIVE_PREVIEW' ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8 pb-24 md:pb-12">
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
          <div className="space-y-5 sm:space-y-6">
            {/* QC 센터 통합 브리핑 배너 (IDF Mall Warm Ivory & Gold) */}
            <div className="bg-[#FAF9F5] text-[#111111] rounded-md p-5 sm:p-6 border border-[#E8E4DA] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-[#F0EBE1] border border-[#DDD5C5] text-[#8C6D3B] text-[10px] sm:text-[11px] font-brand tracking-wider font-bold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B69F76] animate-pulse"></span>
                    E-BIZ PROMOTION & SKU PRE-LAUNCH QC ENGINE
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111111] flex items-center gap-2 font-brand">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#8C6D3B]" />
                    정합성 통합 검증 (QC 센터)
                  </h1>
                  <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed font-medium">
                    기획전 전체 마일스톤 및 다부서(기획MD·웹디자인·전산·마케팅) 협업 조치부터 단품(SKU) 품번 전수 검사(엑셀 업로드, 이상치 감지, 404 이미지)까지 한 화면에서 검증합니다.
                  </p>
                </div>

                {activeDraftCount > 0 && (
                  <button
                    onClick={() => setIsDraftModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#27272a] text-white text-xs font-bold rounded-md shadow-xs transition-all shrink-0 cursor-pointer border border-zinc-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#B69F76] animate-pulse"></span>
                    <span>검토 대기 발송건 {activeDraftCount}건 확인하기</span>
                  </button>
                )}
              </div>
            </div>

            {/* QC 센터 서브탭 세그먼트 컨트롤러 */}
            <div className="bg-white rounded-md border border-zinc-200 p-2 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-md">
                {/* 서브탭 1: 기획전·부서별 사전 QC */}
                <button
                  onClick={() => setQcSubTab('CAMPAIGN_QC')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    qcSubTab === 'CAMPAIGN_QC'
                      ? 'bg-white text-[#111111] font-bold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>1. 기획전·부서별 사전 QC</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      qcSubTab === 'CAMPAIGN_QC'
                        ? 'bg-[#F7F4EE] text-[#9A7B4F] border border-[#E6DCCE]'
                        : 'bg-zinc-200/80 text-zinc-600'
                    }`}
                  >
                    마일스톤 & 부서별 듀얼 메일
                  </span>
                </button>

                {/* 서브탭 2: 단품(SKU) 마스터 전수 QC */}
                <button
                  onClick={() => setQcSubTab('SKU_MASTER_QC')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    qcSubTab === 'SKU_MASTER_QC'
                      ? 'bg-white text-[#111111] font-bold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>2. 단품(SKU) 마스터 전수 QC</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      qcSubTab === 'SKU_MASTER_QC'
                        ? 'bg-[#F7F4EE] text-[#9A7B4F] border border-[#E6DCCE]'
                        : 'bg-zinc-200/80 text-zinc-600'
                    }`}
                  >
                    엑셀업로드 · 비정상 할인율 · 404
                  </span>
                </button>
              </div>

              {/* 상단 기획전 퀵 셀렉터 (드롭다운 인터랙티브 전환) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPromoDropdownOpen(!isPromoDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-400 rounded-xl text-xs transition-all cursor-pointer shadow-2xs group"
                  title="클릭하여 사전 QC 검수 대상 기획전을 즉시 변경합니다"
                >
                  <span className="font-bold text-slate-500 shrink-0">선택된 기획전:</span>
                  {selectedPromo ? (
                    <div className="flex items-center gap-1.5 flex-wrap text-left">
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
                      <span className="font-black text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
                        {selectedPromo.title}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.2 rounded text-[10px] border border-indigo-200 hidden md:inline">
                        ID: {selectedPromo.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                        ({selectedPromo.startDate} ~ {selectedPromo.endDate})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono">기획전 선택 필요</span>
                  )}
                  <span className="ml-1 text-[11px] font-bold text-indigo-600 bg-indigo-100/70 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shrink-0">
                    <span>변경</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isPromoDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {/* 기획전 변경 퀵 드롭다운 메뉴 (플로팅 팝오버) */}
                {isPromoDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsPromoDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>사전 QC 검수 대상 기획전 변경</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          총 {promotions.length}건 등록
                        </span>
                      </div>

                      {/* 1. 진행 중인 행사 (실시간 집중 검수 3건) */}
                      <div className="p-1 space-y-1">
                        <div className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase text-rose-600 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>실시간 집중 검수 행사 (진행 중)</span>
                        </div>
                        {promotions
                          .filter((p) => getPromotionLifecycle(p) === 'ACTIVE')
                          .map((p) => {
                            const isCurrent = p.id === selectedPromotionId;
                            const isBlocker = p.status === 'NEEDS_CHECK';
                            const isWaiting = p.status === 'ASSET_REQUESTED';
                            const pBlockerCount = p.qcIssues.filter((i) => i.severity === 'BLOCKER').length;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPromotionId(p.id);
                                  setIsPromoDropdownOpen(false);
                                  const target = document.getElementById('qc-workspace-section');
                                  if (target) {
                                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-300'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                        p.brand === 'SHESMISS'
                                          ? 'bg-purple-100 text-purple-800'
                                          : p.brand === 'LIST'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {p.brand}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {p.startDate} ~ {p.endDate}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {p.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
                                    ID: {p.id}
                                  </p>
                                </div>

                                <div className="shrink-0 flex flex-col items-end gap-1">
                                  {isBlocker && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                                      🚨 결함 {pBlockerCount}건
                                    </span>
                                  )}
                                  {isWaiting && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                      ⏳ 소재 대기
                                    </span>
                                  )}
                                  {!isBlocker && !isWaiting && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                      ✓ 통과 완료
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      선택됨
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {/* 2. 진행 예정 및 기타 행사 */}
                      <div className="p-1 space-y-1 border-t border-slate-100 mt-1">
                        <div className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase text-slate-500">
                          진행 예정 & 기타 행사
                        </div>
                        {promotions
                          .filter((p) => getPromotionLifecycle(p) !== 'ACTIVE')
                          .slice(0, 6)
                          .map((p) => {
                            const isCurrent = p.id === selectedPromotionId;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPromotionId(p.id);
                                  setIsPromoDropdownOpen(false);
                                  const target = document.getElementById('qc-workspace-section');
                                  if (target) {
                                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-indigo-50 border-indigo-300'
                                    : 'bg-white hover:bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="min-w-0 flex-1 flex items-center gap-2">
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 shrink-0">
                                    {p.brand}
                                  </span>
                                  <span className="text-xs font-medium text-slate-800 truncate">
                                    {p.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {p.startDate.slice(5)} 오픈
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </>
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

      {/* 4. 모바일 전용 하단 고정 퀵 내비게이션 바 (Mobile Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-area-bottom">
        <button
          onClick={() => setActiveTab('ANNUAL_GANTT')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'ANNUAL_GANTT'
              ? 'text-[#111111] font-bold'
              : 'text-zinc-400 hover:text-zinc-700 font-medium'
          }`}
        >
          <Calendar className={`w-4.5 h-4.5 ${activeTab === 'ANNUAL_GANTT' ? 'text-[#111111]' : ''}`} />
          <span className="text-[10px]">연간 로드맵</span>
          {activeTab === 'ANNUAL_GANTT' && (
            <span className="w-1 h-1 rounded-full bg-[#B69F76]"></span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('QC_CENTER');
            setQcSubTab('CAMPAIGN_QC');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'QC_CENTER'
              ? 'text-[#111111] font-bold'
              : 'text-zinc-400 hover:text-zinc-700 font-medium'
          }`}
        >
          <div className="relative">
            <ShieldCheck className={`w-4.5 h-4.5 ${activeTab === 'QC_CENTER' ? 'text-[#111111]' : ''}`} />
            {selectedPromo && selectedPromo.qcIssues.some((i) => i.severity === 'BLOCKER') && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E11D48]"></span>
            )}
          </div>
          <span className="text-[10px]">QC 검증</span>
          {activeTab === 'QC_CENTER' && (
            <span className="w-1 h-1 rounded-full bg-[#B69F76]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('LIVE_PREVIEW')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'LIVE_PREVIEW'
              ? 'text-[#111111] font-bold'
              : 'text-zinc-400 hover:text-zinc-700 font-medium'
          }`}
        >
          <Sparkles className={`w-4.5 h-4.5 ${activeTab === 'LIVE_PREVIEW' ? 'text-[#B69F76]' : ''}`} />
          <span className="text-[10px]">전시 미리보기</span>
          {activeTab === 'LIVE_PREVIEW' && (
            <span className="w-1 h-1 rounded-full bg-[#B69F76]"></span>
          )}
        </button>

        <button
          onClick={() => {
            handleLoadDemo();
            setActiveTab('QC_CENTER');
            setQcSubTab('CAMPAIGN_QC');
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md text-[#B69F76] hover:text-[#9A7B4F] font-bold cursor-pointer"
        >
          <span className="w-4.5 h-4.5 rounded-full bg-[#F7F4EE] border border-[#E6DCCE] flex items-center justify-center text-[10px] font-black">
            ⚡
          </span>
          <span className="text-[10px]">시연 로드</span>
        </button>
      </div>

      <footer className="border-t border-zinc-200 bg-white py-6 sm:py-8 text-center text-xs text-zinc-500 space-y-1.5 pb-20 md:pb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-brand font-black text-sm tracking-widest text-[#111111]">IDF MALL</span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600 font-medium">E-Biz Promotion Operations Board</span>
        </div>
        <p className="font-semibold text-zinc-700">
          인동FN 자사몰 (SHESMISS · LIST · SISTINA) 프로모션 일정 관리 & 오픈 사전 전수 점검
        </p>
        <p className="text-[11px] text-zinc-400 max-w-2xl mx-auto px-4 leading-relaxed">
          ※ <strong>Data Compliance Note:</strong> 본 프로토타입에 수록된 행사 기획, 상품 단가, 협업 직무(기획MD 담당자 등), 가상 이메일(@example.invalid)은 포트폴리오 시연용 <strong>가상 데이터(Mock Data)</strong>입니다.
        </p>
      </footer>
    </div>
  );
}
