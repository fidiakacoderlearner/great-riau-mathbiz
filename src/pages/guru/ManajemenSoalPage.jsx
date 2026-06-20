import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSoalByGuru, updateProduk } from '../../lib/game'

const TIPE_OPTIONS = [
  { value: 'A', label: 'Pilihan Ganda' },
  { value: 'B', label: 'Esai / Isian' },
]

// ── Komponen Badge ─────────────────────────────────────────────────
function Badge({ tipe }) {
  const map = {
    A:               { bg: '#EAF4FB', color: '#3498DB', label: 'Pilihan Ganda' },
    B:               { bg: '#FEF9E7', color: '#F39C12', label: 'Esai' },
    pertidaksamaan:  { bg: '#D5F5E3', color: '#1E8449', label: 'Pertidaksamaan' },
  }
  const s = map[tipe] ?? { bg: '#eee', color: '#888', label: tipe ?? '-' }
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
      backgroundColor: s.bg, color: s.color,
      fontSize: '0.7rem', fontWeight: 700
    }}>
      {s.label}
    </span>
  )
}

// ── Label helper ───────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#555', marginBottom: '0.35rem' }}>
      {children}
    </p>
  )
}

const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem',
  borderRadius: '0.65rem', border: '2px solid #ddd',
  fontSize: '0.875rem', fontWeight: 600,
  backgroundColor: '#FAFAFA', outline: 'none',
  boxSizing: 'border-box', marginBottom: '1rem',
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
}

