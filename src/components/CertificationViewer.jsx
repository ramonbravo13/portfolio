export default function CertificationViewer({ pdfUrl, title, onClose }) {
  if (!pdfUrl) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(18, 22, 19, 0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--spacing-md)',
      backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '960px',
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)', gap: 'var(--spacing-md)' }}>
          <div>
            <div className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.75rem', marginBottom: '4px' }}>
              ACREDITACIÓN OFICIAL &bull; JUAN RAMÓN BRAVO LÓPEZ
            </div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{title}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              Ver completo ↗
            </a>
            <button onClick={onClose} style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s'
            }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-mist)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >&times;</button>
          </div>
        </div>
        
        <div style={{ flexGrow: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title={title} />
        </div>
      </div>
    </div>
  )
}
