export default function TextBlock({ content }) {
  return (
    <div className="notebook-block text-block" style={{ padding: 'var(--spacing-md) 0' }}>
      <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem' }}>{content}</p>
    </div>
  )
}
