export const soalRancanganUsaha = [
  {
    id: 1,
    produk: "Bolu Kemojo",
    biayaProduksi: 24000,
    resep: [
      "150 gram gula pasir",
      "3 butir telur",
      "600 ml santan",
      "280 gr terigu"
    ],
    soal: "Kamu ingin memperoleh keuntungan 25%. Berapa harga jualnya?",
    pilihan: [
      { nilai: 26000, label: "Rp26.000" },
      { nilai: 28000, label: "Rp28.000" },
      { nilai: 30000, label: "Rp30.000" },
      { nilai: 32000, label: "Rp32.000" },
      { nilai: 34000, label: "Rp34.000" }
    ],
    jawaban: 30000,
    feedbackBenar: "Mantap, hitunganmu pas sekali!",
    feedbackSalah: "Hmm, belum pas! Coba lagi!",
    hint: "Jika kamu ingin memperoleh keuntungan 10% dari modal Rp24.000 yaitu Rp2.400, maka harga jualnya menjadi Rp26.400",
    penjelasan: [
      "25% dari Rp24.000 = 25/100 × 24.000 = 6.000",
      "Harga Jual = Modal + Untung",
      "= 24.000 + 6.000 = 30.000",
      "Jadi, harga jual bolu kemojomu adalah Rp30.000"
    ]
  },
  {
    id: 2,
    produk: "Kue Bangkit",
    biayaProduksi: 40000,
    resep: [
      "150 gram gula pasir",
      "2 butir telur",
      "150 ml santan",
      "150 gr terigu",
      "250 gr tepung sagu"
    ],
    soal: "Kamu ingin menjual Kue Bangkit pertoples 250gr seharga Rp58.000, berapa persen keuntungannya?",
    pilihan: [
      { nilai: 18, label: "18%" },
      { nilai: 35, label: "35%" },
      { nilai: 40, label: "40%" },
      { nilai: 45, label: "45%" },
      { nilai: 55, label: "55%" }
    ],
    jawaban: 45,
    feedbackBenar: "Mantap, hitunganmu pas sekali!",
    feedbackSalah: "Hmm, belum pas! Coba lagi!",
    hint: "Jika kamu memproduksi barang bermodal Rp30.000 dan menjual barang tersebut dengan harga Rp33.000, keuntungannya adalah Rp3.000 sama dengan 10% harga modal",
    penjelasan: [
      "Keuntungan = Harga Jual - Modal = 58.000 - 40.000 = 18.000",
      "Persentase = (Keuntungan / Modal) × 100%",
      "= (18.000 / 40.000) × 100% = 45%",
      "Jadi, keuntunganmu adalah 45%"
    ]
  }
]

export const XP_CONFIG = {
  waktuCepat: 50,
  waktuLambat: 25,
  firstTryBonus: 15,
  hintPenaltyRatio: 1/3,
  maxAttempts: 3,
  waktuMaksimal: 300
}

export const soalDapurProduksi = [
  {
    id: 3,
    tipe: 'pertidaksamaan',
    judul: 'Pertidaksamaan Waktu',
    konteks: 'Kamu hanya punya waktu 6 jam (360 menit). Sekali jalan, usahamu membuat 4 loyang Bolu Kemojo dalam 80 menit, atau 2 toples Kue Bangkit dalam 60 menit. x = batch Bolu Kemojo, y = batch Kue Bangkit.',
    kanan: '360',
    tokens: ['60', '80', '360', '<', '>', '≤', '≥'],
    jawaban: { a: '80', b: '60', c: '≤' },
    hint: 'x adalah batch Bolu Kemojo (80 menit per batch), y adalah batch Kue Bangkit (60 menit per batch). Total waktu tidak boleh melebihi 360 menit.',
    penjelasan: [
      'x = banyak batch Bolu Kemojo → tiap batch butuh 80 menit',
      'y = banyak batch Kue Bangkit → tiap batch butuh 60 menit',
      'Total waktu maksimal = 6 jam = 360 menit',
      'Maka pertidaksamaannya: 80x + 60y ≤ 360'
    ]
  },
  {
    id: 4,
    tipe: 'pertidaksamaan',
    judul: 'Pertidaksamaan Modal',
    konteks: 'Kamu punya modal Rp600.000. Biaya per batch Bolu Kemojo = 4 × Rp30.000 = Rp120.000. Biaya per batch Kue Bangkit = 2 × Rp58.000 = Rp116.000.',
    kanan: '600.000',
    tokens: ['116.000', '120.000', '600.000', '<', '>', '≤', '≥'],
    jawaban: { a: '120.000', b: '116.000', c: '≤' },
    hint: 'Biaya per batch kemojo = 4 × Rp30.000 = Rp120.000. Biaya per batch kue bangkit = 2 × Rp58.000 = Rp116.000. Total tidak boleh melebihi modal Rp600.000.',
    penjelasan: [
      'Biaya per batch Bolu Kemojo = 4 × Rp30.000 = Rp120.000',
      'Biaya per batch Kue Bangkit = 2 × Rp58.000 = Rp116.000',
      'Total modal maksimal = Rp600.000',
      'Maka pertidaksamaannya: 120.000x + 116.000y ≤ 600.000'
    ]
  }
]