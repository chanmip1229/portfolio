import { Department, EmailDraft } from '@/types/promotion';

export interface SlackSendParams {
  webhookUrl?: string;
  text: string;
  blocks?: unknown[];
}

export interface SlackSendResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Next.js API 라우트를 통해 실제 Slack Webhook으로 메시지를 전송합니다.
 */
export async function sendSlackMessage(params: SlackSendParams): Promise<SlackSendResult> {
  try {
    const res = await fetch('/api/slack/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Slack 메시지 발송에 실패했습니다.',
      };
    }

    return {
      success: true,
      message: data.message || 'Slack 메시지가 발송되었습니다.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '네트워크 통신 오류';
    return {
      success: false,
      error: `슬랙 발송 요청 실패: ${msg}`,
    };
  }
}

/**
 * 1. Slack 연동 테스트용 블록 키트 생성
 */
export function buildTestSlackBlocks() {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎉 [연동 성공] IDF E-Biz 운영 보드 & Slack 실시간 알림 연결 완료',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '안녕하세요! 인동FN 자사몰 **IDF E-Biz 운영 보드**와 실제 Slack 채널 연동이 정상적으로 완료되었습니다.\n앞으로 프로모션 사전 QC에서 감지된 **가격 역전, 마진 오류, 이미지 누락** 등 긴급 결함이 이 채널로 실시간 발송됩니다.',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*발송 시스템:*\nIDF E-Biz 운영 보드 (스마트 코파일럿)',
        },
        {
          type: 'mrkdwn',
          text: '*담당 운영자:*\nE-BIZ 자사몰 운영팀 박찬미',
        },
        {
          type: 'mrkdwn',
          text: '*연동 상태:*\n🟢 정상 작동 중 (Live Webhook)',
        },
        {
          type: 'mrkdwn',
          text: `*발송 일시:*\n${now}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '💡 인동FN 자사몰 프로모션 사전 QC & 무결점 런칭 데스크 • IDF E-Biz 운영 보드',
        },
      ],
    },
  ];
}

interface SummaryIssueItem {
  no: number;
  targetCode: string;
  targetName: string;
  issueType: string;
  severity: 'BLOCKER' | 'WARNING';
  description: string;
  requestAction: string;
}

interface SummaryDataInput {
  dept: Department;
  deptName: string;
  recipientName: string;
  recipientEmail: string;
  excelFileName: string;
  issues: SummaryIssueItem[];
}

/**
 * 2. 부서별 종합 요약 리포트용 블록 키트 생성 (MD / 디자인 / 개발 / 마케팅)
 */
export function buildQcSummarySlackBlocks(summary: SummaryDataInput) {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const blockerCount = summary.issues.filter((i) => i.severity === 'BLOCKER').length;
  const warningCount = summary.issues.filter((i) => i.severity === 'WARNING').length;

  const issueLines = summary.issues.map((issue) => {
    const icon = issue.severity === 'BLOCKER' ? '🚨' : '⚠️';
    const tag = issue.severity === 'BLOCKER' ? '*[BLOCKER]*' : '*[WARNING]*';
    return (
      `${icon} ${tag} *${issue.no}. \`${issue.targetCode}\` ${issue.targetName}*\n` +
      `> • *유형:* ${issue.issueType}\n` +
      `> • *오류:* ${issue.description}\n` +
      `> • *요청:* \`${issue.requestAction}\``
    );
  }).join('\n\n');

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚨 [긴급 QC] ${summary.deptName} 결함 전수 요약 리포트 (총 ${summary.issues.length}건)`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `2026 S/S 프로모션 오픈 전 사전 검증에서 *${summary.deptName}* 담당 영역의 결함 총 *${summary.issues.length}건*이 감지되었습니다.\n실무 담당자의 피로도를 줄이기 위해 개별 메시지 대신 종합 요약으로 공유드립니다.`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*수신 담당자:*\n${summary.recipientName} (<mailto:${summary.recipientEmail}|${summary.recipientEmail}>)`,
        },
        {
          type: 'mrkdwn',
          text: `*발신자:*\nE-BIZ 자사몰 운영팀 박찬미`,
        },
        {
          type: 'mrkdwn',
          text: `*결함 심각도 현황:*\n🔴 BLOCKER: ${blockerCount}건 | 🟡 WARNING: ${warningCount}건`,
        },
        {
          type: 'mrkdwn',
          text: `*첨부 엑셀 시트:*\n📎 \`${summary.excelFileName}\``,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*■ ${summary.deptName} 조치 필요 결함 상세 현황:*\n\n${issueLines}`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `※ 상세 로데이터는 메일 첨부된 \`${summary.excelFileName}\`을 참조해주세요. | 조치 완료 후 회신 또는 QC 시스템에서 승인 요망 (${now})`,
        },
      ],
    },
  ];
}

/**
 * 3. 개별 결함 건별 초안용 슬랙 블록 생성
 */
export function buildSingleDraftSlackBlocks(draft: EmailDraft) {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const deptLabel =
    draft.toDepartment === 'MD'
      ? 'MD팀'
      : draft.toDepartment === 'DESIGN'
      ? '디자인팀'
      : draft.toDepartment === 'DEV'
      ? '웹개발팀'
      : '마케팅팀';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `⚠️ [QC 알림] [${deptLabel}] ${draft.relatedProductCode || '프로모션'} 정합성 확인 요청`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*제목:* ${draft.subject}\n*발생 사유:* ${draft.triggerReason}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*수신 담당자:*\n${draft.recipientName} (${deptLabel})`,
        },
        {
          type: 'mrkdwn',
          text: '*발신:*\nE-BIZ 자사몰 운영팀 박찬미',
        },
        {
          type: 'mrkdwn',
          text: `*대상 품번:*\n\`${draft.relatedProductCode || '-'}\``,
        },
        {
          type: 'mrkdwn',
          text: `*발송 일시:*\n${now}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*■ 메일 본문 요약:*\n\`\`\`\n${draft.body.slice(0, 500)}${draft.body.length > 500 ? '...' : ''}\n\`\`\``,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `IDF E-Biz 운영 보드 • ${deptLabel} 담당자 즉시 확인 요망`,
        },
      ],
    },
  ];
}
