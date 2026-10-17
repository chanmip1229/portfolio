import React, { useState } from 'react';
import { Sparkles, Mail, CheckCircle2, Bell } from 'lucide-react';
import { useOpsStore } from '@/store/useOpsStore';

interface HeaderProps {
  onLoadDemo: () => void;
  onOpenDrafts: () => void;
  draftCount: number;
}

export default function Header({ onLoadDemo, onOpenDrafts, draftCount }: HeaderProps) {
  const { setIsSlackModalOpen, slackWebhookUrl, selectedBrand, setSelectedBrand } = useOpsStore();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadDemo = () => {
    onLoadDemo();
    setIsLoaded(true);
    setTimeout(() => setIsLoaded(false), 3000);
  };

  const isSlackConnected = Boolean(
    (slackWebhookUrl && slackWebhookUrl.startsWith('https://hooks.slack.com/')) ||
      process.env.NEXT_PUBLIC_SLACK_CONFIGURED === 'true'
  );

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* 1. 최상단 브랜드 유틸리티 바 (IDF Mall Signature Top Bar) */}
      <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-brand tracking-wider">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#B69F76] tracking-widest">INDONG FN</span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-3 font-medium text-zinc-300">
            <button
              onClick={() => setSelectedBrand('SHESMISS')}
              className={`hover:text-white transition-colors cursor-pointer ${
                selectedBrand === 'SHESMISS' ? 'text-white font-bold underline underline-offset-4 decoration-[#B69F76]' : ''
              }`}
            >
              SHESMISS
            </button>
            <span className="text-zinc-600">·</span>
            <button
              onClick={() => setSelectedBrand('LIST')}
              className={`hover:text-white transition-colors cursor-pointer ${
                selectedBrand === 'LIST' ? 'text-white font-bold underline underline-offset-4 decoration-[#B69F76]' : ''
              }`}
            >
              LIST
            </button>
            <span className="text-zinc-600">·</span>
            <button
              onClick={() => setSelectedBrand('SISTINA')}
              className={`hover:text-white transition-colors cursor-pointer ${
                selectedBrand === 'SISTINA' ? 'text-white font-bold underline underline-offset-4 decoration-[#B69F76]' : ''
              }`}
            >
              SISTINA
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
          <span className="hidden md:inline">E-Commerce Promotion Operations & Pre-Launch QC Copilot</span>
        </div>
      </div>

      {/* 2. 메인 헤더 영역 */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between">
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-md bg-[#111111] text-white flex items-center justify-center font-brand font-black tracking-tighter text-base sm:text-lg shadow-sm border border-zinc-800 relative group">
            <span>IDF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-[#111111] tracking-tight">
                IDF E-Biz 운영 보드
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-[#F7F4EE] text-[#9A7B4F] rounded border border-[#E6DCCE] tracking-wide">
                스마트 QC
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-normal line-clamp-1">
              인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 전수 점검
            </p>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Slack 실시간 연동 버튼 */}
          <button
            type="button"
            onClick={() => setIsSlackModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-md border transition-all cursor-pointer ${
              isSlackConnected
                ? 'bg-[#FAF9F5] text-[#111111] border-[#D6C7B2] hover:bg-[#F3EFE6]'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
            }`}
            title="Slack Webhook 결함 알림 설정"
            aria-label="Slack Webhook 실시간 연동 설정 열기"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSlackConnected ? 'bg-[#2D4A3E]' : 'bg-zinc-300'
              }`}
            />
            <span className="w-3.5 h-3.5 rounded bg-[#111111] text-[#B69F76] flex items-center justify-center text-[9px] font-black">
              #
            </span>
            <span className="hidden sm:inline">Slack 연동</span>
            {isSlackConnected && (
              <span className="text-[9px] bg-[#F2F5F3] text-[#2D4A3E] font-bold px-1 rounded border border-[#C7D6CE]">
                LIVE
              </span>
            )}
          </button>

          {/* 시연 시나리오 로드 버튼 (모바일에서는 하단 탭바에 배치되어 있으므로 데스크톱/태블릿에서만 표시) */}
          <button
            onClick={handleLoadDemo}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-md shadow-xs transition-all cursor-pointer ${
              isLoaded
                ? 'bg-[#2D4A3E] text-white ring-2 ring-[#C7D6CE] shadow-md'
                : 'bg-[#111111] hover:bg-[#27272a] text-white border border-[#B69F76]/40 hover:border-[#B69F76]'
            }`}
          >
            {isLoaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C7D6CE]" />
                <span>시연 데이터 세팅 완료</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#B69F76]" />
                <span>시연 시나리오 로드 (LIST 기획전)</span>
              </>
            )}
          </button>

          {/* 메일 임시보관함 알림 버튼 */}
          <button
            onClick={onOpenDrafts}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-200 transition-colors cursor-pointer relative"
            title="담당자 확인 요청 메일 임시보관함"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">임시보관함</span>
            {draftCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-[#881337] text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {draftCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
