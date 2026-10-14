import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, text, blocks } = body;

    // 1. 요청에 포함된 Webhook URL 또는 환경변수에서 가져오기
    const targetWebhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL;

    if (!targetWebhookUrl || !targetWebhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return NextResponse.json(
        {
          success: false,
          error: '유효한 Slack Webhook URL이 설정되지 않았습니다. 우측 상단 [Slack 연동]에서 Webhook URL을 등록해 주세요.',
        },
        { status: 400 }
      );
    }

    // 2. Slack Incoming Webhook 규격에 맞게 페이로드 구성
    const payload: { text?: string; blocks?: unknown[] } = {};
    if (text) payload.text = text;
    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      payload.blocks = blocks;
    }

    // 3. Slack Webhook 엔드포인트로 전송
    const slackResponse = await fetch(targetWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await slackResponse.text();

    if (!slackResponse.ok || responseText !== 'ok') {
      return NextResponse.json(
        {
          success: false,
          error: `Slack 발송 실패: ${responseText || slackResponse.statusText}`,
        },
        { status: slackResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slack 메시지가 성공적으로 발송되었습니다.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 서버 오류';
    console.error('Slack send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Slack 발송 중 서버 에러: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
