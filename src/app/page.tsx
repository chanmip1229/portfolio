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
} from 'lucide-react';

export default function Home() {
  const {
    emailDrafts,
    selectedPromotionId,
    setSelectedPromotionId,
    resetToDefault,
    setIsDraftModalOpen,
    setSelectedDraftId,
  } = useOpsStore();

  // 기능별 그룹화: 3단계 이커머스 운영 파이프라인
  // 1. 프로모션 기획 & 연간 로드맵
  // 2. 정합성 통합 검증 (QC 센터) - [서브탭 1: 기획전·부서별 사전 QC / 서브탭 2: 단품(SKU) 마스터 전수 QC]
  // 3. 최종 전시 프리뷰 & 배너 검수
  const [activeTab, setActiveTab] = useState<'ANNUAL_GANTT' | 'QC_CENTER' | 'LIVE_PREVIEW'>('ANNUAL_GANTT');
  const [qcSubTab, setQcSubTab] = useState<'CAMPAIGN_QC' | 'SKU_MASTER_QC'>('CAMPAIGN_QC');

  const activeDraftCount = emailDrafts.filter((d) => d.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onLoadDemo={resetToDefault}
        onOpenDrafts={() => setIsDraftModalOpen(true)}
        draftCount={activeDraftCount}
      />

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
                    E-BIZ 프로모션 & SKU 마스터 무결점 검증 엔진
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    정합성 통합 검증 (QC 센터)
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    기획전 전체 마일스톤 및 다부서(MD·디자인·웹개발·마케팅) 협업 조치부터 단품(SKU) 품번 전수 검사(엑셀 업로드, 80% 이상치 감지, 404 이미지)까지 한 화면에서 검증합니다.
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

              <div className="flex items-center gap-2 px-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">선택된 기획전:</span>
                <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                  {selectedPromotionId || '전체'}
                </span>
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
          <div className="space-y-8">
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

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        IDF E-Biz 운영 보드 — 인동FN 자사몰 프로모션 사전 QC & 무결점 런칭 데스크
      </footer>
    </div>
  );
}
