export default function MediaBlock({ url, type, caption }) {
  return (
    <div className="notebook-block media-block" style={{ margin: 'var(--spacing-lg) 0' }}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', border: '1px solid var(--border-glass)' }}>
        {type === 'image' ? (
          <img src={url} alt={caption} style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
        ) : type === 'pdf' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <iframe src={url} width="100%" height="100%" style={{ border: 'none' }} title={caption || 'PDF Document'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Open PDF in new tab ↗
              </a>
            </div>
          </div>
        ) : (
          <video src={url} controls style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
        )}
      </div>
      {caption && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>{caption}</p>}
    </div>
  )
}
