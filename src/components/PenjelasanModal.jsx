function PenjelasanModal({ langkahLangkah, benar, onTutup }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">

        <h3 className="text-xl font-black text-center mb-4"
          style={{ color: benar ? '#1E8449' : '#C0392B' }}>
          {benar ? '✅ Pembahasan' : '📖 Penjelasan'}
        </h3>

        <div className="mb-6 space-y-2">
          {langkahLangkah.map((langkah, i) => (
            <p key={i}
              className="text-sm font-semibold text-gray-700 leading-relaxed
                         px-3 py-2 rounded-xl"
              style={{ backgroundColor: '#EAF4FB' }}>
              {langkah}
            </p>
          ))}
        </div>

        <button
          onClick={onTutup}
          className="w-full py-3 rounded-2xl text-white font-bold text-lg"
          style={{ backgroundColor: benar ? '#1E8449' : '#C0392B' }}>
          Mengerti, Lanjut →
        </button>

      </div>
    </div>
  )
}

export default PenjelasanModal