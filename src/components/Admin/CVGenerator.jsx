import { useState, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import html2pdf from 'html2pdf.js';

export default function CVGenerator() {
  const { profile, projects } = usePortfolio();
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cvRef = useRef(null);
  const [generatedData, setGeneratedData] = useState(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Assuming the user has a GEMINI_API_KEY env var

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('VITE_GEMINI_API_KEY no está configurada en las variables de entorno.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
      const dataToSend = {
        profile: {
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          skills: profile.skills
        },
        experiences: profile.experiences || [],
        projects: projects.map(p => ({
          title: p.title,
          tags: p.tags,
          problem: p.problem,
          solution: p.solution,
          result: p.result
        })),
        certifications: profile.certs || []
      };

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
Actúa como un experto reclutador Tech y redactor de CVs para Roles de Ciencia de Datos e IA.
Tengo los siguientes datos de mi perfil extraídos de mi base de datos:
${JSON.stringify(dataToSend, null, 2)}

Instrucciones o vacante objetivo:
${instructions}

Tu tarea:
1. Filtra y selecciona los 3 o 4 proyectos y certificaciones más relevantes para esta vacante o enfoque.
2. Reescribe los puntos de la experiencia laboral usando la metodología STAR (Situación, Tarea, Acción, Resultado) de manera sintética y con métricas de impacto.
3. Genera un JSON estructurado de salida con las claves: \`nombre\`, \`titulo\`, \`resumen_ejecutivo\`, \`experiencias\` (array con \`empresa\`, \`rol\`, \`periodo\`, \`descripcion\`(array de strings STAR)), \`proyectos_clave\` (array con \`titulo\`, \`descripcion\`, \`tecnologias\` (array)), \`certificaciones\` (array con \`titulo\`, \`descripcion\`), \`skills\` (array).
4. Devuelve ÚNICAMENTE el código JSON válido sin ningún texto explicativo o formato Markdown extra. NO incluyas bloques de código \`\`\`json.
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Clean up if the model wrapped it in markdown
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/, '').replace(/```$/, '');
      }

      const cvData = JSON.parse(responseText.trim());
      setGeneratedData(cvData);

      // Wait for React to render the hidden template
      setTimeout(() => {
        generatePDF();
      }, 500);

    } catch (err) {
      console.error('Error generating CV:', err);
      setError(err.message || 'Ocurrió un error al generar el CV.');
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const element = cvRef.current;
    
    // Configuración para html2pdf
    const opt = {
      margin:       10,
      filename:     `CV_Ramon_Bravo_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      setGeneratedData(null); // Clear after generating
    });
  };

  return (
    <section className="admin-section" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <FileText className="section-icon" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Generador de CV con IA</h2>
      </div>

      <div className="premium-card" style={{ borderTop: 'none', borderBottom: 'none', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
        
        <div className="form-group">
          <label className="form-label">Instrucciones o Descripción de la Vacante (Opcional)</label>
          <textarea 
            className="form-input" 
            style={{ minHeight: '120px', resize: 'vertical' }}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej. Enfocar más en Machine Learning y Python. O pega aquí la descripción del puesto al que aplicas..."
          />
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Procesando con Gemini e Imprimiendo PDF...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Generar CV en PDF
            </>
          )}
        </button>
      </div>

      {/* Hidden CV Template for html2pdf */}
      {generatedData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={cvRef} style={{ width: '800px', padding: '40px', backgroundColor: '#fff', color: '#111', fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.5 }}>
            
            {/* Header */}
            <header style={{ borderBottom: '2px solid #222', paddingBottom: '15px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '28px', margin: '0 0 5px 0', color: '#000', textTransform: 'uppercase' }}>{generatedData.nombre}</h1>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#444', fontWeight: 500 }}>{generatedData.titulo}</h2>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                {profile.contactEmail && <span>{profile.contactEmail}</span>}
                {profile.contactPhone && <span>{profile.contactPhone}</span>}
              </div>
            </header>

            {/* Resumen */}
            {generatedData.resumen_ejecutivo && (
              <section style={{ marginBottom: '20px' }}>
                <p style={{ margin: 0 }}>{generatedData.resumen_ejecutivo}</p>
              </section>
            )}

            {/* Skills */}
            {generatedData.skills && generatedData.skills.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>Habilidades Técnicas</h3>
                <p style={{ margin: 0 }}>{generatedData.skills.join(', ')}</p>
              </section>
            )}

            {/* Experiencia */}
            {generatedData.experiencias && generatedData.experiencias.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>Experiencia Profesional</h3>
                {generatedData.experiencias.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '15px' }}>{exp.rol}</strong>
                      <span style={{ fontSize: '13px', color: '#666' }}>{exp.periodo}</span>
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: '5px' }}>{exp.empresa}</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {(exp.descripcion || []).map((punto, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '4px' }}>{punto}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Proyectos Clave */}
            {generatedData.proyectos_clave && generatedData.proyectos_clave.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>Proyectos Clave</h3>
                {generatedData.proyectos_clave.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{proj.titulo}</strong>
                    <p style={{ margin: '0 0 4px 0' }}>{proj.descripcion}</p>
                    <div style={{ fontSize: '12px', color: '#555' }}>
                      <strong>Tecnologías:</strong> {(proj.tecnologias || []).join(', ')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Certificaciones */}
            {generatedData.certificaciones && generatedData.certificaciones.length > 0 && (
              <section>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>Certificaciones</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {generatedData.certificaciones.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      <strong>{cert.titulo}</strong> {cert.descripcion ? `- ${cert.descripcion}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        </div>
      )}
    </section>
  );
}
