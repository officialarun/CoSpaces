import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { FaLandmark, FaUsers, FaShieldAlt, FaChartLine } from 'react-icons/fa';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Head>
        <title>Fractional Land SPV Platform - Invest in Land Fractionally</title>
        <meta name="description" content="Invest in fractional land ownership through SPVs with full compliance" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaLandmark className="text-primary-600 text-3xl" />
            <span className="text-2xl font-bold text-gray-900">FractionalLand</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            {isAuthenticated() ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Invest in Fractional Land Ownership
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Access premium land investments through compliant SPV structures. Invest from as low as ₹1 Lakh 
            with full legal protection and transparency.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/projects" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Browse Projects
            </Link>
            <Link href="/signup" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FractionalLand?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Compliant</h3>
              <p className="text-gray-600">
                All investments structured through legal SPVs following Companies Act, SEBI, and RERA guidelines.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLandmark className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">
                Curated land parcels in high-growth areas with strong appreciation potential.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">KYC/AML Verified</h3>
              <p className="text-gray-600">
                Robust KYC and AML processes ensure all investors are verified and compliant.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Returns</h3>
              <p className="text-gray-600">
                Clear exit strategies with projected IRR and distribution tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary-600 text-4xl font-bold mb-2">01</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & KYC</h3>
              <p className="text-gray-600">
                Register and complete KYC verification with Aadhaar, PAN, and AML screening.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary-600 text-4xl font-bold mb-2">02</div>
              <h3 className="text-xl font-semibold mb-2">Browse & Invest</h3>
              <p className="text-gray-600">
                Explore curated land projects and invest in SPVs with minimum ₹1 Lakh.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary-600 text-4xl font-bold mb-2">03</div>
              <h3 className="text-xl font-semibold mb-2">Hold & Track</h3>
              <p className="text-gray-600">
                Monitor your investment through our dashboard with real-time updates.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary-600 text-4xl font-bold mb-2">04</div>
              <h3 className="text-xl font-semibold mb-2">Exit & Profit</h3>
              <p className="text-gray-600">
                Receive pro-rata distributions upon sale with automated tax deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl mb-8">
            Join hundreds of investors who have already invested in fractional land ownership.
          </p>
          <Link href="/signup" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">FractionalLand</h3>
              <p className="text-sm">
                India's first compliant fractional land investment platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/projects">Projects</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/compliance">Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@fractionalland.com</li>
                <li>Phone: +91 1234567890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2024 FractionalLand SPV Platform. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">
              Disclaimer: Investments are subject to market risks. Please read all legal documents carefully before investing.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

