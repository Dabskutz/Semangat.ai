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

    console.log('[API CHAT] Generating text with Groq (Llama 3.1)...');

    const result = await generateText({
      // @ts-ignore - Version mismatch between ai v4 and newer provider types
      model: groq('llama-3.1-8b-instant'),
      messages,
      maxTokens: 100,
      temperature: 0.8,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat kata-kata semangat yang puitis dan menginspirasi. JANGAN gunakan format markdown. Kirimkan teks murni saja.',
    });

    const cleanText = (result.text || '').replace(/[*_#`~]/g, '').trim();
    
    console.log('[API CHAT] AI Response:', cleanText);
    
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
