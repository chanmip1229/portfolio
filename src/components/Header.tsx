import React from 'react';
import { Sparkles, Layers, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onLoadDemo: () => void;
  onOpenDrafts: () => void;
  draftCount: number;
}

export default function Header({ onLoadDemo, onOpenDrafts, draftCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tighter text-lg shadow-sm">
            IDF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">OpsPilot</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                AI E-BIZ Copilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              인동FN 자사몰 프로모션 운영 & 무결점 사전 QC 시스템
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 시연용 원클릭 로드 버튼 */}
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs hover:shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🚀 시연 시나리오 로드 (26SS LIST)</span>
          </button>

          {/* 메일 임시보관함 알림 버튼 */}
          <div className="relative">
            <button
              onClick={onOpenDrafts}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>임시보관함</span>
              {draftCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {draftCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
