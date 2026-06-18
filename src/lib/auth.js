import { supabase } from './supabase'

// ── Register Siswa ────────────────────────────────────────────────
export async function registerSiswa({ email, password, namaLengkap, kodeKelas }) {
  // Validasi kode kelas via RPC — bisa dijalankan tanpa login
  const { data: kelasData, error: kelasError } = await supabase
    .rpc('validate_kode_kelas', { kode: kodeKelas.toUpperCase() })

  if (kelasError || !kelasData || kelasData.length === 0) {
    throw new Error('Kode kelas tidak ditemukan')
  }

  const kelas = kelasData[0]

  // Register ke Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role:         'siswa',
        nama_lengkap: namaLengkap,
        kelas_id:     kelas.id,
      }
    }
  })
  if (error) throw error

  // Tunggu trigger selesai buat profile
  await new Promise(resolve => setTimeout(resolve, 500))

  // Masukkan siswa ke kelas
  const { error: joinError } = await supabase
    .from('kelas_siswa')
    .insert({
      kelas_id: kelas.id,
      siswa_id: data.user.id,
    })

  if (joinError) throw joinError

  // Logout supaya siswa harus login manual
  await supabase.auth.signOut()

  return data
}

// ── Register Guru ─────────────────────────────────────────────────
export async function registerGuru({ email, password, namaLengkap }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role:         'guru',
        nama_lengkap: namaLengkap,
      }
    }
  })
  if (error) throw error
  await supabase.auth.signOut()
  return data
}

// ── Login ─────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// ── Logout ────────────────────────────────────────────────────────
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Get Current User + Profile ────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null

  return {
    id:          user.id,
    email:       user.email,
    role:        profile.role,
    namaLengkap: profile.nama_lengkap,
  }
}

// ── Listen Auth State Change ──────────────────────────────────────
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, nama_lengkap')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Gagal fetch profile:', error.message)
          // Kalau gagal fetch profile, logout paksa supaya tidak stuck
          await supabase.auth.signOut()
          callback(null)
          return
        }

        callback({
          id:          session.user.id,
          email:       session.user.email,
          role:        profile.role,
          namaLengkap: profile.nama_lengkap,
        })
      } catch (err) {
        console.error('Error di onAuthStateChange:', err)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}

// ── Buat Kelas (Guru) ─────────────────────────────────────────────
export async function buatKelas({ namaKelas, guruId }) {
  // Generate kode kelas unik 6 karakter
  const kode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabase
    .from('kelas')
    .insert({
      nama:       namaKelas,
      kode_kelas: kode,
      guru_id:    guruId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Fetch Kelas Guru ──────────────────────────────────────────────
export async function fetchKelasByGuru(guruId) {
  const { data, error } = await supabase
    .from('kelas')
    .select(`
      *,
      kelas_siswa (
        siswa_id,
        joined_at,
        profiles (
          nama_lengkap,
          role
        )
      )
    `)
    .eq('guru_id', guruId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ── Fetch Progress Siswa di Kelas ─────────────────────────────────
export async function fetchProgressSiswa(kelasId) {
  const { data, error } = await supabase
    .from('kelas_siswa')
    .select(`
      siswa_id,
      joined_at,
      profiles (
        nama_lengkap
      )
    `)
    .eq('kelas_id', kelasId)

  if (error) throw error
  return data
}