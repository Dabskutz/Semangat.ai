import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

// Mapping mood internal ke kategori API Publik (Indonesian Quotes API)
const API_V1_MAPPING: Record<string, string> = {
  sedih: 'life',
  lelah: 'life',
  ragu: 'motivation',
  senang: 'success',
  koleksi: 'life'
};

// Mapping mood internal ke kategori API Publik (Liupurnomo API)
const API_V2_MAPPING: Record<string, string> = {
  sedih: 'kehidupan',
  lelah: 'motivasi',
  ragu: 'motivasi',
  senang: 'kebahagiaan',
  koleksi: 'kehidupan'
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
  ],
  koleksi: [
    "Pendidikan adalah senjata paling ampuh untuk mengubah dunia. - Nelson Mandela",
    "Imajinasi lebih penting daripada pengetahuan. - Albert Einstein",
    "Waktumu terbatas, jangan sia-siakan dengan menjalani hidup orang lain. - Steve Jobs",
    "Berhenti membandingkan dirimu dengan orang lain, bandingkan dirimu dengan dirimu yang kemarin. - Jordan Peterson",
    "Hiduplah seolah-olah kamu akan mati besok. - Mahatma Gandhi",
    "Kesuksesan adalah kemampuan untuk beralih dari satu kegagalan ke kegagalan lain tanpa kehilangan antusiasme. - Winston Churchill",
    "Jangan biarkan opini orang lain menenggelamkan suara hatimu sendiri. - Steve Jobs",
    "Dunia ini panggung sandiwara, tapi kita harus bermain dengan sungguh-sungguh. - Pramoedya Ananta Toer",
    "Aku ingin mencintaimu dengan sederhana. - Sapardi Djoko Damono",
    "Terkadang, orang yang paling sulit dicintai adalah orang yang paling membutuhkannya. - Tere Liye",
    "Dunia mematahkan setiap orang, dan setelah itu, banyak yang kuat di tempat yang patah. - Ernest Hemingway",
    "Tidak perlu menjadi sempurna untuk memulai, tapi kau harus memulai untuk menjadi sempurna. - Zig Ziglar",
    "Kebahagiaan bisa ditemukan, bahkan di saat-saat tergelap, jika seseorang hanya ingat untuk menyalakan lampu. - J.K. Rowling",
    "Kenali dirimu sendiri. - Socrates",
    "Kebahagiaan tergantung pada diri kita sendiri. - Aristoteles",
    "Hidup yang tidak diuji tidak layak dijalani. - Socrates",
    "Kemenangan yang paling besar adalah kemenangan atas diri sendiri. - Plato",
    "Segala sesuatu memiliki keindahan, tetapi tidak semua orang melihatnya. - Konfusius",
    "Perjalanan seribu mil dimulai dengan satu langkah. - Lao Tzu",
    "Balas dendam terbaik adalah dengan tidak menjadi seperti musuhmu. - Marcus Aurelius",
    "Hidup kita adalah apa yang dibentuk oleh pikiran kita. - Marcus Aurelius",
    "Bukan karena hal-hal sulit kita tidak berani, tetapi karena kita tidak berani hal-hal menjadi sulit. - Seneca",
    "Siapa yang tidak menghargai hidup, tidak layak memilikinya. - Leonardo da Vinci",
    "Kesederhanaan adalah kecanggihan tertinggi. - Leonardo da Vinci",
    "Tindakan adalah kunci dasar untuk semua kesuksesan. - Pablo Picasso",
    "Saya selalu melakukan apa yang tidak bisa saya lakukan, agar saya bisa belajar bagaimana melakukannya. - Pablo Picasso",
    "Mengetahui diri sendiri adalah awal dari semua kebijaksanaan. - Aristoteles",
    "Kita adalah apa yang kita kerjakan berulang kali. Keunggulan, bukanlah tindakan, tetapi kebiasaan. - Aristoteles",
    "Cinta terdiri dari satu jiwa yang menghuni dua tubuh. - Aristoteles",
    "Hanya orang yang berpendidikan yang bebas. - Epictetus",
    "Jangan menjelaskan filosofimu. Wujudkanlah. - Epictetus",
    "Kebebasan adalah satu-satunya tujuan yang layak dalam hidup. - Epictetus",
    "Masa depan milik mereka yang percaya pada keindahan mimpi mereka. - Eleanor Roosevelt",
    "Lakukan apa yang kamu bisa, dengan apa yang kamu miliki, di mana pun kamu berada. - Theodore Roosevelt",
    "Percayalah kamu bisa dan kamu sudah setengah jalan. - Theodore Roosevelt",
    "Satu-satunya hal yang harus kita takuti adalah ketakutan itu sendiri. - Franklin D. Roosevelt",
    "Kegelapan tidak bisa mengusir kegelapan; hanya cahaya yang bisa melakukannya. - Martin Luther King Jr.",
    "Kebencian tidak bisa mengusir kebencian; hanya cinta yang bisa melakukannya. - Martin Luther King Jr.",
    "Ketidakadilan di mana pun adalah ancaman bagi keadilan di mana-mana. - Martin Luther King Jr.",
    "Pada akhirnya, kita tidak akan mengingat kata-kata musuh kita, tetapi diamnya teman-teman kita. - Martin Luther King Jr.",
    "Jadilah perubahan yang ingin kamu lihat di dunia. - Mahatma Gandhi",
    "Lemah tidak pernah bisa memaafkan. Pengampunan adalah atribut dari yang kuat. - Mahatma Gandhi",
    "Kebahagiaan adalah ketika apa yang kamu pikirkan, apa yang kamu katakan, dan apa yang kamu lakukan selaras. - Mahatma Gandhi",
    "Mata ganti mata hanya akan membuat seluruh dunia buta. - Mahatma Gandhi",
    "Cara terbaik untuk menemukan dirimu adalah dengan kehilangan dirimu dalam pelayanan orang lain. - Mahatma Gandhi",
    "Kemuliaan terbesar dalam hidup bukan terletak pada tidak pernah jatuh, tetapi pada bangkit setiap kali kita jatuh. - Nelson Mandela",
    "Kelihatannya selalu mustahil sampai hal itu selesai dilakukan. - Nelson Mandela",
    "Menjadi bebas bukan sekadar membuang rantai seseorang, tetapi hidup dengan cara yang menghargai kebebasan orang lain. - Nelson Mandela",
    "Logika akan membawamu dari A ke B. Imajinasi akan membawamu ke mana saja. - Albert Einstein",
    "Siapa pun yang tidak pernah melakukan kesalahan tidak pernah mencoba sesuatu yang baru. - Albert Einstein",
    "Satu-satunya sumber pengetahuan adalah pengalaman. - Albert Einstein",
    "Tanda kecerdasan yang sebenarnya bukan pengetahuan tapi imajinasi. - Albert Einstein",
    "Berusahalah untuk tidak menjadi sukses, tetapi untuk menjadi bernilai. - Albert Einstein",
    "Di tengah kesulitan terdapat kesempatan. - Albert Einstein",
    "Kecerdasan tanpa ambisi adalah burung tanpa sayap. - Salvador Dali",
    "Jangan takut akan kesempurnaan - kamu tidak akan pernah mencapainya. - Salvador Dali",
    "Menjadi diri sendiri di dunia yang terus berusaha membuatmu menjadi sesuatu yang lain adalah pencapaian terbesar. - Ralph Waldo Emerson",
    "Jangan pergi ke mana jalan itu mengarah, pergilah ke tempat yang tidak ada jalannya dan tinggalkan jejak. - Ralph Waldo Emerson",
    "Pahlawan tidak lebih berani dari orang biasa, tapi dia berani lima menit lebih lama. - Ralph Waldo Emerson",
    "Apa yang ada di belakang kita dan apa yang ada di depan kita adalah masalah kecil dibandingkan dengan apa yang ada di dalam diri kita. - Ralph Waldo Emerson",
    "Hidup adalah sebuah petualangan yang berani atau tidak sama sekali. - Helen Keller",
    "Optimisme adalah keyakinan yang mengarah pada pencapaian. - Helen Keller",
    "Sendiri kita bisa melakukan begitu sedikit; bersama-sama kita bisa melakukan begitu banyak. - Helen Keller",
    "Hal-hal terbaik dan terindah di dunia tidak dapat dilihat atau disentuh - mereka harus dirasakan dengan hati. - Helen Keller",
    "Seorang teman adalah seseorang yang memberimu kebebasan total untuk menjadi dirimu sendiri. - Jim Morrison",
    "Musik mengungkapkan apa yang tidak bisa dikatakan dan yang tidak mungkin didiamkan. - Victor Hugo",
    "Bahkan malam yang paling gelap pun akan berakhir dan matahari akan terbit. - Victor Hugo",
    "Berani berarti mencintai tanpa syarat tanpa mengharapkan imbalan apa pun. - Madonna",
    "Satu-satunya cara untuk memiliki teman adalah dengan menjadi teman. - Ralph Waldo Emerson",
    "Jangan menangis karena itu berakhir, tersenyumlah karena itu terjadi. - Dr. Seuss",
    "Kamu punya otak di kepalamu. Kamu punya kaki di sepatumu. Kamu bisa mengarahkan dirimu ke mana pun kamu pilih. - Dr. Seuss",
    "Hanya satu hal yang membuat mimpi mustahil dicapai: ketakutan akan kegagalan. - Paulo Coelho",
    "Saat kita mencintai, kita selalu berusaha menjadi lebih baik dari kita yang sekarang. - Paulo Coelho",
    "Rahasia hidup adalah jatuh tujuh kali dan bangun delapan kali. - Paulo Coelho",
    "Ingatlah selalu bahwa kamu unik. Sama seperti orang lain. - Margaret Mead",
    "Masa depan adalah milik mereka yang mempersiapkan diri hari ini. - Malcolm X",
    "Jika kamu tidak berdiri untuk sesuatu, kamu akan jatuh untuk apa pun. - Malcolm X",
    "Pendidikan adalah paspor menuju masa depan. - Malcolm X",
    "Sukses adalah guru yang buruk. Dia menggoda orang pintar untuk berpikir mereka tidak bisa kalah. - Bill Gates",
    "Rayakan kesuksesanmu, tetapi jauh lebih penting untuk memperhatikan pelajaran dari kegagalan. - Bill Gates",
    "Pelangganmu yang paling tidak bahagia adalah sumber pembelajaran terbesarmu. - Bill Gates",
    "Kita semua membutuhkan orang yang akan memberi kita umpan balik. Begitulah cara kita meningkatkan diri. - Bill Gates",
    "Jika saya punya waktu delapan jam untuk menebang pohon, saya akan menghabiskan enam jam untuk mengasah kapak saya. - Abraham Lincoln",
    "Pada akhirnya, bukan tahun-tahun dalam hidupmu yang dihitung. Tapi hidup dalam tahun-tahunmu. - Abraham Lincoln",
    "Saya adalah orang yang berjalan lambat, tetapi saya tidak pernah berjalan mundur. - Abraham Lincoln",
    "Cara terbaik untuk meramalkan masa depanmu adalah dengan menciptakannya. - Abraham Lincoln",
    "Hampir semua orang bisa tahan menghadapi kesulitan, tapi jika Anda ingin menguji karakter seseorang, berilah dia kekuasaan. - Abraham Lincoln",
    "Jangan pernah menyerah pada sesuatu yang tidak bisa kamu lalui sehari pun tanpa memikirkannya. - Winston Churchill",
    "Sikap adalah hal kecil yang membuat perbedaan besar. - Winston Churchill",
    "Kesuksesan bukanlah akhir, kegagalan bukanlah fatal: keberanian untuk melanjutkanlah yang dihitung. - Winston Churchill",
    "Layang-layang terbang paling tinggi melawan angin, bukan searah dengannya. - Winston Churchill",
    "Seorang pesimis melihat kesulitan dalam setiap kesempatan; seorang optimis melihat kesempatan dalam setiap kesulitan. - Winston Churchill",
    "Jika Anda sedang melewati neraka, teruslah berjalan. - Winston Churchill",
    "Cita-cita itu adalah untuk diwujudkan, bukan untuk diimpikan. - Tan Malaka",
    "Ingatlah bahwa keberadaanmu di dunia ini bukan untuk menjadi biasa-biasa saja. - Buya Hamka",
    "Jangan takut jatuh, karena hanya orang yang tidak pernah memanjatlah yang tidak pernah jatuh. - Buya Hamka",
    "Kehidupan itu bukan apa yang Anda miliki, tapi apa yang Anda berikan. - Buya Hamka",
    "Gantungkan cita-citamu setinggi langit! Bermimpilah setinggi langit. Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang. - Soekarno",
    "Bangsa yang besar adalah bangsa yang menghormati jasa pahlawannya. - Soekarno",
    "Beri aku 10 pemuda, niscaya akan kuguncangkan dunia. - Soekarno"
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
    else if (lastMessage.includes('Koleksi')) userMood = 'koleksi';

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
    console.log(`[API CHAT] Step 2: Falling back to Gemini 2.5 Flash AI for mood: ${userMood}...`);
    try {
      const isKoleksi = userMood === 'koleksi';
      const systemPrompt = isKoleksi 
        ? 'Anda adalah pustakawan dunia. Berikan satu kutipan bijak dari penulis atau tokoh terkenal dunia dalam bahasa Indonesia. Sebutkan nama tokohnya di akhir kalimat. JANGAN gunakan markdown.'
        : 'Anda adalah motivator Indonesia. Berikan satu kalimat penyemangat puitis singkat sesuai mood user. JANGAN gunakan markdown, JANGAN gunakan tanda kutip.';

      const result = await generateText({
        model: google('gemini-2.5-flash') as any,
        messages,
        system: systemPrompt,
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
