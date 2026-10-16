'use client';

import React from 'react';
import { Promotion } from '@/types/promotion';
import { useOpsStore } from '@/store/useOpsStore';
import {
  X,
  History,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

interface CommunicationHistoryModalProps {
  promotion: Promotion;
  isOpen: boolean;
  onClose: () => void;
  onOpenDraft?: (draftId: string) => void;
}

export default function CommunicationHistoryModal({
  promotion,
  isOpen,
  onClose,
  onOpenDraft,
}: CommunicationHistoryModalProps) {
  const { emailDrafts } = useOpsStore();

  if (!isOpen) return null;

  // 관련 메일 초안 목록
  const relatedDrafts = emailDrafts.filter(
    (d) => promotion.emailDraftIds.includes(d.id) || d.promotionId === promotion.id
  );

  // 타임라인 이벤트 구성
  const timelineEvents = [
    {
      id: 'step-planned',
      time: promotion.timestamps.plannedAt || '2026-10-01 09:30',
      title: '01. 프로모션 기획안 접수',
      sender: '기획MD 담당자',
      receiver: 'E-Biz 운영 담당 (박찬미)',
      channel: '사내 ERP / 그룹웨어 전자결재',
      status: 'DONE',
      badge: '기획 완료',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      content: `[${promotion.brand}] ${promotion.title} 행사 기본 기획안 및 목표 할인율(${promotion.targetDiscountRate}%), 오픈 일정(${promotion.startDate} ~ ${promotion.endDate})이 접수되었습니다.`,
      details: [
        '목표 할인율: UP TO ' + promotion.targetDiscountRate + '%',
        '쿠폰 정책: ' + (promotion.allowCoupon ? '쿠폰 중복 할인 허용' : '특가전 (쿠폰 제외)'),
        '초기 편성 대상 상품군: ' + (promotion.category || '시즌 아우터'),
      ],
    },
    {
      id: 'step-requested',
      time: promotion.timestamps.assetRequestedAt || '2026-10-08 14:15',
      title: '02. 단품 엑셀 및 배너 소재 요청 (D-7)',
      sender: 'E-Biz 운영 담당 (박찬미)',
      receiver: '기획MD 담당, 디자인 담당',
      channel: '사내 메일 (공통 발신)',
      status: promotion.timestamps.assetRequestedAt ? 'DONE' : 'PENDING',
      badge: promotion.timestamps.assetRequestedAt ? '요청 완료' : '대기 중',
      badgeColor: promotion.timestamps.assetRequestedAt
        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
        : 'bg-slate-100 text-slate-600 border-slate-200',
      content: '기획MD 담당 대상 행사 등록용 단품 SKU 마스터 엑셀 요청 및 디자인 담당 대상 PC(1920x600)/모바일(750x900) 메인 룩북 화보 소재 제작을 정식 요청하였습니다.',
      details: [
        '요청 기한: 오픈 D-5 18:00까지',
        '필수 회신 항목: 단품 행사가, 승인 품번, 권장 해상도 화보 파일',
      ],
    },
    {
      id: 'step-received',
      time: promotion.timestamps.dataReceivedAt || '대기 중 (미수신)',
      title: '03. 기획 엑셀 및 룩북 화보 회신',
      sender: '기획MD 담당, 디자인 담당',
      receiver: 'E-Biz 운영 담당 (박찬미)',
      channel: '사내 메일 & 대용량 파일 서버 (NAS)',
      status: promotion.timestamps.dataReceivedAt ? 'DONE' : 'WAITING',
      badge: promotion.timestamps.dataReceivedAt ? '회신 수신 완료' : '회신 대기 (D-3)',
      badgeColor: promotion.timestamps.dataReceivedAt
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
      content: promotion.timestamps.dataReceivedAt
        ? `단품 마스터 엑셀 및 메인 룩북 화보(${promotion.banner.sourceImageName || '화보 파일'}) 수신이 완료되어 사전 QC 검증 엔진으로 이관되었습니다.`
        : '디자인 담당 또는 기획MD 담당의 필수 데이터가 아직 회신되지 않았습니다. 지연 방지 리마인더 메일 또는 슬랙 넛지가 필요합니다.',
      details: promotion.timestamps.dataReceivedAt
        ? [
            `수신 화보 파일: ${promotion.banner.sourceImageName || '메인 룩북 컷'}`,
            `편성 단품 SKU: ${promotion.products.length}종 수신`,
          ]
        : ['회신 지연 시 배너 자동 합성 및 사전 QC 일정이 순연될 수 있습니다.'],
    },
    {
      id: 'step-issue',
      time: promotion.timestamps.issueDetectedAt || (promotion.qcIssues.length > 0 ? '2026-10-13 11:22' : '이슈 없음'),
      title: '04. 6가지 핵심 기준 사전 검수 및 결함 발견',
      sender: 'E-BIZ 사전 QC 자동화 엔진',
      receiver: 'E-Biz 운영 담당 (박찬미)',
      channel: '시스템 내부 룰엔진 즉시 판독',
      status: promotion.qcIssues.length > 0 ? 'ALERT' : 'PASS',
      badge: promotion.qcIssues.length > 0 ? `결함 ${promotion.qcIssues.length}건 발견` : '결함 0건 (정상)',
      badgeColor: promotion.qcIssues.length > 0
        ? 'bg-rose-100 text-rose-800 border-rose-300'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      content: promotion.qcIssues.length > 0
        ? `단품 가격 계산 오류, 404 URL, 배너 규격 미달 등 ${promotion.qcIssues.length}건의 결함이 감지되었습니다. 부서별(MD·디자인) 맞춤 요청 메일 초안이 자동 생성되었습니다.`
        : '6가지 핵심 사전 점검 기준(가격, 쿠폰, 이미지, 배너, 품번 승인, 오픈일자) 전 항목을 정상 통과하였습니다.',
      details: promotion.qcIssues.map((err) => `• [${err.department || 'MD'}] ${err.message}`),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <History className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-white font-mono">
                  {promotion.brand}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  전사 소통 & 메일 발송 히스토리
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  ID: {promotion.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {promotion.title} — 기획 접수부터 다부서 메일·슬랙 발송 내역 실시간 추적
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 연동 메커니즘 투명성 안내 배너 */}
        <div className="bg-indigo-900 text-white p-3.5 px-6 border-b border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>실시간 연동 아키텍처 안내</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              • <strong>Slack:</strong> Webhook 등록 시 사내 업무 채널로 <strong>실시간 알림이 100% 즉시 전송</strong>됩니다.<br />
              • <strong>E-Mail:</strong> 포트폴리오 안전을 위해 브라우저 기반 <strong>사내 메일 샌드박스(Outbox)</strong>에 실시간 보관되며, 사내 SMTP API와 1:1 바인딩됩니다.
            </p>
          </div>
          <span className="text-[10px] bg-white/10 text-slate-200 px-2.5 py-1 rounded border border-white/20 font-mono shrink-0 self-start sm:self-auto">
            Audit Log ID: {promotion.id}-AUDIT
          </span>
        </div>

        {/* 타임라인 본문 (스크롤) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {timelineEvents.map((evt, idx) => {
              const isAlert = evt.status === 'ALERT';
              const isWaiting = evt.status === 'WAITING';
              const isDone = evt.status === 'DONE';

              return (
                <div key={evt.id} className="relative group">
                  {/* 타임라인 노드 아이콘 */}
                  <div
                    className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-transform group-hover:scale-110 ${
                      isAlert
                        ? 'border-rose-500 text-rose-500 ring-2 ring-rose-100'
                        : isWaiting
                        ? 'border-amber-500 text-amber-500 ring-2 ring-amber-100 animate-pulse'
                        : isDone
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-slate-300 text-slate-400'
                    }`}
                  >
                    {isAlert ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : isWaiting ? (
                      <Clock className="w-3 h-3" />
                    ) : isDone ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* 타임라인 카드 */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{evt.title}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${evt.badgeColor}`}>
                          {evt.badge}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        {evt.time}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span><strong>발신:</strong> {evt.sender}</span>
                      <span>➔</span>
                      <span><strong>수신:</strong> {evt.receiver}</span>
                      <span className="text-slate-300">|</span>
                      <span><strong>채널:</strong> {evt.channel}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {evt.content}
                    </p>

                    {evt.details && evt.details.length > 0 && (
                      <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 space-y-0.5 font-mono">
                        {evt.details.map((item, dIdx) => (
                          <div key={dIdx} className={isAlert ? 'text-rose-700 font-semibold' : ''}>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 관련 메일 초안 및 발송 이력 아웃박스 섹션 */}
          {relatedDrafts.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>생성 및 발송 대기 중인 부서별 맞춤 요청 메일 ({relatedDrafts.length}건)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  클릭 시 발송 모달 원문이 즉시 열립니다
                </span>
              </div>

              <div className="space-y-2">
                {relatedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => {
                      if (onOpenDraft) {
                        onClose();
                        onOpenDraft(draft.id);
                      }
                    }}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {draft.toDepartment === 'MD' ? '기획MD 담당' : draft.toDepartment === 'DESIGN' ? '디자인 담당' : draft.toDepartment === 'DEV' ? '전산/개발 담당' : '마케팅 담당'}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {draft.subject}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        수신: {draft.recipientName} • 사유: {draft.triggerReason}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <Send className="w-3 h-3" />
                      <span>메일 열람 / 발송</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            인동FN E-BIZ 자사몰 프로모션 운영 파이프라인
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
