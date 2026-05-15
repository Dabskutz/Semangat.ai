import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

const MODELS = [
  'models/gemini-2.0-flash-lite-preview-02-05', // Versi spesifik yang sering lebih stabil
  'models/gemini-1.5-flash',
  'models/gemini-1.5-flash-8b'
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
    
    for (const modelId of MODELS) {
      try {
        console.log(`[API CHAT] Trying model: ${modelId}...`);
        
        const result = await generateText({
          // @ts-ignore
          model: google(modelId),
          messages,
          system: 'Anda adalah motivator Indonesia. Berikan kata-kata semangat yang sangat singkat dan puitis. JANGAN gunakan format markdown. Kirimkan teks murni saja.',
        });

        if (result && result.text && result.text.trim().length > 0) {
          const cleanText = result.text.replace(/[*_#`~]/g, '').trim();
          console.log(`[API CHAT] Success with ${modelId}: ${cleanText.substring(0, 20)}...`);
          
          return new Response(JSON.stringify({ text: cleanText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        console.warn(`[API CHAT] Model ${modelId} returned empty text`);
      } catch (error: any) {
        console.warn(`[API CHAT] Model ${modelId} failed:`, error.message);
        lastError = error;
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
