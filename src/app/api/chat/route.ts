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

    console.log('[API CHAT] Generating text with Groq (Llama 3)...');

    const { text } = await generateText({
      model: groq('llama3-8b-8192'), // Menggunakan Llama 3 8B yang sangat cepat
      messages,
      maxTokens: 60,
      temperature: 0.7,
      system: 'Anda adalah motivator Indonesia. Berikan kata-kata semangat yang sangat singkat dan puitis (maksimal 15 kata). JANGAN gunakan format markdown. Kirimkan teks murni saja.',
    });

    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    
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
