import imgWajik from '../assets/Wajik.png'
import imgDodol from '../assets/Dodol.png'
import imgLopek from '../assets/Lopek.png'
import imgKueBangkit from '../assets/Kue_Bangkit.png'
import imgLempokDurian from '../assets/Lempok_Durian.png'
import imgBoluKemojo from '../assets/Bolu_Kemojo.png'
import imgBoluBerendam from '../assets/Bolu_Berendam.png'
import imgKueTalam from '../assets/Kue_Talam.png'
import imgKuePinyaram from '../assets/Kue_Pinyaram.png'
import imgKueSagu from '../assets/Kue_Sagu.png'
import imgKaryawan1 from '../assets/karyawan-1.png'
import imgKaryawan2 from '../assets/karyawan-2.png'
import imgKaryawan3 from '../assets/karyawan-3.png'

// ── Data Karyawan ─────────────────────────────────────────────────
export const KARYAWAN_DATA = [
  {
    level:       1,
    nama:        'Pembantu Dapur',
    image:        imgKaryawan1,
    deskripsi:   'Membantu pekerjaan dasar di dapur',
    tambahWaktu: 60,
    hargaDasar:  60000,
  },
  {
    level:       2,
    nama:        'Juru Masak',
    image:       imgKaryawan2,
    deskripsi:   'Berpengalaman memasak kue tradisional',
    tambahWaktu: 90,
    hargaDasar:  100000,
  },
  {
    level:       3,
    nama:        'Chef Melayu',
    image:       imgKaryawan3,
    deskripsi:   'Ahli kuliner khas Melayu Riau yang andal',
    tambahWaktu: 120,
    hargaDasar:  150000,
  },
]

export const MAX_KARYAWAN  = 3
export const INFLASI_RATE  = 1.2
export const WAKTU_DASAR   = 360

export function getHargaKaryawan(level, runKe) {
  const k = KARYAWAN_DATA.find(k => k.level === level)
  if (!k) return 0
  return Math.round(k.hargaDasar * Math.pow(INFLASI_RATE, runKe))
}

