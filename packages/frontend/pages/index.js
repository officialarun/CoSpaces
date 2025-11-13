import Head from 'next/head';
import Link from 'next/link';
import { FaChevronRight, FaBuilding, FaBriefcase, FaLeaf, FaImage, FaUnlock, FaThList, FaChartLine, FaExchangeAlt, FaCubes, FaShieldAlt, FaLandmark } from 'react-icons/fa';
import { useAuth } from '../lib/auth';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Head>
        <title>Invest in Global Alternative Assets - CoSpaces</title>
        <meta name="description" content="Access top-tier Real Estate, PE and VC investments with low minimums" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaLandmark className="text-blue-600 text-3xl" />
            <span className="text-2xl font-bold text-gray-900">CoSpaces</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 font-medium">
              Projects
            </Link>
            {isAuthenticated() ? (
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Section 1: Hero Section */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Hero Section */}
        <div className="flex-1 bg-white px-8 py-16 lg:px-16 lg:py-24 flex flex-col justify-center">
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-12">
              Invest in global{' '}
              <span className="text-blue-600">alternative assets</span>{' '}
              like never before
            </h1>

            {/* Value Propositions */}
            <ul className="space-y-6 mb-12">
              <li className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-xl text-gray-800">
                  Access top-tier Real Estate opportunities
                </span>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-xl text-gray-800">
                  Curated PE and VC investments coming soon
                </span>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-xl text-gray-800">
                  Diversify across asset classes with low minimums
                </span>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-xl text-gray-800">
                  Enhance liquidity with secondary market trading
                </span>
              </li>
            </ul>

            {/* CTA Button */}
            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              Join The Waitlist
            </button>

            {/* IFSCA Badge */}
            <div className="mt-16 flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">IFSCA's Regulatory</p>
                <p className="text-sm font-semibold text-gray-800">Sandbox Framework</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">IFSCA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Interactive UI */}
        <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-16 lg:px-12 lg:py-24 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium shadow-md">
                Real Estate
              </button>
              <button className="px-5 py-2.5 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium hover:bg-opacity-30 transition-all">
                Artwork and collectibles
              </button>
              <button className="px-5 py-2.5 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium hover:bg-opacity-30 transition-all">
                Venture Capital
              </button>
              <button className="px-5 py-2.5 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium hover:bg-opacity-30 transition-all">
                Private Equity
              </button>
            </div>

            {/* Property Fund Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  New token offering
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Fund</h3>
              <p className="text-sm text-gray-500 mb-6">Investment strategy</p>

              {/* Loading Bars - Investment Strategy */}
              <div className="space-y-3 mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-300 to-gray-200 rounded-full loading-bar" style={{width: '60%'}}></div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-300 to-gray-200 rounded-full loading-bar" style={{width: '80%'}}></div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3">Asset data</p>
              
              {/* Loading Bars - Asset Data */}
              <div className="space-y-3 mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-300 to-gray-200 rounded-full loading-bar" style={{width: '70%'}}></div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-300 to-gray-200 rounded-full loading-bar" style={{width: '45%'}}></div>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <span>INVEST</span>
                <FaChevronRight className="text-sm" />
              </button>
            </div>

            {/* My Portfolio Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">My Portfolio</p>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900">$125,075</span>
                    <span className="text-green-600 font-semibold flex items-center">
                      19.43% <span className="ml-1">↑</span>
                    </span>
                  </div>
                </div>
                
                {/* Donut Chart */}
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="62.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Menu Dots */}
              <div className="flex justify-end space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            {/* India VC Fund Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">India VC Fund</h3>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>BUY</span>
                  <span className="text-lg">↓</span>
                </button>
                <button className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>SELL</span>
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>

            {/* Polygon Branding */}
            <div className="flex items-center justify-center space-x-3 pt-6">
              <span className="text-white text-sm uppercase tracking-wider opacity-80">Powered by</span>
              <svg className="h-6" viewBox="0 0 120 30" fill="none">
                <path d="M10 15L15 10L20 15L15 20L10 15Z" fill="white"/>
                <text x="25" y="20" fill="white" fontSize="14" fontWeight="600">polygon</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: ORYX Featured Property */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Introducing <span className="text-gray-900">ORYX</span> — India's first{' '}
            <span className="text-blue-600">tokenized</span> property
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Property Details Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-3xl font-bold text-gray-900">ORYX</h3>
                  <span className="px-4 py-1.5 border-2 border-blue-600 text-blue-600 text-xs font-bold rounded-full">
                    100% PRIMARY SUBSCRIBED
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Terazo's flagship tokenized fund offers an opportunity to invest in ORYX, a
                  grade-A commercial development in GIFT City, India.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Asset class</p>
                  <p className="font-bold text-gray-900">Real estate</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Asset value</p>
                  <p className="font-bold text-gray-900">US $48M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fund size</p>
                  <p className="font-bold text-gray-900">US $7M</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Target returns</p>
                  <p className="font-bold text-gray-900">&gt; 18%*</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fund structure</p>
                  <p className="font-bold text-gray-900">Single-asset</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project stage</p>
                  <p className="font-bold text-gray-900">New Build</p>
                </div>
              </div>

              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all mb-6">
                Learn more
              </button>

              <div className="text-xs text-gray-500 space-y-2">
                <p>* Target returns and fund IRR are pre-tax, do not consider currency fluctuation and subject to change.</p>
                <p>* Estimation on return and development completion date are indicative and based on certain assumptions and should not be considered as a promise, guarantee or forecast. Please read all the fun documents before considering investment.</p>
              </div>
            </div>

            {/* Right: Property Image */}
            <div className="relative h-96 lg:h-full min-h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                alt="ORYX Commercial Building"
                className="w-full h-full object-cover rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: As Seen In */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-12">As seen in</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-serif font-bold text-gray-800">THE TIMES<br/>OF INDIA</div>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-800 rounded"></div>
                <span className="text-xl font-semibold text-gray-800">Regulation Asia</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                <span className="text-3xl">U</span> Ledger<br/>Insights
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 tracking-wide">VCCIRCLE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Asset Classes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            <span className="text-blue-600">Bolster your portfolio</span> across assets
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Real Estate */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <FaBuilding className="text-6xl text-blue-600 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Estate</h3>
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                Active
              </span>
            </div>

            {/* Private Equity */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <FaBriefcase className="text-6xl text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Private Equity</h3>
              <span className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                Coming soon
              </span>
            </div>

            {/* Venture Capital */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <FaLeaf className="text-6xl text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Venture Capital</h3>
              <span className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                Coming soon
              </span>
            </div>

            {/* Art & Collectibles */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <FaImage className="text-6xl text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Art & Collectibles</h3>
              <span className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Part 1: Institutional Stats */}
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            Invest like <span className="text-blue-600">Institutions</span> and{' '}
            <span className="text-blue-600">Family offices</span>
            <sup className="text-lg">1</sup>
          </h2>

          <div className="grid md:grid-cols-3 gap-12 mb-24">
            <div className="text-center">
              <div className="text-6xl lg:text-7xl font-bold text-blue-600 mb-4">81%</div>
              <p className="text-gray-600 leading-relaxed">
                of Ultra-High-Networth-Individuals (UHNIs) invest in alternative assets
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl lg:text-7xl font-bold text-blue-600 mb-4">50%</div>
              <p className="text-gray-600 leading-relaxed">
                Average portfolio allocation to alternative assets among UHNIs
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl lg:text-7xl font-bold text-blue-600 mb-4">81%</div>
              <p className="text-gray-600 leading-relaxed">
                of Institutional investors plan to increase allocation to alternative assets over 5 years
              </p>
            </div>
          </div>

          {/* Part 2: Performance Bar Chart */}
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            In Private asset classes that <span className="text-blue-600">outperform</span>
            <sup className="text-lg">2</sup>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* S&P 500 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">S&P 500</span>
                  <span className="font-bold text-gray-900">8.2%</span>
                </div>
                <div className="h-16 bg-gray-300 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-300" style={{width: '33%'}}></div>
                </div>
              </div>

              {/* PE Funds */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">PE Funds</span>
                  <span className="font-bold text-gray-900">12.2%</span>
                </div>
                <div className="h-16 bg-gray-300 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-400" style={{width: '49%'}}></div>
                </div>
              </div>

              {/* VC Funds */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">VC Funds</span>
                  <span className="font-bold text-gray-900">18.6%</span>
                </div>
                <div className="h-16 bg-gray-300 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500" style={{width: '74%'}}></div>
                </div>
              </div>

              {/* Top 25% Indian PE/VC */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Top-25% Indian PE/VC funds</span>
                  <span className="font-bold text-gray-900">25%</span>
                </div>
                <div className="h-16 bg-gray-300 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              Avg. Global Annualised Returns from 2004-2018
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Invest with <span className="text-blue-600">flexibility</span> and{' '}
            <span className="text-blue-600">transparency</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            {/* Exclusive Access */}
            <div className="text-center">
              <div className="mb-6">
                <FaUnlock className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Exclusive access</h3>
              <p className="text-gray-600 leading-relaxed">
                Access privately syndicated deals managed by experienced operators
              </p>
            </div>

            {/* Curated Opportunities */}
            <div className="text-center">
              <div className="mb-6">
                <FaThList className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Curated opportunities</h3>
              <p className="text-gray-600 leading-relaxed">
                Participate in unique offerings in private markets
              </p>
            </div>

            {/* Fractional Investments */}
            <div className="text-center">
              <div className="mb-6">
                <FaChartLine className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fractional investments</h3>
              <p className="text-gray-600 leading-relaxed">
                Gain exposure to real estate and PE/VC funds with as little as $1000
              </p>
            </div>

            {/* Enhanced Liquidity */}
            <div className="text-center">
              <div className="mb-6">
                <FaExchangeAlt className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enhanced liquidity</h3>
              <p className="text-gray-600 leading-relaxed">
                Trade your asset-backed tokens at any time on our P2P marketplace
              </p>
            </div>

            {/* Powered by Blockchain */}
            <div className="text-center">
              <div className="mb-6">
                <FaCubes className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Powered by blockchain</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy transparency and low fees in a robust and secure ecosystem
              </p>
            </div>

            {/* Licensed and Regulated */}
            <div className="text-center">
              <div className="mb-6">
                <FaShieldAlt className="text-5xl text-gray-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Licensed and regulated</h3>
              <p className="text-gray-600 leading-relaxed">
                Terazo operates under regulatory sandbox of IFSCA, GIFT City (India)
              </p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg">
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-900 relative overflow-hidden">
        {/* Geometric Decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 200 200" fill="none">
            <path d="M50 50 L100 50 L100 100 L50 100 Z" stroke="white" strokeWidth="1"/>
            <path d="M100 50 L150 50 L150 100 L100 100 Z" stroke="white" strokeWidth="1"/>
            <path d="M100 100 L150 100 L150 150 L100 150 Z" stroke="white" strokeWidth="1"/>
            <path d="M50 100 L100 100 L100 150 L50 150 Z" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Diversify your portfolio<br/>with alternative assets
          </h2>
          <button className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all">
            Join the waitlist
          </button>
        </div>
      </section>

      {/* Section 8: Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">TERAZO</span>
              </div>
            </div>

            {/* Invest Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Invest</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                <li><Link href="/how-it-works" className="hover:text-blue-600">How it works</Link></li>
                <li><Link href="/faq" className="hover:text-blue-600">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact Us</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/grievance" className="hover:text-blue-600">Grievance Redressal Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-xs text-gray-500 mb-4">
              © 2021 - 2024 Terazo Fintech LLP
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Terazo is a trademark and/or registered trademark of Terazo Network LLP. All rights reserved.
            </p>
            
            <div className="text-xs text-gray-500 space-y-4 leading-relaxed">
              <p>
                This website contains certain forward-looking statements that are subject to various risks and uncertainties. You are cautioned not to place undue reliance on any of these forward-looking statements. This website is maintained by Terazo Fintech LLP in its sole and absolute discretion.
              </p>
              <p>
                Terazo Fintech LLP is regulated under IFSCA's Regulatory Sandbox Framework. The information contained on the terazo.network website has been prepared by Terazo Fintech LLP without reference to any particular user's investment requirements or financial situation. Potential investors are encouraged to consult with professional or financial advisors before making any investment. All investments involve risk, including the risk of the loss of all your invested capital. Please carefully consider the investment objectives, risks, transaction costs, and other expenses related to an investment prior to deciding to invest. Diversification and asset allocation do not ensure profit or guarantee against loss. Investment decisions should be based on an individual's own goals, time horizon, and tolerance for risk. Our materials contain historical appreciation percentages based on sales data and reflect historical price trends. Such information is not intended to be indicative of returns that would have been achieved by Terazo Fintech LLP during such periods. Fees, expenses, and other factors may create significant reduction in the performance of an investment.
              </p>
              <p>
                Past price trends are not indicative of future price trends and are not intended to be a proxy for historical or projected future performance of an asset. Also, our materials may present comparisons between the historical price performance of an asset with other investment asset classes, such as stocks, bonds, real estate, funds, and others. There is no guarantee of profits and investing includes risk of loss. The information contained herein neither constitutes an offer for sale nor a solicitation of interest in any specific offering.
              </p>
              <p>
                Investment opportunities on this website are only for eligible investors from select jurisdictions who successfully complete KYC and AML checks, submit net worth certificate, sign fund documents and are qualified by issuer to invest.
              </p>
              <p>
                By using this website, you agree to our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 hover:underline">Terms of use</Link>.
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              Copyright © Terazo 2024
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
