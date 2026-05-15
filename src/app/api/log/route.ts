import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown Device';
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const message = `*👋 Website Visit*\n*IP:* \`${ip}\`\n*Device:* ${userAgent}\n*Time:* ${new Date().toLocaleString('id-ID')}`;
    
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        }),
      });
    } catch (e) {
      console.error('[VISIT LOG] Telegram failed:', e);
    }
  }

  return NextResponse.json({ status: 'logged' });
}
