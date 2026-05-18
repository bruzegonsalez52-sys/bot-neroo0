'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const SERVERS = [
  { id: '1500991250311155822', name: 'Servidor Principal' },
  { id: '1384435461065277531', name: 'Servidor Secundario' }
]

export default function TemplatesPage() {
  const [plantillas, setPlantillas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    try {
      const data = await fetch(`${API_URL}/api/plantillas/${SERVERS[0].id}`).then(r => r.json())
      setPlantillas(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Plantillas</h1>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Cargando...</p>
        ) : plantillas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#1a1a3e', borderRadius: '16px' }}>
            <p style={{ color: '#9ca3af' }}>No hay plantillas. Usa /plantilla en Discord para crear una.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {plantillas.map(p => (
              <div key={p.id} style={{ background: '#1a1a3e', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a4a' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{p.nombre}</h3>
                <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>{p.descripcion || 'Sin descripción'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {p.roles?.map((r: any) => (
                    <span key={r.name} style={{ padding: '0.25rem 0.75rem', background: '#5865F220', color: '#5865F2', borderRadius: '20px', fontSize: '0.875rem' }}>
                      {r.name}: {r.cupos || p.cupos_por_rol?.[r.name] || 0}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}