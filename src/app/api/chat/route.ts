import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[API CHAT] New Request Received');
  
  try {
    const { messages } = await req.json();
    console.log('[API CHAT] Messages Payload:', JSON.stringify(messages));
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('[API CHAT] CRITICAL: API Key is missing from ENV');
      return new Response(JSON.stringify({ error: 'API Key Gemini tidak ditemukan.' }), { status: 401 });
    }

    console.log('[API CHAT] Initiating streamText with gemini-1.5-flash-latest...');

    const result = await streamText({
      model: google('gemini-1.5-flash-latest', {
        // Longgarkan safety settings untuk menghindari pemblokiran palsu pada kata-kata emosional
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      }),
      messages,
      system: 'Anda adalah seorang motivator yang hangat dan bijaksana. Berikan kata-kata penyemangat singkat (maksimal 2-3 kalimat), puitis, dan gunakan bahasa Indonesia yang santai namun menyentuh hati. Sesuaikan dengan mood pengguna.',
      onFinish: (res) => {
        console.log('[API CHAT] Stream finished successfully. Reason:', res.finishReason);
      },
    });

    console.log('[API CHAT] Returning DataStreamResponse');
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('[API CHAT] SERVER ERROR:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Gagal memproses permintaan AI.',
        details: error.message || String(error),
        type: error.name
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
