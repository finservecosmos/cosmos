import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: 'var(--bg-app)' }}>
      <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>404</div>
      <h2 style={{ color: 'var(--text-primary)', margin: '16px 0 8px' }}>Page not found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The page you&apos;re looking for doesn&apos;t exist.</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        Back to Dashboard
      </button>
    </div>
  )
}
