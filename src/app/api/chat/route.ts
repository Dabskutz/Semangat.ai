import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('--- API CHAT START ---');
  try {
    const { messages } = await req.json();
    console.log('Messages received:', messages.length);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing');
      return new Response(
        JSON.stringify({ error: 'API Key Gemini tidak ditemukan di environment variables.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    console.log('Starting streamText with model gemini-1.5-flash...');
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah seorang motivator yang hangat dan bijaksana. Berikan kata-kata penyemangat singkat, puitis, dan gunakan bahasa yang santai namun menyentuh hati. Berikan respon dalam Bahasa Indonesia sesuai dengan mood atau perasaan yang disampaikan pengguna.',
    });

    console.log('streamText started successfully, returning stream response');
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('DETAILED API ROUTE ERROR:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: error.toString() 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
