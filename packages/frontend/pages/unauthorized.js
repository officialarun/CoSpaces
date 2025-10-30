import Head from 'next/head';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';

export default function Unauthorized() {
  return (
    <>
      <Head>
        <title>Unauthorized Access</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <FaLock className="mx-auto text-red-500 text-6xl mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
          <div className="mt-6 space-x-4">
            <Link href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </Link>
            <Link href="/" className="btn-secondary inline-block">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

