import { useEffect, useState } from 'react';
import { adminSPVAPI, adminTrustAPI } from '../lib/api';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SPVsTab() {
  const [spvs, setSpvs] = useState([]);
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmSPV, setConfirmSPV] = useState(null);

  const [form, setForm] = useState({ name: '', registrationNumber: '', trust: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [spvRes, trustRes] = await Promise.all([
        adminSPVAPI.getSPVs({}),
        adminTrustAPI.getTrusts(),
      ]);
      setSpvs(spvRes.data.data.spvs || []);
      setTrusts(trustRes.data.data.trusts || []);
    } catch (e) {
      toast.error('Failed to load SPVs');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', registrationNumber: '', trust: trusts[0]?._id || '' }); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.spvName || s.name||'', registrationNumber: s.registrationDetails?.cin || s.registrationNumber||'', trust: s.trust?._id || s.trust || '' }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await adminSPVAPI.updateSPV(editing._id, form); toast.success('SPV updated'); }
      else { await adminSPVAPI.createSPV(form); toast.success('SPV created'); }
      setModalOpen(false); load();
    } catch { toast.error('Failed to save SPV'); }
  };

  const startDelete = (s) => { setConfirmSPV(s); setConfirmText(''); setConfirmOpen(true); };
  const onDelete = async () => {
    try { await adminSPVAPI.deleteSPV(confirmSPV._id); toast.success('SPV deleted'); setConfirmOpen(false); load(); }
    catch (e) { toast.error(e?.response?.data?.error || 'Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">SPVs</h2>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-primary-600 text-white shadow hover:bg-primary-700 transition flex items-center gap-2"><FaPlus/> New SPV</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Reg. No.</th><th>Trust</th><th>Created</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr> : spvs.length===0 ? <tr><td colSpan={5} className="p-6 text-center">No SPVs</td></tr> : spvs.map(s => (
                <tr key={s._id}>
                  <td>{s.spvName || s.name}</td>
                  <td>{s.registrationDetails?.cin || s.registrationNumber || '-'}</td>
                  <td>{s.trust && typeof s.trust === 'object' ? (s.trust.name || '-') : (s.trust ? 'Loading...' : '-')}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="btn-secondary"><FaEdit/></button>
                      <button onClick={() => startDelete(s)} className="btn-danger"><FaTrash/></button>
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
              <h3 className="text-xl font-bold">{editing ? 'Edit SPV' : 'Create SPV'}</h3>
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
                <label className="block text-sm font-medium mb-1">Trust</label>
                <select className="input" value={form.trust} onChange={(e)=>setForm({...form, trust:e.target.value})} required>
                  <option value="">Select trust</option>
                  {trusts.map(t => (<option key={t._id} value={t._id}>{t.name}</option>))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Delete SPV</h3>
            <p className="text-sm text-gray-700 mb-3">Type the SPV name to confirm:</p>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm mb-4 select-all">{confirmSPV?.spvName || confirmSPV?.name}</div>
            <input className="input mb-4" value={confirmText} onChange={(e)=>setConfirmText(e.target.value)} placeholder="Type SPV name" />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={()=>setConfirmOpen(false)}>Cancel</button>
              <button className="btn-danger" disabled={confirmText !== (confirmSPV?.spvName || confirmSPV?.name)} onClick={onDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


