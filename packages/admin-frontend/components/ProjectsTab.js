import { useState, useEffect } from 'react';
import { adminProjectAPI } from '../lib/api';
import { FaSearch, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects();
  }, [page, search, statusFilter, publicFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await adminProjectAPI.getProjects({
        page,
        limit: 20,
        search,
        status: statusFilter,
        isPublic: publicFilter
      });
      setProjects(response.data.data.projects);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (project) => {
    const action = project.isPublic ? 'unpublish' : 'publish';
    const confirmMessage = `Are you sure you want to ${action} "${project.projectName}"?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      if (project.isPublic) {
        await adminProjectAPI.unpublishProject(project._id);
        toast.success('Project unpublished successfully');
      } else {
        await adminProjectAPI.publishProject(project._id);
        toast.success('Project published successfully');
      }
      fetchProjects();
    } catch (error) {
      console.error(`Error ${action}ing project:`, error);
      toast.error(`Failed to ${action} project`);
    }
  };

  const handleDelete = async (project) => {
    if (!confirm(`Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminProjectAPI.deleteProject(project._id);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge badge-gray">Draft</span>,
      listed: <span className="badge badge-info">Listed</span>,
      fundraising: <span className="badge badge-success">Fundraising</span>,
      approved: <span className="badge badge-success">Approved</span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Project name or code"
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="listed">Listed</option>
              <option value="fundraising">Fundraising</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Published</label>
            <select
              className="input"
              value={publicFilter}
              onChange={(e) => setPublicFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={fetchProjects} className="btn btn-primary w-full">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Raised / Target</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td className="font-medium">{project.projectName}</td>
                    <td className="text-sm text-gray-600">{project.projectCode}</td>
                    <td className="text-sm">
                      {project.landDetails?.location?.city}, {project.landDetails?.location?.state}
                    </td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>
                      {project.isPublic ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge badge-gray">Unpublished</span>
                      )}
                    </td>
                    <td className="font-medium">
                      ₹{(project.funding?.raisedPaid || 0).toLocaleString()} / ₹{(project.financials?.targetRaise || 0).toLocaleString()}
                    </td>
                    {/* Actions removed; manage publish/delete in Publish Sites tab */}
                  </tr>
                ))}
              </tbody>
            </table>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