// ── Form Edit (slide-up) ───────────────────────────────────────────
function FormEdit({ produk, onClose, onSaved }) {
  const [tab, setTab] = useState('resep') // 'resep' | 'soal'

  // Tab Resep
  const [nama,          setNama]         = useState(produk.nama ?? '')
  const [satuan,        setSatuan]       = useState(produk.satuan ?? '')
  const [isiPerBatch,   setIsiPerBatch]  = useState(produk.isi_per_batch ?? '')
  const [waktuPerBatch, setWaktuPerBatch]= useState(produk.waktu_per_batch ?? '')
  const [biayaPerUnit,  setBiayaPerUnit] = useState(produk.biaya_per_unit ?? '')
  const [hargaJual,     setHargaJual]    = useState(produk.harga_jual ?? '')
  const [resepText,     setResepText]    = useState(
    Array.isArray(produk.resep) ? produk.resep.join('\n') : (produk.resep ?? '')
  )

  // Tab Soal
  const [tipeSoal,   setTipeSoal]   = useState(produk.tipe_soal ?? 'A')
  const [soal,       setSoal]       = useState(produk.soal ?? '')

  // Pilihan ganda: tiap opsi = { nilai: string/number, label: string }
  // nilai = kunci yg dicocokkan, label = teks tampil ke siswa
  function initP(idx) {
    const p = Array.isArray(produk.pilihan) ? produk.pilihan[idx] : null
    if (!p) return { nilai: '', label: '' }
    if (typeof p === 'object') return { nilai: String(p.nilai ?? ''), label: String(p.label ?? '') }
    return { nilai: String(p), label: String(p) }
  }
  const [pilihanA, setPilihanA] = useState(() => initP(0))
  const [pilihanB, setPilihanB] = useState(() => initP(1))
  const [pilihanC, setPilihanC] = useState(() => initP(2))
  const [pilihanD, setPilihanD] = useState(() => initP(3))

  // jawaban pilihan_ganda = nilai (string/number) salah satu opsi
  // jawaban pertidaksamaan = JSON object
  const [jawaban, setJawaban] = useState(() => {
    if (!produk.jawaban && produk.jawaban !== 0) return ''
    if (typeof produk.jawaban === 'object' && !Array.isArray(produk.jawaban))
      return JSON.stringify(produk.jawaban, null, 2)
    return String(produk.jawaban)
  })
  const [hint,       setHint]       = useState(produk.hint ?? '')
  const [penjelasan, setPenjelasan] = useState(
    Array.isArray(produk.penjelasan)
      ? produk.penjelasan.join('\n')
      : (produk.penjelasan ?? '')
  )

  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSave() {
    setError('')
    // Validasi minimal
    if (!nama.trim()) { setError('Nama produk tidak boleh kosong.'); return }

    setSaving(true)
    try {
      // Bangun nilai jawaban
      let jawabanVal = jawaban.trim()
      let pilihanArr = null

      if (tipeSoal === 'A') {
        const allFilled = [pilihanA, pilihanB, pilihanC, pilihanD].every(p => p.nilai && p.label)
        if (soal.trim() && !allFilled) {
          setError('Semua opsi A–D: isi Nilai dan Label.'); setSaving(false); return
        }
        if (!jawaban.trim()) {
          setError('Pilih kunci jawaban yang benar.'); setSaving(false); return
        }
        // Simpan sebagai [{nilai, label}], nilai dikonversi ke number jika bisa
        pilihanArr = [pilihanA, pilihanB, pilihanC, pilihanD].map(p => ({
          nilai: isNaN(p.nilai) ? p.nilai : Number(p.nilai),
          label: p.label,
        }))
        // jawaban juga dikonversi ke number jika bisa
        jawabanVal = isNaN(jawaban) ? jawaban : Number(jawaban)
      }

      const resepArr = resepText.split('\n').map(s => s.trim()).filter(Boolean)
      const penjelasanArr = penjelasan.trim()
        ? penjelasan.split('\n').map(s => s.trim()).filter(Boolean)
        : null

      await updateProduk({
        slug:          produk.slug,
        nama:          nama.trim(),
        satuan:        satuan.trim(),
        isiPerBatch:   Number(isiPerBatch) || 0,
        waktuPerBatch: Number(waktuPerBatch) || 0,
        biayaPerUnit:  Number(biayaPerUnit) || 0,
        hargaJual:     Number(hargaJual) || 0,
        resep:         resepArr,
        tipeSoal:      tipeSoal,
        soal:          soal.trim() || null,
        pilihan:       pilihanArr,
        jawaban:       jawabanVal || null,
        hint:          hint.trim() || null,
        penjelasan:    penjelasanArr,
      })

      setSuccessMsg('Tersimpan!')
      setTimeout(() => setSuccessMsg(''), 2500)
      onSaved()
    } catch (err) {
      setError('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '1.5rem 1.5rem 0 0',
        padding: '1.5rem', width: '100%', maxWidth: '640px',
        maxHeight: '92dvh', overflowY: 'auto'
      }}>
        {/* Header form */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#333' }}>Edit Produk</h2>
            <p style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>{produk.nama}</p>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem',
                     cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { key: 'resep', label: '🧾 Resep & Produk' },
            { key: 'soal',  label: '📝 Soal & Jawaban' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '0.55rem', borderRadius: '0.65rem',
                backgroundColor: tab === t.key ? '#1E8449' : '#eee',
                color: tab === t.key ? 'white' : '#666',
                fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB RESEP ── */}
        {tab === 'resep' && (
          <>
            <Label>Nama Produk *</Label>
            <input value={nama} onChange={e => setNama(e.target.value)}
              placeholder="Contoh: Kue Lopek" style={inputStyle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <Label>Satuan</Label>
                <input value={satuan} onChange={e => setSatuan(e.target.value)}
                  placeholder="pcs / bungkus" style={inputStyle} />
              </div>
              <div>
                <Label>Isi per Batch</Label>
                <input type="number" value={isiPerBatch}
                  onChange={e => setIsiPerBatch(e.target.value)}
                  placeholder="10" style={inputStyle} />
              </div>
              <div>
                <Label>Waktu per Batch (menit)</Label>
                <input type="number" value={waktuPerBatch}
                  onChange={e => setWaktuPerBatch(e.target.value)}
                  placeholder="30" style={inputStyle} />
              </div>
              <div>
                <Label>Biaya Produksi / unit (Rp)</Label>
                <input type="number" value={biayaPerUnit}
                  onChange={e => setBiayaPerUnit(e.target.value)}
                  placeholder="16000" style={inputStyle} />
              </div>
            </div>

            <Label>Harga Jual / unit (Rp)</Label>
            <input type="number" value={hargaJual}
              onChange={e => setHargaJual(e.target.value)}
              placeholder="20000" style={inputStyle} />

            <Label>Bahan-bahan Resep (satu baris = satu bahan)</Label>
            <textarea value={resepText} onChange={e => setResepText(e.target.value)}
              rows={5}
              placeholder={"300 gr beras ketan\n200 ml santan\n100 gr gula merah\nDaun pisang secukupnya"}
              style={textareaStyle} />
            <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 600,
                        marginTop: '-0.75rem', marginBottom: '1rem' }}>
              Tiap baris akan tampil sebagai poin (•) di kartu resep siswa.
            </p>
          </>
        )}

        {/* ── TAB SOAL ── */}
        {tab === 'soal' && (
          <>
            <Label>Tipe Soal</Label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {TIPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setTipeSoal(opt.value)}
                  style={{
                    padding: '0.4rem 0.85rem', borderRadius: '0.6rem',
                    backgroundColor: tipeSoal === opt.value ? '#1E8449' : '#eee',
                    color: tipeSoal === opt.value ? 'white' : '#666',
                    fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer'
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <Label>Pertanyaan / Soal</Label>
            <textarea value={soal} onChange={e => setSoal(e.target.value)}
              rows={3} placeholder="Tulis soal di sini..." style={textareaStyle} />

            {tipeSoal === 'A' && (
              <>
                <Label>Opsi Jawaban (A–D)</Label>
                <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 600,
                            marginTop: '-0.25rem', marginBottom: '0.75rem' }}>
                  <b>Nilai</b> = angka kunci (mis: 25), <b>Label</b> = teks tampil ke siswa (mis: 25%)
                </p>
                {[['A', pilihanA, setPilihanA], ['B', pilihanB, setPilihanB],
                  ['C', pilihanC, setPilihanC], ['D', pilihanD, setPilihanD]].map(([lbl, val, set]) => (
                  <div key={lbl} style={{ display: 'flex', gap: '0.5rem',
                                          alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#1E8449',
                                   minWidth: '1.25rem', flexShrink: 0 }}>{lbl}</span>
                    <input
                      value={val.nilai}
                      onChange={e => set(p => ({ ...p, nilai: e.target.value }))}
                      placeholder="Nilai (mis: 25)"
                      style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                    <input
                      value={val.label}
                      onChange={e => set(p => ({ ...p, label: e.target.value }))}
                      placeholder="Label (mis: 25%)"
                      style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                  </div>
                ))}
                <div style={{ marginTop: '0.75rem' }}>
                  <Label>Kunci Jawaban — masukkan Nilai yang benar</Label>
                  <select value={jawaban} onChange={e => setJawaban(e.target.value)}
                    style={{ ...inputStyle }}>
                    <option value="">-- Pilih jawaban yang benar --</option>
                    {[pilihanA, pilihanB, pilihanC, pilihanD]
                      .filter(p => p.nilai)
                      .map((p, i) => (
                        <option key={i} value={p.nilai}>
                          {['A','B','C','D'][i]}: {p.label || p.nilai}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            {tipeSoal === 'B' && (
              <>
                <Label>Kunci Jawaban</Label>
                <textarea value={jawaban} onChange={e => setJawaban(e.target.value)}
                  rows={2} placeholder="Jawaban yang benar..." style={textareaStyle} />
              </>
            )}


            <Label>Hint (opsional)</Label>
            <textarea value={hint} onChange={e => setHint(e.target.value)}
              rows={2} placeholder="Petunjuk untuk siswa yang kesulitan..."
              style={textareaStyle} />

            <Label>Penjelasan Langkah (opsional, satu baris = satu langkah)</Label>
            <textarea value={penjelasan} onChange={e => setPenjelasan(e.target.value)}
              rows={4} placeholder={"Langkah 1: ...\nLangkah 2: ...\nLangkah 3: ..."}
              style={textareaStyle} />
          </>
        )}

        {error && (
          <p style={{ color: '#C0392B', fontSize: '0.8rem', fontWeight: 700,
                      marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
            {error}
          </p>
        )}
        {successMsg && (
          <p style={{ color: '#1E8449', fontSize: '0.8rem', fontWeight: 700,
                      marginBottom: '0.75rem' }}>
            ✅ {successMsg}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              flex: 1, padding: '0.85rem', borderRadius: '0.75rem',
              backgroundColor: '#1E8449', color: 'white',
              fontWeight: 700, border: 'none', cursor: 'pointer',
              opacity: saving ? 0.6 : 1
            }}>
            {saving ? 'Menyimpan...' : '💾 Simpan'}
          </button>
          <button onClick={onClose}
            style={{
              padding: '0.85rem 1.25rem', borderRadius: '0.75rem',
              backgroundColor: '#eee', color: '#666',
              fontWeight: 700, border: 'none', cursor: 'pointer'
            }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card Produk ────────────────────────────────────────────────────
function ProdukCard({ produk, onEdit }) {
  const resepArr = Array.isArray(produk.resep) ? produk.resep : []
  const sudahAdaSoal = !!produk.soal

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '1rem',
      padding: '1rem', border: `2px solid ${sudahAdaSoal ? '#D5F5E3' : '#fdd'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 800, color: '#333', fontSize: '0.95rem' }}>
              {produk.nama}
            </p>
            {produk.tipe_soal && <Badge tipe={produk.tipe_soal} />}
            {sudahAdaSoal
              ? <span style={{ fontSize: '0.7rem', color: '#1E8449', fontWeight: 700 }}>✅ Soal</span>
              : <span style={{ fontSize: '0.7rem', color: '#C0392B', fontWeight: 700 }}>⚠️ Belum ada soal</span>
            }
          </div>

          {/* Preview resep */}
          {resepArr.length > 0 && (
            <div style={{ marginTop: '0.35rem' }}>
              {resepArr.slice(0, 2).map((b, i) => (
                <p key={i} style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600 }}>
                  • {b}
                </p>
              ))}
              {resepArr.length > 2 && (
                <p style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 600 }}>
                  + {resepArr.length - 2} bahan lainnya...
                </p>
              )}
            </div>
          )}

          {/* Info harga */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#C0392B', fontWeight: 700 }}>
              Modal: Rp{(produk.biaya_per_unit ?? 0).toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#1E8449', fontWeight: 700 }}>
              Jual: Rp{(produk.harga_jual ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button onClick={() => onEdit(produk)}
          style={{
            padding: '0.5rem 1rem', borderRadius: '0.65rem',
            backgroundColor: '#1E8449', color: 'white',
            fontWeight: 700, fontSize: '0.8rem',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
          ✏️ Edit
        </button>
      </div>
    </div>
  )
}

// ── Halaman Utama ──────────────────────────────────────────────────
export default function ManajemenSoalPage() {
  const navigate = useNavigate()
  const [produkList, setProdukList] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)

  useEffect(() => { loadProduk() }, [])

  async function loadProduk() {
    try {
      setLoading(true)
      const data = await fetchSoalByGuru()
      setProdukList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sudahAdaSoal = produkList.filter(p => p.soal)
  const belumAdaSoal = produkList.filter(p => !p.soal)

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FDFBE4' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: '#1E8449', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <button onClick={() => navigate('/dashboard-guru')}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
                   color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
          ←
        </button>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>
            📝 Manajemen Produk & Soal
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            Edit resep, harga, soal & jawaban
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa', fontWeight: 600, padding: '2rem' }}>
            Memuat data produk...
          </p>
        )}

        {!loading && (
          <>
            {belumAdaSoal.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#C0392B',
                            marginBottom: '0.5rem' }}>
                  ⚠️ Belum ada soal ({belumAdaSoal.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {belumAdaSoal.map(p => (
                    <ProdukCard key={p.id} produk={p} onEdit={setSelected} />
                  ))}
                </div>
              </div>
            )}

            {sudahAdaSoal.length > 0 && (
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#1E8449',
                            marginBottom: '0.5rem' }}>
                  ✅ Sudah ada soal ({sudahAdaSoal.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sudahAdaSoal.map(p => (
                    <ProdukCard key={p.id} produk={p} onEdit={setSelected} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <FormEdit
          produk={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { loadProduk() }}
        />
      )}
    </div>
  )
}