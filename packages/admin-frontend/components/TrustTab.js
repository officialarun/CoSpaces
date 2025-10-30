import { useEffect, useState } from 'react';
import { adminTrustAPI } from '../lib/api';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TrustTab() {
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', registrationNumber: '', pan: '', tan: '', notes: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminTrustAPI.getTrusts();
      setTrusts(res.data.data.trusts || []);
    } catch (e) {
      toast.error('Failed to load trusts');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', registrationNumber: '', pan: '', tan: '', notes: '' }); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name||'', registrationNumber: t.registrationNumber||'', pan: t.pan||'', tan: t.tan||'', notes: t.notes||'' }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await adminTrustAPI.updateTrust(editing._id, form); toast.success('Trust updated'); }
      else { await adminTrustAPI.createTrust(form); toast.success('Trust created'); }
      setModalOpen(false); load();
    } catch { toast.error('Failed to save trust'); }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this trust? (blocked if SPVs exist)')) return;
    try { await adminTrustAPI.deleteTrust(id); toast.success('Trust deleted'); load(); }
    catch (e) { toast.error(e?.response?.data?.error || 'Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Trusts</h2>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-primary-600 text-white shadow hover:bg-primary-700 transition flex items-center gap-2"><FaPlus/> New Trust</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Reg. No.</th><th>PAN</th><th>TAN</th><th>Created</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr> : trusts.length===0 ? <tr><td colSpan={6} className="p-6 text-center">No trusts</td></tr> : trusts.map(t => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.registrationNumber||'-'}</td>
                  <td>{t.pan||'-'}</td>
                  <td>{t.tan||'-'}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="btn-secondary"><FaEdit/></button>
                      <button onClick={() => onDelete(t._id)} className="btn-danger"><FaTrash/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editing ? 'Edit Trust' : 'Create Trust'}</h3>
              <button onClick={()=>setModalOpen(false)} className="btn-secondary">Close</button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="input" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration No.</label>
                <input className="input" value={form.registrationNumber} onChange={(e)=>setForm({...form, registrationNumber:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PAN</label>
                <input className="input" value={form.pan} onChange={(e)=>setForm({...form, pan:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TAN</label>
                <input className="input" value={form.tan} onChange={(e)=>setForm({...form, tan:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


