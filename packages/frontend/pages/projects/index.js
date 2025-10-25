import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { projectAPI } from '../../lib/api';
import { FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaChartLine } from 'react-icons/fa';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getListedProjects();
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
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

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Fundraising Open</span>
                          <span>₹{(project.financials.targetRaise / 10000000).toFixed(2)}Cr Target</span>
                        </div>
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
        </div>
      </div>
    </>
  );
}

