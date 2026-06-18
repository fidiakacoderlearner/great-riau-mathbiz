import { supabase } from './supabase'

// ── Produk ────────────────────────────────────────────────────────
export async function fetchProduk() {
  const { data, error } = await supabase
    .from('produk')
    .select('*')
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error

  // Mapping dari snake_case DB ke camelCase yang sudah dipakai di React
  return data.map(p => ({
    id:            p.slug,           // pakai slug sebagai id supaya kompatibel
    dbId:          p.id,             // UUID asli dari DB
    nama:          p.nama,
    image:         p.image_url,
    satuan:        p.satuan,
    isiPerBatch:   p.isi_per_batch,
    waktuPerBatch: p.waktu_per_batch,
    biayaPerUnit:  p.biaya_per_unit,
    hargaJual:     p.harga_jual,
    resep:         p.resep,
    soal:          p.soal,
    tipeSoal:      p.tipe_soal,
    pilihan:       p.pilihan,
    jawaban:       p.jawaban,
    hint:          p.hint,
    penjelasan:    p.penjelasan,
    feedbackBenar: 'Mantap, hitunganmu pas sekali!',
  feedbackSalah: 'Hmm, belum pas! Coba lagi!',
  }))
}

// ── Karyawan ──────────────────────────────────────────────────────
export async function fetchKaryawan() {
  const { data, error } = await supabase
    .from('karyawan')
    .select('*')
    .eq('is_active', true)
    .order('level')

  if (error) throw error

  return data.map(k => ({
    level:       k.level,
    nama:        k.nama,
    image:       k.image_url,
    deskripsi:   k.deskripsi,
    tambahWaktu: k.tambah_waktu,
    hargaDasar:  k.harga_dasar,
    inflasiRate: k.inflasi_rate,
  }))
}

