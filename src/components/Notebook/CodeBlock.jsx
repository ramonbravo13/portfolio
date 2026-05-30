import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function CodeBlock({ code, language, isExecutable = false }) {
  const [output, setOutput] = useState(null);

  const handleExecute = () => {
    // Simple mock execution
    setOutput(`[Simulated Execution] Running ${language} code...\nOutput: Successfully compiled and returned 0.`);
  };

  return (
    <div className="notebook-block code-block" style={{ margin: 'var(--spacing-lg) 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--bg-secondary)', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', borderBottom: 'none' }}>
        <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{language}</span>
        {isExecutable && (
          <button onClick={handleExecute} style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--accent-secondary)'}>
            <Play size={14} fill="currentColor" /> Run Cell
          </button>
        )}
      </div>
      <div style={{ border: '1px solid var(--border-glass)', borderBottomLeftRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, padding: 'var(--spacing-md) var(--spacing-lg)', background: '#111111', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {code}
        </SyntaxHighlighter>
      </div>
      {output && (
        <div className="animate-fade-in" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-md)', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '3px solid var(--accent-primary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
          {output}
        </div>
      )}
    </div>
  )
}