// ── 10 Produk Khas Melayu Riau ────────────────────────────────────
export const produkList = [
  {
    id: 'bolu-kemojo',
    nama: 'Bolu Kemojo',
    image: imgBoluKemojo,
    satuan: 'loyang',
    isiPerBatch: 4,
    waktuPerBatch: 80,
    biayaPerUnit: 24000,
    hargaJual: 30000,
    resep: [
      '150 gram gula pasir',
      '3 butir telur',
      '600 ml santan',
      '280 gr terigu'
    ],
    tipesoal: 'A',
    markup: 25,
    soal: 'Kamu ingin memperoleh keuntungan 25%. Berapa harga jualnya?',
    pilihan: [
      { nilai: 26000, label: 'Rp26.000' },
      { nilai: 28000, label: 'Rp28.000' },
      { nilai: 30000, label: 'Rp30.000' },
      { nilai: 32000, label: 'Rp32.000' },
      { nilai: 34000, label: 'Rp34.000' }
    ],
    jawaban: 30000,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Jika kamu ingin memperoleh keuntungan 10% dari modal Rp24.000 yaitu Rp2.400, maka harga jualnya menjadi Rp26.400',
    penjelasan: [
      '25% dari Rp24.000 = 25/100 × 24.000 = 6.000',
      'Harga Jual = Modal + Untung',
      '= 24.000 + 6.000 = 30.000',
      'Jadi, harga jual Bolu Kemojo adalah Rp30.000'
    ]
  },
  {
    id: 'kue-bangkit',
    nama: 'Kue Bangkit',
    image: imgKueBangkit,
    satuan: 'toples',
    isiPerBatch: 2,
    waktuPerBatch: 60,
    biayaPerUnit: 40000,
    hargaJual: 58000,
    resep: [
      '150 gram gula pasir',
      '2 butir telur',
      '150 ml santan',
      '150 gr terigu',
      '250 gr tepung sagu'
    ],
    tipesoal: 'B',
    markup: 45,
    soal: 'Kamu ingin menjual Kue Bangkit per toples seharga Rp58.000, berapa persen keuntungannya?',
    pilihan: [
      { nilai: 18, label: '18%' },
      { nilai: 35, label: '35%' },
      { nilai: 40, label: '40%' },
      { nilai: 45, label: '45%' },
      { nilai: 55, label: '55%' }
    ],
    jawaban: 45,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Keuntungan = Harga Jual − Modal. Persentase = (Keuntungan / Modal) × 100%',
    penjelasan: [
      'Keuntungan = 58.000 − 40.000 = 18.000',
      'Persentase = (18.000 / 40.000) × 100% = 45%',
      'Jadi, keuntungan Kue Bangkit adalah 45%'
    ]
  },
  {
    id: 'lempuk-durian',
    nama: 'Lempuk Durian',
    image: imgLempokDurian,
    satuan: 'bungkus',
    isiPerBatch: 3,
    waktuPerBatch: 90,
    biayaPerUnit: 30000,
    hargaJual: 36000,
    resep: [
      '500 gr daging durian',
      '200 gr gula pasir',
      '1/2 sdt garam'
    ],
    tipesoal: 'A',
    markup: 20,
    soal: 'Kamu ingin memperoleh keuntungan 20%. Berapa harga jualnya?',
    pilihan: [
      { nilai: 32000, label: 'Rp32.000' },
      { nilai: 34000, label: 'Rp34.000' },
      { nilai: 36000, label: 'Rp36.000' },
      { nilai: 38000, label: 'Rp38.000' },
      { nilai: 40000, label: 'Rp40.000' }
    ],
    jawaban: 36000,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Jika keuntungan 10% dari modal Rp30.000 adalah Rp3.000, maka harga jualnya Rp33.000',
    penjelasan: [
      '20% dari Rp30.000 = 20/100 × 30.000 = 6.000',
      'Harga Jual = Modal + Untung = 30.000 + 6.000 = 36.000',
      'Jadi, harga jual Lempuk Durian adalah Rp36.000'
    ]
  },
  {
    id: 'kue-lopek',
    nama: 'Kue Lopek',
    image: imgLopek,
    satuan: 'paket',
    isiPerBatch: 5,
    waktuPerBatch: 60,
    biayaPerUnit: 16000,
    hargaJual: 20000,
    resep: [
      '300 gr beras ketan',
      '200 ml santan',
      '100 gr gula merah',
      'Daun pisang secukupnya'
    ],
    tipesoal: 'B',
    markup: 25,
    soal: 'Kamu ingin menjual Kue Lopek per paket seharga Rp20.000, berapa persen keuntungannya?',
    pilihan: [
      { nilai: 15, label: '15%' },
      { nilai: 20, label: '20%' },
      { nilai: 25, label: '25%' },
      { nilai: 30, label: '30%' },
      { nilai: 35, label: '35%' }
    ],
    jawaban: 25,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Keuntungan = Harga Jual − Modal. Persentase = (Keuntungan / Modal) × 100%',
    penjelasan: [
      'Keuntungan = 20.000 − 16.000 = 4.000',
      'Persentase = (4.000 / 16.000) × 100% = 25%',
      'Jadi, keuntungan Kue Lopek adalah 25%'
    ]
  },
  {
    id: 'dodol',
    nama: 'Dodol',
    image: imgDodol,
    satuan: 'bungkus',
    isiPerBatch: 2,
    waktuPerBatch: 120,
    biayaPerUnit: 25000,
    hargaJual: 35000,
    resep: [
      '500 gr tepung ketan',
      '400 gr gula merah',
      '600 ml santan',
      '1/2 sdt garam'
    ],
    tipesoal: 'A',
    markup: 40,
    soal: 'Kamu ingin memperoleh keuntungan 40%. Berapa harga jualnya?',
    pilihan: [
      { nilai: 30000, label: 'Rp30.000' },
      { nilai: 32000, label: 'Rp32.000' },
      { nilai: 35000, label: 'Rp35.000' },
      { nilai: 38000, label: 'Rp38.000' },
      { nilai: 40000, label: 'Rp40.000' }
    ],
    jawaban: 35000,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Jika keuntungan 10% dari modal Rp25.000 adalah Rp2.500, maka harga jualnya Rp27.500',
    penjelasan: [
      '40% dari Rp25.000 = 40/100 × 25.000 = 10.000',
      'Harga Jual = Modal + Untung = 25.000 + 10.000 = 35.000',
      'Jadi, harga jual Dodol adalah Rp35.000'
    ]
  },
  {
    id: 'kue-wajik',
    nama: 'Kue Wajik',
    image: imgWajik,
    satuan: 'kotak',
    isiPerBatch: 4,
    waktuPerBatch: 90,
    biayaPerUnit: 20000,
    hargaJual: 26000,
    resep: [
      '300 gr beras ketan',
      '200 gr gula merah',
      '300 ml santan',
      'Daun pandan secukupnya'
    ],
    tipesoal: 'B',
    markup: 30,
    soal: 'Kamu ingin menjual Kue Wajik per kotak seharga Rp26.000, berapa persen keuntungannya?',
    pilihan: [
      { nilai: 20, label: '20%' },
      { nilai: 25, label: '25%' },
      { nilai: 30, label: '30%' },
      { nilai: 35, label: '35%' },
      { nilai: 40, label: '40%' }
    ],
    jawaban: 30,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Keuntungan = Harga Jual − Modal. Persentase = (Keuntungan / Modal) × 100%',
    penjelasan: [
      'Keuntungan = 26.000 − 20.000 = 6.000',
      'Persentase = (6.000 / 20.000) × 100% = 30%',
      'Jadi, keuntungan Kue Wajik adalah 30%'
    ]
  },
  {
    id: 'kue-sagu',
    nama: 'Kue Sagu',
    image: imgKueSagu,
    satuan: 'toples',
    isiPerBatch: 3,
    waktuPerBatch: 60,
    biayaPerUnit: 25000,
    hargaJual: 30000,
    resep: [
      '300 gr tepung sagu',
      '150 gr gula pasir',
      '2 butir telur',
      '100 gr kelapa parut'
    ],
    tipesoal: 'A',
    markup: 20,
    soal: 'Kamu ingin memperoleh keuntungan 20%. Berapa harga jualnya?',
    pilihan: [
      { nilai: 27000, label: 'Rp27.000' },
      { nilai: 28000, label: 'Rp28.000' },
      { nilai: 30000, label: 'Rp30.000' },
      { nilai: 32000, label: 'Rp32.000' },
      { nilai: 33000, label: 'Rp33.000' }
    ],
    jawaban: 30000,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Jika keuntungan 10% dari modal Rp25.000 adalah Rp2.500, maka harga jualnya Rp27.500',
    penjelasan: [
      '20% dari Rp25.000 = 20/100 × 25.000 = 5.000',
      'Harga Jual = Modal + Untung = 25.000 + 5.000 = 30.000',
      'Jadi, harga jual Kue Sagu adalah Rp30.000'
    ]
  },
  {
    id: 'bolu-berendam',
    nama: 'Bolu Berendam',
    image: imgBoluBerendam,
    satuan: 'loyang',
    isiPerBatch: 3,
    waktuPerBatch: 75,
    biayaPerUnit: 20000,
    hargaJual: 30000,
    resep: [
      '4 butir telur',
      '200 gr gula pasir',
      '200 gr terigu',
      '150 ml santan',
      'Air gula secukupnya'
    ],
    tipesoal: 'B',
    markup: 50,
    soal: 'Kamu ingin menjual Bolu Berendam per loyang seharga Rp30.000, berapa persen keuntungannya?',
    pilihan: [
      { nilai: 30, label: '30%' },
      { nilai: 40, label: '40%' },
      { nilai: 45, label: '45%' },
      { nilai: 50, label: '50%' },
      { nilai: 60, label: '60%' }
    ],
    jawaban: 50,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Keuntungan = Harga Jual − Modal. Persentase = (Keuntungan / Modal) × 100%',
    penjelasan: [
      'Keuntungan = 30.000 − 20.000 = 10.000',
      'Persentase = (10.000 / 20.000) × 100% = 50%',
      'Jadi, keuntungan Bolu Berendam adalah 50%'
    ]
  },
  {
    id: 'kue-talam',
    nama: 'Kue Talam',
    image: imgKueTalam,
    satuan: 'loyang',
    isiPerBatch: 4,
    waktuPerBatch: 60,
    biayaPerUnit: 18000,
    hargaJual: 27000,
    resep: [
      '250 gr tepung beras',
      '200 ml santan',
      '150 gr gula pasir',
      '1/2 sdt garam',
      '2 lembar daun pandan'
    ],
    tipesoal: 'A',
    markup: 50,
    soal: 'Kamu ingin memperoleh keuntungan 50%. Berapa harga jualnya?',
    pilihan: [
      { nilai: 24000, label: 'Rp24.000' },
      { nilai: 25000, label: 'Rp25.000' },
      { nilai: 27000, label: 'Rp27.000' },
      { nilai: 28000, label: 'Rp28.000' },
      { nilai: 30000, label: 'Rp30.000' }
    ],
    jawaban: 27000,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Jika keuntungan 10% dari modal Rp18.000 adalah Rp1.800, maka harga jualnya Rp19.800',
    penjelasan: [
      '50% dari Rp18.000 = 50/100 × 18.000 = 9.000',
      'Harga Jual = Modal + Untung = 18.000 + 9.000 = 27.000',
      'Jadi, harga jual Kue Talam adalah Rp27.000'
    ]
  },
  {
    id: 'kue-pinyaram',
    nama: 'Kue Pinyaram',
    image: imgKuePinyaram,
    satuan: 'bungkus',
    isiPerBatch: 4,
    waktuPerBatch: 60,
    biayaPerUnit: 20000,
    hargaJual: 26000,
    resep: [
      '300 gr tepung beras',
      '200 gr gula merah',
      '250 ml santan',
      '100 gr kelapa parut'
    ],
    tipesoal: 'B',
    markup: 30,
    soal: 'Kamu ingin menjual Kue Pinyaram per bungkus seharga Rp26.000, berapa persen keuntungannya?',
    pilihan: [
      { nilai: 20, label: '20%' },
      { nilai: 25, label: '25%' },
      { nilai: 30, label: '30%' },
      { nilai: 35, label: '35%' },
      { nilai: 40, label: '40%' }
    ],
    jawaban: 30,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
    feedbackSalah: 'Hmm, belum pas! Coba lagi!',
    hint: 'Keuntungan = Harga Jual − Modal. Persentase = (Keuntungan / Modal) × 100%',
    penjelasan: [
      'Keuntungan = 26.000 − 20.000 = 6.000',
      'Persentase = (6.000 / 20.000) × 100% = 30%',
      'Jadi, keuntungan Kue Pinyaram adalah 30%'
    ]
  }
]