// ── Sesi Bermain ──────────────────────────────────────────────────
export async function createSesi({ siswaId, kelasId = null, budgetAwal }) {
  const { data, error } = await supabase
    .from('sesi_bermain')
    .insert({
      siswa_id:    siswaId,
      kelas_id:    kelasId,
      budget_awal: budgetAwal,
      status:      'aktif',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSesi(sesiId, { totalXp, totalPendapatan, jumlahRun, status }) {
  const { error } = await supabase
    .from('sesi_bermain')
    .update({
      total_xp:         totalXp,
      total_pendapatan: totalPendapatan,
      jumlah_run:       jumlahRun,
      status,
      finished_at:      status === 'selesai' ? new Date().toISOString() : null,
    })
    .eq('id', sesiId)

  if (error) throw error
}

// ── Run ───────────────────────────────────────────────────────────
export async function createRun({
  sesiId, runKe,
  produkADbId, produkBDbId,
  karyawanDisewa, biayaKaryawan,
  budgetProduksi, waktuTersedia,
  batchA, batchB, pendapatan,
  pendapatanOptimal, batchOptimalA, batchOptimalB,
  xpRun, waktuBermain,
}) {
  const { data, error } = await supabase
    .from('run')
    .insert({
      sesi_id:            sesiId,
      run_ke:             runKe,
      produk_a_id:        produkADbId,
      produk_b_id:        produkBDbId,
      karyawan_disewa:    karyawanDisewa,
      biaya_karyawan:     biayaKaryawan,
      budget_produksi:    budgetProduksi,
      waktu_tersedia:     waktuTersedia,
      batch_a:            batchA,
      batch_b:            batchB,
      pendapatan,
      pendapatan_optimal: pendapatanOptimal,
      batch_optimal_a:    batchOptimalA,
      batch_optimal_b:    batchOptimalB,
      xp_run:             xpRun,
      waktu_bermain:      waktuBermain,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Jawaban Soal ──────────────────────────────────────────────────
export async function saveJawaban({
  runId, produkDbId = null, tipeSoal,
  jawabanBenar, percobaanKe,
  hintDipakai, waktuMenjawab, xpDiperoleh,
}) {
  const { error } = await supabase
    .from('jawaban_soal')
    .insert({
      run_id:         runId,
      produk_id:      produkDbId,
      tipe_soal:      tipeSoal,
      jawaban_benar:  jawabanBenar,
      percobaan_ke:   percobaanKe,
      hint_dipakai:   hintDipakai,
      waktu_menjawab: waktuMenjawab,
      xp_diperoleh:   xpDiperoleh,
    })

  if (error) throw error
}

// ── History Sesi Siswa ────────────────────────────────────────────
export async function fetchRiwayatSiswa(siswaId) {
  const { data, error } = await supabase
    .from('sesi_bermain')
    .select(`
      *,
      run (
        *,
        produk_a:produk_a_id ( slug, nama, image_url ),
        produk_b:produk_b_id ( slug, nama, image_url )
      )
    `)
    .eq('siswa_id', siswaId)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data
}

// ── Kelas — Guru ──────────────────────────────────────────────────

export async function fetchKelasByGuru(guruId) {
  const { data, error } = await supabase
    .from('kelas')
    .select('*, kelas_siswa ( count )')
    .eq('guru_id', guruId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createKelas({ guruId, namaKelas }) {
  const { data: kodeData, error: kodeError } = await supabase
    .rpc('generate_kode_kelas')

  if (kodeError) throw kodeError

  const { data, error } = await supabase
    .from('kelas')
    .insert({
      nama:       namaKelas,
      kode_kelas: kodeData,
      guru_id:    guruId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteKelas(kelasId) {
  const { error } = await supabase
    .from('kelas')
    .delete()
    .eq('id', kelasId)

  if (error) throw error
}

// ── Siswa per Kelas ───────────────────────────────────────────────

export async function fetchSiswaByKelas(kelasId) {
  const { data, error } = await supabase
    .from('kelas_siswa')
    .select(`
      joined_at,
      profiles (
        id,
        nama_lengkap,
        created_at
      )
    `)
    .eq('kelas_id', kelasId)

  if (error) throw error
  return data.map(d => ({
    ...d.profiles,
    joinedAt: d.joined_at,
  }))
}

// ── Progress Siswa ────────────────────────────────────────────────

export async function fetchProgressSiswa(siswaId) {
  const { data, error } = await supabase
    .from('sesi_bermain')
    .select(`
      *,
      run (
        *,
        produk_a:produk_a_id ( slug, nama, image_url ),
        produk_b:produk_b_id ( slug, nama, image_url ),
        jawaban_soal (*)
      )
    `)
    .eq('siswa_id', siswaId)
    .order('started_at', { ascending: true })

  if (error) throw error
  return data
}

export async function fetchStatistikKelas(kelasId) {
  const siswaList = await fetchSiswaByKelas(kelasId)

  const progressList = await Promise.all(
    siswaList.map(async siswa => {
      const sesiList     = await fetchProgressSiswa(siswa.id)
      const semuaRun     = sesiList.flatMap(s => s.run ?? [])
      const semuaJawaban = semuaRun.flatMap(r => r.jawaban_soal ?? [])

      const totalXp         = semuaRun.reduce((s, r) => s + (r.xp_run ?? 0), 0)
      const totalPendapatan = semuaRun.reduce((s, r) => s + (r.pendapatan ?? 0), 0)
      const totalWaktu      = semuaRun.reduce((s, r) => s + (r.waktu_bermain ?? 0), 0)
      const totalJawaban    = semuaJawaban.length
      const jawabanBenar    = semuaJawaban.filter(j => j.jawaban_benar).length
      const hintDipakai     = semuaJawaban.filter(j => j.hint_dipakai).length
      const produkSelesai   = new Set(
        semuaRun.flatMap(r => [r.produk_a?.slug, r.produk_b?.slug].filter(Boolean))
      ).size

      return {
        siswa,
        totalRun:       semuaRun.length,
        totalXp,
        totalPendapatan,
        totalWaktu,
        akurasi:        totalJawaban > 0
                          ? Math.round((jawabanBenar / totalJawaban) * 100)
                          : 0,
        persenHint:     totalJawaban > 0
                          ? Math.round((hintDipakai / totalJawaban) * 100)
                          : 0,
        produkSelesai,
        rataWaktuRun:   semuaRun.length > 0
                          ? Math.round(totalWaktu / semuaRun.length)
                          : 0,
        runs:           semuaRun,
        jawaban:        semuaJawaban,
      }
    })
  )

  return progressList
}

// Ambil kelas_id siswa (dipakai saat buat sesi)
export async function fetchKelasIdSiswa(siswaId) {
  const { data, error } = await supabase
    .from('kelas_siswa')
    .select('kelas_id')
    .eq('siswa_id', siswaId)
    .single()

  if (error) return null
  return data?.kelas_id ?? null
}

// ── Load Progress Siswa dari Supabase ─────────────────────────────
export async function fetchGameProgress(siswaId) {
  const { data: sesiList, error } = await supabase
    .from('sesi_bermain')
    .select(`
      *,
      run (
        *,
        produk_a:produk_a_id ( slug, nama, image_url ),
        produk_b:produk_b_id ( slug, nama, image_url )
      )
    `)
    .eq('siswa_id', siswaId)
    .eq('status', 'selesai')
    .order('started_at', { ascending: true })

  if (error) throw error

  const semuaRun = sesiList
    .flatMap(s => s.run ?? [])
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  // Rekonstruksi allDoneIds dari produk yang sudah dikerjakan
  const allDoneIds = [...new Set(
    semuaRun.flatMap(r => [
      r.produk_a?.slug,
      r.produk_b?.slug,
    ].filter(Boolean))
  )]

  // Hitung budget saat ini
  const BUDGET_AWAL = 600000
  let budget = BUDGET_AWAL
  for (const run of semuaRun) {
    budget = budget - (run.biaya_karyawan ?? 0) + (run.pendapatan ?? 0)
  }

  // Rekonstruksi runHistory untuk ReviewPage
  const runHistory = semuaRun.map((r, i) => ({
    run:            i + 1,
    produkA:        r.produk_a?.nama ?? '',
    produkB:        r.produk_b?.nama ?? '',
    imageA:         r.produk_a?.image_url ?? '',
    imageB:         r.produk_b?.image_url ?? '',
    budgetAwal:     (r.budget_produksi ?? 0) + (r.biaya_karyawan ?? 0),
    biayaKaryawan:  r.biaya_karyawan ?? 0,
    budgetProduksi: r.budget_produksi ?? 0,
    pendapatan:     r.pendapatan ?? 0,
    waktuBermain:   r.waktu_bermain ?? 0,
    waktuTersedia:  r.waktu_tersedia ?? 360,
    xpRun:          r.xp_run ?? 0,
    karyawanDisewa: r.karyawan_disewa ?? [],
  }))

  return { allDoneIds, budget, runHistory }
}
