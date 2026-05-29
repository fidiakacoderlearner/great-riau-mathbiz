import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import EksplorasiPage from './pages/EksplorasiPage'
import DapurProduksiPage from './pages/DapurProduksiPage'
import BertemuPembeli from './pages/BertemuPembeli'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/eksplorasi"      element={<EksplorasiPage />} />
          <Route path="/dapur-produksi"  element={<DapurProduksiPage />} />
          <Route path="/bertemu-pembeli" element={<BertemuPembeli />} />
          <Route path="/tantangan"       element={<PlaceholderPage judul="🚣 Tantangan"       pesan="Fitur Pacu Jalur segera hadir!" />} />
          <Route path="/dashboard-guru"  element={<PlaceholderPage judul="📚 Dashboard Guru"  pesan="Dashboard guru sedang dikembangkan." />} />
          <Route path="*"                element={<PlaceholderPage judul="404"                pesan="Halaman tidak ditemukan." />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

function PlaceholderPage({ judul, pesan }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#FDFBE4' }}>
      <h1 className="text-3xl font-black mb-2" style={{ color: '#C0392B' }}>{judul}</h1>
      <p className="text-gray-500 font-semibold mb-6 text-center">{pesan}</p>
      <a href="/" className="py-3 px-8 rounded-2xl text-white font-bold"
        style={{ backgroundColor: '#1E8449' }}>
        Kembali ke Menu
      </a>
    </div>
  )
}

export default App