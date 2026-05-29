function Layout({ children }) {
  const stripeAtas =
    'repeating-linear-gradient(90deg,#C0392B 0,#C0392B 20px,#F1C40F 20px,#F1C40F 40px,#1E8449 40px,#1E8449 60px)'
  const stripeBawah =
    'repeating-linear-gradient(90deg,#1E8449 0,#1E8449 20px,#F1C40F 20px,#F1C40F 40px,#C0392B 40px,#C0392B 60px)'

  return (
    <div className="min-h-screen flex flex-col">

      {/* Stripe atas — mobile only */}
      <div className="md:hidden shrink-0 h-3" style={{ background: stripeAtas }} />

      {/* Konten utama */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Stripe bawah — mobile only */}
      <div className="md:hidden shrink-0 h-3" style={{ background: stripeBawah }} />

    </div>
  )
}

export default Layout