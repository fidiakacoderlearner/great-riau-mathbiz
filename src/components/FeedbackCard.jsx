function FeedbackCard({ pesan, benar }) {
  return (
    <div className={`px-4 py-3 rounded-2xl font-bold text-center text-white mt-4`}
      style={{ backgroundColor: benar ? '#1E8449' : '#C0392B' }}>
      {pesan}
    </div>
  )
}

export default FeedbackCard