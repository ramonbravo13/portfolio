import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, MessageCircle, Code, Terminal, Database, Award, Rocket, 
  Cpu, TrendingUp, Layers, Mail, Phone, MapPin, Briefcase 
} from 'lucide-react';
import CertificationViewer from '../components/CertificationViewer';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../context/PortfolioContext';

// Animated Counter Component
function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const isSpecialty = isNaN(parseInt(value.replace(/\D/g, ''), 10));
    if (isSpecialty) {
      setCount(value);
      return;
    }

    const numericValue = parseInt(value.replace(/\D/g, ''), 10);
    const suffix = value.replace(/[0-9]/g, '');
    let start = 0;
    const end = numericValue;
    if (start === end) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeProgress = percentage * (2 - percentage); // Ease out quad
      const currentCount = Math.floor(easeProgress * (end - start) + start);
      
      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const isNumeric = !isNaN(parseInt(value.replace(/\D/g, ''), 10));
  return <span>{isNumeric ? `${count}${value.replace(/[0-9]/g, '')}` : value}</span>;
}

// Metric Card Component
function MetricCard({ title, value, startTrigger, icon: Icon }) {
  return (
    <div className="premium-card animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center',
      padding: 'var(--spacing-xl) var(--spacing-md)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        opacity: 0.03,
        color: 'var(--text-primary)'
      }}>
        {Icon && <Icon size={64} />}
      </div>
      <h3 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 800, 
        color: 'var(--text-primary)', 
        marginBottom: 'var(--spacing-xs)',
        letterSpacing: '-0.03em'
      }}>
        {startTrigger ? <AnimatedCounter value={value} /> : '0'}
      </h3>
      <p style={{ 
        margin: 0, 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        fontWeight: 600, 
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>{title}</p>
    </div>
  );
}

// Metrics Counter Section with Scroll Trigger
function CounterSection({ isEnglish }) {
  const { profile } = usePortfolio();
  const metrics = profile.metrics || {
    yearsExp: "10+",
    projectsCount: "50+",
    appsCount: "2",
    specialist: "IA y Ciencia de Datos",
    specialist_en: "AI & Data Science"
  };

  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
      gap: 'var(--spacing-lg)',
      marginTop: 'var(--spacing-2xl)',
      marginBottom: 'var(--spacing-3xl)'
    }}>
      <MetricCard title={isEnglish ? "Years of experience" : "Años de experiencia"} value={metrics.yearsExp} startTrigger={visible} icon={Briefcase} />
      <MetricCard title={isEnglish ? "Projects developed" : "Proyectos desarrollados"} value={metrics.projectsCount} startTrigger={visible} icon={Cpu} />
      <MetricCard title={isEnglish ? "Apps published" : "Aplicaciones publicadas"} value={metrics.appsCount} startTrigger={visible} icon={Rocket} />
      <MetricCard title={isEnglish ? "Specialist in" : "Especialista en"} value={isEnglish && metrics.specialist_en ? metrics.specialist_en : metrics.specialist} startTrigger={visible} icon={Layers} />
    </div>
  );
}

