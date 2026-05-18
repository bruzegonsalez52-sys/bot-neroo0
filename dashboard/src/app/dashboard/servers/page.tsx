'use client'

export default function ServersPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Servidores</h1>
        <div style={{ background: '#1a1a3e', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af' }}>Los servidores se configuran automáticamente cuando el bot se une.</p>
        </div>
      </div>
    </div>
  )
}