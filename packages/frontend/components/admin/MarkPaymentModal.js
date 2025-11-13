import { useState } from 'react';
import { adminDistributionAPI } from '../../lib/api';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MarkPaymentModal({ distribution, investor, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    utr: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.transactionId && !formData.utr) {
      toast.error('Please provide either Transaction ID or UTR');
      return;
    }

    setLoading(true);
    try {
      await adminDistributionAPI.markInvestorPaid(
        distribution._id,
        investor.investor?._id || investor.investor,
        {
          transactionId: formData.transactionId || undefined,
          utr: formData.utr || undefined,
          paymentDate: formData.paymentDate || new Date()
        }
      );
      toast.success('Investor marked as paid successfully! Email notification sent.');
      onSuccess();
    } catch (error) {
      console.error('Error marking investor as paid:', error);
      toast.error(error.message || 'Failed to mark investor as paid');
    } finally {
      setLoading(false);
    }
  };

  const investorName = `${investor.investor?.firstName || ''} ${investor.investor?.lastName || ''}`.trim();
  const netAmount = investor.netAmount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Mark Investor as Paid</h3>
            <p className="text-sm text-gray-500 mt-1">{investorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Amount</span>
              <span className="text-xl font-bold text-green-600">
                ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID
            </label>
            <input
              type="text"
              className="input"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="Enter transaction ID"
            />
            <p className="text-xs text-gray-500 mt-1">Optional if UTR is provided</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UTR (Unique Transaction Reference)
            </label>
            <input
              type="text"
              className="input"
              value={formData.utr}
              onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
              placeholder="Enter UTR"
            />
            <p className="text-xs text-gray-500 mt-1">Optional if Transaction ID is provided</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="input"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> An email notification will be sent to the investor confirming the payment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <FaCheckCircle />
              <span>{loading ? 'Processing...' : 'Mark as Paid'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