export default function Home() {
  const [selectedCert, setSelectedCert] = useState(null);
  const { profile, projects, language } = usePortfolio();
  
  const isEnglish = language === 'en';


  const getIcon = (type) => {
    switch(type) {
      case 'Database': return <Database size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'Terminal': return <Terminal size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'Code': return <Code size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'Award': return <Award size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'Rocket': return <Rocket size={20} style={{ color: 'var(--accent-primary)' }} />;
      default: return <Code size={20} style={{ color: 'var(--accent-primary)' }} />;
    }
  }


  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* Main Content Layout */}
      <main className="page-container animate-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--spacing-xl))' }}>
        
        {/* HERO SECTION */}
        <section id="inicio" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'center',
          minHeight: '80vh',
          paddingBottom: 'var(--spacing-3xl)'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(isEnglish && profile.skills_en && profile.skills_en.length > 0 ? profile.skills_en : (profile.skills || [])).map((tag, idx) => (
                <span key={idx} className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', 
              fontWeight: 800, 
              lineHeight: 1.1, 
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)'
            }}>
              {isEnglish && profile.title_en ? profile.title_en : profile.title}
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6,
              fontWeight: 400,
              maxWidth: '600px',
              margin: 0
            }}>
              {isEnglish && profile.bio_en ? profile.bio_en : profile.bio}
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
              <a href="#proyectos" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                {isEnglish ? 'View projects' : 'Ver proyectos'} <ArrowRight size={16} />
              </a>
              <a href="#contacto" className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                {isEnglish ? 'Contact' : 'Contactar'}
              </a>
            </div>
          </div>

          {/* Right Column - Premium image frame */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: 'calc(var(--radius-lg) - 10px)'
                  }} 
                />
              ) : (
                // Stunning geometric tech fallback
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at center, rgba(37,99,235,0.05) 0%, transparent 70%)',
                  gap: 'var(--spacing-md)'
                }}>
                  <Cpu size={80} style={{ color: 'var(--border-subtle)', opacity: 0.5 }} />
                  <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>RB // CORE_ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-2xl)' }}>
          <CounterSection isEnglish={isEnglish} />
        </section>

        {/* PROJECTS SECTION */}
        <section id="proyectos" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{isEnglish ? 'Portfolio' : 'Portafolio'}</span>
            <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem' }}>{isEnglish ? 'Featured projects' : 'Proyectos destacados'}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
            {projects.map(project => {
              const hasCaseStudy = project.problem || project.solution || project.result;
              const title = isEnglish && project.title_en ? project.title_en : project.title;
              const tags = isEnglish && project.tags_en && project.tags_en.length > 0 ? project.tags_en : (project.tags || []);
              const problem = isEnglish && project.problem_en ? project.problem_en : project.problem;
              const solution = isEnglish && project.solution_en ? project.solution_en : project.solution;
              const result = isEnglish && project.result_en ? project.result_en : project.result;

              return (
                <div key={project.id} className="premium-card" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: project.thumbnailUrl ? 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' : '1fr',
                  gap: 'var(--spacing-2xl)',
                  padding: 'var(--spacing-2xl)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  {/* Left (or full) details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {getIcon(project.iconType)}
                      <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{title}</h3>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '4px 0' }}>
                      {tags.map(tag => (
                        <span key={tag} className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {hasCaseStudy ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                        {problem && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>{isEnglish ? 'The Problem' : 'El Problema'}</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{problem}</p>
                          </div>
                        )}
                        {solution && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>{isEnglish ? 'The Solution' : 'La Solución'}</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{solution}</p>
                          </div>
                        )}
                        {result && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>{isEnglish ? 'The Result' : 'El Resultado'}</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{result}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback for projects with only notebook blocks
                      <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0' }}>
                        {isEnglish ? 'Documented technological case study. Click the button below to view full specifications, diagrams, and code.' : 'Caso de estudio tecnológico documentado. Haz clic en el botón de abajo para ver la especificación completa, diagramas y código.'}
                      </p>
                    )}

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <Link to={`/project/${project.id}`} className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                        {isEnglish ? 'View full case study' : 'Ver caso completo'} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Right featured image */}
                  {project.thumbnailUrl && (
                    <div style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      maxHeight: '380px'
                    }}>
                      <img src={project.thumbnailUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certificaciones" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{isEnglish ? 'Credentials' : 'Credenciales'}</span>
            <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem' }}>{isEnglish ? 'Certifications & Awards' : 'Certificaciones y Reconocimientos'}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--spacing-xl)' }}>
            {(profile.certs || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1', padding: 'var(--spacing-lg)' }}>
                {isEnglish ? 'No certifications added yet.' : 'Aún no se han agregado certificaciones.'}
              </p>
            ) : (
              (profile.certs || []).map((cert, idx) => {
                const title = isEnglish && cert.title_en ? cert.title_en : cert.title;
                const tags = isEnglish && cert.tags_en ? cert.tags_en : cert.tags;
                const desc = isEnglish && cert.desc_en ? cert.desc_en : cert.desc;

                return (
                  <div key={cert.id || idx} onClick={() => setSelectedCert(cert)} className="premium-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <Award size={24} style={{ color: 'var(--accent-primary)' }} />
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
                    </div>
                    {tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tags.split(',').map((tag, tagIdx) => (
                          <span key={tagIdx} className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {desc && (
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {desc}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-subtle)' }}>
                      <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {isEnglish ? 'View PDF Document' : 'Ver Documento PDF'} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experiencia" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{isEnglish ? 'Trajectory' : 'Trayectoria'}</span>
            <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem' }}>{isEnglish ? 'Professional experience' : 'Experiencia profesional'}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {(profile.experiences || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                {isEnglish ? 'No professional experience registered yet.' : 'No se ha registrado experiencia profesional aún.'}
              </p>
            ) : (
              (profile.experiences || []).map((item, idx) => {
                const role = isEnglish && item.role_en ? item.role_en : item.role;
                const period = isEnglish && item.period_en ? item.period_en : item.period;
                const tag = isEnglish && item.tag_en ? item.tag_en : item.tag;
                const desc = isEnglish && item.desc_en ? item.desc_en : item.desc;
                
                return (
                  <div key={idx} className="premium-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-md)',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{role}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.company}</p>
                      </div>
                      <span className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {period}
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {tag}
                    </div>
                    <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {desc}
                    </p>
                  </div>
                );
              })
            )}
          </div>

        </section>

        {/* CONTACT SECTION */}
        <section id="contacto" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto', gap: 'var(--spacing-xl)' }}>
            
            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', alignItems: 'center', width: '100%' }}>
              <div>
                <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{isEnglish ? 'Contact' : 'Contacto'}</span>
                <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>{isEnglish ? "Let's talk about your next project" : 'Hablemos de tu próximo proyecto'}</h2>
              </div>
              
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isEnglish ? 'Do you have a software, data science or artificial intelligence problem that requires a sophisticated engineering solution? Write me or schedule a video call directly.' : '¿Tienes un problema de software, ciencia de datos o inteligencia artificial que requiera una solución de ingeniería sofisticada? Escríbeme o agenda una videollamada directamente.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>ramonbravo13@gmail.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>Guadalajara Jalisco México</span>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="premium-card" style={{ 
                marginTop: 'var(--spacing-md)', 
                borderRadius: 'var(--radius-md)', 
                borderColor: 'var(--accent-primary)',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, transparent 100%)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
              }}>
                <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.05rem', marginBottom: 'var(--spacing-xs)' }}>
                  <MessageCircle size={18} style={{ color: 'var(--accent-primary)' }} /> {isEnglish ? 'Direct chat' : 'Chat directo'}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                  {isEnglish ? 'Send me a WhatsApp message for fast and direct communication.' : 'Envíame un mensaje por WhatsApp para una comunicación rápida y directa.'}
                </p>
                <a href="https://wa.me/523315004877" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '0.6rem 1.2rem', textDecoration: 'none', backgroundColor: '#25D366', color: '#000', border: 'none' }}>
                  <MessageCircle size={16} /> {isEnglish ? 'Send WhatsApp' : 'Enviar WhatsApp'}
                </a>
              </div>
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
