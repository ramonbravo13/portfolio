export default function CertificationViewer({ pdfUrl, title, onClose }) {
  if (!pdfUrl) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--spacing-xl)',
      backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column', padding: 'var(--spacing-md)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', gap: 'var(--spacing-md)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', flexGrow: 1 }}>{title}</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 14px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: '0.85rem', transition: 'background 0.2s', border: '1px solid var(--border-glass)' }}
             onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
             onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
             Ver pantalla completa ↗
          </a>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >&times;</button>
        </div>
        <div style={{ flexGrow: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title={title} />
        </div>
      </div>
    </div>
  )
}
