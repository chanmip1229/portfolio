'use client';

import React, { useState, useEffect } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  X,
  Send,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Trash2,
  HelpCircle,
  Bell,
  Sparkles,
} from 'lucide-react';
import { sendSlackMessage, buildTestSlackBlocks } from '@/utils/slackNotifier';

export default function SlackSettingsModal() {
  const { isSlackModalOpen, setIsSlackModalOpen, slackWebhookUrl, setSlackWebhookUrl } =
    useOpsStore();

  const [inputUrl, setInputUrl] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (isSlackModalOpen) {
      setInputUrl(slackWebhookUrl || '');
      setTestResult(null);
    }
  }, [isSlackModalOpen, slackWebhookUrl]);

  if (!isSlackModalOpen) return null;

  const isConfigured = Boolean(
    (slackWebhookUrl && slackWebhookUrl.startsWith('https://hooks.slack.com/')) ||
      process.env.NEXT_PUBLIC_SLACK_CONFIGURED === 'true'
  );

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    setSlackWebhookUrl(trimmed);
    setTestResult({
      success: true,
      message: trimmed ? 'Slack Webhook URL이 안전하게 저장되었습니다.' : '연동이 초기화되었습니다.',
    });
    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  };

  const handleClear = () => {
    setInputUrl('');
    setSlackWebhookUrl('');
    setTestResult({
      success: true,
      message: 'Slack 연동이 해제되었습니다.',
    });
    setTimeout(() => {
      setTestResult(null);
    }, 2500);
  };

  const handleSendTest = async () => {
    const targetUrl = inputUrl.trim() || slackWebhookUrl;
    if (!targetUrl && process.env.NEXT_PUBLIC_SLACK_CONFIGURED !== 'true') {
      setTestResult({
        success: false,
        message: 'Slack Webhook URL을 먼저 입력해 주세요.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    const res = await sendSlackMessage({
      webhookUrl: targetUrl || undefined,
      text: '🎉 [연동 성공] IDF E-Biz 운영 보드 & Slack 실시간 알림 연결 완료',
      blocks: buildTestSlackBlocks(),
    });

    setIsSendingTest(false);
    if (res.success) {
      if (targetUrl) {
        setSlackWebhookUrl(targetUrl);
      }
      setTestResult({
        success: true,
        message: '🎉 실제 Slack 채널로 테스트 메시지가 성공적으로 전송되었습니다! 슬랙을 확인해 보세요!',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Slack 메시지 전송에 실패했습니다. Webhook URL을 확인해 주세요.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 상단 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A154B] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <span className="text-xl">#</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">실제 Slack 실시간 연동 설정</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
                  ></span>
                  {isConfigured ? '연동 활성화됨 (Live)' : '미연동 상태'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Slack 알림은 <strong>Incoming Webhook 연동 방식</strong>으로 동작하며, URL 연결 후 실제 워크스페이스 채널로 결함 리포트가 전송됩니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSlackModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Slack 설정 모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Webhook URL 입력 영역 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Slack Incoming Webhook URL</span>
              </label>
              {isConfigured && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  브라우저에 안전하게 저장됨
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="발급받은 Slack Incoming Webhook URL을 여기에 붙여넣어 주세요"
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs pr-20"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              알림을 수신할 Slack 채널의 Webhook URL을 입력해 주세요. 입력된 URL은 사용자의 로컬 브라우저에만 저장되며, 임시보관함에서 [Slack 발송] 클릭 시 실제 채널로 메시지가 전달됩니다.
            </p>
          </div>

          {/* 알림 피드백 배너 */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || (!inputUrl.trim() && !isConfigured)}
                className="px-4 py-2 bg-[#4A154B] hover:bg-[#3d113e] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {isSendingTest ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>슬랙으로 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>⚡ 테스트 메시지 즉시 발송</span>
                  </>
                )}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>연동 해제</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              설정 저장
            </button>
          </div>

          {/* 초간단 1분 연동 가이드 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>📌 내 Slack Webhook URL 발급받는 방법 (1분 소요)</span>
              </span>
              <span className="text-[11px] text-purple-700 underline font-normal">
                {showGuide ? '접기 ▲' : '가이드 보기 ▼'}
              </span>
            </button>

            {showGuide && (
              <div className="p-4 pt-1 space-y-3 text-xs text-slate-700 border-t border-slate-200/80">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">
                      Slack Incoming Webhooks 앱 열기
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      Slack 워크스페이스가 로그인된 브라우저에서 아래 공식 링크로 이동합니다.
                    </p>
                    <a
                      href="https://slack.com/apps/A0F7XDUAZ-incoming-webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-bold mt-1 hover:underline"
                    >
                      <span>👉 Slack Incoming WebHooks 앱 바로가기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">알림 수신 채널 선택</strong>
                    <p className="text-[11px] text-slate-500">
                      <strong>[Slack에 추가]</strong> 버튼을 누르고, QC 알림을 받고 싶은 채널(예: <code className="bg-slate-200/80 px-1 rounded text-[10px]">#ebiz-qc-알림</code> 또는 <code className="bg-slate-200/80 px-1 rounded text-[10px]">#general</code>)을 선택한 뒤 <strong>[수신 웹후크 통합 앱 추가]</strong>를 누릅니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">웹후크 URL 복사 및 등록</strong>
                    <p className="text-[11px] text-slate-500">
                      화면에 발급된 <strong>웹후크 URL (<code className="bg-slate-200/80 px-1 rounded text-[10px]">https://hooks.slack.com/services/...</code>)</strong>을 복사하여 위 입력창에 붙여넣고 <strong>[⚡ 테스트 메시지 즉시 발송]</strong>을 눌러보세요!
                    </p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-purple-50/80 rounded-lg border border-purple-200 text-[11px] text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    <strong>포트폴리오 면접 팁:</strong> 실제 내 스마트폰이나 PC의 Slack으로 결함 알림이 실시간으로 팝업되는 시연을 보여주면 현실성과 실무 완성도 평가가 극대화됩니다.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 모달 하단 닫기 */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>인동FN E-BIZ 자사몰 프로모션 일정 관리 & 오픈 사전 점검</span>
          <button
            type="button"
            onClick={() => setIsSlackModalOpen(false)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
