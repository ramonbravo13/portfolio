import { ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '../../utils/sanitize';

export default function LinkBlock({ url, label }) {
  const safeUrl = sanitizeUrl(url);
  return (
    <div className="notebook-block link-block" style={{ margin: 'var(--spacing-md) 0', textAlign: 'center' }}>
      <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', padding: '0.6rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
        {label || url} <ExternalLink size={16} />
      </a>
    </div>
  )
}
