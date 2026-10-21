import { QuestionData } from '../types/math';

export const QUESTIONS_DATA: QuestionData[] = [
  {
    id: 1,
    shapeKey: 'persegi',
    title: 'Soal 1: Persegi',
    subtitle: 'Membagi Kertas Karton Persegi',
    level: 'Level Kognitif C5-Evaluasi',
    story:
      'Kakak memiliki sebuah kertas karton berbentuk persegi dengan luas 64 cm². Jika kakak ingin membagikan kertas karton tersebut kepada 4 orang temannya secara rata. Kakak harus menggunting kertas karton tersebut dengan panjang sisi? Gambar dan tuliskan jawabanmu pada kertas berikut!',
    questionPrompt:
      'Guntingan karton untuk 4 orang teman harus berukuran sama rata. Berapakah panjang sisi potongan persegi masing-masing?',
    answerKeyImage: '/assets/aistudio/image_57f139eb.png',
    hintText:
      'Pikirkan: Berapa luas masing-masing dari 4 bagian karton tersebut? Jika luas potongan persegi diketahui, bagaimana mencari panjang sisinya?',
    solutionBreakdown: {
      diketahui: [
        'Luas total karton persegi (L) = 64 cm²',
        'Akan dibagikan sama rata kepada 4 orang teman'
      ],
      ditanyakan: 'Panjang sisi (s) tiap potongan kertas karton?',
      langkahPengerjaan: [
        {
          judul: 'Langkah 1: Menghitung Luas Tiap Potongan',
          rumus: 'Luas Potongan = Luas Total ÷ Jumlah Teman',
          perhitungan: ['Luas Potongan = 64 cm² ÷ 4', 'Luas Potongan = 16 cm²'],
          hasil: '16 cm²'
        },
        {
          judul: 'Langkah 2: Menghitung Panjang Sisi Potongan Persegi',
          rumus: 'L = s²  atau  s = √L',
          perhitungan: [
            '16 cm² = s²',
            's = √(16 cm²)',
            's = 4 cm'
          ],
          hasil: 's = 4 cm'
        }
      ],
      kesimpulan:
        'Jadi, Kakak harus menggunting kertas karton tersebut dengan panjang sisi 4 cm.'
    },
    affirmation: {
      quote: 'Kemampuan memecah masalah besar menjadi bagian kecil adalah tanda seorang pemikir hebat.',
      author: 'Growth Mindset Math',
      insight:
        'Kamu baru saja melakukan analisis pembagian area dan akar kuadrat. Kesulitan yang kamu rasakan adalah proses otakmu membentuk jalur neuron baru!'
    }
  },
  {
    id: 2,
    shapeKey: 'persegi_panjang',
    title: 'Soal 2: Persegi Panjang',
    subtitle: 'Rancangan Taman, Kolam & Area Bermain',
    level: 'Level Kognitif C5-Evaluasi',
    story:
      'Seorang arsitek sedang merancangan desain untuk membangun sebuah taman berbentuk persegi panjang dengan panjang 20 m dan lebar 9 m. Taman ini akan memiliki sebuah kolam berbentuk persegi panjang dengan panjang 5 m dan lebar 4 m di tengah taman. Serta sebuah area bermain berbentuk persegi panjang dengan luas 24 m² di sudut taman. Berapa luas sebenarnya dari area taman yang tersisa setelah penambahan kolam dan area bermain? Gambar dan tuliskan jawabanmu pada kertas berikut!',
    questionPrompt:
      'Hitung dan evaluasi luas area taman yang tersisa setelah dikurangi kolam dan area bermain!',
    answerKeyImage: '/assets/aistudio/image_7004a5af.png',
    hintText:
      'Cari dulu luas seluruh taman (panjang x lebar), lalu cari luas kolam, kemudian kurangkan luas keduanya bersama area bermain dari luas taman awal.',
    solutionBreakdown: {
      diketahui: [
        'Panjang Taman (pT) = 20 m, Lebar Taman (lT) = 9 m',
        'Panjang Kolam (pK) = 5 m, Lebar Kolam (lK) = 4 m',
        'Luas Area Bermain (LAB) = 24 m²'
      ],
      ditanyakan:
        'Luas sebenarnya dari area taman yang tersisa setelah penambahan kolam dan area bermain?',
      langkahPengerjaan: [
        {
          judul: 'Langkah 1: Menghitung Luas Taman Utama',
          rumus: 'Luas Taman = pT × lT',
          perhitungan: ['Luas Taman = 20 m × 9 m', 'Luas Taman = 180 m²'],
          hasil: '180 m²'
        },
        {
          judul: 'Langkah 2: Menghitung Luas Kolam',
          rumus: 'Luas Kolam = pK × lK',
          perhitungan: ['Luas Kolam = 5 m × 4 m', 'Luas Kolam = 20 m²'],
          hasil: '20 m²'
        },
        {
          judul: 'Langkah 3: Menghitung Luas Area Tersisa',
          rumus: 'Luas Sisa = Luas Taman - (Luas Kolam + Luas Area Bermain)',
          perhitungan: [
            'Luas Sisa = 180 m² - (20 m² + 24 m²)',
            'Luas Sisa = 180 m² - 44 m²',
            'Luas Sisa = 136 m²'
          ],
          hasil: '136 m²'
        }
      ],
      kesimpulan:
        'Jadi, luas sebenarnya dari area taman yang tersisa setelah penambahan kolam dan area bermain adalah 136 m².'
    },
    affirmation: {
      quote: 'Kecermatan dalam menggabungkan dan mengurangkan ruang adalah keahlian arsitek sejati.',
      author: 'Arsitektur & Logika Matematika',
      insight:
        'Kemampuan mengevaluasi beberapa bagian bangun ruang membuktikan penalaran visualmu semakin berkembang tajam!'
    }
  },
  {
    id: 3,
    shapeKey: 'segitiga',
    title: 'Soal 3: Segitiga',
    subtitle: 'Evaluasi Perbandingan Luas Dua Kain Segitiga',
    level: 'Level Kognitif C5-Evaluasi',
    story:
      'Ardi memiliki 2 (dua) buah kain berbentuk bangun datar segitiga yang ingin ia bandingkan luasnya. Segitiga pertama memiliki panjang alas 16 cm dan tinggi 11 cm. Segitiga kedua memiliki panjang alas 14 cm dan tinggi 12 cm. Ardi membuat beberapa pernyataan tentang luas kedua bangun segitiga tersebut, sebagai berikut:\n1. Luas segitiga pertama lebih besar dari luas segitiga kedua.\n2. Luas kedua segitiga sama.\n3. Luas segitiga kedua lebih kecil 2x lipat dari luas segitiga pertama.\n4. Luas segitiga kedua adalah 84 cm².\nMenurutmu manakah pernyataan yang benar? Gambar dan tuliskan jawabanmu pada kertas berikut!',
    questionPrompt:
      'Hitung luas kedua segitiga, lalu evaluasi kebenaran dari masing-masing pernyataan (1, 2, 3, dan 4)!',
    answerKeyImage: '/assets/aistudio/image_84c74919.png',
    hintText:
      'Gunakan rumus luas segitiga: L = ½ × alas × tinggi untuk masing-masing kain. Bandingkan hasilnya secara kritis dengan ke-4 pernyataan.',
    solutionBreakdown: {
      diketahui: [
        'Segitiga 1 (Δ1): alas (aΔ1) = 16 cm, tinggi (tΔ1) = 11 cm',
        'Segitiga 2 (Δ2): alas (aΔ2) = 14 cm, tinggi (tΔ2) = 12 cm'
      ],
      ditanyakan:
        'Tentukanlah pernyataan yang benar berdasarkan perhitungan luas bangun datar segitiga!',
      langkahPengerjaan: [
        {
          judul: 'Langkah 1: Menghitung Luas Segitiga Pertama (Δ1)',
          rumus: 'LΔ1 = ½ × a × t',
          perhitungan: ['LΔ1 = ½ × 16 cm × 11 cm', 'LΔ1 = 8 cm × 11 cm', 'LΔ1 = 88 cm²'],
          hasil: '88 cm²'
        },
        {
          judul: 'Langkah 2: Menghitung Luas Segitiga Kedua (Δ2)',
          rumus: 'LΔ2 = ½ × a × t',
          perhitungan: ['LΔ2 = ½ × 14 cm × 12 cm', 'LΔ2 = 7 cm × 12 cm', 'LΔ2 = 84 cm²'],
          hasil: '84 cm²'
        }
      ],
      evaluasiPernyataan: [
        {
          pernyataanId: 1,
          status: 'Benar',
          penjelasan: 'Luas Δ1 (88 cm²) terbukti lebih besar dari Luas Δ2 (84 cm²).'
        },
        {
          pernyataanId: 2,
          status: 'Salah',
          penjelasan: 'Luas kedua segitiga berbeda (88 cm² ≠ 84 cm²).'
        },
        {
          pernyataanId: 3,
          status: 'Salah',
          penjelasan: 'Luas Δ2 (84 cm²) bukan setengah atau 2x lebih kecil dari 88 cm².'
        },
        {
          pernyataanId: 4,
          status: 'Benar',
          penjelasan: 'Hasil perhitungan Luas Δ2 memang tepat 84 cm².'
        }
      ],
      kesimpulan:
        'Jadi, pernyataan yang benar berdasarkan perhitungan luas bangun datar segitiga adalah nomor 1 dan 4.'
    },
    affirmation: {
      quote: 'Mengevaluasi klaim dengan bukti matematis adalah dasar dari berpikir kritis ilmiah.',
      author: 'Kekuatan Berpikir Tingkat Tinggi',
      insight:
        'Kamu tidak sekadar percaya pada kata orang, kamu membuktikannya sendiri dengan rumus dan fakta!'
    }
  },
  {
    id: 4,
    shapeKey: 'lingkaran',
    title: 'Soal 4: Lingkaran',
    subtitle: 'Evaluasi Pernyataan Luas & Pengaruh Jari-Jari',
    level: 'Level Kognitif C5-Evaluasi',
    story:
      'Pak Guru meminta siswa-siswinya untuk menghitung luas sebuah lingkaran. Lingkaran tersebut memiliki jari-jari 7 cm. Perhatikan pernyataan-pernyataan berikut ini!\nPernyataan 1: Luas lingkaran adalah 154 cm².\nPernyataan 2: Jika jari-jari lingkaran diperbesar menjadi 14 cm, luasnya akan menjadi empat kali lipat dari luas lingkaran asli.\nPernyataan 3: Jika diameter lingkaran adalah 14 cm, maka luas lingkaran adalah 77 cm².\nPernyataan 4: Luas lingkaran dengan jari-jari 7 cm adalah setengah dari luas lingkaran dengan jari-jari 14 cm.\nMenurutmu pernyataan manakah yang benar? Gambar dan tuliskan jawabanmu pada kertas berikut!',
    questionPrompt:
      'Evaluasi ke-4 pernyataan tersebut dengan menghitung luas lingkaran awal (r=7 cm) dan lingkaran hasil perubahan (r=14 cm)!',
    answerKeyImage: '/assets/aistudio/image_80dcc31f.png',
    hintText:
      'Ingat rumus luas lingkaran L = π × r² (gunakan π = 22/7). Perhatikan jika jari-jari dilipatgandakan 2 kali, luasnya bertambah pangkat dua (2² = 4 kali lipat).',
    solutionBreakdown: {
      diketahui: [
        'Jari-jari lingkaran mula-mula (r) = 7 cm',
        'Nilai pendekatan π = 22/7'
      ],
      ditanyakan:
        'Pilihlah pernyataan yang benar berdasarkan perhitungan luas lingkaran!',
      langkahPengerjaan: [
        {
          judul: 'Langkah 1: Menghitung Luas Lingkaran Awal (r = 7 cm)',
          rumus: 'L = π × r × r',
          perhitungan: ['L = (22/7) × 7 cm × 7 cm', 'L = 22 × 7 cm²', 'L = 154 cm²'],
          hasil: '154 cm²'
        },
        {
          judul: 'Langkah 2: Menghitung Luas Lingkaran Jika r = 14 cm',
          rumus: 'L_baru = π × r_baru × r_baru',
          perhitungan: [
            'L_baru = (22/7) × 14 cm × 14 cm',
            'L_baru = 22 × 2 × 14 = 616 cm²',
            'Rasio = 616 ÷ 154 = 4 kali lipat'
          ],
          hasil: '616 cm² (4× lipat)'
        }
      ],
      evaluasiPernyataan: [
        {
          pernyataanId: 1,
          status: 'Benar',
          penjelasan: 'Luas lingkaran dengan jari-jari 7 cm adalah 154 cm² (L = 22/7 × 7 × 7 = 154 cm²).'
        },
        {
          pernyataanId: 2,
          status: 'Benar',
          penjelasan:
            'Jika jari-jari diperbesar menjadi 14 cm, luasnya menjadi 616 cm², yang merupakan tepat 4 kali lipat dari 154 cm² (karena faktor skala luas adalah k² = 2² = 4).'
        },
        {
          pernyataanId: 3,
          status: 'Salah',
          penjelasan:
            'Diameter 14 cm berarti jari-jarinya tetap r = 14 ÷ 2 = 7 cm, sehingga luasnya tetap 154 cm², bukan 77 cm².'
        },
        {
          pernyataanId: 4,
          status: 'Salah',
          penjelasan:
            'Luas dengan r=7 cm (154 cm²) adalah seperempat (bukan setengah) dari luas lingkaran dengan r=14 cm (616 cm²).'
        }
      ],
      kesimpulan:
        'Jadi, pernyataan yang benar pada evaluasi konsep lingkaran adalah Pernyataan 1 dan Pernyataan 2.'
    },
    affirmation: {
      quote: 'Ketika kamu menemukan keteraturan dalam kurva lingkaran, kamu sedang berbicara dalam bahasa semesta.',
      author: 'Eksplorasi Matematika C5',
      insight:
        'Memahami kuadratik (perubahan jari-jari terhadap luas) adalah lompatan kognitif yang sangat luar biasa untuk levelmu!'
    }
  },
  {
    id: 5,
    shapeKey: 'layang_layang',
    title: 'Soal 5: Layang-Layang',
    subtitle: 'Evaluasi Luas Dua Layang-Layang P & Q',
    level: 'Level Kognitif C5-Evaluasi',
    story:
      'Bu Guru memberikan tugas kepada siswa-siswinya untuk menghitung luas bangun datar layang-layang. Layang-layang P memiliki diagonal panjang 10 cm dan diagonal pendek 6 cm. Layang-layang Q memiliki diagonal panjang 8 cm dan diagonal pendek 9 cm. Perhatikan pernyataan-pernyataan berikut ini!\nPernyataan 1: Luas layang-layang P lebih besar dari luas layang-layang Q.\nPernyataan 2: Jika diagonal panjang layang-layang P diperbesar menjadi 20 cm dan diagonal pendek tetap 6 cm, maka luasnya akan menjadi dua kali lipat dari luas aslinya.\nPernyataan 3: Jika diagonal pendek layang-layang Q diperbesar menjadi dua kali lipat, luasnya akan menjadi 72 cm².\nPernyataan 4: Jika luas layang-layang Q adalah 36 cm², maka diagonal panjangnya harus 12 cm.\nMenurutmu pernyataan manakah yang benar? Gambar dan tuliskan jawabanmu pada kertas berikut!',
    questionPrompt:
      'Lakukan pengujian dan evaluasi terhadap ke-4 pernyataan tersebut dengan menghitung luas masing-masing layang-layang!',
    answerKeyImage: '/assets/aistudio/image_da2c6e11.png',
    hintText:
      'Rumus luas layang-layang adalah L = ½ × d1 × d2. Ujilah masing-masing premis pernyataan secara cermat satu per satu.',
    solutionBreakdown: {
      diketahui: [
        'Layang-layang P: d1 = 6 cm, d2 = 10 cm',
        'Layang-layang Q: d1 = 9 cm, d2 = 8 cm'
      ],
      ditanyakan:
        'Pilihlah pernyataan yang benar berdasarkan perhitungan luas bangun datar layang-layang!',
      langkahPengerjaan: [
        {
          judul: 'Langkah 1: Menghitung Luas Layang-layang P',
          rumus: 'L1 = ½ × d1 × d2',
          perhitungan: ['L1 = ½ × 10 cm × 6 cm', 'L1 = 5 × 6 = 30 cm²'],
          hasil: '30 cm²'
        },
        {
          judul: 'Langkah 2: Menghitung Luas Layang-layang Q',
          rumus: 'L2 = ½ × d1 × d2',
          perhitungan: ['L2 = ½ × 9 cm × 8 cm', 'L2 = 9 × 4 = 36 cm²'],
          hasil: '36 cm²'
        }
      ],
      evaluasiPernyataan: [
        {
          pernyataanId: 1,
          status: 'Salah',
          penjelasan:
            'Luas layang-layang P adalah 30 cm², sedangkan luas layang-layang Q adalah 36 cm². Jadi luas P lebih kecil daripada Q.'
        },
        {
          pernyataanId: 2,
          status: 'Benar',
          penjelasan:
            'Jika diagonal panjang P menjadi 20 cm dan diagonal pendek tetap 6 cm, luasnya menjadi L = ½ × 20 × 6 = 60 cm², yang merupakan tepat dua kali lipat dari luas aslinya (30 cm²).'
        },
        {
          pernyataanId: 3,
          status: 'Benar',
          penjelasan:
            'Jika diagonal pendek Q diperbesar menjadi 2 kali lipat (9 cm × 2 = 18 cm), maka L = ½ × 18 × 8 = 72 cm².'
        },
        {
          pernyataanId: 4,
          status: 'Salah',
          penjelasan:
            'Dengan luas 36 cm² dan diagonal pendek 9 cm, diagonal panjangnya adalah (2 × 36) ÷ 9 = 8 cm, bukan 12 cm.'
        }
      ],
      kesimpulan:
        'Jadi, pernyataan yang bernilai benar adalah Pernyataan 2 dan Pernyataan 3.'
    },
    affirmation: {
      quote: 'Bukan tentang seberapa cepat kamu menyelesaikannya, tetapi seberapa mendalam pemahamanmu saat mengujinya.',
      author: 'Refleksi Matematika',
      insight:
        'Tantangan evaluasi C5 membutuhkan ketelitian dan keuletan tingkat tinggi. Kamu telah menunjukkan dedikasi belajar yang patut dibanggakan!'
    }
  }
];
