import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, UploadCloud, Languages } from 'lucide-react';
import { autoTranslate } from '../../utils/translate';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ProjectEditor() {
  const { projects, addProject, updateProject, deleteProject, uploadFile } = usePortfolio();
  const [editingId, setEditingId] = useState(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const [formData, setFormData] = useState({
    title: '', title_en: '',
    tags: '', tags_en: '',
    iconType: 'Code',
    commercialType: 'research',
    origin: '', origin_en: '',
    status: '', status_en: '',
    businessValue: '', businessValue_en: '',
    problem: '', problem_en: '',
    solution: '', solution_en: '',
    result: '', result_en: '',
    thumbnailUrl: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || '', 
      title_en: project.title_en || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      tags_en: Array.isArray(project.tags_en) ? project.tags_en.join(', ') : (project.tags_en || ''),
      iconType: project.iconType || 'Code',
      commercialType: project.commercialType || 'research',
      origin: project.origin || '',
      origin_en: project.origin_en || '',
      status: project.status || '',
      status_en: project.status_en || '',
      businessValue: project.businessValue || '',
      businessValue_en: project.businessValue_en || '',
      problem: project.problem || '', 
      problem_en: project.problem_en || '',
      solution: project.solution || '', 
      solution_en: project.solution_en || '',
      result: project.result || '', 
      result_en: project.result_en || '',
      thumbnailUrl: project.thumbnailUrl || ''
    });
    setBlocks(project.blocks || []);
    setThumbnailFile(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Process blocks to handle file uploads
      const processedBlocks = await Promise.all(blocks.map(async (block) => {
        if (block.type === 'media' && block.file) {
          const url = await uploadFile(block.file, 'project_media');
          // Return block without the file object
          const { file, ...rest } = block;
          return { ...rest, url };
        }
        return block;
      }));

      let finalThumbnailUrl = formData.thumbnailUrl;
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadFile(thumbnailFile, 'project_thumbnails');
      }

      const data = {
        title: formData.title || '', title_en: formData.title_en || '',
        tags: (formData.tags || '').split(',').map(s => s.trim()).filter(s => s),
        tags_en: (formData.tags_en || '').split(',').map(s => s.trim()).filter(s => s),
        iconType: formData.iconType || 'Code',
        commercialType: formData.commercialType || 'research',
        origin: formData.origin || '', origin_en: formData.origin_en || '',
        status: formData.status || '', status_en: formData.status_en || '',
        businessValue: formData.businessValue || '', businessValue_en: formData.businessValue_en || '',
        problem: formData.problem || '', problem_en: formData.problem_en || '',
        solution: formData.solution || '', solution_en: formData.solution_en || '',
        result: formData.result || '', result_en: formData.result_en || '',
        thumbnailUrl: finalThumbnailUrl || '',
        blocks: processedBlocks || []
      };

      if (editingId) {
        await updateProject(editingId, data);
        setEditingId(null);
      } else {
        await addProject(data);
      }
      setFormData({ 
        title: '', title_en: '', 
        tags: '', tags_en: '', 
        iconType: 'Code', 
        commercialType: 'research',
        origin: '', origin_en: '',
        status: '', status_en: '',
        businessValue: '', businessValue_en: '',
        problem: '', problem_en: '', 
        solution: '', solution_en: '', 
        result: '', result_en: '', 
        thumbnailUrl: '' 
      });
      setBlocks([]);
      setThumbnailFile(null);
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Error saving project. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      title: '', title_en: '', 
      tags: '', tags_en: '', 
      iconType: 'Code', 
      commercialType: 'research',
      origin: '', origin_en: '',
      status: '', status_en: '',
      businessValue: '', businessValue_en: '',
      problem: '', problem_en: '', 
      solution: '', solution_en: '', 
      result: '', result_en: '', 
      thumbnailUrl: '' 
    });
    setBlocks([]);
    setThumbnailFile(null);
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translatedTitle = await autoTranslate(formData.title);
      const translatedTags = await autoTranslate(formData.tags);
      const translatedOrigin = formData.origin ? await autoTranslate(formData.origin) : '';
      const translatedStatus = formData.status ? await autoTranslate(formData.status) : '';
      const translatedBusinessValue = formData.businessValue ? await autoTranslate(formData.businessValue) : '';
      const translatedProblem = await autoTranslate(formData.problem);
      const translatedSolution = await autoTranslate(formData.solution);
      const translatedResult = await autoTranslate(formData.result);
      
      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        tags_en: translatedTags || prev.tags_en,
        origin_en: translatedOrigin || prev.origin_en,
        status_en: translatedStatus || prev.status_en,
        businessValue_en: translatedBusinessValue || prev.businessValue_en,
        problem_en: translatedProblem || prev.problem_en,
        solution_en: translatedSolution || prev.solution_en,
        result_en: translatedResult || prev.result_en
      }));

      // Also translate text blocks
      const translatedBlocks = await Promise.all(blocks.map(async (block) => {
        if (block.type === 'text') {
          const transContent = await autoTranslate(block.content);
          const transTitle = await autoTranslate(block.title);
          return { 
            ...block, 
            content_en: transContent || block.content_en,
            title_en: transTitle || block.title_en
          };
        }
        return block;
      }));
      setBlocks(translatedBlocks);

    } catch (err) {
      console.error(err);
      alert('Error translating text.');
    } finally {
      setTranslating(false);
    }
  };

  const addBlock = (type) => {
    const newBlock = { id: Date.now().toString(), type };
    if (type === 'text') { newBlock.title = ''; newBlock.title_en = ''; newBlock.content = ''; newBlock.content_en = ''; }
    if (type === 'code') { newBlock.language = 'javascript'; newBlock.code = ''; newBlock.isExecutable = false; }
    if (type === 'media') { newBlock.mediaType = 'image'; newBlock.url = ''; newBlock.caption = ''; }
    if (type === 'link') { newBlock.url = ''; newBlock.label = ''; }
    
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (index, direction) => {
    setBlocks(prev => {
      if (index + direction < 0 || index + direction >= prev.length) return prev;
      const newBlocks = [...prev];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + direction];
      newBlocks[index + direction] = temp;
      return newBlocks;
    });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Manage Projects</h2>

      {/* List Existing Projects */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        {projects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No projects found. Add one below.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(projects || []).map(p => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>{p.title} <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({(p.tags || []).join(', ')})</span></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}><Edit size={18} /></button>
                  <button onClick={() => deleteProject(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add / Edit Form */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{editingId ? 'Edit Project Case Study' : 'Create New Project Case Study'}</h3>
          <button type="button" className="btn-secondary" onClick={handleTranslate} disabled={translating} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Languages size={14} /> {translating ? 'Translating...' : 'Auto-Translate to EN'}
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          {/* Basic Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Project Title (ES)</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Project Title (EN)</label>
              <input type="text" className="form-input" value={formData.title_en} onChange={e => setFormData(prev => ({...prev, title_en: e.target.value}))} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Tags ES (comma separated)</label>
              <input type="text" className="form-input" value={formData.tags} onChange={e => setFormData(prev => ({...prev, tags: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tags EN</label>
              <input type="text" className="form-input" value={formData.tags_en} onChange={e => setFormData(prev => ({...prev, tags_en: e.target.value}))} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">Display Icon</label>
            <select className="form-input" value={formData.iconType} onChange={e => setFormData(prev => ({...prev, iconType: e.target.value}))}>
              <option value="Code">Code</option>
              <option value="Terminal">Terminal</option>
              <option value="Database">Database</option>
              <option value="Award">Certification / Award</option>
              <option value="Rocket">Launched / Sold App</option>
            </select>
          </div>

          {/* Módulo de Origen e Impacto Comercial */}
          <div style={{ 
            marginTop: 'var(--spacing-lg)', 
            marginBottom: 'var(--spacing-lg)', 
            padding: 'var(--spacing-md)', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(2, 132, 199, 0.05)', 
            border: '1px solid rgba(2, 132, 199, 0.25)' 
          }}>
            <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💼</span> Origen e Impacto Comercial (Badges & Ficha Ejecutiva)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              Destaca si el proyecto fue vendido a clientes reales, es un SaaS de desarrollo propio o un caso de estudio técnico de I+D.
            </p>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="form-label">Tipo / Badge de Estado Comercial</label>
              <select 
                className="form-input" 
                value={formData.commercialType} 
                onChange={e => setFormData(prev => ({...prev, commercialType: e.target.value}))}
              >
                <option value="client">🔵 Proyecto Comercial / Cliente Real (Vendido / Consultoría)</option>
                <option value="saas">🟣 SaaS Propio / Idea Original & Prototipo Comercial</option>
                <option value="research">🟢 I+D / Proyecto de Investigación / Caso de Estudio Técnico</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Origen (ES)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.origin} 
                  placeholder="ej. Consultoría y desarrollo a medida para empresa del sector retail."
                  onChange={e => setFormData(prev => ({...prev, origin: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Origen (EN)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.origin_en} 
                  placeholder="e.g. Bespoke software consulting for retail company."
                  onChange={e => setFormData(prev => ({...prev, origin_en: e.target.value}))} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Estado (ES)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.status} 
                  placeholder="ej. Desplegado en producción • En operación activa continua"
                  onChange={e => setFormData(prev => ({...prev, status: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado (EN)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.status_en} 
                  placeholder="e.g. Production deployed • Active operation"
                  onChange={e => setFormData(prev => ({...prev, status_en: e.target.value}))} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Valor de Negocio (ES)</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  value={formData.businessValue} 
                  placeholder="ej. Centralización de inventarios multitienda, facturación y reducción de mermas."
                  onChange={e => setFormData(prev => ({...prev, businessValue: e.target.value}))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor de Negocio (EN)</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  value={formData.businessValue_en} 
                  placeholder="e.g. Multi-store inventory centralization, billing and shrinkage reduction."
                  onChange={e => setFormData(prev => ({...prev, businessValue_en: e.target.value}))} 
                />
              </div>
            </div>
          </div>

          {/* Case Study Details */}
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">Featured Case Study Image (URL or Upload)</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <input type="url" className="form-input" placeholder="https://..." value={formData.thumbnailUrl} onChange={e => setFormData(prev => ({...prev, thumbnailUrl: e.target.value}))} disabled={!!thumbnailFile} />
              <span style={{ color: 'var(--text-secondary)' }}>OR</span>
              <label className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', whiteSpace: 'nowrap' }}>
                <UploadCloud size={18} /> {thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail'}
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} />
              </label>
              {thumbnailFile && (
                <button type="button" onClick={() => setThumbnailFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Problem / El Problema (ES)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.problem || ''} onChange={val => setFormData(prev => ({...prev, problem: val}))} placeholder="Describe the challenges..." />
            </div>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Problem (EN)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.problem_en || ''} onChange={val => setFormData(prev => ({...prev, problem_en: val}))} placeholder="Describe the challenges..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Solution / La Solución (ES)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.solution || ''} onChange={val => setFormData(prev => ({...prev, solution: val}))} placeholder="Describe how you solved it..." />
            </div>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Solution (EN)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.solution_en || ''} onChange={val => setFormData(prev => ({...prev, solution_en: val}))} placeholder="Describe how you solved it..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Result / El Resultado (ES)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.result || ''} onChange={val => setFormData(prev => ({...prev, result: val}))} placeholder="Describe the measurable outcome..." />
            </div>
            <div className="form-group" style={{ marginBottom: '40px' }}>
              <label className="form-label">The Result (EN)</label>
              <ReactQuill theme="snow" modules={modules} value={formData.result_en || ''} onChange={val => setFormData(prev => ({...prev, result_en: val}))} placeholder="Describe the measurable outcome..." />
            </div>
          </div>

          {/* Block Editor Section */}
          <div style={{ marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-md)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Notebook Content Blocks (Optional Detailed Case View)</h4>
            
            {blocks.map((block, index) => (
              <div key={block.id} style={{ background: 'var(--bg-secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{block.type} BLOCK</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => moveBlock(index, -1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowUp size={16} /></button>
                    <button type="button" onClick={() => moveBlock(index, 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowDown size={16} /></button>
                    <button type="button" onClick={() => removeBlock(block.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>

                {block.type === 'text' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>ES Title (Optional)</label>
                        <input type="text" className="form-input" placeholder="Block Title..." value={block.title || ''} onChange={(e) => updateBlock(block.id, 'title', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>EN Title (Optional)</label>
                        <input type="text" className="form-input" placeholder="English Block Title..." value={block.title_en || ''} onChange={(e) => updateBlock(block.id, 'title_en', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div className="form-group" style={{ marginBottom: '40px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>ES Content</label>
                        <ReactQuill theme="snow" modules={modules} value={block.content || ''} onChange={(val) => updateBlock(block.id, 'content', val)} placeholder="Rich text content..." />
                      </div>
                      <div className="form-group" style={{ marginBottom: '40px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>EN Content</label>
                        <ReactQuill theme="snow" modules={modules} value={block.content_en || ''} onChange={(val) => updateBlock(block.id, 'content_en', val)} placeholder="English rich text content..." />
                      </div>
                    </div>
                  </div>
                )}

                {block.type === 'code' && (
                  <>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                      <input type="text" className="form-input" placeholder="Language (e.g., python, javascript)" value={block.language} onChange={(e) => updateBlock(block.id, 'language', e.target.value)} required />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" checked={block.isExecutable} onChange={(e) => updateBlock(block.id, 'isExecutable', e.target.checked)} />
                        Executable?
                      </label>
                    </div>
                    <textarea className="form-input mono" rows="5" placeholder="print('Hello World')" value={block.code} onChange={(e) => updateBlock(block.id, 'code', e.target.value)} required style={{ background: '#111' }} />
                  </>
                )}

                {block.type === 'media' && (
                  <>
                    <select className="form-input" style={{ marginBottom: 'var(--spacing-sm)' }} value={block.mediaType} onChange={(e) => updateBlock(block.id, 'mediaType', e.target.value)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                    
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                      <input type="url" className="form-input" placeholder="https://..." value={block.url || ''} onChange={(e) => updateBlock(block.id, 'url', e.target.value)} disabled={!!block.file} />
                      <span style={{ color: 'var(--text-secondary)' }}>OR</span>
                      <label className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        <UploadCloud size={18} /> {block.file ? block.file.name : 'Upload File'}
                        <input type="file" style={{ display: 'none' }} accept={block.mediaType === 'pdf' ? '.pdf' : block.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={(e) => updateBlock(block.id, 'file', e.target.files[0])} />
                      </label>
                      {block.file && (
                        <button type="button" onClick={() => updateBlock(block.id, 'file', null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
                      )}
                    </div>
                    
                    <input type="text" className="form-input" placeholder="Caption (optional)" value={block.caption} onChange={(e) => updateBlock(block.id, 'caption', e.target.value)} />
                  </>
                )}

                {block.type === 'link' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                    <input type="text" className="form-input" placeholder="Button Label (e.g. View on GitHub)" value={block.label} onChange={(e) => updateBlock(block.id, 'label', e.target.value)} required />
                    <input type="url" className="form-input" placeholder="https://github.com/..." value={block.url} onChange={(e) => updateBlock(block.id, 'url', e.target.value)} required />
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
              <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }} onClick={() => addBlock('text')}><Plus size={16} /> Add Text</button>
              <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }} onClick={() => addBlock('code')}><Plus size={16} /> Add Code</button>
              <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }} onClick={() => addBlock('media')}><Plus size={16} /> Add Media/PDF</button>
              <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', fontSize: '0.85rem' }} onClick={() => addBlock('link')}><Plus size={16} /> Add Link</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-2xl)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="submit" className="btn-primary" disabled={uploading}>
              <Save size={18} /> {uploading ? 'Saving & Uploading...' : (editingId ? 'Save Project Case Study' : 'Publish Project')}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
