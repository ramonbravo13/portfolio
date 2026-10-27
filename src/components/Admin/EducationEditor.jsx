import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, UploadCloud, Languages, 
  GraduationCap, BookOpen, CheckCircle2, Clock, Sparkles, FileText, ArrowRight
} from 'lucide-react';
import { autoTranslate } from '../../utils/translate';

export default function EducationEditor() {
  const { profile, updateProfile, uploadFile } = usePortfolio();
  const [educationList, setEducationList] = useState([]);
  
  useEffect(() => {
    setEducationList(profile.education || []);
  }, [profile.education]);

  const [formData, setFormData] = useState({
    type: 'degree', // 'degree' | 'master' | 'paper' | 'custom'
    title: '', title_en: '',
    institution: '', institution_en: '',
    period: '', period_en: '',
    status: 'completed', // 'completed' | 'in_progress' | 'near_grad' | 'published' | 'in_review' | 'preprint' | 'custom'
    customStatusLabel: '', customStatusLabel_en: '',
    authors: '',
    desc: '', desc_en: '',
    tags: '', tags_en: '',
    url: ''
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Check if there are any degrees in profile.certs that can be migrated
  const certsWithDegrees = (profile.certs || []).filter(c => 
    c.credentialType === 'degree' || c.credentialType === 'master' ||
    `${c.title}`.toLowerCase().includes('ingenier') ||
    `${c.title}`.toLowerCase().includes('licenciatura') ||
    `${c.title}`.toLowerCase().includes('título')
  );

  const handleMigrateFromCerts = async () => {
    if (certsWithDegrees.length === 0) return;
    
    const migratedItems = certsWithDegrees.map(c => ({
      id: c.id || Date.now(),
      type: c.credentialType === 'master' ? 'master' : 'degree',
      title: c.title,
      title_en: c.title_en || '',
      institution: c.institution || 'Universidad / Institución',
      institution_en: c.institution || 'University / Institution',
      period: c.period || '',
      period_en: c.period || '',
      status: c.status || 'completed',
      customStatusLabel: c.customStatusLabel || '',
      customStatusLabel_en: c.customStatusLabel_en || '',
      authors: '',
      desc: c.desc || '',
      desc_en: c.desc_en || '',
      tags: c.tags || '',
      tags_en: c.tags_en || '',
      url: c.url || ''
    }));

    // Filter out migrated items from certs
    const remainingCerts = (profile.certs || []).filter(c => !certsWithDegrees.some(m => m.id === c.id));
    const newEducation = [...(profile.education || []), ...migratedItems];

    await updateProfile({
      ...profile,
      education: newEducation,
      certs: remainingCerts
    });

    alert('¡Título migrado exitosamente a Educación & Investigación!');
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    const item = educationList[index];
    setFormData({
      type: item.type || 'degree',
      title: item.title || '', title_en: item.title_en || '',
      institution: item.institution || '', institution_en: item.institution_en || '',
      period: item.period || '', period_en: item.period_en || '',
      status: item.status || 'completed',
      customStatusLabel: item.customStatusLabel || '', customStatusLabel_en: item.customStatusLabel_en || '',
      authors: item.authors || '',
      desc: item.desc || '', desc_en: item.desc_en || '',
      tags: item.tags || '', tags_en: item.tags_en || '',
      url: item.url || ''
    });
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translatedTitle = await autoTranslate(formData.title);
      const translatedInst = await autoTranslate(formData.institution);
      const translatedPeriod = await autoTranslate(formData.period);
      const translatedDesc = await autoTranslate(formData.desc);
      const translatedTags = await autoTranslate(formData.tags);
      const translatedStatus = formData.customStatusLabel ? await autoTranslate(formData.customStatusLabel) : '';
      
      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        institution_en: translatedInst || prev.institution_en,
        period_en: translatedPeriod || prev.period_en,
        desc_en: translatedDesc || prev.desc_en,
        tags_en: translatedTags || prev.tags_en,
        customStatusLabel_en: translatedStatus || prev.customStatusLabel_en
      }));
    } catch (err) {
      console.error(err);
      alert('Error traduciendo campos.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalUrl = formData.url;
      if (pdfFile) {
        finalUrl = await uploadFile(pdfFile, 'education');
      }

      const updatedData = {
        type: formData.type,
        title: formData.title, title_en: formData.title_en,
        institution: formData.institution, institution_en: formData.institution_en,
        period: formData.period, period_en: formData.period_en,
        status: formData.status,
        customStatusLabel: formData.customStatusLabel, customStatusLabel_en: formData.customStatusLabel_en,
        authors: formData.authors,
        desc: formData.desc, desc_en: formData.desc_en,
        tags: formData.tags, tags_en: formData.tags_en,
        url: finalUrl
      };

      let newEducation = [...educationList];
      if (editingIndex !== null) {
        newEducation[editingIndex] = { ...newEducation[editingIndex], ...updatedData };
      } else {
        newEducation.push({ id: Date.now(), ...updatedData });
      }

      await updateProfile({ ...profile, education: newEducation });
      
      setFormData({
        type: 'degree',
        title: '', title_en: '',
        institution: '', institution_en: '',
        period: '', period_en: '',
        status: 'completed',
        customStatusLabel: '', customStatusLabel_en: '',
        authors: '',
        desc: '', desc_en: '',
        tags: '', tags_en: '',
        url: ''
      });
      setPdfFile(null);
      setEditingIndex(null);
    } catch (err) {
      console.error("Error guardando registro académico:", err);
      alert("Error al guardar el registro académico.");
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (index) => {
    if (window.confirm('¿Eliminar este registro académico/publicación?')) {
      const newEducation = educationList.filter((_, i) => i !== index);
      await updateProfile({ ...profile, education: newEducation });
    }
  };

  const moveItem = async (index, dir) => {
    if ((dir === -1 && index === 0) || (dir === 1 && index === educationList.length - 1)) return;
    const newEducation = [...educationList];
    const temp = newEducation[index];
    newEducation[index] = newEducation[index + dir];
    newEducation[index + dir] = temp;
    await updateProfile({ ...profile, education: newEducation });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormData({
      type: 'degree',
      title: '', title_en: '',
      institution: '', institution_en: '',
      period: '', period_en: '',
      status: 'completed',
      customStatusLabel: '', customStatusLabel_en: '',
      authors: '',
      desc: '', desc_en: '',
      tags: '', tags_en: '',
      url: ''
    });
    setPdfFile(null);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="#8b5cf6" /> Educación & Publicaciones Científicas
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Gestiona tus grados universitarios, maestrías y artículos de investigación científica (papers).
          </p>
        </div>
      </div>

      {/* Migration Alert Banner if degrees were found in certs */}
      {certsWithDegrees.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong style={{ color: '#8b5cf6', display: 'block', fontSize: '0.9rem' }}>
              💡 Título detectado en Certificaciones
            </strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Se encontró {certsWithDegrees.length} título en tu lista previa de certificaciones: <em>{certsWithDegrees.map(c => c.title).join(', ')}</em>
            </span>
          </div>
          <button 
            type="button" 
            onClick={handleMigrateFromCerts}
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff' }}
          >
            Mover a Educación & Investigación <ArrowRight size={14} />
          </button>
        </div>
      )}
      
      {/* Existing List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
        {educationList.map((item, idx) => {
          const isPaper = item.type === 'paper';
          const isMaster = item.type === 'master';
          
          return (
            <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {isPaper ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--color-ink)', color: 'var(--color-voltage)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <BookOpen size={13} /> Paper Científico
                  </span>
                ) : isMaster ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <GraduationCap size={13} /> Máster / Postgrado
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <GraduationCap size={13} /> Título Profesional
                  </span>
                )}

                {/* Status indicator */}
                {item.status === 'in_progress' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    <Clock size={11} /> EN CURSO
                  </span>
                ) : item.status === 'near_grad' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    <Sparkles size={11} /> PRÓXIMO A EGRESAR
                  </span>
                ) : item.status === 'in_review' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    <Clock size={11} /> EN REVISIÓN
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(43, 238, 75, 0.12)', color: '#2bee4b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    <CheckCircle2 size={11} /> {isPaper ? 'PUBLICADO' : 'TITULADO'}
                  </span>
                )}

                <span style={{ fontWeight: 600 }}>{item.title}</span>
                {item.institution && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({item.institution})</span>
                )}
                {item.period && (
                  <span className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.75rem' }}>• {item.period}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}><ArrowUp size={16}/></button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === educationList.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === educationList.length - 1 ? 'not-allowed' : 'pointer' }}><ArrowDown size={16}/></button>
                <button onClick={() => handleEdit(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Edit size={16}/></button>
                <button onClick={() => deleteItem(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </div>
            </div>
          );
        })}
        {educationList.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay títulos ni publicaciones agregadas aún.</p>}
      </div>

      {/* Form */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
            {editingIndex !== null ? 'Editar Grado / Publicación' : 'Agregar Nuevo Grado Académico o Publicación Científica'}
          </h3>
          <button type="button" className="btn-secondary" onClick={handleTranslate} disabled={translating} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Languages size={14} /> {translating ? 'Traduciendo...' : 'Auto-Traducir a EN'}
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            
            {/* Tipo */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Tipo de Registro</label>
              <select 
                className="form-input" 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="degree">🎓 Título Profesional / Ingeniería / Licenciatura</option>
                <option value="master">🎓 Maestría / Postgrado / Diplomado</option>
                <option value="paper">📄 Publicación Científica / Artículo / Paper</option>
                <option value="custom">✏️ Otro Reconocimiento Académico</option>
              </select>
            </div>

            {/* Estado */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Estado Académico / Editorial</label>
              <select 
                className="form-input" 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="completed">✅ Titulado / Graduado / Publicado</option>
                <option value="in_progress">⏳ En Curso</option>
                <option value="near_grad">🎯 Próximo a Egresar</option>
                <option value="in_review">📑 En Revisión por Pares (Peer-Review)</option>
                <option value="preprint">📄 Preprint / Borrador</option>
                <option value="custom">✏️ Estado Personalizado</option>
              </select>
            </div>

            {/* Periodo / Año */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Periodo / Año</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. 2020 - 2024, 2026..." 
                value={formData.period} 
                onChange={e => setFormData({ ...formData, period: e.target.value })} 
              />
            </div>

          </div>

          {/* Estado Personalizado si aplica */}
          {formData.status === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Estado Personalizado (ES)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Pasante, Tesis Aprobada..." 
                  value={formData.customStatusLabel} 
                  onChange={e => setFormData({ ...formData, customStatusLabel: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Estado Personalizado (EN)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Candidate, Thesis Defended..." 
                  value={formData.customStatusLabel_en} 
                  onChange={e => setFormData({ ...formData, customStatusLabel_en: e.target.value })} 
                />
              </div>
            </div>
          )}

          {/* Título */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Título del Paper / Artículo (ES)' : 'Título de la Carrera / Grado (ES)'}</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Paper Title (EN)' : 'Degree Title (EN)'}</label>
              <input type="text" className="form-input" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
            </div>
          </div>

          {/* Institución / Revista */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Revista / Conferencia / Journal (ES)' : 'Universidad / Institución (ES)'}</label>
              <input type="text" className="form-input" placeholder="Ej. CETI Colomos, IEEE Transactions..." value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Journal / Conference (EN)' : 'University / Institution (EN)'}</label>
              <input type="text" className="form-input" value={formData.institution_en} onChange={e => setFormData({...formData, institution_en: e.target.value})} />
            </div>
          </div>

          {/* Autores (para papers o tesis) */}
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">Autores / Coautores (Opcional, útil para publicaciones científicas)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. Juan Ramón Bravo López, Dr. Investigador..." 
              value={formData.authors} 
              onChange={e => setFormData({...formData, authors: e.target.value})} 
            />
          </div>

          {/* Abstract / Descripción */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Abstract / Resumen Científico (ES)' : 'Enfoque Académico & Especialización (ES)'}</label>
              <textarea className="form-input" rows="4" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">{formData.type === 'paper' ? 'Abstract / Research Scope (EN)' : 'Academic Scope (EN)'}</label>
              <textarea className="form-input" rows="4" value={formData.desc_en} onChange={e => setFormData({...formData, desc_en: e.target.value})} />
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Líneas de Investigación / Tags (ES) (separadas por coma)</label>
              <input type="text" className="form-input" placeholder="Ej. Machine Learning, NLP, Sistemas Distribuidos..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Research Fields / Tags (EN)</label>
              <input type="text" className="form-input" value={formData.tags_en} onChange={e => setFormData({...formData, tags_en: e.target.value})} />
            </div>
          </div>

          {/* PDF File / DOI URL */}
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">{formData.type === 'paper' ? 'URL del Paper / DOI / arXiv o Subir PDF' : 'URL del Título Oficial o Subir PDF'}</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <input type="url" className="form-input" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} disabled={!!pdfFile} />
              <span style={{ color: 'var(--text-secondary)' }}>O</span>
              <label className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', whiteSpace: 'nowrap' }}>
                <UploadCloud size={18} /> {pdfFile ? pdfFile.name : 'Subir Documento (PDF)'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setPdfFile(e.target.files[0])} />
              </label>
              {pdfFile && (
                <button type="button" onClick={() => setPdfFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Quitar</button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={18} /> {uploading ? 'Guardando...' : (editingIndex !== null ? 'Actualizar Registro' : 'Agregar a Educación & Investigación')}
            </button>
            {editingIndex !== null && (
              <button type="button" className="btn-secondary" onClick={cancelEdit} style={{ flex: 1, justifyContent: 'center' }}>
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
