'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const SERVERS = [
  { id: '1500991250311155822', name: 'Servidor Principal' },
  { id: '1384435461065277531', name: 'Servidor Secundario' }
]

export default function BalancesPage() {
  const [balances, setBalances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/balances/${SERVERS[0].id}`)
      .then(r => r.json())
      .then(setBalances)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Balances</h1>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Cargando...</p>
        ) : balances.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No hay balances registrados.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {balances.map((b, i) => (
              <div key={b.user_id} style={{ background: '#1a1a3e', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>#{i + 1} <span style={{ color: '#5865F2' }}>{b.user_id}</span></span>
                <span style={{ color: '#FEE75C', fontSize: '1.25rem' }}>{b.balance?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}