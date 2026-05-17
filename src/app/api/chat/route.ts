import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

// Pool Jawaban Cadangan (Fallback) untuk menghemat token dan mengatasi limit
const FALLBACK_RESPONSES: Record<string, string[]> = {
  sedih: [
    "Dibalik setiap tetes air mata, tersimpan kekuatan yang sedang bersiap untuk mekar kembali.",
    "Mendung tidak selamanya ada, esok mentari akan menyapa jiwamu dengan hangat yang baru.",
    "Izinkan dirimu beristirahat, namun jangan pernah menyerah pada harapan yang menantimu di ujung jalan.",
    "Luka hari ini adalah pupuk bagi ketabahanmu di masa depan yang lebih cerah."
  ],
  lelah: [
    "Lelahmu adalah bukti perjuanganmu, beristirahatlah sejenak untuk melangkah lebih jauh besok.",
    "Bintang pun butuh malam untuk bersinar, begitu pula ragamu yang butuh jeda untuk kembali bugar.",
    "Setiap langkah kecil dalam kelelahanmu adalah kemajuan besar menuju impianmu.",
    "Rehatlah tanpa rasa bersalah, karena dunia akan tetap berputar menunggumu kembali kuat."
  ],
  ragu: [
    "Percayalah pada getaran hatimu, karena di sanalah jawaban yang paling jujur bersemayam.",
    "Keraguan hanyalah kabut tipis, teruslah melangkah hingga cahaya kepastian menembus pandanganmu.",
    "Jadilah nakhoda bagi dirimu sendiri, biarkan keberanian menuntunmu melewati samudera bimbang.",
    "Ketidakpastian adalah ruang untuk tumbuh, jangan takut melangkah di jalan yang belum terpetakan."
  ],
  senang: [
    "Rayakan setiap detik kebahagiaanmu, biarkan senyummu menjadi pelita bagi orang-orang di sekitarmu.",
    "Kebahagiaan adalah energi semesta, simpanlah hangatnya untuk menerangi hari-hari yang akan datang.",
    "Teruslah menebar tawa, karena dunia menjadi lebih indah setiap kali kamu merasa bahagia.",
    "Syukuri momen ini, biarkan ia menjadi jangkar yang menguatkanmu di saat badai menyapa."
  ]
};

function getFallback(mood: string): string {
  const m = mood.toLowerCase();
  const options = FALLBACK_RESPONSES[m] || FALLBACK_RESPONSES['senang'];
  return options[Math.floor(Math.random() * options.length)];
}

export async function POST(req: Request) {
  let userMood = 'senang';
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Deteksi mood dari pesan terakhir untuk fallback
    if (lastMessage.includes('Sedih')) userMood = 'sedih';
    else if (lastMessage.includes('Lelah')) userMood = 'lelah';
    else if (lastMessage.includes('Ragu')) userMood = 'ragu';

    console.log(`[API CHAT] Processing mood: ${userMood}...`);

    const result = await generateText({
      // @ts-ignore
      model: google('models/gemini-1.5-flash'),
      messages,
      system: 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis singkat sesuai mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip.',
      maxTokens: 60, // Batasi token output untuk hemat biaya/limit
    });

    const textOutput = result.text || '';
    const cleanText = textOutput.replace(/[*_#`~"]/g, '').trim();
    
    return new Response(JSON.stringify({ text: cleanText || getFallback(userMood) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[API CHAT] AI Error or Limit reached, using fallback:', error.message);
    
    // Jika AI error (limit, network, dll), kembalikan jawaban dari pool
    return new Response(JSON.stringify({ 
      text: getFallback(userMood),
      isFallback: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
