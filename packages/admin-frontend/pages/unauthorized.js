import Head from 'next/head';
import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function Unauthorized() {
  return (
    <>
      <Head>
        <title>Unauthorized Access - Admin Console</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-6 rounded-full">
              <FaShieldAlt className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-8">
            You do not have admin privileges to access this console.
            Please contact your system administrator if you believe this is an error.
          </p>

          <Link href="/login" className="btn btn-primary inline-flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

