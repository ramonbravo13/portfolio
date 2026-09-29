import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, MessageCircle, Code, Terminal, Database, Award, Rocket, 
  Cpu, TrendingUp, Layers, Mail, Phone, MapPin, Briefcase 
} from 'lucide-react';
import CertificationViewer from '../components/CertificationViewer';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../context/PortfolioContext';
import gsap from 'gsap';

// --- VISUAL REDESIGN COMPONENTS ---

// ImageTrail Component
function ImageTrail({ images }) {
  useEffect(() => {
    // Only initialize if we have valid images and it's not a small screen
    if (!images || images.length === 0 || window.innerWidth < 768) return;
    
    // Filter out undefined/null images
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return;
    
    let currentIndex = 0;
    let lastRenderTime = 0;
    let zIndexCounter = 100;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let requestRef;
    
    // Pre-create DOM elements
    const imgElements = validImages.map(src => {
      const img = document.createElement('img');
      img.src = src;
      Object.assign(img.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '420px',
        objectFit: 'cover',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translate(-50%, -50%) scale(0.8)',
        zIndex: '0',
        display: 'none',
        border: '1px solid var(--border-light)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      });
      document.body.appendChild(img);
      return img;
    });

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const now = Date.now();
      if (now - lastRenderTime < 100) return; // 100ms throttle for trail density
      lastRenderTime = now;
      
      const img = imgElements[currentIndex];
      if (!img) return;
      
      img.style.display = 'block';
      img.style.zIndex = zIndexCounter++;
      
      // GSAP Animation
      gsap.fromTo(img, 
        { 
          x: mouseX, 
          y: mouseY, 
          scale: 0.8, 
          opacity: 0,
          rotation: Math.random() * 10 - 5
        },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(img, {
              opacity: 0,
              scale: 0.9,
              duration: 0.6,
              delay: 0.5,
              ease: 'power2.in',
              onComplete: () => {
                img.style.display = 'none';
              }
            });
          }
        }
      );
      
      currentIndex = (currentIndex + 1) % validImages.length;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef) cancelAnimationFrame(requestRef);
      imgElements.forEach(img => {
        if (img && img.parentNode) {
          gsap.killTweensOf(img);
          img.parentNode.removeChild(img);
        }
      });
    };
  }, [images]);

  return null;
}

// Editorial Project Card
function EditorialProject({ project, index, isEnglish, getIcon }) {
  const hasCaseStudy = project.problem || project.solution || project.result;
  const title = isEnglish && project.title_en ? project.title_en : project.title;
  const tags = isEnglish && project.tags_en && project.tags_en.length > 0 ? project.tags_en : (project.tags || []);
  const problem = isEnglish && project.problem_en ? project.problem_en : project.problem;
  
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <div className="premium-card animate-fade-up" style={{ 
      position: 'relative',
      paddingBottom: 'var(--spacing-xl)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 'var(--spacing-lg)',
      alignItems: 'start'
    }}>
      <div className="mono" style={{ paddingTop: '8px' }}>{formattedIndex}</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--spacing-md)' }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 1 }}>{title}</h3>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="mono tech-badge">{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-xl)', marginTop: 'var(--spacing-sm)' }}>
          <div>
            <p style={{ margin: 0, maxWidth: '600px' }}>
              {problem ? problem : (isEnglish ? 'Documented technological case study.' : 'Caso de estudio tecnológico documentado.')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
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
  );
}

