import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle, AlertCircle, FileText, Shield, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface SecureDownloadModalProps {
  product: {
    id: string;
    name: string;
    description?: string;
    file_url: string;
    price?: number;
  };
  onClose: () => void;
}

export default function SecureDownloadModal({ product, onClose }: SecureDownloadModalProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkPurchaseAccess();
  }, []);

  const checkPurchaseAccess = async () => {
    if (!user) {
      setError('You must be logged in to download products');
      setCheckingAccess(false);
      return;
    }

    try {
      // If the product is free, grant access immediately
      if (product.price === 0) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }

      // Check if user has purchased this product
      const { data: purchases, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id);

      if (purchaseError) {
        console.error('Error checking purchases:', purchaseError);
        setError('Failed to verify purchase. Please try again.');
        setCheckingAccess(false);
        return;
      }

      if (!purchases || purchases.length === 0) {
        setError('You have not purchased this product');
        setCheckingAccess(false);
        return;
      }

      // If we have a purchase record, check if any associated transaction is confirmed
      let hasConfirmedTransaction = false;

      for (const purchase of purchases) {
        if (purchase.transaction_id) {
          const { data: transaction, error: txError } = await supabase
            .from('crypto_transactions')
            .select('status')
            .eq('id', purchase.transaction_id)
            .single();

          if (!txError && transaction && transaction.status === 'confirmed') {
            hasConfirmedTransaction = true;
            break;
          }
        } else {
          // If there's no transaction_id, it might be a direct purchase
          hasConfirmedTransaction = true;
          break;
        }
      }

      if (!hasConfirmedTransaction) {
        setError('Payment is still pending or failed. Please complete your purchase first.');
        setCheckingAccess(false);
        return;
      }

      setHasAccess(true);
      setCheckingAccess(false);
    } catch (err) {
      console.error('Error checking purchase access:', err);
      setError('Failed to verify purchase. Please try again.');
      setCheckingAccess(false);
    }
  };

  const generateSecureDownloadLink = async () => {
    if (!hasAccess || !product.file_url) {
      setError('Download not available');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Extract the file path from the URL
      const urlParts = product.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = urlParts.slice(-2).join('/'); // Get user_id/filename

      // Generate a signed URL for secure download (expires in 1 hour)
      const { data, error } = await supabase.storage
        .from('product-files')
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error('Error generating download link:', error);
        setError('Failed to generate download link. Please try again.');
        return;
      }

      setDownloadUrl(data.signedUrl);

      // Automatically start download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = product.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error generating download link:', err);
      setError('Failed to generate download link. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Secure Download</h2>
              <p className="text-sm text-gray-600">Your digital product is ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
            </div>
            {product.description && (
              <p className="text-sm text-gray-600">{product.description}</p>
            )}
            {product.price !== undefined && (
              <p className="text-sm text-gray-500 mt-2">
                {product.price === 0 ? 'Free Product' : `Purchased for $${product.price.toFixed(2)}`}
              </p>
            )}
          </div>

          {/* Access Check Loading */}
          {checkingAccess && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600">Verifying purchase...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 border rounded-lg flex items-start gap-3 bg-red-50 border-red-200">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-medium text-sm text-red-800">Access Denied</p>
                <p className="text-sm mt-1 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Access Granted */}
          {hasAccess && !error && (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-green-800 font-medium text-sm">
                    {product.price === 0 ? 'Free Download Available' : 'Purchase Verified'}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    {product.price === 0 
                      ? 'This is a free product. You can download it immediately.'
                      : 'Your payment has been confirmed. You can now download your digital product.'
                    }
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={generateSecureDownloadLink}
                disabled={isDownloading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Download...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Now
                  </>
                )}
              </button>

              {/* Download URL Display */}
              {downloadUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-900">Secure Download Link Generated</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">
                    Your download has started automatically. If it didn't start, click the button above.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock size={12} />
                    <span>Link expires in 1 hour for security</span>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Security & Usage</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Download links are generated securely and expire after 1 hour</li>
                  <li>• Your purchase is permanently recorded in your account</li>
                  <li>• You can re-download anytime from your purchase history</li>
                  <li>• Files are protected against unauthorized access</li>
                </ul>
              </div>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}