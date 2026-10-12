'use client';

import React from 'react';
import Header from '@/components/Header';
import CalendarUploader from '@/components/CalendarUploader';
import MatrixFilterBar from '@/components/MatrixFilterBar';
import PromotionCalendarView from '@/components/PromotionCalendarView';
import EmailDraftModal from '@/components/EmailDraftModal';
import { useOpsStore } from '@/store/useOpsStore';

export default function Home() {
  const { emailDrafts, resetToDefault, setIsDraftModalOpen } = useOpsStore();

  const activeDraftCount = emailDrafts.filter((d) => d.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onLoadDemo={resetToDefault}
        onOpenDrafts={() => setIsDraftModalOpen(true)}
        draftCount={activeDraftCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* 상단 브리핑 배너 */}
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                E-BIZ 프로모션 자율 운영 엔진 가동 중
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                인동FN 자사몰 프로모션 캘린더 & 마일스톤 관리
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                연간 행사 계획 엑셀을 업로드하면 시작일 기준 D-7(MD 상품 요청), D-5(디자인 배너 요청), D-2(회신 확인), D-1(사전 QC) 일정과 진행 현황을 자동으로 생성 및 관리합니다.
              </p>
            </div>

            {activeDraftCount > 0 && (
              <button
                onClick={() => setIsDraftModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
              >
                <span>🔔 검토 대기 메일 {activeDraftCount}건 확인하기</span>
              </button>
            )}
          </div>
        </div>

        {/* 4.1 연간 캘린더 엑셀 업로더 */}
        <CalendarUploader />

        {/* 4.2 3-Way 매트릭스 필터 (브랜드/부서/업무상태) */}
        <MatrixFilterBar />

        {/* 4.1 & 4.2 캘린더, 마일스톤 타임라인 & 리마인더 발송 */}
        <PromotionCalendarView />
      </main>

      {/* 메일 임시보관함 모달 (Human-in-the-Loop 검토) */}
      <EmailDraftModal />

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        AI Commerce Ops Copilot (OpsPilot) — Fashion E-Commerce Operations & Automated QC Platform
      </footer>
    </div>
  );
}
