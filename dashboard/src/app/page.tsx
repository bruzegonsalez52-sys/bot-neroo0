import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(135deg, #5865F2, #57F287)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        BotNeroo0
      </h1>
      <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.2rem' }}>
        Panel de administración de eventos de Albion Online
      </p>
      <Link href="/dashboard" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #5865F2, #57F287)', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}>
        Ir al Dashboard
      </Link>
    </div>
  )
}