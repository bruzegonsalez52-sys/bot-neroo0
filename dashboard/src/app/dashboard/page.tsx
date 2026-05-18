'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const SERVERS = [
  { id: '1500991250311155822', name: 'Servidor Principal' },
  { id: '1384435461065277531', name: 'Servidor Secundario' }
]

export default function DashboardPage() {
  const [selectedServer, setSelectedServer] = useState(SERVERS[0].id)
  const [plantillas, setPlantillas] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [balances, setBalances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [p, e, b] = await Promise.all([
        fetch(`${API_URL}/api/plantillas/${selectedServer}`).then(r => r.json()),
        fetch(`${API_URL}/api/eventos/${selectedServer}`).then(r => r.json()),
        fetch(`${API_URL}/api/balances/${selectedServer}`).then(r => r.json())
      ])
      setPlantillas(p)
      setEventos(e)
      setBalances(b)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedServer])

  const stats = [
    { label: 'Plantillas', value: plantillas.length, color: '#5865F2' },
    { label: 'Eventos Activos', value: eventos.filter(e => e.estado === 'abierto').length, color: '#57F287' },
    { label: 'Balances', value: balances.length, color: '#FEE75C' }
  ]

  const menuItems = [
    { title: 'Plantillas', description: 'Gestionar plantillas de eventos', href: '/dashboard/templates', color: '#5865F2' },
    { title: 'Balances', description: 'Ver balances de jugadores', href: '/dashboard/balances', color: '#FEE75C' },
    { title: 'Servidores', description: 'Configurar servidores', href: '/dashboard/servers', color: '#57F287' }
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>BotNeroo0 Dashboard</h1>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            style={{ padding: '0.75rem 1rem', background: '#1a1a3e', border: '1px solid #2a2a4a', borderRadius: '8px', color: '#fff' }}
          >
            {SERVERS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#1a1a3e', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${s.color}30` }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: s.color }}>{s.value}</p>
              <p style={{ color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#9ca3af' }}>Cargando...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {menuItems.map(item => (
              <Link key={item.title} href={item.href}>
                <div style={{ background: '#1a1a3e', padding: '2rem', borderRadius: '16px', border: '1px solid #2a2a4a', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: '#9ca3af' }}>{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}