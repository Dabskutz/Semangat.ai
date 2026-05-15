import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

// Konfigurasi Groq menggunakan provider OpenAI yang kompatibel
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Fungsi untuk mengirim log ke Telegram
async function sendToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) return;

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
    console.error('[TELEGRAM LOG] Failed to send message:', e);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown Browser';
  
  console.log(`[API CHAT] Request from IP: ${ip}`);
  
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1]?.content || 'N/A';
    
    // Log akses ke Telegram setiap kali ada yang kirim pesan
    await sendToTelegram(`*🚀 Chat Request*\n*IP:* \`${ip}\`\n*Mood/Message:* ${userMessage}\n*Device:* ${userAgent}`);

    console.log('[API CHAT] Generating text with Groq (Llama 3.1)...');

    const result = await generateText({
      // @ts-ignore - Version mismatch between ai v4 and newer provider types
      model: groq('llama-3.1-8b-instant'),
      messages,
      maxTokens: 100,
      temperature: 0.8,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat kata-kata semangat yang puitis dan menginspirasi. Jangan gunakan markdown. Kirimkan teks murni saja.',
    });

    console.log('[API CHAT] Raw Result:', JSON.stringify(result).substring(0, 100));

    let cleanText = (result.text || '').replace(/[*_#`~]/g, '').trim();
    
    // Fallback jika teks kosong
    if (!cleanText) {
      console.warn('[API CHAT] Groq returned empty text, using fallback.');
      cleanText = 'Tetaplah melangkah, karena setiap langkah kecilmu adalah awal dari kesuksesan besar.';
    }

    console.log('[API CHAT] Final Text:', cleanText);
    
    return new Response(JSON.stringify({ text: cleanText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[API CHAT] Error:', error);
    
    // Log error ke Telegram
    await sendToTelegram(`*⚠️ API Error*\n*IP:* \`${ip}\`\n*Error:* ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: 'Gagal memproses permintaan.', details: error.message }),
      { status: 500 }
    );
  }
}
