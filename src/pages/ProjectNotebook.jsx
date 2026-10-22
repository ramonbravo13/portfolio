import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import TextBlock from '../components/Notebook/TextBlock';
import CodeBlock from '../components/Notebook/CodeBlock';
import MediaBlock from '../components/Notebook/MediaBlock';
import LinkBlock from '../components/Notebook/LinkBlock';
import ProjectImpactBox, { ProjectCommercialBadge } from '../components/ProjectImpactBox';
import { usePortfolio } from '../context/PortfolioContext';

export default function ProjectNotebook() {
  const { id } = useParams();
  const { projects, language } = usePortfolio();

  const isEnglish = language === 'en';
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>{isEnglish ? 'Project not found' : 'Proyecto no encontrado'}</h1>
        <Link to="/" className="btn-primary" style={{ marginTop: 'var(--spacing-md)' }}><ArrowLeft size={18}/> {isEnglish ? 'Back Home' : 'Volver al Inicio'}</Link>
      </div>
    )
  }

  const title = isEnglish && project.title_en ? project.title_en : project.title;
  const tags = isEnglish && project.tags_en && project.tags_en.length > 0 ? project.tags_en : (project.tags || []);
  const problem = isEnglish && project.problem_en ? project.problem_en : project.problem;
  const solution = isEnglish && project.solution_en ? project.solution_en : project.solution;
  const result = isEnglish && project.result_en ? project.result_en : project.result;

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

      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', margin: '0 0 var(--spacing-md) 0', lineHeight: 1.15, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{title}</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
          <ProjectCommercialBadge project={project} isEnglish={isEnglish} />
          {tags.map(tag => (
            <span key={tag} className="mono tech-badge">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Commercial Origin & Business Impact Box */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <ProjectImpactBox project={project} isEnglish={isEnglish} />
      </div>

      {project.thumbnailUrl && (
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <img src={project.thumbnailUrl} alt={title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
        </div>
      )}

      <div className="notebook-content">
        {problem && (
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)' }}>{isEnglish ? 'The Problem' : 'El Problema'}</h3>
            <div className="quill-render" dangerouslySetInnerHTML={{ __html: problem }} />
          </div>
        )}
        
        {solution && (
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)' }}>{isEnglish ? 'The Solution' : 'La Solución'}</h3>
            <div className="quill-render" dangerouslySetInnerHTML={{ __html: solution }} />
          </div>
        )}
        
        {result && (
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)' }}>{isEnglish ? 'The Result' : 'El Resultado'}</h3>
            <div className="quill-render" dangerouslySetInnerHTML={{ __html: result }} />
          </div>
        )}

        {(project.blocks || []).map((block, idx) => {
          switch (block.type) {
            case 'text': {
              const textContent = isEnglish && block.content_en ? block.content_en : block.content;
              const blockTitle = isEnglish && block.title_en ? block.title_en : block.title;
              return <TextBlock key={idx} content={textContent} title={blockTitle} />;
            }
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

      {/* Bottom Navigation: Back to Portfolio */}
      <footer style={{
        marginTop: 'var(--spacing-3xl)',
        paddingTop: 'var(--spacing-2xl)',
        paddingBottom: 'var(--spacing-3xl)',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-md)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {isEnglish 
            ? 'Finished exploring this case study?' 
            : '¿Terminaste de explorar este caso de estudio?'}
        </p>
        <Link 
          to="/" 
          className="btn-primary" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '0.85rem 2rem',
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={18} /> {isEnglish ? 'Back to Portfolio' : 'Regresar al Portafolio'}
        </Link>
      </footer>
    </div>
  )
}
