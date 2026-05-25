import { useEffect } from 'react'

function FeedbackPopup({ pesan, benar, onHide }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ pointerEvents: 'none' }}>
      <div
        className="px-8 py-5 rounded-3xl font-black text-white text-xl shadow-2xl
                   text-center max-w-xs"
        style={{ backgroundColor: benar ? '#1E8449' : '#C0392B' }}>
        {benar ? '✅' : '❌'} {pesan}
      </div>
    </div>
  )
}

export default FeedbackPopup