// ── XP Config ─────────────────────────────────────────────────────
export const XP_CONFIG = {
  waktuCepat:       50,
  waktuLambat:      25,
  firstTryBonus:    15,
  hintPenaltyRatio: 1 / 3,
  maxAttempts:      3,
  waktuMaksimal:    300
}

// ── Helper Functions ──────────────────────────────────────────────

// Modal per batch = harga jual × isi per batch
export function getModalPerBatch(produk) {
  return produk.hargaJual * produk.isiPerBatch
}

// Brute-force LP solver — cari kombinasi (x,y) yang memaksimalkan pendapatan
export function generateSoalWaktu(produkA, produkB, waktuTotal = WAKTU_DASAR) {
  const wA = produkA.waktuPerBatch.toString()
  const wB = produkB.waktuPerBatch.toString()
  const kanan = waktuTotal.toString()

  const tokens = [wA, wB]
  if (!tokens.includes(kanan)) tokens.push(kanan)
  tokens.push('<', '>', '≤', '≥')

  return {
    id:      'waktu',
    tipe:    'pertidaksamaan',
    judul:   'Pertidaksamaan Waktu',
    konteks: `Kamu hanya punya waktu ${Math.floor(waktuTotal / 60)} jam ` +
             `(${waktuTotal} menit). Sekali jalan, usahamu membuat ` +
             `${produkA.isiPerBatch} ${produkA.satuan} ${produkA.nama} ` +
             `dalam ${produkA.waktuPerBatch} menit, atau ` +
             `${produkB.isiPerBatch} ${produkB.satuan} ${produkB.nama} ` +
             `dalam ${produkB.waktuPerBatch} menit. ` +
             `x = batch ${produkA.nama}, y = batch ${produkB.nama}.`,
    kanan,
    tokens,
    jawaban: { a: wA, b: wB, c: '≤' },
    hint:    `x = batch ${produkA.nama} (${produkA.waktuPerBatch} menit/batch), ` +
             `y = batch ${produkB.nama} (${produkB.waktuPerBatch} menit/batch). ` +
             `Total waktu tidak boleh melebihi ${waktuTotal} menit.`,
    penjelasan: [
      `x = banyak batch ${produkA.nama} → tiap batch ${produkA.waktuPerBatch} menit`,
      `y = banyak batch ${produkB.nama} → tiap batch ${produkB.waktuPerBatch} menit`,
      `Total waktu maksimal = ${Math.floor(waktuTotal / 60)} jam = ${waktuTotal} menit`,
      `Pertidaksamaan: ${wA}x + ${wB}y ≤ ${kanan}`
    ]
  }
}

