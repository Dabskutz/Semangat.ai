import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Menggunakan Edge Runtime karena seringkali lebih stabil untuk streaming di Vercel
export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('[API CHAT] Request start (Edge Runtime)');
  
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('[API CHAT] Error: API Key missing');
      return new Response(JSON.stringify({ error: 'API Key tidak ditemukan.' }), { status: 401 });
    }

    // Verifikasi sederhana format API Key Gemini
    console.log('[API CHAT] API Key Check:', apiKey.startsWith('AIza') ? 'Format Valid (AIza...)' : 'Format Tidak Valid!');

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan kata-kata semangat yang sangat singkat dan puitis.',
    });

    console.log('[API CHAT] Stream response generated');
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('[API CHAT] Edge Error:', error);
    return new Response(
      JSON.stringify({ error: 'Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
