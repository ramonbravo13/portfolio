import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, UploadCloud } from 'lucide-react';

export default function ProjectEditor() {
  const { projects, addProject, updateProject, deleteProject, uploadFile } = usePortfolio();
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    iconType: 'Code',
    problem: '',
    solution: '',
    result: '',
    thumbnailUrl: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      tags: project.tags.join(', '),
      iconType: project.iconType,
      problem: project.problem || '',
      solution: project.solution || '',
      result: project.result || '',
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
        title: formData.title,
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
        iconType: formData.iconType,
        problem: formData.problem,
        solution: formData.solution,
        result: formData.result,
        thumbnailUrl: finalThumbnailUrl,
        blocks: processedBlocks
      };

      if (editingId) {
        await updateProject(editingId, data);
        setEditingId(null);
      } else {
        await addProject(data);
      }
      setFormData({ title: '', tags: '', iconType: 'Code', problem: '', solution: '', result: '', thumbnailUrl: '' });
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
    setFormData({ title: '', tags: '', iconType: 'Code', problem: '', solution: '', result: '', thumbnailUrl: '' });
    setBlocks([]);
    setThumbnailFile(null);
  };

  const addBlock = (type) => {
    const newBlock = { id: Date.now().toString(), type };
    if (type === 'text') newBlock.content = '';
    if (type === 'code') { newBlock.language = 'javascript'; newBlock.code = ''; newBlock.isExecutable = false; }
    if (type === 'media') { newBlock.mediaType = 'image'; newBlock.url = ''; newBlock.caption = ''; }
    if (type === 'link') { newBlock.url = ''; newBlock.label = ''; }
    
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index, direction) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setBlocks(newBlocks);
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
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.2rem' }}>{editingId ? 'Edit Project Case Study' : 'Create New Project Case Study'}</h3>
        
        <form onSubmit={handleSave}>
          {/* Basic Details */}
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input type="text" className="form-input" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Display Icon</label>
              <select className="form-input" value={formData.iconType} onChange={e => setFormData({...formData, iconType: e.target.value})}>
                <option value="Code">Code</option>
                <option value="Terminal">Terminal</option>
                <option value="Database">Database</option>
                <option value="Award">Certification / Award</option>
                <option value="Rocket">Launched / Sold App</option>
              </select>
            </div>
          </div>

          {/* Case Study Details */}
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">Featured Case Study Image (URL or Upload)</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <input type="url" className="form-input" placeholder="https://..." value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} disabled={!!thumbnailFile} />
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

          <div className="form-group">
            <label className="form-label">The Problem (El Problema)</label>
            <textarea className="form-input" rows="3" placeholder="Describe the challenges or requirements..." value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">The Solution (La Solución)</label>
            <textarea className="form-input" rows="3" placeholder="Describe how you solved it..." value={formData.solution} onChange={e => setFormData({...formData, solution: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">The Result (El Resultado)</label>
            <textarea className="form-input" rows="3" placeholder="Describe the measurable outcome, metrics or impact..." value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} />
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
                  <textarea className="form-input" rows="3" placeholder="Markdown or plain text content..." value={block.content} onChange={(e) => updateBlock(block.id, 'content', e.target.value)} required />
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
