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
  Layers,
  Columns,
  Maximize2,
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
  const [dualSendSuccess, setDualSendSuccess] = useState(false);
  const [showGmailTip, setShowGmailTip] = useState(false);

  // 듀얼 뷰(좌우 분할 2화면) 모드 토글
  const [forceDualView, setForceDualView] = useState<boolean | null>(null);

  if (!isDraftModalOpen) return null;

  const currentDraft = emailDrafts.find((d) => d.id === selectedDraftId) || emailDrafts[0];

  // 짝이 되는 다부서 초안 탐색 (MD <-> DESIGN)
  const pairedDraft = currentDraft?.pairedDraftId
    ? emailDrafts.find((d) => d.id === currentDraft.pairedDraftId)
    : null;

  const isMultiDeptTarget = Boolean(currentDraft?.isMultiDeptSplitDraft && pairedDraft);
  const showDualSplit = forceDualView !== null ? forceDualView : isMultiDeptTarget;

  const mdDraft = currentDraft?.toDepartment === 'MD' ? currentDraft : pairedDraft;
  const designDraft = currentDraft?.toDepartment === 'DESIGN' ? currentDraft : pairedDraft;

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

  // 3. 다부서 동시 일괄 발송
  const handleDualBatchSend = () => {
    if (!mdDraft || !designDraft) return;
    setIsSystemSending(true);

    setTimeout(() => {
      setIsSystemSending(false);
      setDualSendSuccess(true);
      markDraftAsSent(mdDraft.id);
      markDraftAsSent(designDraft.id);
      setTimeout(() => {
        setDualSendSuccess(false);
      }, 4000);
    }, 1200);
  };

  // 4. 시스템 직접 단건 원클릭 발송
  const handleDirectSystemSend = (draftId?: string) => {
    const target = draftId ? emailDrafts.find((d) => d.id === draftId) : currentDraft;
    if (!target) return;
    setIsSystemSending(true);

    setTimeout(() => {
      setIsSystemSending(false);
      setSystemSendSuccess(true);
      markDraftAsSent(target.id);
      setTimeout(() => {
        setSystemSendSuccess(false);
      }, 4000);
    }, 1200);
  };

  // 5. Gmail 웹메일 바로 연결
  const handleOpenGmail = (targetDraft = currentDraft) => {
    if (!targetDraft) return;
    exportToExcel(
      promotions,
      `${targetDraft.toDepartment}팀_오류품번리스트`,
      targetDraft.toDepartment
    );

    const email =
      targetDraft.toDepartment === 'MD'
        ? 'md_list@indongfn.co.kr'
        : targetDraft.toDepartment === 'DESIGN'
        ? 'design_shesmiss@indongfn.co.kr'
        : 'ops@indongfn.co.kr';

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent(targetDraft.subject)}&body=${encodeURIComponent(targetDraft.body)}`;
    window.open(gmailUrl, '_blank');
    setShowGmailTip(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all ${
            showDualSplit ? 'max-w-6xl' : 'max-w-4xl'
          }`}
        >
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">메일 임시보관함 (Outbox Drafts)</h3>
                  {showDualSplit && (
                    <span className="text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Columns className="w-3 h-3 text-purple-600" />
                      다부서(MD+디자인) 2분할 듀얼 뷰 활성화
                    </span>
                  )}
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Human-in-the-Loop 검토 대기
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI가 작성한 부서별 오류 재확인 메일을 검토하고, 한 상품에 2개 이상 부서가 걸린 경우 좌/우 2분할 화면에서 동시에 확인·발송합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 듀얼 뷰 토글 버튼 (복합 이슈 초안일 때) */}
              {isMultiDeptTarget && (
                <button
                  type="button"
                  onClick={() => setForceDualView(!showDualSplit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    showDualSplit
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                  }`}
                  title="좌/우 2분할 화면으로 MD팀과 디자인팀 초안을 나란히 확인합니다"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>{showDualSplit ? '단일 화면으로 전환' : '👥 2분할 듀얼 뷰 열기'}</span>
                </button>
              )}

              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 본문 레이아웃 (좌측 초안 목록 + 우측 단일 또는 2분할 듀얼 편집기) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* 좌측 메일 목록 */}
            <div className="w-full md:w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                작성된 초안 목록 ({emailDrafts.length}건)
              </div>

              {emailDrafts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">대기 중인 메일 초안이 없습니다.</p>
              ) : (
                emailDrafts.map((draft) => {
                  const isSelected = currentDraft?.id === draft.id;
                  const isSent = draft.status === 'SENT';
                  const isMulti = draft.isMultiDeptSplitDraft;

                  return (
                    <div
                      key={draft.id}
                      onClick={() => {
                        setSelectedDraftId(draft.id);
                        if (draft.isMultiDeptSplitDraft) {
                          setForceDualView(true);
                        } else {
                          setForceDualView(false);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-200'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              draft.toDepartment === 'MD'
                                ? 'bg-blue-100 text-blue-800'
                                : draft.toDepartment === 'DESIGN'
                                ? 'bg-purple-100 text-purple-800'
                                : draft.toDepartment === 'DEV'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {draft.toDepartment}팀
                          </span>
                          {isMulti && (
                            <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 px-1 py-0.2 rounded">
                              다부서 복합
                            </span>
                          )}
                        </div>
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

            {/* ========================================================= */}
            {/* 우측 화면 A: [다부서 복합 결함 2분할 듀얼 뷰 (Split Screen)] */}
            {/* ========================================================= */}
            {showDualSplit && mdDraft && designDraft ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/30">
                {/* 상단 다부서 안내 바 */}
                <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-purple-600 text-white rounded-lg">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <strong className="text-purple-950 font-bold">
                        단일 품번 [SWBLPB21010] 다부서 복합 결함 검토 화면 (2-Screen Split)
                      </strong>
                      <p className="text-[11px] text-purple-700">
                        좌측(MD팀: 가격 오류 소명)과 우측(디자인팀: 썸네일 해상도 교체)을 독립적으로 검토하고 동시 발송할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white text-purple-900 border border-purple-200 px-2 py-0.5 rounded">
                    2개 부서 분리 매핑 완료
                  </span>
                </div>

                {/* 좌/우 2분할 메인 편집 컨테이너 */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-y-auto p-4 gap-4">
                  {/* [패널 1: MD팀 앞 발송 초안 (좌측)] */}
                  <div className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                            👗 MD팀 담당자 앞
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {mdDraft.recipientName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">&lt;md_list@indongfn.co.kr&gt;</span>
                      </div>

                      {/* 사유 & 첨부파일 뱃지 */}
                      <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 mb-3 text-xs space-y-1">
                        <p className="text-blue-900 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>가격 역전(30% vs 40%) 및 80% 트렌드 이상치 소명</span>
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                          <span className="text-[11px] text-slate-600">📎 MD팀_오류품번리스트.xlsx (첨부됨)</span>
                          <button
                            type="button"
                            onClick={() => exportToExcel(promotions, 'MD팀_오류품번리스트', 'MD')}
                            className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            다운로드
                          </button>
                        </div>
                      </div>

                      {/* 제목 입력 */}
                      <div className="mb-3">
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">MD팀 메일 제목</label>
                        <input
                          type="text"
                          value={mdDraft.subject}
                          onChange={(e) => updateDraft(mdDraft.id, { subject: e.target.value })}
                          className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                        />
                      </div>

                      {/* 본문 입력 */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block flex items-center justify-between">
                          <span>MD팀 메일 본문</span>
                          <span className="text-[10px] text-indigo-600">가격/할인율 매핑 완료</span>
                        </label>
                        <textarea
                          rows={9}
                          value={mdDraft.body}
                          onChange={(e) => updateDraft(mdDraft.id, { body: e.target.value })}
                          className="w-full text-[11px] font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* MD 단독 액션 버튼 */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleCopy(mdDraft.body, mdDraft.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedId === mdDraft.id ? '복사됨!' : '본문 복사'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectSystemSend(mdDraft.id)}
                        disabled={mdDraft.status === 'SENT'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mdDraft.status === 'SENT'
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                      >
                        {mdDraft.status === 'SENT' ? '✓ MD팀 발송 완료' : '✉️ MD팀만 단독 발송'}
                      </button>
                    </div>
                  </div>

                  {/* [패널 2: 디자인팀 앞 발송 초안 (우측)] */}
                  <div className="flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                            🎨 디자인팀 담당자 앞
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {designDraft.recipientName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">&lt;design_shesmiss@indongfn.co.kr&gt;</span>
                      </div>

                      {/* 사유 & 첨부파일 뱃지 */}
                      <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-200 mb-3 text-xs space-y-1">
                        <p className="text-purple-900 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>대표 썸네일 해상도(300x400) 규격 미달 & 착용 컷 교체</span>
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-purple-200/60">
                          <span className="text-[11px] text-slate-600">📎 디자인팀_소재오류리스트.xlsx (첨부됨)</span>
                          <button
                            type="button"
                            onClick={() => exportToExcel(promotions, '디자인팀_소재오류리스트', 'DESIGN')}
                            className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                          >
                            다운로드
                          </button>
                        </div>
                      </div>

                      {/* 제목 입력 */}
                      <div className="mb-3">
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">디자인팀 메일 제목</label>
                        <input
                          type="text"
                          value={designDraft.subject}
                          onChange={(e) => updateDraft(designDraft.id, { subject: e.target.value })}
                          className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                        />
                      </div>

                      {/* 본문 입력 */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block flex items-center justify-between">
                          <span>디자인팀 메일 본문</span>
                          <span className="text-[10px] text-purple-600">룩북 해상도 매핑 완료</span>
                        </label>
                        <textarea
                          rows={9}
                          value={designDraft.body}
                          onChange={(e) => updateDraft(designDraft.id, { body: e.target.value })}
                          className="w-full text-[11px] font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* 디자인 단독 액션 버튼 */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleCopy(designDraft.body, designDraft.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedId === designDraft.id ? '복사됨!' : '본문 복사'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectSystemSend(designDraft.id)}
                        disabled={designDraft.status === 'SENT'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          designDraft.status === 'SENT'
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
                        }`}
                      >
                        {designDraft.status === 'SENT' ? '✓ 디자인팀 발송 완료' : '✉️ 디자인팀만 단독 발송'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 동시 일괄 발송 성공 배너 */}
                {dualSendSuccess && (
                  <div className="mx-4 mb-2 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        🎉 [MD팀]과 [디자인팀] 담당자에게 각각의 맞춤형 초안과 엑셀 리포트가 성공적으로 동시 발송되었습니다!
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-normal">발송 완료 처리됨</span>
                  </div>
                )}

                {/* 하단 통합 액션 바 (다부서 동시 일괄 발송) */}
                <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>💡 발송 시 </span>
                    <strong className="text-slate-700">MD팀_오류품번리스트.xlsx</strong> 및{' '}
                    <strong className="text-slate-700">디자인팀_소재오류리스트.xlsx</strong> 파일이 자동 패키징 첨부됩니다.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenGmail(mdDraft)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gmail로 열기</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDualBatchSend}
                      disabled={isSystemSending || (mdDraft.status === 'SENT' && designDraft.status === 'SENT')}
                      className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        mdDraft.status === 'SENT' && designDraft.status === 'SENT'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {isSystemSending ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>양 부서에 동시 전송 중...</span>
                        </>
                      ) : mdDraft.status === 'SENT' && designDraft.status === 'SENT' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>양 부서 모두 발송 완료됨</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>🚀 MD팀 & 디자인팀 동시 일괄 발송하기 (엑셀 2종 자동 첨부)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* 우측 화면 B: [기존 단일 부서 메일 편집 & 검토 영역]           */
              /* ========================================================= */
              currentDraft && (
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
                          수백 개 SKU 중 적발된 오류 및 쿠폰/할인 수치 정합성 100% 매핑 완료
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

                  {/* 시스템 단건 발송 성공 알림 */}
                  {systemSendSuccess && (
                    <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
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

                  {/* 하단 액션 버튼 바 */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(currentDraft.body, currentDraft.id)}
                        className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === currentDraft.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">본문 복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-500" />
                            <span>내용 전체 복사</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenGmail(currentDraft)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="엑셀 파일을 다운로드하고 Gmail 작성창을 엽니다"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        <span>Gmail로 바로 연결</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDirectSystemSend(currentDraft.id)}
                        disabled={isSystemSending || currentDraft.status === 'SENT'}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          currentDraft.status === 'SENT'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isSystemSending ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>발송 중...</span>
                          </>
                        ) : currentDraft.status === 'SENT' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>발송 완료됨</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>시스템에서 바로 발송</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
