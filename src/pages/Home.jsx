import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, MessageCircle, Code, Terminal, Database, Award, Rocket, 
  Cpu, TrendingUp, Layers, Mail, Phone, MapPin, Briefcase,
  ShieldCheck, ExternalLink, Github, Linkedin, CheckCircle2 
} from 'lucide-react';
import CertificationViewer from '../components/CertificationViewer';
import CertificationsSection from '../components/CertificationsSection';
import EducationSection from '../components/EducationSection';
import ProjectImpactBox, { ProjectCommercialBadge } from '../components/ProjectImpactBox';
import ExperienceCard from '../components/ExperienceCard';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../context/PortfolioContext';
import gsap from 'gsap';

// --- VISUAL REDESIGN COMPONENTS ---
// Editorial Project Card
function EditorialProject({ project, index, isEnglish, getIcon }) {
  const hasCaseStudy = project.problem || project.solution || project.result;
  const title = isEnglish && project.title_en ? project.title_en : project.title;
  const tags = isEnglish && project.tags_en && project.tags_en.length > 0 ? project.tags_en : (project.tags || []);
  const problem = isEnglish && project.problem_en ? project.problem_en : project.problem;
  
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <div className="premium-card animate-fade-up project-card-grid" style={{ 
      position: 'relative',
      paddingBottom: 'var(--spacing-xl)',
      borderTop: '1px solid var(--border-subtle)'
    }}>
      <div className="mono" style={{ paddingTop: '8px' }}>{formattedIndex}</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.15 }}>{title}</h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ProjectCommercialBadge project={project} isEnglish={isEnglish} />
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="mono tech-badge">{tag}</span>
            ))}
          </div>
        </div>

        <div className="project-card-content-grid">
          {project.thumbnailUrl && (
            <div style={{ width: '100%', maxWidth: '350px' }}>
              <img src={project.thumbnailUrl} alt={title} style={{ width: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {problem ? (
              <div className="quill-render" style={{ margin: 0, maxWidth: '68ch' }} dangerouslySetInnerHTML={{ __html: problem }} />
            ) : (
              <p style={{ margin: 0, maxWidth: '68ch' }}>
                {isEnglish ? 'Documented technological case study.' : 'Caso de estudio tecnológico documentado.'}
              </p>
            )}

            {/* Commercial Origin & Business Impact Box */}
            <ProjectImpactBox project={project} isEnglish={isEnglish} />
            
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', marginTop: 'var(--spacing-xs)' }}>
              <Link to={`/project/${project.id}`} className="hover-underline mono" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {isEnglish ? 'Read Case Study' : 'Leer Caso de Estudio'} <ArrowRight size={14} />
              </Link>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="hover-underline mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="hover-underline mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Counter/Metrics Component (Minimal Editorial Version)
function EditorialMetric({ title, value }) {
  return (
    <div style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--border-light)' }}>
      <p className="mono" style={{ margin: 0, marginBottom: '8px', color: 'var(--text-secondary)' }}>{title}</p>
      <div style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// Main Component
export default function Home() {
  const [selectedCert, setSelectedCert] = useState(null);
  const { profile, projects, language } = usePortfolio();
  const isEnglish = language === 'en';

  const getIcon = (type) => {
    switch(type) {
      case 'Database': return <Database size={20} />;
      case 'Terminal': return <Terminal size={20} />;
      case 'Code': return <Code size={20} />;
      case 'Award': return <Award size={20} />;
      case 'Rocket': return <Rocket size={20} />;
      default: return <Code size={20} />;
    }
  };


  const metrics = profile.metrics || {
    yearsExp: "10+",
    projectsCount: "50+",
    appsCount: "2",
    specialist: "IA y Ciencia de Datos",
    specialist_en: "AI & Data Science"
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <main className="page-container animate-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--spacing-xl))' }}>
        
        {/* HERO SECTION */}
        <section id="inicio" style={{
          minHeight: '80vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'center',
          paddingBottom: 'var(--spacing-3xl)'
        }}>
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)', color: 'var(--color-sage)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-voltage)' }}></span>
              Juan Ramón Bravo López &bull; {isEnglish ? 'Portfolio & Archive' : 'Portafolio y Archivo'} — 2026
            </span>
            
            <h1 style={{ margin: 0, fontSize: profile.titleFontSize ? profile.titleFontSize : undefined }}>
              {(isEnglish && profile.title_en ? profile.title_en : profile.title).replace('Cientifico', 'Científico')}
            </h1>
            
            <p style={{ maxWidth: '65ch', margin: 0, fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', lineHeight: 1.7, marginBottom: 'var(--spacing-sm)', textAlign: 'left' }}>
              {isEnglish && profile.bio_en ? profile.bio_en : profile.bio}
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <a href="#proyectos" className="btn-primary">
                {isEnglish ? 'Selected Works' : 'Trabajos Seleccionados'} <ArrowRight size={16} />
              </a>
              <a href="#certificaciones" className="btn-secondary">
                <Award size={16} /> {isEnglish ? 'Certifications' : 'Certificaciones'}
              </a>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'var(--spacing-sm)' }}>
              {(isEnglish && profile.skills_en && profile.skills_en.length > 0 ? profile.skills_en : (profile.skills || [])).map((tag, idx) => (
                <span key={idx} className="mono tech-badge">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up delay-200" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {profile.profileImage && (
              <div style={{
                width: '100%',
                maxWidth: '420px',
                border: '1px solid var(--border-subtle)',
                padding: '12px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '4/5',
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}>
                  <img 
                    src={profile.profileImage} 
                    alt="Juan Ramón Bravo López - Científico de Datos & Inteligencia Artificial" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }} className="mono">
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Juan Ramón Bravo López</span>
                  <span style={{ color: 'var(--color-sage)', fontSize: '0.7rem' }}>DATA & AI</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* METRICS / OVERVIEW SECTION */}
        <section style={{ paddingBottom: 'var(--spacing-3xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)' }}>
            <EditorialMetric title={isEnglish ? "Experience" : "Experiencia"} value={metrics.yearsExp} />
            <EditorialMetric title={isEnglish ? "Projects" : "Proyectos"} value={metrics.projectsCount} />
            <EditorialMetric title={isEnglish ? "Specialty" : "Especialidad"} value={isEnglish && metrics.specialist_en ? metrics.specialist_en : metrics.specialist} />
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="proyectos" className="section-container">
          <div style={{ marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ margin: 0 }}>{isEnglish ? 'Projects & Development' : 'Proyectos y Desarrollo'}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {projects.map((project, idx) => (
              <EditorialProject key={project.id} project={project} index={idx} isEnglish={isEnglish} getIcon={getIcon} />
            ))}
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experiencia" className="section-container">
          <div style={{ marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ margin: 0 }}>{isEnglish ? 'Professional Experience' : 'Experiencia Profesional'}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {(profile.experiences || []).length === 0 ? (
              <p>{isEnglish ? 'No professional experience registered yet.' : 'No se ha registrado experiencia profesional aún.'}</p>
            ) : (
              (profile.experiences || []).map((item, idx) => (
                <ExperienceCard key={idx} item={item} isEnglish={isEnglish} />
              ))
            )}
          </div>
        </section>

        {/* EDUCATION & RESEARCH SECTION (ACADEMIC RIGOR & PAPERS) */}
        <EducationSection 
          education={profile.education || []} 
          isEnglish={isEnglish} 
          onSelectDoc={setSelectedCert} 
        />

        {/* TECHNICAL CERTIFICATIONS SECTION (COMPACT CREDENTIALS) */}
        <CertificationsSection 
          certs={profile.certs || []} 
          isEnglish={isEnglish} 
          onSelectCert={setSelectedCert} 
        />

        {/* CONTACT SECTION */}
        <section id="contacto" className="section-container" style={{ textAlign: 'center', paddingBottom: 'var(--spacing-3xl)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="mono" style={{ display: 'inline-block', color: 'var(--color-sage)', marginBottom: 'var(--spacing-xs)', letterSpacing: '0.08em' }}>
              {isEnglish ? 'CONNECT & COLLABORATE' : 'CONTACTO Y COLABORACIÓN'}
            </span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
              {isEnglish ? "Let's Talk" : 'Hablemos'}
            </h2>
            <p style={{ fontSize: '1.15rem', marginBottom: 'var(--spacing-xl)', maxWidth: '65ch', margin: '0 auto var(--spacing-xl) auto', lineHeight: 1.7, textAlign: 'center', color: 'var(--text-secondary)' }}>
              {isEnglish 
                ? 'Do you have a software, data science or artificial intelligence problem that requires a sophisticated engineering solution? Write to Juan Ramón Bravo López directly.' 
                : '¿Tienes un problema de software, ciencia de datos o inteligencia artificial que requiera una solución de ingeniería sofisticada? Escríbeme directamente.'}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
              <a href="mailto:ramonbravo13@gmail.com" className="btn-primary">
                <Mail size={16} /> ramonbravo13@gmail.com
              </a>
              <a href="https://wa.me/523315004877" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }} className="mono">
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Guadalajara, Jalisco, México
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: 'var(--spacing-2xl)',
          paddingBottom: 'var(--spacing-xl)',
          marginTop: 'var(--spacing-xl)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            <div style={{ maxWidth: '440px' }}>
              <div style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                marginBottom: 'var(--spacing-xs)',
                color: 'var(--text-primary)'
              }}>
                <span style={{ color: 'var(--color-sage)', fontWeight: 500 }}>Juan Ramón</span> Bravo López
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6, textAlign: 'left' }}>
                {isEnglish
                  ? 'Data Scientist, Artificial Intelligence Specialist & Senior Software Engineer. Building reliable data architectures, machine learning models and scalable software.'
                  : 'Científico de Datos, Especialista en Inteligencia Artificial e Ingeniero de Software Senior. Creando arquitecturas de datos confiables, modelos predictivos y software escalable.'}
              </p>
              <div className="mono" style={{ color: 'var(--color-sage)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Guadalajara, Jalisco, México
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', flexWrap: 'wrap' }}>
              <div>
                <div className="mono" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>
                  {isEnglish ? 'Navigation' : 'Navegación'}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="#inicio" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isEnglish ? 'Home' : 'Inicio'}</a></li>
                  <li><a href="#proyectos" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isEnglish ? 'Projects & Dev' : 'Proyectos y Desarrollo'}</a></li>
                  <li><a href="#experiencia" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isEnglish ? 'Experience' : 'Experiencia'}</a></li>
                  <li><a href="#certificaciones" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isEnglish ? 'Certifications' : 'Certificaciones'}</a></li>
                  <li><a href="#contacto" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isEnglish ? 'Contact' : 'Contacto'}</a></li>
                </ul>
              </div>

              <div>
                <div className="mono" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>
                  {isEnglish ? 'Connect' : 'Contacto Directo'}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <a href="mailto:ramonbravo13@gmail.com" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> ramonbravo13@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/523315004877" target="_blank" rel="noopener noreferrer" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={14} /> WhatsApp Direct
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Linkedin size={14} /> LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover-underline" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Github size={14} /> GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: 'var(--spacing-md)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-md)'
          }}>
            <div className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.75rem' }}>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }}>
                © {new Date().getFullYear()} Juan Ramón Bravo López. {isEnglish ? 'All rights reserved.' : 'Todos los derechos reservados.'}
              </Link>
            </div>
            <div className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-voltage)' }}></span>
              Data Science & AI Portfolio
            </div>
          </div>
        </footer>

      </main>

      {/* Certification Modal Viewer */}
      {selectedCert && (
        <CertificationViewer 
          title={selectedCert.title} 
          pdfUrl={selectedCert.url} 
          onClose={() => setSelectedCert(null)} 
        />
      )}
    </div>
  )
}
