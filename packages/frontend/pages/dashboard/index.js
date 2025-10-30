import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import { subscriptionAPI, distributionAPI, reportAPI } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FaChartLine, FaWallet, FaFileInvoiceDollar, FaLandmark, FaUser, FaBriefcase, FaMapMarkerAlt, FaChartPie, FaEdit, FaShieldAlt } from 'react-icons/fa';
import VerificationBadge from '../../components/VerificationBadge';

function DashboardHome() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [portfolioRes, subscriptionsRes, distributionsRes] = await Promise.all([
        reportAPI.getPortfolio(),
        subscriptionAPI.getMySubscriptions(),
        distributionAPI.getMyDistributions()
      ]);
      
      setPortfolio(portfolioRes.data.portfolio);
      setSubscriptions(subscriptionsRes.data.subscriptions);
      setDistributions(distributionsRes.data.distributions);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper functions to format data
  const formatOccupation = (occupation) => {
    const occupationMap = {
      'salaried': 'Salaried Employee',
      'self_employed': 'Self Employed',
      'business_owner': 'Business Owner',
      'professional': 'Professional',
      'retired': 'Retired',
      'student': 'Student',
      'other': 'Other'
    };
    return occupationMap[occupation] || occupation;
  };

  const formatEducation = (education) => {
    const educationMap = {
      'high_school': 'High School',
      'undergraduate': 'Undergraduate',
      'postgraduate': 'Postgraduate',
      'doctorate': 'Doctorate',
      'other': 'Other'
    };
    return educationMap[education] || education;
  };

  const formatIncome = (income) => {
    const incomeMap = {
      'below_5L': 'Below ₹5 Lakhs',
      '5L_10L': '₹5 - 10 Lakhs',
      '10L_25L': '₹10 - 25 Lakhs',
      '25L_50L': '₹25 - 50 Lakhs',
      '50L_1Cr': '₹50 Lakhs - 1 Crore',
      'above_1Cr': 'Above ₹1 Crore'
    };
    return incomeMap[income] || income;
  };

  const formatLandType = (type) => {
    const typeMap = {
      'agricultural': '🌾 Agricultural',
      'residential': '🏘️ Residential',
      'commercial': '🏢 Commercial',
      'industrial': '🏭 Industrial',
      'mixed_use': '🏗️ Mixed Use'
    };
    return typeMap[type] || type;
  };

  const formatInvestmentGoal = (goal) => {
    const goalMap = {
      'capital_appreciation': 'Capital Appreciation',
      'regular_income': 'Regular Income',
      'diversification': 'Portfolio Diversification',
      'tax_benefits': 'Tax Benefits',
      'other': 'Other'
    };
    return goalMap[goal] || goal;
  };

  const formatRiskAppetite = (risk) => {
    const riskMap = {
      'conservative': 'Conservative',
      'moderate': 'Moderate',
      'aggressive': 'Aggressive'
    };
    return riskMap[risk] || risk;
  };

  const formatInvestmentHorizon = (horizon) => {
    const horizonMap = {
      'short_term': 'Short Term (< 3 years)',
      'medium_term': 'Medium Term (3-5 years)',
      'long_term': 'Long Term (> 5 years)'
    };
    return horizonMap[horizon] || horizon;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Fractional Land SPV Platform</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName}!
              </h1>
              <p className="text-gray-600 mt-1">Here's an overview of your investments</p>
            </div>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FaUser />
              <span>{showProfile ? 'Hide Profile' : 'View Profile'}</span>
            </button>
          </div>

          {/* Profile Section */}
          {showProfile && (
            <div className="card border-2 border-indigo-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <Link 
                  href="/onboarding/step1" 
                  className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-600 text-xl" />
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <VerificationBadge 
                      status={user.diditVerification?.isVerified ? 'verified' : 'not_verified'}
                      verifiedAt={user.diditVerification?.verifiedAt}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    )}
                    {!user.diditVerification?.isVerified && (
                      <div className="pt-3 border-t border-blue-200">
                        <Link 
                          href="/dashboard/verify-didit"
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2"
                        >
                          <FaShieldAlt />
                          <span>Verify Identity with DIDIT</span>
                        </Link>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.dateOfBirth).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    {(user.diditVerification?.verificationData?.verifiedAge || user.dateOfBirth) && (
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">
                          {user.diditVerification?.verificationData?.verifiedAge || 
                           calculateAge(user.dateOfBirth)} years
                        </p>
                      </div>
                    )}
                    {user.gender && (
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">{user.gender.replace('_', ' ')}</p>
                      </div>
                    )}
                    {user.address && (user.address.street || user.address.city || user.address.state || user.address.pincode || user.address.country) && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">
                          {user.address.street && <>{user.address.street}<br /></>}
                          {(user.address.city || user.address.state || user.address.pincode) && (
                            <>
                              {[user.address.city, user.address.state, user.address.pincode]
                                .filter(Boolean)
                                .join(', ')}
                              <br />
                            </>
                          )}
                          {user.address.country && user.address.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details */}
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaBriefcase className="text-green-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                  </div>
                  <div className="space-y-3">
                    {user.professionalDetails?.occupation && (
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-900">
                          {formatOccupation(user.professionalDetails.occupation)}
                        </p>
                      </div>
                    )}
                    {user.professionalDetails?.company && (
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">{user.professionalDetails.company}</p>
                      </div>
                    )}
                    {user.professionalDetails?.designation && (
                      <div>
                        <p className="text-sm text-gray-600">Designation</p>
                        <p className="font-medium text-gray-900">{user.professionalDetails.designation}</p>
                      </div>
                    )}
                    {user.professionalDetails?.yearsOfExperience && (
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium text-gray-900">
                          {user.professionalDetails.yearsOfExperience} years
                        </p>
                      </div>
                    )}
                    {user.professionalDetails?.education && (
                      <div>
                        <p className="text-sm text-gray-600">Education</p>
                        <p className="font-medium text-gray-900">
                          {formatEducation(user.professionalDetails.education)}
                        </p>
                      </div>
                    )}
                    {user.professionalDetails?.annualIncome && (
                      <div>
                        <p className="text-sm text-gray-600">Annual Income</p>
                        <p className="font-medium text-gray-900">
                          {formatIncome(user.professionalDetails.annualIncome)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Investment Preferences - Land Types & Locations */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaMapMarkerAlt className="text-purple-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Land Preferences</h3>
                  </div>
                  <div className="space-y-3">
                    {user.investmentPreferences?.landTypes?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Preferred Land Types</p>
                        <div className="flex flex-wrap gap-2">
                          {user.investmentPreferences.landTypes.map((type, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-purple-200"
                            >
                              {formatLandType(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.investmentPreferences?.preferredLocations?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Preferred Locations</p>
                        <div className="space-y-2">
                          {user.investmentPreferences.preferredLocations.map((loc, idx) => (
                            <div 
                              key={idx}
                              className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-purple-200"
                            >
                              📍 {loc.city}, {loc.state} {loc.pincode && `- ${loc.pincode}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Investment Goals & Strategy */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaChartPie className="text-orange-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Investment Strategy</h3>
                  </div>
                  <div className="space-y-3">
                    {user.investmentPreferences?.investmentGoal && (
                      <div>
                        <p className="text-sm text-gray-600">Investment Goal</p>
                        <p className="font-medium text-gray-900">
                          {formatInvestmentGoal(user.investmentPreferences.investmentGoal)}
                        </p>
                      </div>
                    )}
                    {user.investmentPreferences?.riskAppetite && (
                      <div>
                        <p className="text-sm text-gray-600">Risk Appetite</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.investmentPreferences.riskAppetite === 'conservative' 
                            ? 'bg-green-100 text-green-800' 
                            : user.investmentPreferences.riskAppetite === 'moderate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatRiskAppetite(user.investmentPreferences.riskAppetite)}
                        </span>
                      </div>
                    )}
                    {user.investmentPreferences?.investmentHorizon && (
                      <div>
                        <p className="text-sm text-gray-600">Investment Horizon</p>
                        <p className="font-medium text-gray-900">
                          {formatInvestmentHorizon(user.investmentPreferences.investmentHorizon)}
                        </p>
                      </div>
                    )}
                    {(user.investmentPreferences?.minimumInvestmentAmount || user.investmentPreferences?.maximumInvestmentAmount) && (
                      <div>
                        <p className="text-sm text-gray-600">Investment Range</p>
                        <p className="font-medium text-gray-900">
                          {user.investmentPreferences.minimumInvestmentAmount && 
                            `₹${user.investmentPreferences.minimumInvestmentAmount.toLocaleString()}`}
                          {user.investmentPreferences.minimumInvestmentAmount && user.investmentPreferences.maximumInvestmentAmount && ' - '}
                          {user.investmentPreferences.maximumInvestmentAmount && 
                            `₹${user.investmentPreferences.maximumInvestmentAmount.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DIDIT Verification Banner */}
          {!user.diditVerification?.isVerified && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-400 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <FaShieldAlt className="text-indigo-600 text-2xl" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Identity Verification Required
                    </p>
                    <p className="text-xs text-indigo-700">
                      Verify your identity with Aadhaar to unlock all investment opportunities
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/verify-didit" className="btn-primary text-sm whitespace-nowrap">
                  Verify Now
                </Link>
              </div>
            </div>
          )}

          {/* Phone Number Required Banner (for OAuth users) */}
          {!user.phone && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-blue-700">
                    Phone number required for KYC verification. Please add your phone number to continue.
                  </p>
                </div>
                <Link href="/kyc/onboarding" className="btn-primary text-sm">
                  Add Phone
                </Link>
              </div>
            </div>
          )}

          {/* KYC Status Banner */}
          {user.kycStatus !== 'approved' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Your KYC is {user.kycStatus}. Complete your KYC to start investing.
                  </p>
                </div>
                <Link href="/kyc/onboarding" className="btn-primary text-sm">
                  Complete KYC
                </Link>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio?.totalInvested?.toLocaleString() || 0}
                  </p>
                </div>
                <FaWallet className="text-primary-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio?.activeInvestments || 0}
                  </p>
                </div>
                <FaLandmark className="text-green-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Distributions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio?.totalDistributions?.toLocaleString() || 0}
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-blue-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{((portfolio?.totalInvested || 0) + (portfolio?.totalDistributions || 0)).toLocaleString()}
                  </p>
                </div>
                <FaChartLine className="text-purple-600 text-3xl" />
              </div>
            </div>
          </div>

          {/* My Investments */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">My Investments</h2>
            {portfolio?.investments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPV</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invested</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shares</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {portfolio.investments.map((investment) => (
                      <tr key={investment.spv}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{investment.spv}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          ₹{investment.invested.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {investment.shares}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          ₹{investment.distributionsReceived.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link href={`/investments/${investment.spv}`} className="text-primary-600 hover:text-primary-700">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You don't have any investments yet</p>
                <Link href="/projects" className="btn-primary">
                  Browse Projects
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Subscriptions</h2>
              {subscriptions.slice(0, 5).map((sub) => (
                <div key={sub._id} className="border-b border-gray-200 py-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sub.spv?.spvName}</p>
                      <p className="text-sm text-gray-500">₹{sub.committedAmount.toLocaleString()}</p>
                    </div>
                    <span className={`badge badge-${sub.status === 'completed' ? 'success' : sub.status === 'rejected' ? 'error' : 'warning'}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Distributions</h2>
              {distributions.slice(0, 5).map((dist) => (
                <div key={dist._id} className="border-b border-gray-200 py-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{dist.spv?.spvName}</p>
                      <p className="text-sm text-gray-500">
                        {dist.investorDistributions.find(inv => inv.investor === user._id)?.netAmount.toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge badge-${dist.status === 'completed' ? 'success' : 'info'}`}>
                      {dist.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardHome />
    </ProtectedRoute>
  );
}

