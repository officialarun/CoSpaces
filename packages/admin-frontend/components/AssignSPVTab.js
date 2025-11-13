import { useEffect, useState } from 'react';
import { adminProjectAPI, adminSPVAPI, adminTrustAPI } from '../lib/api';
import { FaLink } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AssignSPVTab() {
  const [projects, setProjects] = useState([]);
  const [spvs, setSpvs] = useState([]);
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignFor, setAssignFor] = useState(null);
  const [selectedSPV, setSelectedSPV] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      // Recalculate funding on load so eligible projects auto-mark as under_acquisition
      await adminProjectAPI.recalcFunding().catch(()=>{});
      
      // Fetch projects with 'under_acquisition' status (projects that completed fundraising)
      // Also include 'funded' for backwards compatibility
      const [underAcqRes, fundedRes, spvRes, trustRes] = await Promise.all([
        adminProjectAPI.getProjects({ status: 'under_acquisition' }),
        adminProjectAPI.getProjects({ status: 'funded' }).catch(() => ({ data: { data: { projects: [] } } })),
        adminSPVAPI.getSPVs({}),
        adminTrustAPI.getTrusts(),
      ]);
      
      // Combine and filter out projects that already have SPV assigned
      const underAcqProjects = (underAcqRes.data.data.projects||[]).filter(p=>!p.spv);
      const fundedProjects = (fundedRes.data.data.projects||[]).filter(p=>!p.spv);
      
      // Combine and deduplicate by project ID
      const allProjects = [...underAcqProjects, ...fundedProjects];
      const uniqueProjects = allProjects.filter((p, index, self) => 
        index === self.findIndex(pr => pr._id === p._id)
      );
      
      setProjects(uniqueProjects);
      setSpvs(spvRes.data.data.spvs||[]);
      setTrusts(trustRes.data.data.trusts||[]);
    } catch (e) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const assign = async () => {
    if (!assignFor || !selectedSPV) return;
    try {
      await adminProjectAPI.assignSPV(assignFor._id, selectedSPV);
      toast.success('SPV assigned');
      setAssignFor(null); setSelectedSPV('');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to assign SPV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assign SPV to Project</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th><th>Code</th><th>City</th><th>Status</th><th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr> : projects.length===0 ? <tr><td colSpan={5} className="p-6 text-center">No eligible projects</td></tr> : projects.map(p => (
                <tr key={p._id}>
                  <td>{p.projectName}</td>
                  <td>{p.projectCode}</td>
                  <td>{p?.landDetails?.location?.city}</td>
                  <td className="capitalize">{p.status}</td>
                  <td>
                    <div className="flex justify-end">
                      <button className="px-3 py-2 rounded-xl bg-primary-600 text-white shadow hover:bg-primary-700 transition flex items-center gap-2" onClick={()=>{ setAssignFor(p); setSelectedSPV(''); }}>
                        <FaLink/> Assign SPV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Assign SPV to {assignFor.projectName}</h3>
              <button className="btn-secondary" onClick={()=>setAssignFor(null)}>Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select SPV</label>
                <select className="input" value={selectedSPV} onChange={(e)=>setSelectedSPV(e.target.value)}>
                  <option value="">Select SPV</option>
                  {spvs.length === 0 ? (
                    <option disabled>No SPVs available</option>
                  ) : (
                    <>
                      {trusts.map(t => {
                        const trustSPVs = spvs.filter(s => {
                          // Handle both populated trust object and trust ObjectId
                          const sTrustId = s.trust?._id || s.trust;
                          return sTrustId && String(sTrustId) === String(t._id);
                        });
                        return trustSPVs.length > 0 ? (
                          <optgroup key={t._id} label={`Trust: ${t.name}`}>
                            {trustSPVs.map(s => (
                              <option key={s._id} value={s._id}>
                                {s.spvName || s.name} {s.registrationDetails?.cin || s.registrationNumber ? `(${s.registrationDetails?.cin || s.registrationNumber})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        ) : null;
                      })}
                      {/* Also show SPVs without a trust assigned */}
                      {spvs.filter(s => {
                        const sTrustId = s.trust?._id || s.trust;
                        return !sTrustId || !trusts.find(t => String(t._id) === String(sTrustId));
                      }).length > 0 && (
                        <optgroup label="Unassigned SPVs">
                          {spvs.filter(s => {
                            const sTrustId = s.trust?._id || s.trust;
                            return !sTrustId || !trusts.find(t => String(t._id) === String(sTrustId));
                          }).map(s => (
                            <option key={s._id} value={s._id}>
                              {s.spvName || s.name} {s.registrationDetails?.cin || s.registrationNumber ? `(${s.registrationDetails?.cin || s.registrationNumber})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )}
                </select>
                {spvs.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Create an SPV first in the SPVs section</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={()=>setAssignFor(null)}>Cancel</button>
                <button className="btn-primary" disabled={!selectedSPV} onClick={assign}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


