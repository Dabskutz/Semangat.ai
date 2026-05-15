import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log('[API CHAT] Generating text with Gemini 1.5 Flash...');

    const result = await generateText({
      // @ts-ignore
      model: google('models/gemini-1.5-flash'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis singkat sesuai mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip.',
    });

    // Ambil teks dengan lebih kuat (handle berbagai versi SDK)
    const textOutput = result.text || '';
    const cleanText = textOutput.replace(/[*_#`~"]/g, '').trim();
    
    console.log('[API CHAT] Final Output:', cleanText);
    
    return new Response(JSON.stringify({ text: cleanText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[API CHAT] Error:', error);
    return new Response(
      JSON.stringify({ error: 'AI Error', details: error.message }),
      { status: 500 }
    );
  }
}


  } catch (error: any) {
    console.error('[API CHAT] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal memproses permintaan AI.', details: error.message }),
      { status: 500 }
    );
  }
}
