function HintModal({ teks, onTutup }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>

      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-black text-center mb-4"
          style={{ color: '#1E8449' }}>
          💡 Hint
        </h3>

        <p className="text-center text-gray-700 font-semibold leading-relaxed mb-6">
          {teks}
        </p>

        <button
          onClick={onTutup}
          className="w-full py-3 rounded-2xl text-white font-bold text-lg"
          style={{ backgroundColor: '#1E8449' }}>
          Mengerti
        </button>
      </div>

    </div>
  )
}

export default HintModal