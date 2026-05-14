import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Menentukan durasi maksimum eksekusi (penting untuk Vercel)
export const maxDuration = 30;
// Memastikan route tidak di-cache secara statis
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[API CHAT] Request received');
  
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      console.error('[API CHAT] Invalid messages format');
      return new Response(
        JSON.stringify({ error: 'Format pesan tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('[API CHAT] GOOGLE_GENERATIVE_AI_API_KEY is missing');
      return new Response(
        JSON.stringify({ error: 'API Key Gemini tidak ditemukan. Pastikan sudah diatur di Environment Variables Vercel.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[API CHAT] Starting streamText with ${messages.length} messages`);

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah seorang motivator yang hangat dan bijaksana. Berikan kata-kata penyemangat singkat, puitis, dan gunakan bahasa yang santai namun menyentuh hati. Berikan respon dalam Bahasa Indonesia sesuai dengan mood atau perasaan yang disampaikan pengguna.',
    });

    console.log('[API CHAT] Stream started successfully');
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('[API CHAT] DETAILED ERROR:', error);
    
    // Memberikan respons yang lebih detail ke client untuk mempermudah debug
    return new Response(
      JSON.stringify({ 
        error: 'Terjadi kesalahan pada server saat memproses permintaan.',
        details: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
