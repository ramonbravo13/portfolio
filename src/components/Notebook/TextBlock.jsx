export default function TextBlock({ content }) {
  return (
    <div className="notebook-block text-block" style={{ padding: 'var(--spacing-md) 0' }}>
      <div className="quill-render" style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: content || '' }} />
    </div>
  )
}
