import { useState, useRef } from 'react';
import { adminDistributionAPI } from '../../lib/api';
import { FaTimes, FaUpload, FaFileCsv, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function BulkPaymentUploadModal({ distribution, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    
    // Preview CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file appears to be empty or invalid');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header.toLowerCase()] = values[index] || '';
        });
        return row;
      });

      setPreviewData({ headers, rows: rows.slice(0, 5) }); // Preview first 5 rows
    };
    reader.readAsText(selectedFile);
  };

  const downloadTemplate = () => {
    // Generate template CSV
    const headers = [
      'Investor Email',
      'Transaction ID',
      'UTR',
      'Payment Date'
    ];

    const rows = distribution.investorDistributions.map(inv => {
      const investor = inv.investor;
      return [
        investor?.email || '',
        '',
        '',
        new Date().toISOString().split('T')[0]
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_template_${distribution.distributionNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template CSV downloaded!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setLoading(true);
    try {
      // Parse and send CSV data
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
        
        const payments = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Find investor by email
          const investor = distribution.investorDistributions.find(
            inv => inv.investor?.email?.toLowerCase() === row['investor email']?.toLowerCase()
          );

          if (investor && (row['transaction id'] || row['utr'])) {
            payments.push({
              investorId: investor.investor?._id || investor.investor,
              transactionId: row['transaction id'] || undefined,
              utr: row['utr'] || undefined,
              paymentDate: row['payment date'] || new Date().toISOString().split('T')[0]
            });
          }
        }

        if (payments.length === 0) {
          toast.error('No valid payments found in CSV. Please check the format.');
          setLoading(false);
          return;
        }

        // Process payments sequentially
        let successCount = 0;
        let failCount = 0;

        for (const payment of payments) {
          try {
            await adminDistributionAPI.markInvestorPaid(
              distribution._id,
              payment.investorId,
              {
                transactionId: payment.transactionId,
                utr: payment.utr,
                paymentDate: payment.paymentDate
              }
            );
            successCount++;
          } catch (error) {
            console.error('Error processing payment:', error);
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully processed ${successCount} payment(s)!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
          onSuccess();
        } else {
          toast.error('Failed to process any payments. Please check the CSV format.');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading payments:', error);
      toast.error('Failed to process payment file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Bulk Payment Upload</h3>
            <p className="text-sm text-gray-500 mt-1">Upload CSV file with payment confirmations</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Download Template</h4>
                <p className="text-xs text-blue-700">Get a pre-filled CSV template with all investors</p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="btn btn-sm btn-primary flex items-center space-x-2"
              >
                <FaDownload />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!file && (
                <div>
                  <FaFileCsv className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to select CSV file</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    Select File
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Required columns: Investor Email, Transaction ID, UTR, Payment Date
                  </p>
                </div>
              )}
              {file && (
                <div>
                  <FaFileCsv className="text-green-500 text-4xl mx-auto mb-4" />
                  <p className="font-medium text-gray-900 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewData(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewData && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Preview (First 5 rows)</h4>
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      {previewData.headers.map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {previewData.headers.map((header, colIdx) => (
                          <td key={colIdx}>{row[header.toLowerCase()] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              <strong>CSV Format Requirements:</strong>
              <br />• First row must contain headers: Investor Email, Transaction ID, UTR, Payment Date
              <br />• Each subsequent row should contain payment information for one investor
              <br />• At least Transaction ID or UTR must be provided for each payment
              <br />• Payment Date should be in YYYY-MM-DD format (defaults to today if not provided)
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
              disabled={loading || !file}
            >
              <FaUpload />
              <span>{loading ? 'Processing...' : 'Upload and Process'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

