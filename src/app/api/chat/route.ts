import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('[API CHAT] Request start (Google Mode)');
  
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google API Key missing' }), { status: 401 });
    }

    console.log('[API CHAT] Generating text with gemini-1.5-flash...');

    const { text } = await generateText({
      // @ts-ignore - Version mismatch between ai v4 and google v3 types
      model: google('models/gemini-1.5-flash'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan kata-kata semangat yang sangat singkat dan puitis. JANGAN gunakan format markdown sama sekali (seperti **, *, _, `). Kirimkan teks murni saja.',
    });

    // Membersihkan markdown jika masih ada
    const cleanText = text.replace(/[*_#`~]/g, '');

    console.log('[API CHAT] Generation successful');
    return new Response(JSON.stringify({ text: cleanText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[API CHAT] Generation Error:', error);
    return new Response(
      JSON.stringify({ error: 'Server Error', details: error.message }),
      { status: 500 }
    );
  }
}
