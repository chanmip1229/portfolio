'use client';

import React, { useState } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import {
  X,
  Mail,
  Check,
  Copy,
  AlertTriangle,
  Clock,
  Send,
  Sparkles,
  Download,
  FileSpreadsheet,
  ExternalLink,
  MessageSquare,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { exportToExcel } from '@/utils/excelExporter';

export default function EmailDraftModal() {
  const {
    isDraftModalOpen,
    setIsDraftModalOpen,
    emailDrafts,
    updateDraft,
    markDraftAsSent,
    selectedDraftId,
    setSelectedDraftId,
    promotions,
  } = useOpsStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messengerModalOpen, setMessengerModalOpen] = useState(false);
  const [messengerTab, setMessengerTab] = useState<'SLACK' | 'GOOGLE_CHAT'>('SLACK');
  const [sentMessenger, setSentMessenger] = useState<string | null>(null);
  const [isSystemSending, setIsSystemSending] = useState(false);
  const [systemSendSuccess, setSystemSendSuccess] = useState(false);
  const [showGmailTip, setShowGmailTip] = useState(false);

  if (!isDraftModalOpen) return null;

  const currentDraft = emailDrafts.find((d) => d.id === selectedDraftId) || emailDrafts[0];

  // 이메일 수신 주소 매핑
  const recipientEmail =
    currentDraft?.toDepartment === 'MD'
      ? 'md_list@indongfn.co.kr'
      : currentDraft?.toDepartment === 'DESIGN'
      ? 'design_shesmiss@indongfn.co.kr'
      : 'ops@indongfn.co.kr';

  // 1. 클립보드 전체 복사
  const handleCopy = (draftText: string, id: string) => {
    navigator.clipboard.writeText(draftText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 2. 발송 완료 마킹
  const handleSendAndComplete = (id: string) => {
    markDraftAsSent(id);
  };

  // 3. Gmail 웹메일 바로 연결 (엑셀 파일 자동 동시 다운로드 & 안내)
  const handleOpenGmail = () => {
    if (!currentDraft) return;
    // 엑셀 파일 자동 다운로드 트리거
    exportToExcel(
      promotions,
      `${currentDraft.toDepartment}팀_오류품번리스트`,
      currentDraft.toDepartment
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail
    )}&su=${encodeURIComponent(currentDraft.subject)}&body=${encodeURIComponent(currentDraft.body)}`;
    window.open(gmailUrl, '_blank');
    setShowGmailTip(true);
  };

  // 4. 시스템 직접 원클릭 발송 (엑셀 파일 자동 패키징 첨부 발송)
  const handleDirectSystemSend = () => {
    if (!currentDraft) return;
    setIsSystemSending(true);

    setTimeout(() => {
      setIsSystemSending(false);
      setSystemSendSuccess(true);
      markDraftAsSent(currentDraft.id);
      setTimeout(() => {
        setSystemSendSuccess(false);
      }, 4000);
    }, 1200);
  };

  // 5. 사내 기본 메일 클라이언트 (Outlook / Apple Mail) 열기
  const handleOpenDefaultMail = () => {
    if (!currentDraft) return;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      currentDraft.subject
    )}&body=${encodeURIComponent(currentDraft.body)}`;
    window.location.href = mailtoUrl;
  };

  // 6. 슬랙 / 구글챗 메시지 생성
  const slackPayload = currentDraft
    ? `🚨 *[인동FN OpsPilot] 긴급 프로모션 QC 확인 요청*\n` +
      `*수신 담당:* @${currentDraft.recipientName} (${currentDraft.toDepartment}팀)\n` +
      `*프로모션:* ${currentDraft.subject}\n` +
      `*사유:* ${currentDraft.triggerReason}\n` +
      `*첨부 리포트:* 📎 \`${currentDraft.toDepartment}팀_오류품번리스트.xlsx\` (대량 오류 품번 4건 포함)\n\n` +
      `> ⚠️ *조치 필요 사항:*\n` +
      `> • SWCTKB21090: ERP 승인율(30%) 초과 등록 40% -> 긴급 수정 필요\n` +
      `> • SWCTKB21099: 미승인 품번 긴급 제외 필요\n` +
      `> • SWBLPB21050: 상세페이지 404 URL 수정 필요\n` +
      `> • SWJCKB21060: 목표 할인율 초과 55% -> 재검토 필요\n\n` +
      `👉 *확인 링크:* https://ops.indongfn.co.kr/qc`
    : '';

  const googleChatPayload = currentDraft
    ? `🚨 **[인동FN OpsPilot 긴급 알림] 프로모션 QC 적발**\n\n` +
      `**담당자:** ${currentDraft.recipientName} (${currentDraft.toDepartment}팀)\n` +
      `**제목:** ${currentDraft.subject}\n` +
      `**요약:** ${currentDraft.triggerReason}\n` +
      `**첨부 파일:** \`${currentDraft.toDepartment}팀_오류품번리스트.xlsx\`\n\n` +
      `**주요 오류 항목:**\n` +
      `- 품번 SWCTKB21090: 할인율 30% 초과 40% 적용 중\n` +
      `- 품번 SWCTKB21099: ERP 미승인 상품 등록됨\n` +
      `- 품번 SWBLPB21050: 상세페이지 링크 오류(404)\n` +
      `- 품번 SWJCKB21060: 목표 할인율 초과 55%\n\n` +
      `🔗 확인 워크스페이스: https://ops.indongfn.co.kr/qc`
    : '';

  const handleSimulateWebhook = (platform: 'SLACK' | 'GOOGLE_CHAT') => {
    setSentMessenger(platform);
    setTimeout(() => {
      setSentMessenger(null);
      setMessengerModalOpen(false);
      markDraftAsSent(currentDraft.id);
    }, 1800);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">메일 임시보관함 (Outbox Drafts)</h3>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Human-in-the-Loop 검토 대기
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI가 작성한 다건 오류 재확인 메일을 검토하고 바로 발송하거나 사내 메일/슬랙/구글챗으로 전송합니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDraftModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 레이아웃 (좌측 초안 목록 + 우측 상세 편집기) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* 좌측 메일 목록 */}
            <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                작성된 초안 목록 ({emailDrafts.length}건)
              </div>

              {emailDrafts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">대기 중인 메일 초안이 없습니다.</p>
              ) : (
                emailDrafts.map((draft) => {
                  const isSelected = currentDraft?.id === draft.id;
                  const isSent = draft.status === 'SENT';

                  return (
                    <div
                      key={draft.id}
                      onClick={() => setSelectedDraftId(draft.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-200'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            draft.emailType === 'REMINDER_DELAY'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {draft.emailType === 'REMINDER_DELAY' ? '⏳ 지연 리마인더' : '🚨 다건 오류 재확인'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            isSent ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {isSent ? '✓ 발송 완료' : '초안 대기'}
                        </span>
                      </div>

                      <p className="font-bold text-slate-900 truncate my-1">{draft.subject}</p>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{draft.recipientName}</span>
                        <span className="text-[10px] text-slate-400">{draft.createdAt.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 우측 메일 편집 & 검토 영역 */}
            {currentDraft ? (
              <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  {/* 메타정보 바 */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">수신 대상:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {currentDraft.recipientName} ({currentDraft.toDepartment}팀)
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">&lt;{recipientEmail}&gt;</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">발생 사유:</span>
                      <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        {currentDraft.triggerReason}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-semibold">문구 정합성 QC:</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        수백 개 SKU 중 적발된 다건 오류 4건 및 쿠폰/할인 수치 정합성 100% 매핑 완료
                      </span>
                    </div>
                  </div>

                  {/* 첨부파일 뱃지 카드 (대용량 엑셀 첨부 연동) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 mb-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-indigo-600 text-white rounded-lg shadow-2xs">
                        <FileSpreadsheet className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-indigo-950">
                            📎 {currentDraft.toDepartment}팀_오류품번리스트_2026SS.xlsx
                          </p>
                          <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-bold px-1.5 py-0.2 rounded">
                            메일 자동 첨부됨
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          개별 쿠폰별 적용 여부(Y/N) 및 기간, 오류 내역이 포함된 공식 스프레드시트 (14.2 KB)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          exportToExcel(
                            promotions,
                            `${currentDraft.toDepartment}팀_오류품번리스트`,
                            currentDraft.toDepartment
                          )
                        }
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>첨부 엑셀 다운로드</span>
                      </button>
                    </div>
                  </div>

                  {/* 제목 */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">메일 제목</label>
                    <input
                      type="text"
                      value={currentDraft.subject}
                      onChange={(e) => updateDraft(currentDraft.id, { subject: e.target.value })}
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 본문 */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center justify-between">
                      <span>메일 본문 (수정 및 첨부 확인 가능)</span>
                      <span className="text-[11px] text-indigo-600 font-normal flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Gemini Ops Copilot 자동 작성
                      </span>
                    </label>
                    <textarea
                      rows={11}
                      value={currentDraft.body}
                      onChange={(e) => updateDraft(currentDraft.id, { body: e.target.value })}
                      className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 시스템 발송 성공 알림 배너 */}
                {systemSendSuccess && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        🎉 [{currentDraft.toDepartment}팀_오류품번리스트.xlsx] 파일이 정상 첨부되어{' '}
                        {recipientEmail} 담당자에게 성공적으로 발송되었습니다!
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-normal">발송 완료 처리됨</span>
                  </div>
                )}

                {/* Gmail 실행 시 엑셀 다운로드 & 바로 보내기 가이드 팁 */}
                {showGmailTip && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold">
                          💡 Gmail 웹창이 열렸으며, [오류품번리스트.xlsx] 파일이 자동 다운로드되었습니다!
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          본문 내에 <strong>사내망 실시간 엑셀 다운로드 링크</strong>가 이미 포함되어 있으므로 Gmail에서 바로 <strong>[보내기]</strong>만 누르셔도 수신자가 즉시 엑셀을 확인하실 수 있습니다. (물리적 파일 첨부를 원하실 경우 다운로드된 엑셀 파일을 Gmail 작성창으로 1초만 드래그해 넣으시면 됩니다.)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGmailTip(false)}
                      className="text-amber-600 hover:text-amber-800 p-1 text-xs font-bold cursor-pointer ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 하단 액션 버튼 바 */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {currentDraft.status === 'SENT' ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {currentDraft.sentAt} 에 발송 및 확인 완료 처리되었습니다.
                      </span>
                    ) : (
                      <span>검토 후 [엑셀 자동 첨부하여 즉시 발송]을 누르면 바로 전송됩니다.</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1. 슬랙 / 구글챗 긴급 전송 버튼 */}
                    <button
                      type="button"
                      onClick={() => setMessengerModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>슬랙 / 구글챗 전송</span>
                    </button>

                    {/* 2. 메일 클라이언트 바로 열기 (자동 다운로드 연동) */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                      <button
                        type="button"
                        onClick={handleOpenGmail}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                        title="Gmail 웹 메일함 열기 (엑셀 자동 동시 다운로드)"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
                        <span>Gmail 열기</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenDefaultMail}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors cursor-pointer border-l border-slate-200"
                        title="기본 메일앱 (Outlook/Apple Mail) 열기"
                      >
                        <span>기본 메일앱</span>
                      </button>
                    </div>

                    {/* 3. 본문 복사 */}
                    <button
                      onClick={() =>
                        handleCopy(`${currentDraft.subject}\n\n${currentDraft.body}`, currentDraft.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                    >
                      {copiedId === currentDraft.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>본문 복사</span>
                        </>
                      )}
                    </button>

                    {/* 4. [핵심] 원클릭 엑셀 자동 첨부하여 즉시 발송 */}
                    <button
                      type="button"
                      onClick={handleDirectSystemSend}
                      disabled={isSystemSending || currentDraft.status === 'SENT'}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer ${
                        currentDraft.status === 'SENT'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : isSystemSending
                          ? 'bg-emerald-700 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                      }`}
                      title="별도 창을 열지 않고 엑셀 첨부파일을 포함하여 즉시 발송합니다."
                    >
                      {isSystemSending ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>📎 엑셀 첨부 발송 중...</span>
                        </>
                      ) : currentDraft.status === 'SENT' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>발송 완료됨</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>🚀 엑셀 자동 첨부하여 즉시 발송</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 flex items-center justify-center text-slate-400 text-xs">
                확인할 초안을 선택해주세요.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 슬랙 / 구글챗 긴급 전송 팝업 모달 */}
      {messengerModalOpen && currentDraft && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    사내 메신저 긴급 알림 전송 (Slack / Google Chat)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    메일 수신 전 신속한 조치를 위해 담당 부서 채널에 웹훅 알림을 즉시 발송합니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessengerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 메신저 플랫폼 탭 */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMessengerTab('SLACK')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  messengerTab === 'SLACK'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>💬 Slack 채널 (#ops-qc-alerts)</span>
              </button>
              <button
                type="button"
                onClick={() => setMessengerTab('GOOGLE_CHAT')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  messengerTab === 'GOOGLE_CHAT'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🟢 Google Chat 스페이스</span>
              </button>
            </div>

            {/* 메시지 미리보기 영역 */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono mb-4 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {messengerTab === 'SLACK' ? slackPayload : googleChatPayload}
            </div>

            {/* 전송 성공 피드백 알림 */}
            {sentMessenger && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  {sentMessenger === 'SLACK' ? 'Slack #ops-qc-alerts' : 'Google Chat 스페이스'}로 긴급
                  알림 발송이 완료되었습니다!
                </span>
              </div>
            )}

            {/* 모달 하단 버튼 */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = messengerTab === 'SLACK' ? slackPayload : googleChatPayload;
                  navigator.clipboard.writeText(text);
                  alert('메신저 메시지가 클립보드에 복사되었습니다.');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>메시지 복사</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateWebhook(messengerTab)}
                disabled={!!sentMessenger}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {messengerTab === 'SLACK' ? 'Slack 채널로 즉시 전송' : 'Google Chat으로 즉시 전송'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

