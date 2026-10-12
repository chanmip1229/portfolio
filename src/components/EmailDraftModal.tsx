'use client';

import React, { useState } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { X, Mail, Check, Copy, AlertTriangle, Clock, Send, Sparkles } from 'lucide-react';

export default function EmailDraftModal() {
  const { isDraftModalOpen, setIsDraftModalOpen, emailDrafts, updateDraft, markDraftAsSent, selectedDraftId, setSelectedDraftId } =
    useOpsStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isDraftModalOpen) return null;

  const currentDraft = emailDrafts.find((d) => d.id === selectedDraftId) || emailDrafts[0];

  const handleCopy = (draftText: string, id: string) => {
    navigator.clipboard.writeText(draftText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendAndComplete = (id: string) => {
    markDraftAsSent(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                AI가 작성한 재확인/리마인더 메일을 운영자가 최종 검토 후 복사하여 발송할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDraftModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
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
                        {draft.emailType === 'REMINDER_DELAY' ? '⏳ 지연 리마인더' : '🚨 오류 재확인'}
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
                    <span className="font-bold text-slate-800">{currentDraft.recipientName} ({currentDraft.toDepartment})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">생성 사유:</span>
                    <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentDraft.triggerReason}
                    </span>
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
                    <span>메일 본문 (수정 가능)</span>
                    <span className="text-[11px] text-indigo-600 font-normal flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Gemini Copilot 작성 초안
                    </span>
                  </label>
                  <textarea
                    rows={12}
                    value={currentDraft.body}
                    onChange={(e) => updateDraft(currentDraft.id, { body: e.target.value })}
                    className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* 하단 액션 버튼 바 */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {currentDraft.status === 'SENT' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {currentDraft.sentAt} 에 발송(복사) 완료 처리되었습니다.
                    </span>
                  ) : (
                    <span>최종 검토 후 복사하여 사내 그룹웨어/Gmail에 붙여넣으세요.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy(`${currentDraft.subject}\n\n${currentDraft.body}`, currentDraft.id)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                  >
                    {copiedId === currentDraft.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>전체 복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendAndComplete(currentDraft.id)}
                    disabled={currentDraft.status === 'SENT'}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors ${
                      currentDraft.status === 'SENT'
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentDraft.status === 'SENT' ? '발송 완료됨' : '발송 및 확인 완료 처리'}</span>
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
  );
}
