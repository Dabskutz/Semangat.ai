import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

// Mapping mood internal ke kategori API Publik
const API_MOOD_MAPPING: Record<string, string> = {
  sedih: 'life', // Hidup/Galau
  lelah: 'life', // Perjuangan
  ragu: 'motivation', // Motivasi untuk yakin
  senang: 'success' // Kebahagiaan/Kesuksesan
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
  try {
    const category = API_MOOD_MAPPING[mood.toLowerCase()] || 'motivation';
    const response = await fetch(`https://indonesian-quotes-api.vercel.app/api/quotes/random?category=${category}`, {
      next: { revalidate: 3600 } // Cache selama 1 jam di Next.js
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.quote || data.content || null;
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
    console.log('[API CHAT] Step 2: Falling back to Gemini AI...');
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis singkat sesuai mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip.',
      maxTokens: 60,
    });

    const textOutput = result.text || '';
    const cleanText = textOutput.replace(/[*_#`~"]/g, '').trim();
    
    return new Response(JSON.stringify({ text: cleanText || getLocalFallback(userMood), source: 'ai' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

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
