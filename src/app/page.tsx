'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import MatrixFilterBar from '@/components/MatrixFilterBar';
import PromotionCalendarView from '@/components/PromotionCalendarView';
import BannerStudio from '@/components/BannerStudio';
import QcWorkspace from '@/components/QcWorkspace';
import MobileLivePreview from '@/components/MobileLivePreview';
import EmailDraftModal from '@/components/EmailDraftModal';
import AnnualScheduleView from '@/components/AnnualScheduleView';
import SkuMasterQcView from '@/components/SkuMasterQcView';
import { useOpsStore } from '@/store/useOpsStore';
import {
  Sparkles,
  Calendar,
  LayoutDashboard,
  FileSpreadsheet,
  ShieldCheck,
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

      {/* 상단 3단계 운영 파이프라인 메인 네비게이션 */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            {/* STEP 1: 프로모션 기획 & 연간 로드맵 */}
            <button
              onClick={() => setActiveTab('ANNUAL_GANTT')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'ANNUAL_GANTT'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  activeTab === 'ANNUAL_GANTT' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                STEP 1
              </span>
              <Calendar className="w-4 h-4" />
              <span>프로모션 기획 & 연간 로드맵</span>
            </button>

            {/* STEP 2: 정합성 통합 검증 (QC 센터) — 기획전 사전 QC + 단품(SKU) 전수 검수 통합 */}
            <button
              onClick={() => setActiveTab('QC_CENTER')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'QC_CENTER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  activeTab === 'QC_CENTER' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                STEP 2
              </span>
              <ShieldCheck className="w-4 h-4" />
              <span>정합성 통합 검증 (QC 센터)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  activeTab === 'QC_CENTER' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}
              >
                기획전 + SKU 전수
              </span>
            </button>

            {/* STEP 3: 최종 전시 프리뷰 & 배너 검수 */}
            <button
              onClick={() => setActiveTab('LIVE_PREVIEW')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'LIVE_PREVIEW'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                  activeTab === 'LIVE_PREVIEW' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                STEP 3
              </span>
              <Sparkles className="w-4 h-4" />
              <span>최종 전시 프리뷰 & 배너 검수</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>인동FN (SHESMISS · LIST · SISTINA) E-BIZ 자율 운영 시스템</span>
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

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        AI Commerce Ops Copilot (OpsPilot) — Fashion E-Commerce Operations & Automated QC Platform
      </footer>
    </div>
  );
}
