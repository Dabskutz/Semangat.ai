import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

// Mapping mood internal ke kategori API Publik (Indonesian Quotes API)
const API_V1_MAPPING: Record<string, string> = {
  sedih: 'life',
  lelah: 'life',
  ragu: 'motivation',
  senang: 'success'
};

// Mapping mood internal ke kategori API Publik (Liupurnomo API)
const API_V2_MAPPING: Record<string, string> = {
  sedih: 'kehidupan',
  lelah: 'motivasi',
  ragu: 'motivasi',
  senang: 'kebahagiaan'
};

// Pool Jawaban Cadangan (Fallback Terakhir)
const FALLBACK_RESPONSES: Record<string, string[]> = {
  sedih: [
    "Dibalik setiap tetes air mata, tersimpan kekuatan yang sedang bersiap untuk mekar kembali.",
    "Mendung tidak selamanya ada, esok mentari akan menyapa jiwamu dengan hangat yang baru.",
    "Luka hari ini adalah pupuk bagi ketabahanmu di masa depan yang lebih cerah."
  ],
  lelah: [
    "Lelahmu adalah bukti perjuanganmu, beristirahatlah sejenak untuk melangkah lebih jauh besok.",
    "Bintang pun butuh malam untuk bersinar, begitu pula ragamu yang butuh jeda untuk kembali bugar.",
    "Rehatlah tanpa rasa bersalah, karena dunia akan tetap berputar menunggumu kembali kuat."
  ],
  ragu: [
    "Percayalah pada getaran hatimu, karena di sanalah jawaban yang paling jujur bersemayam.",
    "Keraguan hanyalah kabut tipis, teruslah melangkah hingga cahaya kepastian menembus pandanganmu.",
    "Jadilah nakhoda bagi dirimu sendiri, biarkan keberanian menuntunmu melewati samudera bimbang."
  ],
  senang: [
    "Rayakan setiap detik kebahagiaanmu, biarkan senyummu menjadi pelita bagi orang-orang di sekitarmu.",
    "Kebahagiaan adalah energi semesta, simpanlah hangatnya untuk menerangi hari-hari yang akan datang.",
    "Syukuri momen ini, biarkan ia menjadi jangkar yang menguatkanmu di saat badai menyapa."
  ]
};

function getLocalFallback(mood: string): string {
  const m = mood.toLowerCase();
  const options = FALLBACK_RESPONSES[m] || FALLBACK_RESPONSES['senang'];
  return options[Math.floor(Math.random() * options.length)];
}

// Fungsi untuk mengambil quotes dari API Publik (Gratis & Hemat Token)
async function fetchPublicQuote(mood: string): Promise<string | null> {
  const m = mood.toLowerCase();
  const sourceSelector = Math.random();

  try {
    if (sourceSelector > 0.5) {
      // SUMBER 1: Indonesian Quotes API
      const category = API_V1_MAPPING[m] || 'motivation';
      const response = await fetch(`https://indonesian-quotes-api.vercel.app/api/quotes/random?category=${category}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        return data.quote || data.content || null;
      }
    } else {
      // SUMBER 2: Quotes Liupurnomo
      const category = API_V2_MAPPING[m] || 'motivasi';
      const response = await fetch(`https://quotes.liupurnomo.com/api/quotes/random?category=${category}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        // Handle struktur data yang mungkin berbeda
        const quote = data.data?.quote || data.quote || (Array.isArray(data) ? data[0]?.quote : null);
        return quote;
      }
    }
    return null;
  } catch (err) {
    console.error('[API CHAT] External API Error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  let userMood = 'senang';
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Deteksi mood
    if (lastMessage.includes('Sedih')) userMood = 'sedih';
    else if (lastMessage.includes('Lelah')) userMood = 'lelah';
    else if (lastMessage.includes('Ragu')) userMood = 'ragu';

    console.log(`[API CHAT] Step 1: Trying Public API for mood: ${userMood}...`);

    // LANGKAH 1: Coba API Publik dulu (0 Token AI)
    const publicQuote = await fetchPublicQuote(userMood);
    if (publicQuote) {
      console.log('[API CHAT] Success using Public API');
      return new Response(JSON.stringify({ text: publicQuote, source: 'public_api' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // LANGKAH 2: Jika API Publik gagal, gunakan Gemini (Pakai Token)
    console.log('[API CHAT] Step 2: Falling back to Gemini 2.5 Flash AI...');
    try {
      const result = await generateText({
        model: google('gemini-2.5-flash') as any,
        messages,
        system: 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis singkat sesuai mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip.',
        maxTokens: 100,
      });

      const textOutput = result.text || '';
      const cleanText = textOutput.replace(/[*_#`~"]/g, '').trim();
      
      return new Response(JSON.stringify({ text: cleanText || getLocalFallback(userMood), source: 'ai' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (aiError: any) {
      console.error('[API CHAT] Gemini 2.5 Flash Error Detail:', JSON.stringify(aiError, null, 2));
      throw aiError; 
    }

  } catch (error: any) {
    console.error('[API CHAT] Critical Error, using local fallback:', error.message);
    
    // LANGKAH 3: Jika semua gagal (Limit AI + API Down), gunakan pool lokal
    return new Response(JSON.stringify({ 
      text: getLocalFallback(userMood),
      source: 'local_fallback' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
