import { useState, useEffect } from 'react';
import { bankPaymentAPI } from '../../lib/api';
import { FaTimes, FaDownload, FaSpinner, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TransactionHistoryModal({ investor, onClose }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (investor?._id || investor) {
      fetchTransactionHistory();
    }
  }, [investor]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      const investorId = investor._id || investor;
      const response = await bankPaymentAPI.getPaymentHistory(investorId);
      setTransactions(response.data.transactions || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      // Silently handle transaction history errors
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const downloadHistoryCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to download');
      return;
    }

    const headers = [
      'Date',
      'Type',
      'Amount',
      'Status',
      'Reference',
      'Project/SPV',
      'Description'
    ];

    const rows = transactions.map(txn => [
      new Date(txn.date).toLocaleDateString('en-IN'),
      txn.type,
      txn.amount.toFixed(2),
      txn.status,
      txn.reference || '',
      txn.project || '',
      txn.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaction_history_${investor?.email || 'investor'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Transaction history downloaded!');
  };

  const investorName = investor?.firstName && investor?.lastName
    ? `${investor.firstName} ${investor.lastName}`
    : investor?.email || 'Investor';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Transaction History</h3>
            <p className="text-sm text-gray-600 mt-1">{investorName}</p>
            {investor?.email && (
              <p className="text-xs text-gray-500 mt-1">{investor.email}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadHistoryCSV}
              className="btn btn-sm btn-secondary flex items-center space-x-2"
              disabled={transactions.length === 0}
            >
              <FaDownload />
              <span>Download CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalInvestments}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Distributions</p>
                <p className="text-2xl font-bold text-purple-600">{summary.totalDistributions}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-red-600">₹{summary.totalInvested?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-green-600">₹{summary.totalReceived?.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No transaction history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 sticky top-0">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project/SPV</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(txn.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          txn.type === 'investment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {txn.type === 'investment' ? (
                            <>
                              <FaArrowDown className="text-xs" />
                              <span>Investment</span>
                            </>
                          ) : (
                            <>
                              <FaArrowUp className="text-xs" />
                              <span>Distribution</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {txn.project || '-'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        txn.type === 'investment' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {txn.type === 'investment' ? '-' : '+'}₹{txn.amount?.toLocaleString('en-IN', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }) || '0.00'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${
                          txn.status === 'completed' || txn.status === 'captured' 
                            ? 'badge-success' 
                            : txn.status === 'failed'
                            ? 'badge-danger'
                            : 'badge-gray'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-gray-600">
                          {txn.reference || txn.utr || txn.transactionId || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {txn.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

