import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API Key tidak ditemukan. Pastikan variabel GOOGLE_GENERATIVE_AI_API_KEY sudah diatur di Vercel Settings > Environment Variables.' 
        }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah seorang motivator yang hangat dan bijaksana. Berikan kata-kata penyemangat singkat, puitis, dan gunakan bahasa yang santai namun menyentuh hati. Berikan respon dalam Bahasa Indonesia sesuai dengan mood atau perasaan yang disampaikan pengguna.',
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('API Route Error:', error);
    
    // Tangkap error spesifik dari Google/Gemini
    const errorMessage = error.message || 'Terjadi kesalahan pada server.';
    
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
