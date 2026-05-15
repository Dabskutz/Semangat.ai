import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('[API CHAT] Request start (OpenAI Mode)');
  
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API Key missing' }), { status: 401 });
    }

    console.log('[API CHAT] Generating text with gpt-4o...');

    const { text } = await generateText({
      // @ts-ignore - Version mismatch between ai v4 and openai v3 types
      model: openai('gpt-4o'),
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
