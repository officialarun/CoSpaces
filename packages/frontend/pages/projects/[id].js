import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { projectAPI, subscriptionAPI, complianceAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaChartLine, FaCheckCircle, FaUsers, FaFileAlt } from 'react-icons/fa';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectAPI.getProjectById(id);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      const response = await complianceAPI.checkInvestorEligibility(project.spv);
      setEligibility(response.data.checks);
      if (response.data.checks.eligible) {
        setShowInvestModal(true);
      } else {
        toast.error('Please complete KYC to invest');
        router.push('/kyc/onboarding');
      }
    } catch (error) {
      toast.error('Unable to check eligibility');
    }
  };

  const handleInvest = async () => {
    const amount = parseFloat(investAmount);
    
    if (!amount || amount < project.financials.minimumInvestment) {
      toast.error(`Minimum investment is ₹${project.financials.minimumInvestment.toLocaleString()}`);
      return;
    }

    try {
      await subscriptionAPI.createSubscription({
        spvId: project.spv,
        committedAmount: amount
      });
      toast.success('Investment subscription created! Complete the process in your dashboard.');
      router.push('/dashboard/subscriptions');
    } catch (error) {
      toast.error(error.error || 'Failed to create subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Link href="/projects" className="text-primary-600 hover:text-primary-700">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.projectName} - Investment Details</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/projects" className="text-gray-600 hover:text-gray-900">
              ← Back to Projects
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </header>

        {/* Hero Image */}
        {project.media?.coverImage && (
          <div className="w-full h-96 bg-gray-200">
            <img
              src={project.media.coverImage}
              alt={project.projectName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {project.projectName}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    {project.landDetails.location.city}, {project.landDetails.location.state}
                  </div>
                  <span className={`badge ${project.status === 'listed' ? 'badge-success' : 'badge-info'}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">About This Project</h2>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>

              {/* Key Details */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Key Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Land Type</h3>
                    <p className="text-lg font-medium capitalize">{project.landDetails.landType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Total Area</h3>
                    <p className="text-lg font-medium">
                      {project.landDetails.totalArea.value.toLocaleString()} {project.landDetails.totalArea.unit}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Survey Number</h3>
                    <p className="text-lg font-medium">{project.landDetails.surveyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Zoning</h3>
                    <p className="text-lg font-medium">{project.landDetails.zoning || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Land Valuation</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(project.financials.landValue / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Target Raise</h3>
                    <p className="text-2xl font-bold text-primary-600">
                      ₹{(project.financials.targetRaise / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Expected IRR</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {project.financials.expectedIRR?.target || 'N/A'}%
                    </p>
                    {project.financials.expectedIRR?.low && (
                      <p className="text-sm text-gray-500">
                        Range: {project.financials.expectedIRR.low}% - {project.financials.expectedIRR.high}%
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Holding Period</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.financials.holdingPeriod} months
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {project.riskFactors && project.riskFactors.length > 0 && (
                <div className="card border-2 border-yellow-200 bg-yellow-50">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-900">⚠️ Risk Factors</h2>
                  <ul className="space-y-2">
                    {project.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`badge ${
                          risk.severity === 'high' ? 'badge-error' :
                          risk.severity === 'medium' ? 'badge-warning' : 'badge-info'
                        } mr-2 mt-1`}>
                          {risk.severity}
                        </span>
                        <span className="text-yellow-900">{risk.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h3 className="text-xl font-bold mb-4">Investment Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Investment</span>
                    <span className="font-bold">₹{(project.financials.minimumInvestment / 100000).toFixed(0)}L</span>
                  </div>
                  
                  {project.financials.maximumInvestment && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Investment</span>
                      <span className="font-bold">₹{(project.financials.maximumInvestment / 100000).toFixed(0)}L</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Exit Strategy</span>
                    <span className="font-medium capitalize">{project.financials.exitStrategy}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Fundraising Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-primary-600 h-3 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ₹0 raised of ₹{(project.financials.targetRaise / 10000000).toFixed(2)}Cr
                  </p>
                </div>

                {/* RERA Badge */}
                {project.reraCompliance?.applicable && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-sm font-medium text-green-900">RERA Compliant</span>
                  </div>
                )}

                <button
                  onClick={checkEligibility}
                  className="w-full btn-primary mb-3"
                >
                  Invest Now
                </button>

                <div className="text-center text-sm text-gray-500">
                  <p>Regulated under Companies Act 2013</p>
                  <p className="mt-1">Maximum 200 investors per SPV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Invest in {project.projectName}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (₹)
              </label>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="input"
                placeholder={`Min: ₹${project.financials.minimumInvestment.toLocaleString()}`}
                min={project.financials.minimumInvestment}
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum: ₹{project.financials.minimumInvestment.toLocaleString()}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
              <p className="text-blue-900">
                • Documents will need to be signed<br />
                • Funds will be held in escrow<br />
                • KYC must be approved
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                className="flex-1 btn-primary"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

