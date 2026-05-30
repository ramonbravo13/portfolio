export default function MediaBlock({ url, type, caption }) {
  return (
    <div className="notebook-block media-block" style={{ margin: 'var(--spacing-lg) 0' }}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', border: '1px solid var(--border-glass)' }}>
        {type === 'image' ? (
          <img src={url} alt={caption} style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
        ) : (
          <video src={url} controls style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
        )}
      </div>
      {caption && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-sm)', fontStyle: 'italic' }}>{caption}</p>}
    </div>
  )
}
