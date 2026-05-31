import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Calendar, Code, Terminal, Database, Award, Rocket, 
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
function CounterSection() {
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 'var(--spacing-lg)',
      marginTop: 'var(--spacing-2xl)',
      marginBottom: 'var(--spacing-3xl)'
    }}>
      <MetricCard title="Años de experiencia" value="10+" startTrigger={visible} icon={Briefcase} />
      <MetricCard title="Proyectos desarrollados" value="50+" startTrigger={visible} icon={Cpu} />
      <MetricCard title="Aplicaciones publicadas" value="2" startTrigger={visible} icon={Rocket} />
      <MetricCard title="Especialista en" value="IA y Ciencia de Datos" startTrigger={visible} icon={Layers} />
    </div>
  );
}

export default function Home() {
  const [selectedCert, setSelectedCert] = useState(null);
  const { profile, projects } = usePortfolio();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  };
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* Main Content Layout */}
      <main className="page-container animate-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--spacing-xl))' }}>
        
        {/* HERO SECTION */}
        <section id="inicio" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'center',
          minHeight: '80vh',
          paddingBottom: 'var(--spacing-3xl)'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DESARROLLO DE SOFTWARE</span>
              <span className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>CIENCIA DE DATOS</span>
              <span className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>INTELIGENCIA ARTIFICIAL</span>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', 
              fontWeight: 800, 
              lineHeight: 1.1, 
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)'
            }}>
              Transformo problemas complejos en soluciones tecnológicas escalables.
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6,
              fontWeight: 400,
              maxWidth: '600px',
              margin: 0
            }}>
              Desarrollo software, inteligencia artificial y soluciones de datos que generan resultados medibles y potencian la transformación digital.
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
              <a href="#proyectos" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                Ver proyectos <ArrowRight size={16} />
              </a>
              <a href="#contacto" className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                Contactar
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
          <CounterSection />
        </section>

        {/* PROJECTS SECTION */}
        <section id="proyectos" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Portafolio</span>
            <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem' }}>Proyectos destacados</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
            {projects.map(project => {
              const hasCaseStudy = project.problem || project.solution || project.result;
              return (
                <div key={project.id} className="premium-card" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: project.thumbnailUrl ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
                  gap: 'var(--spacing-2xl)',
                  padding: 'var(--spacing-2xl)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  {/* Left (or full) details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {getIcon(project.iconType)}
                      <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{project.title}</h3>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '4px 0' }}>
                      {(project.tags || []).map(tag => (
                        <span key={tag} className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {hasCaseStudy ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                        {project.problem && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>El Problema</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{project.problem}</p>
                          </div>
                        )}
                        {project.solution && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>La Solución</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{project.solution}</p>
                          </div>
                        )}
                        {project.result && (
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>El Resultado</h4>
                            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{project.result}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback for projects with only notebook blocks
                      <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0' }}>
                        Caso de estudio tecnológico documentado. Haz clic en el botón de abajo para ver la especificación completa, diagramas y código.
                      </p>
                    )}

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <Link to={`/project/${project.id}`} className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                        Ver caso completo <ArrowRight size={14} />
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

        {/* EXPERIENCE SECTION */}
        <section id="experiencia" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Trayectoria</span>
            <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem' }}>Experiencia profesional</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {(profile.experiences || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No se ha registrado experiencia profesional aún.
              </p>
            ) : (
              (profile.experiences || []).map((item, idx) => (
              <div key={idx} className="premium-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{item.role}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.company}</p>
                  </div>
                  <span className="mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                    {item.period}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.tag}
                </div>
                <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))
            )}
          </div>

          {/* Certifications Box within Experience Section */}
          <div className="premium-card" style={{ marginTop: 'var(--spacing-2xl)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Certificaciones y Acreditaciones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
              {(profile.certs || []).map((cert, idx) => (
                <div key={idx} onClick={() => setSelectedCert(cert)} style={{
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <Award size={20} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{cert.title}</span>
                  </div>
                  <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PDF ↗</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contacto" className="section-container" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-3xl)' }}>
            
            {/* Left side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', justifyContent: 'center' }}>
              <div>
                <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Contacto</span>
                <h2 style={{ display: 'block', marginTop: 'var(--spacing-xs)', fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>Hablemos de tu próximo proyecto</h2>
              </div>
              
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ¿Tienes un problema de software, ciencia de datos o inteligencia artificial que requiera una solución de ingeniería sofisticada? Escríbeme o agenda una videollamada directamente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>juanbravolopez@outlook.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>San José, Costa Rica</span>
                </div>
              </div>

              {/* Calendly / Schedule Card */}
              <div className="premium-card" style={{ 
                marginTop: 'var(--spacing-md)', 
                borderRadius: 'var(--radius-md)', 
                borderColor: 'var(--accent-primary)',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, transparent 100%)' 
              }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', marginBottom: 'var(--spacing-xs)' }}>
                  <Calendar size={18} style={{ color: 'var(--accent-primary)' }} /> Videollamada de 15 min
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                  Agenda una sesión de consultoría técnica sin costo para revisar tus objetivos.
                </p>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
                  Reservar en Calendly
                </a>
              </div>
            </div>

            {/* Right side form */}
            <div className="premium-card" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2xl)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.25rem' }}>Enviar un mensaje</h3>
              
              {formSubmitted ? (
                <div style={{ 
                  background: 'rgba(16,185,129,0.06)', 
                  border: '1px solid #10b981', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: 'var(--spacing-lg)', 
                  textAlign: 'center' 
                }}>
                  <h4 style={{ color: '#10b981', marginBottom: '4px' }}>¡Mensaje enviado con éxito!</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gracias por contactar. Te responderé a la brevedad.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactForm.name} 
                      onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={contactForm.email} 
                      onChange={e => setContactForm({...contactForm, email: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mensaje</label>
                    <textarea 
                      className="form-input" 
                      rows="5" 
                      value={contactForm.message} 
                      onChange={e => setContactForm({...contactForm, message: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--spacing-sm)' }}>
                    Enviar mensaje
                  </button>
                </form>
              )}
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
