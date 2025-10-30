import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

/**
 * Reusable badge component for showing verification status
 * @param {string} status - 'verified', 'pending', or 'not_verified'
 * @param {Date} verifiedAt - Optional verification date
 * @param {string} size - 'sm', 'md', or 'lg'
 */
export default function VerificationBadge({ status = 'not_verified', verifiedAt, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const config = {
    verified: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: FaCheckCircle,
      iconColor: 'text-green-600',
      label: 'Verified with DIDIT'
    },
    pending: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: FaClock,
      iconColor: 'text-yellow-600',
      label: 'Verification Pending'
    },
    not_verified: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      icon: FaTimesCircle,
      iconColor: 'text-gray-600',
      label: 'Not Verified'
    }
  };

  const { bgColor, textColor, borderColor, icon: Icon, iconColor, label } = config[status] || config.not_verified;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full border ${bgColor} ${borderColor} ${textColor} ${sizeClasses[size]} font-medium`}>
      <Icon className={`${iconColor} ${iconSizes[size]}`} />
      <span>{label}</span>
      {status === 'verified' && verifiedAt && (
        <span className="text-xs opacity-75">
          ({formatDate(verifiedAt)})
        </span>
      )}
    </div>
  );
}

