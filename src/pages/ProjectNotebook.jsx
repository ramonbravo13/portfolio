import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import TextBlock from '../components/Notebook/TextBlock';
import CodeBlock from '../components/Notebook/CodeBlock';
import MediaBlock from '../components/Notebook/MediaBlock';
import LinkBlock from '../components/Notebook/LinkBlock';
import { usePortfolio } from '../context/PortfolioContext';

export default function ProjectNotebook() {
  const { id } = useParams();
  const { projects, language } = usePortfolio();

  const isEnglish = language === 'en';
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1 className="text-gradient">{isEnglish ? 'Project not found' : 'Proyecto no encontrado'}</h1>
        <Link to="/" className="btn-primary" style={{ marginTop: 'var(--spacing-md)' }}><ArrowLeft size={18}/> {isEnglish ? 'Back Home' : 'Volver al Inicio'}</Link>
      </div>
    )
  }

  const title = isEnglish && project.title_en ? project.title_en : project.title;
  const tags = isEnglish && project.tags_en && project.tags_en.length > 0 ? project.tags_en : (project.tags || []);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '900px' }}>
      <nav style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}>
          <ArrowLeft size={18} /> {isEnglish ? 'Back to Portfolio' : 'Volver al Portafolio'}
        </Link>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={18} /> {isEnglish ? 'Share' : 'Compartir'}
        </button>
      </nav>

      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 var(--spacing-md) 0', lineHeight: 1.1 }}>{title}</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {tags.map(tag => (
            <span key={tag} className="mono" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="notebook-content">
        {(project.blocks || []).map((block, idx) => {
          switch (block.type) {
            case 'text':
              const textContent = isEnglish && block.content_en ? block.content_en : block.content;
              return <TextBlock key={idx} content={textContent} />;
            case 'code':
              return <CodeBlock key={idx} code={block.code} language={block.language} isExecutable={block.isExecutable} />;
            case 'media':
              return <MediaBlock key={idx} url={block.url} type={block.mediaType} caption={block.caption} />;
            case 'link':
              return <LinkBlock key={idx} url={block.url} label={block.label} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  )
}