export function hitungOptimal(
  produkA, produkB,
  budget     = 600000,
  waktuTotal = WAKTU_DASAR
) {
  const mA = getModalPerBatch(produkA)
  const mB = getModalPerBatch(produkB)

  let bestRevenue = 0
  let bestX = 0, bestY = 0

  const maxX = Math.floor(waktuTotal / produkA.waktuPerBatch)

  for (let x = 0; x <= maxX; x++) {
    const waktuSisa = waktuTotal - x * produkA.waktuPerBatch
    const maxY = Math.floor(waktuSisa / produkB.waktuPerBatch)
    for (let y = 0; y <= maxY; y++) {
      if (x * mA + y * mB > budget) continue
      const rev = x * produkA.isiPerBatch * produkA.hargaJual
               + y * produkB.isiPerBatch * produkB.hargaJual
      if (rev > bestRevenue) {
        bestRevenue = rev; bestX = x; bestY = y
      }
    }
  }

  return {
    x: bestX, y: bestY,
    revenue: bestRevenue,
    modalBatchA:   mA,
    modalBatchB:   mB,
    waktuTerpakai: bestX * produkA.waktuPerBatch + bestY * produkB.waktuPerBatch,
    modalTerpakai: bestX * mA + bestY * mB,
  }
}

// Generate soal pertidaksamaan modal
export function generateSoalModal(produkA, produkB) {
  const mA    = getModalPerBatch(produkA)
  const mB    = getModalPerBatch(produkB)
  const mAStr = mA.toLocaleString('id-ID')
  const mBStr = mB.toLocaleString('id-ID')

  // Sama — tidak pakai Set supaya duplikat tetap muncul
  const tokens = [mAStr, mBStr]
  if (!tokens.includes('600.000')) tokens.push('600.000')
  tokens.push('<', '>', '≤', '≥')

  return {
    id:      'modal',
    tipe:    'pertidaksamaan',
    judul:   'Pertidaksamaan Modal',
    konteks: `Kamu punya modal Rp600.000. ` +
             `Biaya per batch ${produkA.nama} = ${produkA.isiPerBatch} × Rp${produkA.hargaJual.toLocaleString('id-ID')} = Rp${mAStr}. ` +
             `Biaya per batch ${produkB.nama} = ${produkB.isiPerBatch} × Rp${produkB.hargaJual.toLocaleString('id-ID')} = Rp${mBStr}.`,
    kanan:   '600.000',
    tokens,
    jawaban: { a: mAStr, b: mBStr, c: '≤' },
    hint:    `Biaya per batch ${produkA.nama} = ${produkA.isiPerBatch} × Rp${produkA.hargaJual.toLocaleString('id-ID')} = Rp${mAStr}. ` +
             `Biaya per batch ${produkB.nama} = ${produkB.isiPerBatch} × Rp${produkB.hargaJual.toLocaleString('id-ID')} = Rp${mBStr}. ` +
             `Total tidak boleh melebihi Rp600.000.`,
    penjelasan: [
      `Biaya per batch ${produkA.nama} = ${produkA.isiPerBatch} × Rp${produkA.hargaJual.toLocaleString('id-ID')} = Rp${mAStr}`,
      `Biaya per batch ${produkB.nama} = ${produkB.isiPerBatch} × Rp${produkB.hargaJual.toLocaleString('id-ID')} = Rp${mBStr}`,
      'Total modal maksimal = Rp600.000',
      `Pertidaksamaan: ${mAStr}x + ${mBStr}y ≤ 600.000`
    ]
  }
}