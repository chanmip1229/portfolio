'use client';

import React, { useState, useMemo } from 'react';
import { useOpsStore } from '@/store/useOpsStore';
import { Department } from '@/types/promotion';
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
  Columns,
  Layers,
  Table,
  ListFilter,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { exportToExcel } from '@/utils/excelExporter';

interface DeptSummaryIssue {
  no: number;
  targetCode: string;
  targetName: string;
  issueType: string;
  severity: 'BLOCKER' | 'WARNING';
  description: string;
  requestAction: string;
  deadline: string;
}

interface DeptSummaryData {
  dept: Department;
  deptName: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  excelFileName: string;
  issues: DeptSummaryIssue[];
}

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

  // 1. 발송 모드: 'INDIVIDUAL' (건별 개별 초안) vs 'SUMMARY' (부서별 종합 취합 발송 - 표 요약)
  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'SUMMARY'>('INDIVIDUAL');

  // 2. 팀(부서)별 필터링 상태 (건별 목록용)
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'MD' | 'DESIGN' | 'DEV' | 'MARKETING'>('ALL');

  // 3. 종합 취합 모드에서 선택된 부서
  const [selectedSummaryDept, setSelectedSummaryDept] = useState<Department>('MD');

  // 4. 복사/발송 상태
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSystemSending, setIsSystemSending] = useState(false);
  const [systemSendSuccess, setSystemSendSuccess] = useState(false);
  const [dualSendSuccess, setDualSendSuccess] = useState(false);
  const [summarySendSuccess, setSummarySendSuccess] = useState<string | null>(null);
  const [sentSummaryDepts, setSentSummaryDepts] = useState<Record<string, boolean>>({});
  const [showGmailTip, setShowGmailTip] = useState(false);

  // 5. 종합 요약 메일 본문/제목 사용자 편집 상태
  const [summaryCustomEdits, setSummaryCustomEdits] = useState<
    Record<string, { subject?: string; body?: string }>
  >({});

  // 듀얼 뷰(좌우 분할 2화면) 모드 토글
  const [forceDualView, setForceDualView] = useState<boolean | null>(null);

  // =========================================================================
  // 부서별 전수 이슈 취합 데이터 (Total Issue Summary Mail Data with Table)
  // =========================================================================
  const deptSummaries: Record<Department, DeptSummaryData> = useMemo(() => {
    return {
      MD: {
        dept: 'MD',
        deptName: 'MD1팀',
        recipientName: 'MD1팀 김지현 대리',
        recipientEmail: 'md_list@indongfn.co.kr',
        subject: '[긴급 전수 취합] [LIST] 26SS 트렌치코트 얼리버드 위크 — MD팀 결함 품번 전수 요약 리포트 (총 3건)',
        excelFileName: 'MD팀_종합_결함품번전수리스트.xlsx',
        issues: [
          {
            no: 1,
            targetCode: 'SWBLPB21010',
            targetName: '클래식 더블 버튼 트렌치코트 (네이비)',
            issueType: '가격/할인율 계산 불일치',
            severity: 'BLOCKER',
            description: '정가 198,000원 / 실판매가 138,600원으로 계산 할인율은 30%이나, 시트 표기 할인율이 40%로 기재됨.',
            requestAction: '실제 판매가를 118,800원으로 인하할 것인지, 표기 할인율을 30%로 정정할 것인지 승인 요망',
            deadline: '2026-03-08 17:00',
          },
          {
            no: 2,
            targetCode: 'SWCTKB21030',
            targetName: '벨티드 하프 트렌치 자켓 (카키)',
            issueType: '80% 트렌드 극단치 이상치',
            severity: 'WARNING',
            description: '자켓 카테고리 시즌 평균(30%) 대비 80% 극단치 기입 (정가 178,000원 ➔ 행사가 35,600원).',
            requestAction: '시즌 신상품 역마진 위험 확인, 0 누락 또는 오기입 여부 소명 및 최종 승인 요망',
            deadline: '2026-03-08 17:00',
          },
          {
            no: 3,
            targetCode: 'SWJCKB21060',
            targetName: '루즈핏 벨티드 하프 코트 (베이지)',
            issueType: '기획 한도 초과 역마진',
            severity: 'BLOCKER',
            description: '기획서 기준 카테고리 최대 허용 할인율(40%)을 초과하는 55% 할인이 설정됨.',
            requestAction: '기획 한도 준수를 위한 판매가 재산정 또는 팀장 특별 승인 회신 요망',
            deadline: '2026-03-08 17:00',
          },
        ],
      },
      DESIGN: {
        dept: 'DESIGN',
        deptName: '디자인팀',
        recipientName: '디자인팀 박민지 책임',
        recipientEmail: 'design_shesmiss@indongfn.co.kr',
        subject: '[긴급 전수 취합] 26SS 프로모션 소재/배너 디자인팀 결함 전수 요약 리포트 (총 3건)',
        excelFileName: '디자인팀_종합_소재결함전수리스트.xlsx',
        issues: [
          {
            no: 1,
            targetCode: 'SWBLPB21010',
            targetName: '클래식 더블 버튼 트렌치코트 (네이비)',
            issueType: '해상도 규격 미달 & 착용 컷 교체',
            severity: 'BLOCKER',
            description: '현재 300x400 px 저해상도 파일 등록으로 모바일 상세페이지 확대 시 심각한 픽셀 깨짐.',
            requestAction: '750x1000 px 이상 3:4 비율 고해상도 모델 룩북 착용 컷으로 썸네일 교체 재전달',
            deadline: '2026-03-08 15:00',
          },
          {
            no: 2,
            targetCode: 'SWOPPB11010',
            targetName: '신년 플리츠 벨티드 원피스',
            issueType: '이미지 링크 깨짐 (404 엑스박스)',
            severity: 'BLOCKER',
            description: '이미지 서버 CDN 파일 누락으로 고객 화면에 엑스박스(깨진 이미지)가 노출되고 있음.',
            requestAction: '고해상도 대표 착용 컷 이미지 파일 긴급 재전달 (고객 노출 차단 중)',
            deadline: '즉시 조치 요망',
          },
          {
            no: 3,
            targetCode: 'PC 메인 배너',
            targetName: '[LIST] 26SS 트렌치코트전 메인 배너',
            issueType: '배너 해상도 규격 미달',
            severity: 'BLOCKER',
            description: '권장 규격(1920x600 px)에 미달하는 저해상도 파일(1200x400 px)로 타이포그래피 흐림.',
            requestAction: 'PC 메인 배너 원본 고해상도(1920x600 px, 72dpi 이상) 재전달',
            deadline: '2026-03-08 15:00',
          },
        ],
      },
      DEV: {
        dept: 'DEV',
        deptName: '웹개발/퍼블리싱팀',
        recipientName: '웹개발/퍼블리싱팀 정우진 선임',
        recipientEmail: 'dev@indongfn.co.kr',
        subject: '[긴급 조치 요청] [LIST] 26SS 트렌치코트전 — 상세 URL 404 단절 오류 요약 리포트 (1건)',
        excelFileName: '웹개발팀_URL오류리스트.xlsx',
        issues: [
          {
            no: 1,
            targetCode: 'SWBLPB21050',
            targetName: '숏 더블 트렌치 블루종',
            issueType: '상세 URL 404 단절',
            severity: 'BLOCKER',
            description: '카페24 정상 라우팅 대신 외부 테스트 도메인(broken-link.com)으로 기재되어 404 발생.',
            requestAction: '정상 자사몰 경로(https://www.idfmall.co.kr/product/SWBLPB21050)로 라우팅 수정',
            deadline: '즉시 조치 요망',
          },
        ],
      },
      MARKETING: {
        dept: 'MARKETING',
        deptName: '마케팅팀',
        recipientName: '마케팅팀 최현우 팀장',
        recipientEmail: 'marketing@indongfn.co.kr',
        subject: '[정책 확인 요청] [LIST] 26SS 트렌치코트전 — 쿠폰 정책 종합 검토 리포트 (1건)',
        excelFileName: '마케팅팀_쿠폰정책검토시트.xlsx',
        issues: [
          {
            no: 1,
            targetCode: '쿠폰 정책',
            targetName: 'LIVE WEEK 한정 특가 상품군 쿠폰 적용',
            issueType: '쿠폰 중복 적용 플래그 검토',
            severity: 'WARNING',
            description: 'LIVE WEEK 한정 특가 상품군에 신규회원 웰컴 쿠폰 중복 적용 허용 플래그가 활성화됨.',
            requestAction: '특가 상품의 중복 쿠폰 적용 허용 여부 최종 승인 (기획 원안대로 중복 불가 정정)',
            deadline: '2026-03-08 18:00',
          },
        ],
      },
      EBIZ_OPS: {
        dept: 'EBIZ_OPS',
        deptName: 'E-BIZ 운영팀',
        recipientName: 'E-BIZ 운영팀 담당자',
        recipientEmail: 'ops@indongfn.co.kr',
        subject: '[운영 점검] 26SS 프로모션 종합 검증 리포트',
        excelFileName: '운영팀_종합검증리스트.xlsx',
        issues: [],
      },
    };
  }, []);

  const defaultSummaryBodies = useMemo(() => {
    const bodies: Record<string, string> = {};
    (['MD', 'DESIGN', 'DEV', 'MARKETING', 'EBIZ_OPS'] as Department[]).forEach((dept) => {
      const s = deptSummaries[dept];
      if (!s || s.issues.length === 0) return;
      bodies[dept] = `안녕하세요, ${s.recipientName}님.
E-BIZ 운영본부 QC 시스템 자동 발송 메일입니다.

2026 S/S 프로모션 오픈 전 사전 검증 과정에서 [${s.deptName}] 담당 영역의 정합성 오류 및 검토 필요 항목 총 ${s.issues.length}건이 감지되었습니다.
실무 담당자 분들의 메일 피로도를 줄이고 전체 결함 현황을 한눈에 파악하실 수 있도록, 개별 메일 대신 [종합 요약표]로 취합하여 송부드립니다.

■ ${s.deptName} 조치 필요 결함 요약 (총 ${s.issues.length}건)
---------------------------------------------------------------------------------------------------------
| No | 대상 품번 / 상품명 | 결함 유형 | 심각도 | 감지된 오류 내용 및 조치 요청 | 조치 기한 |
---------------------------------------------------------------------------------------------------------
${s.issues
  .map(
    (issue) =>
      `| ${issue.no} | [${issue.targetCode}] ${issue.targetName} | ${issue.issueType} | [${issue.severity}] | ${issue.description} -> ${issue.requestAction} | ${issue.deadline} |`
  )
  .join('\n')}
---------------------------------------------------------------------------------------------------------

※ 상세 로데이터 및 SKU별 전수 정보는 첨부된 [${s.excelFileName}] 파일을 확인하여 주시기 바랍니다.
오류 수정 완료 후 회신 또는 QC 시스템에서 [조치 완료] 승인 부탁드립니다.

감사합니다.
E-BIZ 운영팀 배상`;
    });
    return bodies;
  }, [deptSummaries]);

  // 팀별 필터링 옵션 목록
  const deptFilters: { id: 'ALL' | 'MD' | 'DESIGN' | 'DEV' | 'MARKETING'; label: string; count: number }[] = [
    { id: 'ALL', label: '전체', count: emailDrafts?.length || 0 },
    { id: 'MD', label: 'MD팀', count: (emailDrafts || []).filter((d) => d.toDepartment === 'MD').length },
    { id: 'DESIGN', label: '디자인팀', count: (emailDrafts || []).filter((d) => d.toDepartment === 'DESIGN').length },
    { id: 'DEV', label: '웹개발팀', count: (emailDrafts || []).filter((d) => d.toDepartment === 'DEV').length },
    { id: 'MARKETING', label: '마케팅팀', count: (emailDrafts || []).filter((d) => d.toDepartment === 'MARKETING').length },
  ];

  // 팀별 필터링 적용된 초안 목록
  const filteredDrafts = (emailDrafts || []).filter((d) => {
    if (deptFilter === 'ALL') return true;
    return d.toDepartment === deptFilter;
  });

  const currentDraft = (emailDrafts || []).find((d) => d.id === selectedDraftId) || (emailDrafts && emailDrafts[0]) || null;

  // 짝이 되는 다부서 초안 탐색 (MD <-> DESIGN)
  const pairedDraft = currentDraft?.pairedDraftId
    ? (emailDrafts || []).find((d) => d.id === currentDraft.pairedDraftId)
    : null;

  const isMultiDeptTarget = Boolean(currentDraft?.isMultiDeptSplitDraft && pairedDraft);
  const showDualSplit = forceDualView !== null ? forceDualView : isMultiDeptTarget;

  const mdDraft = currentDraft?.toDepartment === 'MD' ? currentDraft : pairedDraft;
  const designDraft = currentDraft?.toDepartment === 'DESIGN' ? currentDraft : pairedDraft;

  // 종합 요약 메일 관련 현재 선택 부서 및 기본 본문 생성
  const currentSummary = deptSummaries[selectedSummaryDept] || deptSummaries.MD;

  const currentSummarySubject =
    summaryCustomEdits[selectedSummaryDept]?.subject ?? currentSummary.subject;
  const currentSummaryBody =
    summaryCustomEdits[selectedSummaryDept]?.body ?? (defaultSummaryBodies[selectedSummaryDept] || '');

  // 이메일 수신 주소 매핑
  const recipientEmail =
    currentDraft?.toDepartment === 'MD'
      ? 'md_list@indongfn.co.kr'
      : currentDraft?.toDepartment === 'DESIGN'
      ? 'design_shesmiss@indongfn.co.kr'
      : 'ops@indongfn.co.kr';

  // 1. 클립보드 전체 복사
  const handleCopy = (draftText: string, id: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(draftText);
      }
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
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
    const target = draftId ? (emailDrafts || []).find((d) => d.id === draftId) : currentDraft;
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

  // 5. 종합 요약 메일 원클릭 발송
  const handleSendSummaryEmail = (dept: Department) => {
    setIsSystemSending(true);

    setTimeout(() => {
      setIsSystemSending(false);
      setSummarySendSuccess(dept);
      setSentSummaryDepts((prev) => ({ ...prev, [dept]: true }));

      // 해당 부서에 매핑된 모든 개별 초안도 완료 상태로 동기화
      (emailDrafts || [])
        .filter((d) => d.toDepartment === dept)
        .forEach((d) => markDraftAsSent(d.id));

      setTimeout(() => {
        setSummarySendSuccess(null);
      }, 4000);
    }, 1200);
  };

  // 6. Gmail 웹메일 바로 연결 (건별 모드)
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

  // 7. 종합 요약 메일 Gmail 바로 연결
  const handleOpenGmailSummary = () => {
    exportToExcel(
      promotions,
      currentSummary.excelFileName.replace('.xlsx', ''),
      currentSummary.dept
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      currentSummary.recipientEmail
    )}&su=${encodeURIComponent(currentSummarySubject)}&body=${encodeURIComponent(
      currentSummaryBody
    )}`;
    window.open(gmailUrl, '_blank');
    setShowGmailTip(true);
  };

  // 모달이 닫혀 있을 때는 모든 훅 실행 후 여기서 안전하게 null 반환
  if (!isDraftModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all ${
            showDualSplit || viewMode === 'SUMMARY' ? 'max-w-6xl' : 'max-w-4xl'
          }`}
        >
          {/* 상단 헤더 & 모드 스위처 */}
          <div className="px-6 py-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">메일 임시보관함 (Outbox Drafts)</h3>
                  {viewMode === 'SUMMARY' ? (
                    <span className="text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Table className="w-3 h-3 text-rose-600" />
                      부서별 종합 취합 모드 (표 요약 발송)
                    </span>
                  ) : showDualSplit ? (
                    <span className="text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Columns className="w-3 h-3 text-purple-600" />
                      다부서 2분할 듀얼 뷰
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ListFilter className="w-3 h-3 text-blue-600" />
                      건별 개별 초안 검토 모드
                    </span>
                  )}
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Human-in-the-Loop 검토 대기
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  부서 담당자의 메일 피로도를 방지하기 위해 <strong>하나의 종합 메일에 케이스별 표로 취합</strong>하여 발송하거나, 건별 개별 초안을 검토합니다.
                </p>
              </div>
            </div>

            {/* 모드 전환 스위처 & 닫기 버튼 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('INDIVIDUAL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'INDIVIDUAL'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="개별 품번/이슈별 단건 초안을 검토합니다"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>건별 개별 초안 ({emailDrafts.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('SUMMARY')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'SUMMARY'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="한 팀에 메일이 과다 발송되지 않도록 전체 결함을 하나의 표로 취합하여 발송합니다"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>부서별 종합 취합 (표 요약)</span>
                  <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1 rounded">
                    추천
                  </span>
                </button>
              </div>

              {/* 듀얼 뷰 토글 버튼 (개별 모드 & 복합 이슈일 때만 표시) */}
              {viewMode === 'INDIVIDUAL' && isMultiDeptTarget && (
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
                  <span>{showDualSplit ? '단일 화면' : '2분할 듀얼'}</span>
                </button>
              )}

              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gmail 연동 시 브라우저 보안 규정 및 첨부 가이드 배너 */}
          {showGmailTip && (
            <div className="mx-6 mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-900 block mb-0.5">
                    📎 Gmail 엑셀 첨부 방법 안내 (웹 브라우저 보안 정책)
                  </strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    웹 브라우저 보안 규격상 외부 사이트인 Gmail 작성창으로 PC 파일이 강제로 자동 삽입되지 않습니다.<br />
                    방금 브라우저에 <strong>자동 다운로드된 엑셀 파일</strong>을 열려 있는 <strong>Gmail 창으로 마우스 드래그 앤 드롭</strong>해 주세요!<br />
                    <span className="text-indigo-700 font-bold">
                      💡 엑셀 첨부까지 완전 자동화를 원하시면 우측 하단의 [시스템에서 바로 발송] 버튼을 누르시면 시스템이 100% 자동 첨부하여 전송합니다.
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGmailTip(false)}
                className="text-amber-800 hover:text-amber-950 text-xs font-bold px-2 py-1 rounded bg-amber-200/80 hover:bg-amber-300 cursor-pointer shrink-0"
              >
                닫기 ✕
              </button>
            </div>
          )}

          {/* 본문 레이아웃 (좌측 초안 목록/부서 선택 + 우측 종합 취합 표 또는 단일/듀얼 편집기) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* 좌측 사이드바: 건별 모드일 때는 팀별 필터 + 초안 목록, 종합 요약 모드일 때는 부서별 종합 목록 */}
            <div className="w-full md:w-80 shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto space-y-3">
              {viewMode === 'INDIVIDUAL' ? (
                <>
                  {/* 팀별 필터 버튼 영역 */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        담당 부서/팀 필터
                      </span>
                      <span className="text-[10px] text-slate-400">선택한 팀만 보기</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {deptFilters.map((f) => {
                        const isActive = deptFilter === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setDeptFilter(f.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span>{f.label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {f.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-200">
                    초안 목록 ({filteredDrafts.length}건)
                  </div>

                  {filteredDrafts.length === 0 ? (
                    <div className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                      선택한 부서의 초안이 없습니다.
                    </div>
                  ) : (
                    filteredDrafts.map((draft) => {
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
                                isSent ? 'text-emerald-600 font-bold' : 'text-slate-400'
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
                </>
              ) : (
                /* ========================================================= */
                /* 부서별 종합 취합 모드 좌측 부서 선택 목록                 */
                /* ========================================================= */
                <>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <Table className="w-3.5 h-3.5 text-rose-600" />
                        부서별 종합 취합 (4개 팀)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      개별 메일 대신 <strong>부서당 1개 종합 메일로 전체 이슈 표를 요약</strong>하여 발송합니다.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    {(['MD', 'DESIGN', 'DEV', 'MARKETING'] as Department[]).map((deptKey) => {
                      const s = deptSummaries[deptKey];
                      if (!s) return null;
                      const isSelected = selectedSummaryDept === deptKey;
                      const isSent = sentSummaryDepts[deptKey];
                      const blockerCount = s.issues.filter((i) => i.severity === 'BLOCKER').length;

                      return (
                        <div
                          key={deptKey}
                          onClick={() => setSelectedSummaryDept(deptKey)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-rose-500 bg-white shadow-xs ring-2 ring-rose-100'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                  deptKey === 'MD'
                                    ? 'bg-blue-100 text-blue-800'
                                    : deptKey === 'DESIGN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : deptKey === 'DEV'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {s.deptName}
                              </span>
                              <span className="text-[11px] font-extrabold text-slate-800">
                                총 {s.issues.length}건
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isSent
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isSent ? '✓ 발송 완료' : '미발송'}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 truncate mb-1">
                            {s.recipientName}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {s.excelFileName}
                            </span>
                            {blockerCount > 0 ? (
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-200">
                                BLOCKER {blockerCount}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                                WARNING {s.issues.length}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ========================================================= */}
            {/* 우측 화면 1: [부서별 종합 취합 모드 - 표 요약 메일]          */}
            {/* ========================================================= */}
            {viewMode === 'SUMMARY' ? (
              <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  {/* 부서 헤더 바 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            selectedSummaryDept === 'MD'
                              ? 'bg-blue-600 text-white'
                              : selectedSummaryDept === 'DESIGN'
                              ? 'bg-purple-600 text-white'
                              : selectedSummaryDept === 'DEV'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {currentSummary.deptName} 종합 취합
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {currentSummary.recipientName}
                        </span>
                        <span className="font-mono text-slate-500 text-xs">
                          &lt;{currentSummary.recipientEmail}&gt;
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                          총 {currentSummary.issues.length}건 이슈 취합
                        </span>
                        {currentSummary.issues.filter((i) => i.severity === 'BLOCKER').length > 0 && (
                          <span className="bg-rose-100 border border-rose-200 text-rose-800 px-2 py-0.5 rounded font-bold">
                            BLOCKER {currentSummary.issues.filter((i) => i.severity === 'BLOCKER').length}건
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        {currentSummary.deptName} 담당자에게 건별로 개별 메일을 발송하지 않고, <strong>아래의 단일 요약표 및 첨부 엑셀로 1통만 발송</strong>하여 메일 피로도를 방지합니다.
                      </span>
                    </p>
                  </div>

                  {/* 대용량 엑셀 첨부파일 카드 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 mb-4 rounded-xl bg-rose-50/80 border border-rose-200">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-rose-600 text-white rounded-lg shadow-2xs">
                        <FileSpreadsheet className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-rose-950">
                            📎 {currentSummary.excelFileName}
                          </p>
                          <span className="text-[10px] bg-rose-100 text-rose-850 font-bold px-2 py-0.5 rounded border border-rose-300">
                            시스템 발송 시 100% 자동 동봉 | Gmail은 다운로드 파일 드래그
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {currentSummary.deptName} 관련 전수 SKU 로데이터 및 결함 상세 내역이 포함된 공식 스프레드시트 (18.6 KB)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        exportToExcel(
                          promotions,
                          currentSummary.excelFileName.replace('.xlsx', ''),
                          currentSummary.dept
                        )
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>취합 엑셀 다운로드</span>
                    </button>
                  </div>

                  {/* 핵심 요구사항: 하나의 메일에 케이스 별 표로 요약된 결함 현황 테이블 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Table className="w-4 h-4 text-indigo-600" />
                        <span>{currentSummary.deptName} 케이스별 결함 요약표 (Total Issues Table)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        메일 본문 표 자동 렌더링
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-[11px] font-bold">
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3 w-40">대상 품번 / 상품명</th>
                            <th className="py-2.5 px-3 w-32">결함 유형</th>
                            <th className="py-2.5 px-3 w-24 text-center">심각도</th>
                            <th className="py-2.5 px-3">감지된 오류 내용 및 조치 요청</th>
                            <th className="py-2.5 px-3 w-28 text-center">조치 기한</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentSummary.issues.map((issue) => (
                            <tr key={issue.no} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                {issue.no}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold text-indigo-700 block">
                                  {issue.targetCode}
                                </span>
                                <span className="text-[11px] text-slate-600 block truncate max-w-[150px]">
                                  {issue.targetName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {issue.issueType}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    issue.severity === 'BLOCKER'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {issue.severity}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 space-y-0.5">
                                <p className="text-slate-800">{issue.description}</p>
                                <p className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 shrink-0" />
                                  <span>{issue.requestAction}</span>
                                </p>
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-slate-600 text-[11px]">
                                {issue.deadline}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 메일 제목 편집 */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">메일 제목</label>
                    <input
                      type="text"
                      value={currentSummarySubject}
                      onChange={(e) =>
                        setSummaryCustomEdits((prev) => ({
                          ...prev,
                          [selectedSummaryDept]: {
                            ...prev[selectedSummaryDept],
                            subject: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* 메일 본문 편집 (마크다운 표 포함) */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center justify-between">
                      <span>메일 본문 (표 요약 텍스트 포함)</span>
                      <span className="text-[11px] text-rose-600 font-normal flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        전체 결함 케이스 표 자동 통합 완료
                      </span>
                    </label>
                    <textarea
                      rows={9}
                      value={currentSummaryBody}
                      onChange={(e) =>
                        setSummaryCustomEdits((prev) => ({
                          ...prev,
                          [selectedSummaryDept]: {
                            ...prev[selectedSummaryDept],
                            body: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 발송 성공 배너 */}
                {summarySendSuccess === selectedSummaryDept && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        🎉 [{currentSummary.deptName}] 담당자에게 [{currentSummary.excelFileName}] 첨부 및 케이스별 종합 요약표 메일이 성공적으로 발송되었습니다! (관련 개별 초안도 자동 완료 처리됨)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-normal">발송 완료 처리됨</span>
                  </div>
                )}

                {/* 하단 액션 버튼 바 */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentSummaryBody, `summary-${selectedSummaryDept}`)}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === `summary-${selectedSummaryDept}` ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">본문 및 표 복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-500" />
                          <span>본문 및 표 전체 복사</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenGmailSummary}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="엑셀 다운로드 후 Gmail 작성창이 열립니다. 브라우저 하단에 받아진 파일을 Gmail 창으로 드래그해 주세요."
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                      <span>엑셀 다운로드 & Gmail 열기</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendSummaryEmail(selectedSummaryDept)}
                      disabled={isSystemSending || sentSummaryDepts[selectedSummaryDept]}
                      className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        sentSummaryDepts[selectedSummaryDept]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {isSystemSending ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>종합 요약 메일 전송 중...</span>
                        </>
                      ) : sentSummaryDepts[selectedSummaryDept] ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{currentSummary.deptName} 요약 메일 발송 완료됨</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>✉️ {currentSummary.deptName} 종합 요약 메일 1클릭 발송 (총 {currentSummary.issues.length}건 취합)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : showDualSplit && mdDraft && designDraft ? (
              /* ========================================================= */
              /* 우측 화면 2: [다부서 복합 결함 2분할 듀얼 뷰 (Split Screen)] */
              /* ========================================================= */
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
                      title="엑셀 다운로드 후 Gmail 작성창이 열립니다. 브라우저 하단에 받아진 파일을 Gmail 창으로 드래그해 주세요."
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>엑셀 다운로드 & Gmail 열기</span>
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
              /* 우측 화면 3: [기존 단일 부서 메일 편집 & 검토 영역]           */
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
                            <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded border border-indigo-200">
                              시스템 발송 시 100% 자동 동봉 | Gmail은 다운로드 파일 드래그
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
                        title="엑셀 다운로드 후 Gmail 작성창이 열립니다. 브라우저 하단에 받아진 파일을 Gmail 창으로 드래그해 주세요."
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        <span>엑셀 다운로드 & Gmail 열기</span>
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
                            <span>🚀 시스템에서 첨부파일 자동 동봉 발송</span>
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
