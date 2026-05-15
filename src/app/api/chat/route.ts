import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

// Konfigurasi Groq menggunakan provider OpenAI yang kompatibel
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log('[API CHAT] Generating text with Groq (Llama 3.3)...');

    const { text } = await generateText({
      // @ts-ignore
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis yang SANGAT SINGKAT sesuai dengan mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip di awal/akhir. Kirimkan teks murni saja.',
    });

    console.log('[API CHAT] Result Text:', text);

    const cleanText = (text || '').replace(/[*_#`~]/g, '').trim();
    
    return new Response(JSON.stringify({ text: cleanText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[API CHAT] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal memproses permintaan AI.', details: error.message }),
      { status: 500 }
    );
  }
}
