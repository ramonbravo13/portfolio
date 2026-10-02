export default function TextBlock({ content, title }) {
  return (
    <div className="notebook-block text-block" style={{ padding: 'var(--spacing-md) 0' }}>
      {title && <h3 style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)' }}>{title}</h3>}
      <div className="quill-render" style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: content || '' }} />
    </div>
  )
}
