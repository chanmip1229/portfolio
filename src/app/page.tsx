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
import { useOpsStore } from '@/store/useOpsStore';
import { Sparkles, Calendar, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const { emailDrafts, selectedPromotionId, setSelectedPromotionId, resetToDefault, setIsDraftModalOpen } = useOpsStore();
  // 사용자가 요청한 대로 간트 로드맵 탭을 1번째 기본 탭으로 설정
  const [activeTab, setActiveTab] = useState<'ANNUAL_GANTT' | 'QC_WORKSPACE' | 'LIVE_PREVIEW'>('ANNUAL_GANTT');

  const activeDraftCount = emailDrafts.filter((d) => d.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onLoadDemo={resetToDefault}
        onOpenDrafts={() => setIsDraftModalOpen(true)}
        draftCount={activeDraftCount}
      />

      {/* 상단 메인 네비게이션 3-탭 바: 1. 연간 간트 로드맵 -> 2. 실시간 사전 QC 워크스페이스 -> 3. 앱·웹 라이브 프리뷰 */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
            {/* 탭 1 (맨 앞): 2026 연간 프로모션 간트 로드맵 & 캘린더 */}
            <button
              onClick={() => setActiveTab('ANNUAL_GANTT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'ANNUAL_GANTT'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>2026 연간 프로모션 간트 로드맵 & 캘린더</span>
            </button>

            {/* 탭 2: 실시간 사전 QC & 부서별 워크스페이스 */}
            <button
              onClick={() => setActiveTab('QC_WORKSPACE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'QC_WORKSPACE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>실시간 사전 QC & 부서별 워크스페이스</span>
            </button>

            {/* 탭 3: IDF몰 앱/웹 라이브 프리뷰 & 배너 검수 */}
            <button
              onClick={() => setActiveTab('LIVE_PREVIEW')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'LIVE_PREVIEW'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>IDF몰 앱/웹 라이브 프리뷰 & 배너 검수</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>인동FN (SHESMISS · LIST · SISTINA) E-BIZ 자율 운영 시스템</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* 탭 1: 2026 연간 프로모션 간트 로드맵 & 캘린더 (행사 기간/진행일차/D-Day/종료행사필터/엑셀업로드 통합) */}
        {activeTab === 'ANNUAL_GANTT' && (
          <AnnualScheduleView
            onNavigateToQc={(promoId) => {
              setSelectedPromotionId(promoId);
              setActiveTab('QC_WORKSPACE');
            }}
          />
        )}

        {/* 탭 2: 실시간 사전 QC & 부서별 정합성 워크스페이스 */}
        {activeTab === 'QC_WORKSPACE' && (
          <>
            {/* 상단 브리핑 배너 */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    E-BIZ 프로모션 자율 운영 엔진 가동 중
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">
                    실시간 사전 QC & 부서별 정합성 워크스페이스
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    MD팀(가격/할인율/승인여부), 디자인팀(배너 해상도), 웹개발팀(링크 오류), 마케팅팀(쿠폰 중복) 등 부서별 오류를 실시간 검출하고 즉시 이메일·슬랙·구글챗으로 전송합니다.
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

            {/* 실시간 사전 QC 워크스페이스 (부서별 탭, 쿠폰 매트릭스, 엑셀 다운로드, 즉시 발송) */}
            {selectedPromotionId && (
              <QcWorkspace promotionId={selectedPromotionId} />
            )}

            {/* 마일스톤 타임라인 & 필터 바 */}
            <MatrixFilterBar />
            <PromotionCalendarView />
          </>
        )}

        {/* 탭 3: IDF몰 앱/웹 멀티 디바이스 라이브 프리뷰 & 배너 검수 */}
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

      {/* 메일 임시보관함 모달 (Human-in-the-Loop 검토) */}
      <EmailDraftModal />

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        AI Commerce Ops Copilot (OpsPilot) — Fashion E-Commerce Operations & Automated QC Platform
      </footer>
    </div>
  );
}
