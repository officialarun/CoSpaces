import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { projectAPI } from '../../lib/api';
import { FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaChartLine, FaLandmark, FaFilter } from 'react-icons/fa';

function ProjectsContent() {
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Investment Projects</h1>
        <p className="text-gray-600 text-lg">Browse available land investment opportunities</p>
      </div>

      {/* Filters */}
      {!loading && projects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FaFilter className="text-blue-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Land Type
              </label>
              <select
                value={filters.landType}
                onChange={(e) => setFilters({ ...filters, landType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              >
                <option value="all">All Cities</option>
                {getUniqueCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">
              Showing <span className="text-blue-600 font-bold">{filteredProjects.length}</span> of <span className="font-bold">{projects.length}</span> projects
            </p>
            {(filters.status !== 'all' || filters.landType !== 'all' || filters.city !== 'all') && (
              <button
                onClick={() => setFilters({ status: 'all', landType: 'all', city: 'all' })}
                className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                {project.media?.coverImage && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.media.coverImage}
                      alt={project.projectName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        project.status === 'listed' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'fundraising' ? 'bg-green-100 text-green-700' :
                        project.status === 'under_acquisition' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {project.projectName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-2 text-blue-600" />
                      {project.landDetails.location.city}, {project.landDetails.location.state}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {project.shortDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="text-xs text-blue-600 mb-1 font-medium">Land Value</div>
                      <div className="font-bold text-gray-900">
                        ₹{(project.financials.landValue / 10000000).toFixed(2)}Cr
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="text-xs text-green-600 mb-1 font-medium">Min. Investment</div>
                      <div className="font-bold text-gray-900">
                        ₹{(project.financials.minimumInvestment / 100000).toFixed(0)}L
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaChartLine className="mr-2 text-green-600" />
                      <span className="font-semibold">IRR: {project.financials.expectedIRR?.target || 'N/A'}%</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="mr-2 text-blue-600" />
                      <span className="font-semibold">{project.financials.holdingPeriod}m</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    {(() => {
                      const raised = project.funding?.raisedPaid || 0;
                      const target = project.financials?.targetRaise || 1;
                      const pct = target > 0 ? Math.min(100, Math.floor((raised / target) * 100)) : 0;
                      const isComplete = raised >= target && target > 0;
                      
                      return (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${isComplete ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span className="font-semibold">{isComplete ? '✓ Funded' : '◷ Fundraising'}</span>
                            <span className="font-semibold">Target: ₹{(target / 10000000).toFixed(2)}Cr</span>
                          </div>
                          {pct > 0 && (
                            <div className="text-xs text-gray-600 mt-2 text-center font-medium">
                              ₹{(raised / 10000000).toFixed(2)}Cr raised • {pct}% complete
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {project.reraCompliance.applicable && (
                    <div className="pt-4">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        ✓ RERA Compliant
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-20 px-8">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLandmark className="text-gray-400 text-5xl" />
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">No projects available</p>
          <p className="text-gray-500">Check back soon for new investment opportunities</p>
        </div>
      )}

      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-20 px-8">
          <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFilter className="text-yellow-600 text-5xl" />
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">No projects match your filters</p>
          <p className="text-gray-500 mb-6">Try adjusting your filters to see more projects</p>
          <button
            onClick={() => setFilters({ status: 'all', landType: 'all', city: 'all' })}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const { user, isAuthenticated } = useAuth();

  // If user is logged in, use DashboardLayout
  if (isAuthenticated()) {
    return (
      <>
        <Head>
          <title>Investment Projects - CoSpaces</title>
        </Head>
        <DashboardLayout>
          <ProjectsContent />
        </DashboardLayout>
      </>
    );
  }

  // If not logged in, use standalone layout with header
  return (
    <>
      <Head>
        <title>Investment Projects - CoSpaces</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        {/* Header for non-logged-in users */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FaLandmark className="text-blue-600 text-3xl" />
              <span className="text-2xl font-bold text-gray-900">CoSpaces</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/projects" className="text-gray-600 hover:text-gray-900 font-medium">
                Projects
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                Sign Up
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProjectsContent />
        </div>
      </div>
    </>
  );
}
