import Head from 'next/head';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <FaExclamationTriangle className="mx-auto text-yellow-500 text-6xl mb-4" />
          <h2 className="text-6xl font-extrabold text-gray-900 mb-2">
            404
          </h2>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h3>
          <p className="mt-2 text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-x-4">
            <Link href="/" className="btn-primary inline-block">
              Go Home
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-block">
              Dashboard
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 text-left bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-bold text-gray-900 mb-3">Helpful Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="text-primary-600 hover:text-primary-700">
                  → Browse Investment Projects
                </Link>
              </li>
              <li>
                <Link href="/kyc/onboarding" className="text-primary-600 hover:text-primary-700">
                  → Complete KYC Verification
                </Link>
              </li>
              <li>
                <Link href="/dashboard/investments" className="text-primary-600 hover:text-primary-700">
                  → View My Investments
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