// Counter/Metrics Component (Minimal Editorial Version)
function EditorialMetric({ title, value }) {
  return (
    <div style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--border-light)' }}>
      <p className="mono" style={{ margin: 0, marginBottom: '8px', color: 'var(--text-secondary)' }}>{title}</p>
      <div style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{value}</div>
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

  // Collect all project images for the ImageTrail
  const projectImages = projects.map(p => p.thumbnailUrl).filter(Boolean);

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
      
      {/* Visual Effect: Image Trail (only uses existing project images) */}
      {projectImages.length > 0 && <ImageTrail images={projectImages} />}

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
            <span className="mono" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
              {isEnglish ? 'Portfolio & Archive' : 'Portafolio y Archivo'} — 2026
            </span>
            
            <h1 style={{ margin: 0, fontSize: profile.titleFontSize ? profile.titleFontSize : undefined }}>
              {(isEnglish && profile.title_en ? profile.title_en : profile.title).replace('Cientifico', 'Científico')}
            </h1>
            
            <p style={{ maxWidth: '600px', margin: 0, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', marginBottom: 'var(--spacing-sm)' }}>
              {isEnglish && profile.bio_en ? profile.bio_en : profile.bio}
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <a href="#proyectos" className="btn-primary">
                {isEnglish ? 'Selected Works' : 'Trabajos Seleccionados'} <ArrowRight size={16} />
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
                aspectRatio: '4/5',
                border: '1px solid var(--border-subtle)',
                padding: '12px',
                backgroundColor: 'transparent'
              }}>
                <img 
                  src={profile.profileImage} 
                  alt={profile.name || "Profile"} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }} 
                />
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
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ margin: 0 }}>{isEnglish ? 'Index of Work' : 'Índice de Trabajo'}</h2>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-subtle)', marginTop: 'var(--spacing-md)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {projects.map((project, idx) => (
              <EditorialProject key={project.id} project={project} index={idx} isEnglish={isEnglish} getIcon={getIcon} />
            ))}
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experiencia" className="section-container">
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ margin: 0 }}>{isEnglish ? 'Trajectory' : 'Trayectoria'}</h2>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-subtle)', marginTop: 'var(--spacing-md)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(profile.experiences || []).length === 0 ? (
              <p>{isEnglish ? 'No professional experience registered yet.' : 'No se ha registrado experiencia profesional aún.'}</p>
            ) : (
              (profile.experiences || []).map((item, idx) => {
                const role = isEnglish && item.role_en ? item.role_en : item.role;
                const period = isEnglish && item.period_en ? item.period_en : item.period;
                const desc = isEnglish && item.desc_en ? item.desc_en : item.desc;
                const tag = isEnglish && item.tag_en ? item.tag_en : item.tag;
                
                return (
                  <div key={idx} className="premium-card animate-fade-up" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr', 
                    gap: 'var(--spacing-lg)',
                    alignItems: 'start'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.company}</h3>
                      <span className="mono">{period}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{role}</h4>
                        {tag && (
                          <div className="mono tech-badge quill-render" dangerouslySetInnerHTML={{ __html: tag || '' }} style={{ padding: '8px 12px' }} />
                        )}
                      </div>
                      <div className="quill-render" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: desc || '' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certificaciones" className="section-container">
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ margin: 0 }}>{isEnglish ? 'Credentials' : 'Credenciales'}</h2>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-subtle)', marginTop: 'var(--spacing-md)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
            {(profile.certs || []).length === 0 ? (
              <p>{isEnglish ? 'No certifications added yet.' : 'Aún no se han agregado certificaciones.'}</p>
            ) : (
              (profile.certs || []).map((cert, idx) => {
                const title = (isEnglish && cert.title_en ? cert.title_en : cert.title).replace('Datoss', 'Datos');
                const desc = isEnglish && cert.desc_en ? cert.desc_en : cert.desc;

                return (
                  <div key={cert.id || idx} onClick={() => setSelectedCert(cert)} className="premium-card animate-fade-up" style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px'
                  }}>
                    {cert.url && (
                      <div style={{
                        width: '100%',
                        aspectRatio: '1.414 / 1',
                        marginBottom: 'var(--spacing-md)',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}>
                        <iframe 
                          src={`${cert.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                          style={{
                            width: '200%',
                            height: '200%',
                            transform: 'scale(0.5)',
                            transformOrigin: 'top left',
                            border: 'none',
                            pointerEvents: 'none'
                          }}
                          title={title}
                          tabIndex={-1}
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></div>
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{title}</h3>
                      {desc && <p style={{ fontSize: '1rem' }}>{desc}</p>}
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <span className="hover-underline mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        {isEnglish ? 'View Document' : 'Ver Documento'} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contacto" className="section-container" style={{ textAlign: 'center', paddingBottom: 'var(--spacing-2xl)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: 'var(--spacing-lg)' }}>
              {isEnglish ? "Let's Talk" : 'Hablemos'}
            </h2>
            <p style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xl)' }}>
              {isEnglish ? 'Do you have a software, data science or artificial intelligence problem that requires a sophisticated engineering solution? Write me directly.' : '¿Tienes un problema de software, ciencia de datos o inteligencia artificial que requiera una solución de ingeniería sofisticada? Escríbeme.'}
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
