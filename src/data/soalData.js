// ── Konstanta ─────────────────────────────────────────────────────
export const MAX_KARYAWAN = 3
export const INFLASI_RATE = 1.2
export const WAKTU_DASAR  = 360
export const BUDGET_AWAL  = 600000

export const XP_CONFIG = {
  waktuCepat:       50,
  waktuLambat:      25,
  firstTryBonus:    15,
  hintPenaltyRatio: 1 / 3,
  maxAttempts:      3,
  waktuMaksimal:    300,
}

// ── Helper Functions ──────────────────────────────────────────────
export function getModalPerBatch(produk) {
  return produk.hargaJual * produk.isiPerBatch
}

export function getHargaKaryawan(level, runKe, karyawanList = []) {
  const k = karyawanList.find(k => k.level === level)
  if (!k) return 0
  return Math.round(k.hargaDasar * Math.pow(k.inflasiRate ?? INFLASI_RATE, runKe))
}

export function hitungOptimal(produkA, produkB, budget = 600000, waktuTotal = WAKTU_DASAR) {
  const mA = getModalPerBatch(produkA)
  const mB = getModalPerBatch(produkB)

  let bestRevenue = 0
  let bestX = 0, bestY = 0

  const maxX = Math.floor(waktuTotal / produkA.waktuPerBatch)

  for (let x = 0; x <= maxX; x++) {
    const waktuSisa = waktuTotal - x * produkA.waktuPerBatch
    const maxY      = Math.floor(waktuSisa / produkB.waktuPerBatch)
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
    revenue:       bestRevenue,
    modalBatchA:   mA,
    modalBatchB:   mB,
    waktuTerpakai: bestX * produkA.waktuPerBatch + bestY * produkB.waktuPerBatch,
    modalTerpakai: bestX * mA + bestY * mB,
  }
}

export function generateSoalWaktu(produkA, produkB, waktuTotal = WAKTU_DASAR) {
  const wA    = produkA.waktuPerBatch.toString()
  const wB    = produkB.waktuPerBatch.toString()
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
    jawaban:    { a: wA, b: wB, c: '≤' },
    hint:       `x = batch ${produkA.nama} (${produkA.waktuPerBatch} menit/batch), ` +
                `y = batch ${produkB.nama} (${produkB.waktuPerBatch} menit/batch). ` +
                `Total waktu tidak boleh melebihi ${waktuTotal} menit.`,
    penjelasan: [
      `x = banyak batch ${produkA.nama} → tiap batch ${produkA.waktuPerBatch} menit`,
      `y = banyak batch ${produkB.nama} → tiap batch ${produkB.waktuPerBatch} menit`,
      `Total waktu maksimal = ${Math.floor(waktuTotal / 60)} jam = ${waktuTotal} menit`,
      `Pertidaksamaan: ${wA}x + ${wB}y ≤ ${kanan}`,
    ],
  }
}

export function generateSoalModal(produkA, produkB, budget = 600000) {
  const mA    = getModalPerBatch(produkA)
  const mB    = getModalPerBatch(produkB)
  const mAStr = mA.toLocaleString('id-ID')
  const mBStr = mB.toLocaleString('id-ID')
  const kanan = budget.toLocaleString('id-ID')
  const tokens = [mAStr, mBStr]
  if (!tokens.includes(kanan)) tokens.push(kanan)
  tokens.push('<', '>', '≤', '≥')

  return {
    id:      'modal',
    tipe:    'pertidaksamaan',
    judul:   'Pertidaksamaan Modal',
    konteks: `Kamu punya modal Rp${kanan}. ` +
             `Biaya per batch ${produkA.nama} = ${produkA.isiPerBatch} × ` +
             `Rp${produkA.hargaJual.toLocaleString('id-ID')} = Rp${mAStr}. ` +
             `Biaya per batch ${produkB.nama} = ${produkB.isiPerBatch} × ` +
             `Rp${produkB.hargaJual.toLocaleString('id-ID')} = Rp${mBStr}.`,
    kanan,
    tokens,
    jawaban:    { a: mAStr, b: mBStr, c: '≤' },
    hint:       `Biaya per batch ${produkA.nama} = Rp${mAStr}. ` +
                `Biaya per batch ${produkB.nama} = Rp${mBStr}. ` +
                `Total tidak boleh melebihi Rp${kanan}.`,
    penjelasan: [
      `Biaya per batch ${produkA.nama} = ${produkA.isiPerBatch} × ` +
      `Rp${produkA.hargaJual.toLocaleString('id-ID')} = Rp${mAStr}`,
      `Biaya per batch ${produkB.nama} = ${produkB.isiPerBatch} × ` +
      `Rp${produkB.hargaJual.toLocaleString('id-ID')} = Rp${mBStr}`,
      `Total modal maksimal = Rp${kanan}`,
      `Pertidaksamaan: ${mAStr}x + ${mBStr}y ≤ ${kanan}`,
    ],
  }
}