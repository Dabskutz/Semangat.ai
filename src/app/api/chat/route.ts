import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

const MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];

export async function POST(req: Request) {
  console.log('[API CHAT] Request start');
  
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google API Key missing' }), { status: 401 });
    }

    let lastError = null;
    
    // Looping melalui model yang tersedia (Fallback Logic)
    for (const modelId of MODELS) {
      try {
        console.log(`[API CHAT] Trying model: ${modelId}...`);
        
        const { text } = await generateText({
          // @ts-ignore - Bypass version mismatch types
          model: google(modelId),
          messages,
          system: 'Anda adalah motivator Indonesia. Berikan kata-kata semangat yang sangat singkat dan puitis. JANGAN gunakan format markdown sama sekali. Kirimkan teks murni saja.',
        });

        // Jika berhasil, bersihkan dan kirim respon
        const cleanText = text.replace(/[*_#`~]/g, '');
        console.log(`[API CHAT] Success with ${modelId}`);
        
        return new Response(JSON.stringify({ text: cleanText, model: modelId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      } catch (error: any) {
        console.warn(`[API CHAT] Model ${modelId} failed:`, error.message);
        lastError = error;
        // Lanjut ke iterasi berikutnya (model selanjutnya)
        continue;
      }
    }

    // Jika semua model gagal
    console.error('[API CHAT] All models failed');
    return new Response(
      JSON.stringify({ 
        error: 'Semua model sedang limit atau bermasalah.', 
        details: lastError?.message 
      }),
      { status: 500 }
    );

  } catch (error: any) {
    console.error('[API CHAT] Global Error:', error);
    return new Response(
      JSON.stringify({ error: 'Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
