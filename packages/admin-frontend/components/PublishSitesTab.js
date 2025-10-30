import { useEffect, useState, useRef } from 'react';
import { adminProjectAPI } from '../lib/api';
import { FaPlus, FaTrash, FaUpload, FaEdit, FaGlobe, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function PublishSitesTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const coverRef = useRef(null);
  const galleryRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [coverLabel, setCoverLabel] = useState('Choose cover image');
  const [galleryLabel, setGalleryLabel] = useState('Choose gallery images');

  const [form, setForm] = useState({
    projectName: '',
    projectCode: '',
    description: '',
    shortDescription: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    landType: 'agricultural',
    totalAreaValue: '',
    totalAreaUnit: 'sqft',
    landValue: '',
    targetRaise: '',
    minimumInvestment: '100000',
    irrLow: '',
    irrHigh: '',
    irrTarget: '',
    holdingPeriod: '',
    exitStrategy: 'resale',
    status: 'draft',
    isPublic: false,
    reraApplicable: false,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminProjectAPI.getProjects({});
      setProjects(res.data.data.projects || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...form, projectName: '', projectCode: '', description: '', shortDescription: '', city: '', state: '', address: '', pincode: '', landType: 'agricultural', totalAreaValue: '', totalAreaUnit: 'sqft', landValue: '', targetRaise: '', minimumInvestment: '100000', irrLow: '', irrHigh: '', irrTarget: '', holdingPeriod: '', exitStrategy: 'resale', status: 'draft', isPublic: false });
    if (coverRef.current) coverRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
    setModalOpen(true);
  };

  const openEdit = (proj) => {
    setEditing(proj);
    setForm({
      projectName: proj.projectName || '',
      projectCode: proj.projectCode || '',
      description: proj.description || '',
      shortDescription: proj.shortDescription || '',
      city: proj?.landDetails?.location?.city || '',
      state: proj?.landDetails?.location?.state || '',
      address: proj?.landDetails?.location?.address || '',
      pincode: proj?.landDetails?.location?.pincode || '',
      landType: proj?.landDetails?.landType || 'agricultural',
      totalAreaValue: proj?.landDetails?.totalArea?.value || '',
      totalAreaUnit: proj?.landDetails?.totalArea?.unit || 'sqft',
      landValue: proj?.financials?.landValue || '',
      targetRaise: proj?.financials?.targetRaise || '',
      minimumInvestment: proj?.financials?.minimumInvestment || '100000',
      irrLow: proj?.financials?.expectedIRR?.low || '',
      irrHigh: proj?.financials?.expectedIRR?.high || '',
      irrTarget: proj?.financials?.expectedIRR?.target || '',
      holdingPeriod: proj?.financials?.holdingPeriod || '',
      exitStrategy: proj?.financials?.exitStrategy || 'resale',
      status: proj?.status || 'draft',
      isPublic: !!proj?.isPublic,
      reraApplicable: !!proj?.reraCompliance?.applicable,
    });
    if (coverRef.current) coverRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
    setModalOpen(true);
  };

  const onDelete = async (id) => {
    try {
      await adminProjectAPI.deleteProject(id);
      toast.success('Project deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const onPublishToggle = async (proj) => {
    try {
      if (proj.isPublic) {
        await adminProjectAPI.unpublishProject(proj._id);
        toast.success('Unpublished');
      } else {
        await adminProjectAPI.publishProject(proj._id);
        toast.success('Published');
      }
      load();
    } catch (e) {
      toast.error('Failed to toggle publish');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      // Ensure booleans are sent as strings for backend parsing
      fd.set('isPublic', String(!!form.isPublic));
      fd.set('reraApplicable', String(!!form.reraApplicable));
      if (coverRef.current?.files?.[0]) fd.append('siteImage', coverRef.current.files[0]);
      if (galleryRef.current?.files?.length) {
        Array.from(galleryRef.current.files).forEach((f) => fd.append('gallery', f));
      }

      if (editing) {
        await adminProjectAPI.updateProject(editing._id, fd);
        toast.success('Project updated');
      } else {
        await adminProjectAPI.createProject(fd);
        toast.success('Project created');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaGlobe /> Publish Sites</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-indigo-700 transition flex items-center gap-2 border border-primary-500/20"
          title="Create a new site"
        >
          <FaPlus className="text-white" />
          <span className="font-semibold">New Site</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>City</th>
                <th>Type</th>
                <th>Status</th>
                <th>Public</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-6 text-center">Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center">No projects</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p._id}>
                    <td>{p.projectName}</td>
                    <td>{p.projectCode}</td>
                    <td>{p?.landDetails?.location?.city}</td>
                    <td className="capitalize">{p?.landDetails?.landType}</td>
                    <td className="capitalize">{p.status}</td>
                    <td>{p.isPublic ? 'Yes' : 'No'}</td>
                    <td>{new Date(p.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onPublishToggle(p)} className="btn-secondary flex items-center gap-2">
                          {p.isPublic ? <FaToggleOff /> : <FaToggleOn />} {p.isPublic ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => openEdit(p)} className="btn-secondary"><FaEdit /></button>
                        <button
                          onClick={() => { setConfirmProject(p); setConfirmText(''); setConfirmOpen(true); }}
                          className="btn-danger"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 backdrop-blur z-10 py-2">
              <h3 className="text-xl font-bold">{editing ? 'Edit Site' : 'Create New Site'}</h3>
              <button
                onClick={() => setModalOpen(false)}
                type="button"
                className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition flex items-center gap-2"
                title="Close form"
              >
                Close
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input className="input" placeholder="e.g., Green Meadows, Pune" value={form.projectName} onChange={(e)=>setForm({...form, projectName:e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project Code</label>
                  <input className="input" placeholder="e.g., AGR-PUN-2025-01" value={form.projectCode} onChange={(e)=>setForm({...form, projectCode:e.target.value.toUpperCase()})} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input className="input" placeholder="One-liner for cards" value={form.shortDescription} onChange={(e)=>setForm({...form, shortDescription:e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea className="input" rows={4} placeholder="Detailed overview, highlights, notes" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input className="input" placeholder="e.g., Pune" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input className="input" placeholder="e.g., Maharashtra" value={form.state} onChange={(e)=>setForm({...form, state:e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input className="input" placeholder="Street and area" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <input className="input" placeholder="e.g., 411001" value={form.pincode} onChange={(e)=>setForm({...form, pincode:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Land Type</label>
                <select className="input" value={form.landType} onChange={(e)=>setForm({...form, landType:e.target.value})}>
                  <option value="agricultural">Agricultural</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed_use">Mixed Use</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Area</label>
                <div className="flex gap-2">
                  <input className="input" type="number" placeholder="e.g., 100000" value={form.totalAreaValue} onChange={(e)=>setForm({...form, totalAreaValue:e.target.value})} />
                  <select className="input" value={form.totalAreaUnit} onChange={(e)=>setForm({...form, totalAreaUnit:e.target.value})}>
                    <option value="sqft">sqft</option>
                    <option value="sqmt">sqmt</option>
                    <option value="acres">acres</option>
                    <option value="hectares">hectares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Land Value (₹)</label>
                <input className="input" type="number" placeholder="e.g., 50000000" value={form.landValue} onChange={(e)=>setForm({...form, landValue:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Raise (₹)</label>
                <input className="input" type="number" placeholder="e.g., 25000000" value={form.targetRaise} onChange={(e)=>setForm({...form, targetRaise:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Investment (₹)</label>
                <input className="input" type="number" placeholder="e.g., 100000" value={form.minimumInvestment} onChange={(e)=>setForm({...form, minimumInvestment:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Holding Period (months)</label>
                <input className="input" type="number" placeholder="e.g., 24" value={form.holdingPeriod} onChange={(e)=>setForm({...form, holdingPeriod:e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expected IRR (Low/High/Target)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input className="input" type="number" placeholder="Low" value={form.irrLow} onChange={(e)=>setForm({...form, irrLow:e.target.value})} />
                  <input className="input" type="number" placeholder="High" value={form.irrHigh} onChange={(e)=>setForm({...form, irrHigh:e.target.value})} />
                  <input className="input" type="number" placeholder="Target" value={form.irrTarget} onChange={(e)=>setForm({...form, irrTarget:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Exit Strategy</label>
                <select className="input" value={form.exitStrategy} onChange={(e)=>setForm({...form, exitStrategy:e.target.value})}>
                  <option value="resale">Resale</option>
                  <option value="development">Development</option>
                  <option value="rental">Rental</option>
                  <option value="lease">Lease</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="input" value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="listed">Listed</option>
                  <option value="fundraising">Fundraising</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input id="isPublic" type="checkbox" checked={form.isPublic} onChange={(e)=>setForm({...form, isPublic:e.target.checked})} />
                <label htmlFor="isPublic" className="text-sm">Public</label>
              </div>

              <div className="flex items-center gap-2">
                <input id="reraApplicable" type="checkbox" checked={form.reraApplicable} onChange={(e)=>setForm({...form, reraApplicable:e.target.checked})} />
                <label htmlFor="reraApplicable" className="text-sm">RERA applicable</label>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image</label>
                  <input
                    ref={coverRef}
                    id="coverInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e)=>{
                      const f = e.target.files?.[0];
                      setCoverLabel(f ? `Selected: ${f.name}` : 'Choose cover image');
                    }}
                  />
                  <label
                    htmlFor="coverInput"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer transition"
                  >
                    <FaUpload />
                    <span>{coverLabel}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 5MB.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gallery Images</label>
                  <input
                    ref={galleryRef}
                    id="galleryInput"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e)=>{
                      const count = e.target.files?.length || 0;
                      if (!count) return setGalleryLabel('Choose gallery images');
                      if (count === 1) return setGalleryLabel(`1 image selected`);
                      setGalleryLabel(`${count} images selected`);
                    }}
                  />
                  <label
                    htmlFor="galleryInput"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition"
                  >
                    <FaUpload />
                    <span>{galleryLabel}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">You can select multiple images.</p>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-primary-600 text-white shadow hover:bg-primary-700 transition flex items-center gap-2">
                  <FaUpload /> {editing ? 'Update Site' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strong confirm delete modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Delete Project</h3>
            <p className="text-sm text-gray-700 mb-3">
              This action cannot be undone. To confirm, type the project code exactly:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm mb-4 select-all">
              {confirmProject?.projectCode}
            </div>
            <input
              className="input mb-4"
              placeholder="Type project code"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button
                className="btn-danger"
                disabled={confirmText !== confirmProject?.projectCode}
                onClick={async () => {
                  await onDelete(confirmProject._id);
                  setConfirmOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


