import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { projectAPI } from '../../lib/api';
import { FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaChartLine } from 'react-icons/fa';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    landType: 'all',
    city: 'all'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, projects]);

  const loadProjects = async () => {
    try {
      // Get all public projects (listed + fundraising + approved)
      const response = await projectAPI.getListedProjects();
      const allProjects = response.data.projects || [];
      setProjects(allProjects);
      setFilteredProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.landType !== 'all') {
      filtered = filtered.filter(p => p.landDetails?.landType === filters.landType);
    }

    if (filters.city !== 'all') {
      filtered = filtered.filter(p => p.landDetails?.location?.city === filters.city);
    }

    setFilteredProjects(filtered);
  };

  const getUniqueCities = () => {
    const cities = projects.map(p => p.landDetails?.location?.city).filter(Boolean);
    return [...new Set(cities)].sort();
  };

  return (
    <>
      <Head>
        <title>Investment Projects - Fractional Land SPV Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              FractionalLand
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            </nav>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Investment Projects</h1>
            <p className="text-gray-600">Browse available land investment opportunities</p>
          </div>

          {/* Filters */}
          {!loading && projects.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="listed">Listed</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="under_acquisition">Under Acquisition</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                {/* Land Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Type
                  </label>
                  <select
                    value={filters.landType}
                    onChange={(e) => setFilters({ ...filters, landType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed_use">Mixed Use</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Cities</option>
                    {getUniqueCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredProjects.length} of {projects.length} projects
                </p>
                {(filters.status !== 'all' || filters.landType !== 'all' || filters.city !== 'all') && (
                  <button
                    onClick={() => setFilters({ status: 'all', landType: 'all', city: 'all' })}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project._id} href={`/projects/${project._id}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    {project.media?.coverImage && (
                      <img
                        src={project.media.coverImage}
                        alt={project.projectName}
                        className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                      />
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {project.projectName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaMapMarkerAlt className="mr-1" />
                          {project.landDetails.location.city}, {project.landDetails.location.state}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.shortDescription}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Land Value</div>
                          <div className="font-semibold text-gray-900">
                            ₹{(project.financials.landValue / 10000000).toFixed(2)}Cr
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Min. Investment</div>
                          <div className="font-semibold text-gray-900">
                            ₹{(project.financials.minimumInvestment / 100000).toFixed(0)}L
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaChartLine className="mr-1 text-green-600" />
                          Target IRR: {project.financials.expectedIRR?.target || 'N/A'}%
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendar className="mr-1" />
                          {project.financials.holdingPeriod} months
                        </div>
                      </div>

                      <div className="pt-3">
                        {(() => {
                          const raised = project.funding?.raisedPaid || 0;
                          const target = project.financials?.targetRaise || 1;
                          const pct = target > 0 ? Math.min(100, Math.floor((raised / target) * 100)) : 0;
                          const isComplete = raised >= target && target > 0;
                          
                          return (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${isComplete ? 'bg-green-600' : 'bg-primary-600'}`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{isComplete ? 'Funding Complete' : 'Fundraising Open'}</span>
                                <span>₹{(target / 10000000).toFixed(2)}Cr Target</span>
                              </div>
                              {pct > 0 && (
                                <div className="text-xs text-gray-600 mt-1 text-center">
                                  ₹{(raised / 10000000).toFixed(2)}Cr raised ({pct}%)
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="pt-3">
                        <span className="badge badge-info">
                          {project.status}
                        </span>
                        {project.reraCompliance.applicable && (
                          <span className="badge badge-success ml-2">
                            RERA Compliant
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects available at the moment</p>
              <p className="text-gray-400 mt-2">Check back soon for new investment opportunities</p>
            </div>
          )}

          {!loading && projects.length > 0 && filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects match your filters</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters to see more projects</p>
              <button
                onClick={() => setFilters({ status: 'all', landType: 'all', city: 'all' })}
                className="mt-4 btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

