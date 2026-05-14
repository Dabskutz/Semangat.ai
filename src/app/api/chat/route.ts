import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah seorang motivator yang hangat dan bijaksana. Berikan kata-kata penyemangat singkat, puitis, dan gunakan bahasa yang santai namun menyentuh hati. Berikan respon dalam Bahasa Indonesia sesuai dengan mood atau perasaan yang disampaikan pengguna.',
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
