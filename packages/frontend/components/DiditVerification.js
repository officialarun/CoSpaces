import React, { useState, useRef } from 'react';
import { FaShieldAlt, FaCheckCircle, FaSpinner, FaUpload, FaCamera } from 'react-icons/fa';
import { diditAPI } from '../lib/api';
import toast from 'react-hot-toast';
import VerificationBadge from './VerificationBadge';

/**
 * DIDIT Verification Component
 * Shows document upload interface for verification
 * @param {boolean} isVerified - Whether user is already verified
 * @param {Date} verifiedAt - Verification date if verified
 * @param {function} onVerificationComplete - Callback when verification completes
 * @param {function} onSkip - Callback when user skips
 * @param {boolean} showSkip - Whether to show skip button
 */
export default function DiditVerification({ 
  isVerified = false, 
  verifiedAt = null,
  onVerificationComplete,
  onSkip,
  showSkip = true
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      toast.error('Please select a document image first');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Uploading document to DIDIT...');
      const response = await diditAPI.verifyDocument(selectedFile, {
        source: 'onboarding',
        timestamp: new Date().toISOString()
      });

      console.log('📥 DIDIT Verification Response:', response);

      if (response.data?.verified || response.verified) {
        toast.success('Document verified successfully!');
        console.log('✅ Calling onVerificationComplete with:', response.data || response);
        if (onVerificationComplete) {
          onVerificationComplete(response.data || response);
        }
      } else {
        toast.error('Document verification failed. Please try again with a clearer image.');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      toast.error(error.response?.data?.error || error.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Identity Verified with DIDIT
            </h3>
            <p className="text-sm text-green-700 mb-3">
              Your identity has been successfully verified using your ID document. Your personal information has been auto-filled from verified data.
            </p>
            <VerificationBadge status="verified" verifiedAt={verifiedAt} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <FaShieldAlt className="text-indigo-600 text-3xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Identity Verification with DIDIT
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Upload a photo of your ID document (Aadhaar, Passport, Driving License, PAN Card) for instant verification. This will auto-fill your details.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">What will be verified:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Full Name (from ID)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Date of Birth & Age</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Complete Address</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Identity Proof (KYC Compliant)</span>
              </li>
            </ul>
          </div>

          {/* File Upload Area */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <FaUpload className="text-indigo-400 text-4xl mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload ID document
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="w-full rounded-lg border-2 border-indigo-200"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || !selectedFile}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt />
                  <span>Verify Document</span>
                </>
              )}
            </button>

            {showSkip && (
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>

          {showSkip && (
            <p className="text-xs text-gray-500 mt-3">
              You can verify later from your dashboard, but verification is required before making investments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
