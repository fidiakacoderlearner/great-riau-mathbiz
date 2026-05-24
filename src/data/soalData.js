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