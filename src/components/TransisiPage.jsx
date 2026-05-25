function TransisiPage({ judul, emoji, warna, onLanjut }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: warna }}>
      <div className="text-8xl mb-6">{emoji}</div>
      <h1 className="text-3xl font-black text-white text-center mb-2">{judul}</h1>
      <div className="w-16 h-1 rounded-full mb-8"
        style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
      </div>
      <button
        onClick={onLanjut}
        className="py-4 px-10 rounded-2xl font-black text-lg
                   active:scale-95 transition-transform"
        style={{ backgroundColor: 'white', color: warna }}>
        Lanjut →
      </button>
    </div>
  )
}

export default TransisiPage