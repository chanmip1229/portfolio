import React, { useState } from 'react';
import { Sparkles, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useOpsStore } from '@/store/useOpsStore';

interface HeaderProps {
  onLoadDemo: () => void;
  onOpenDrafts: () => void;
  draftCount: number;
}

export default function Header({ onLoadDemo, onOpenDrafts, draftCount }: HeaderProps) {
  const { setIsSlackModalOpen, slackWebhookUrl } = useOpsStore();
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tighter text-lg shadow-sm">
            IDF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">IDF E-Biz 운영 보드</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                스마트 코파일럿
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2.5">
          {/* 실제 Slack 실시간 연동 버튼 */}
          <button
            onClick={() => setIsSlackModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
              isSlackConnected
                ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="실제 슬랙 채널과 연동하여 실시간 결함 알림을 전송합니다"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSlackConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="w-3.5 h-3.5 rounded bg-[#4A154B] text-white flex items-center justify-center text-[10px] font-black">
              #
            </span>
            <span>Slack 연동</span>
            {isSlackConnected && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">
                LIVE
              </span>
            )}
          </button>

          {/* 시연용 원클릭 로드 버튼 */}
          <button
            onClick={handleLoadDemo}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-lg shadow-xs hover:shadow transition-all cursor-pointer ${
              isLoaded
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300 shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>✓ 시연 데이터 로드 완료!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>🚀 시연 시나리오 로드 (26FW LIST)</span>
              </>
            )}
          </button>

          {/* 메일 임시보관함 알림 버튼 */}
          <div className="relative">
            <button
              onClick={onOpenDrafts}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
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
