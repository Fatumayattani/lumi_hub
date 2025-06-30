import React, { useState } from 'react';
import { X, Wallet, ShoppingBag } from 'lucide-react';
import AlgorandPaymentModal from './AlgorandPaymentModal';
import SecureDownloadModal from './SecureDownloadModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  file_url: string;
}

interface ProductPurchaseModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductPurchaseModal({ product, onClose, onSuccess }: ProductPurchaseModalProps) {
  const [showAlgorandModal, setShowAlgorandModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleAlgorandPayment = () => {
    setShowAlgorandModal(true);
  };

  const handleAlgorandSuccess = () => {
    setShowAlgorandModal(false);
    setShowDownloadModal(true);
  };

  const handleDownloadComplete = () => {
    setShowDownloadModal(false);
    onSuccess();
  };

  if (showDownloadModal) {
    return (
      <SecureDownloadModal
        product={product}
        onClose={handleDownloadComplete}
      />
    );
  }

  if (showAlgorandModal) {
    return (
      <AlgorandPaymentModal
        product={product}
        onClose={() => setShowAlgorandModal(false)}
        onSuccess={handleAlgorandSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Purchase Product</h2>
              <p className="text-sm text-gray-600">Pay securely with Algorand</p>
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
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={product.image_url || 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Free Download */}
          {product.price === 0 ? (
            <button
              onClick={() => setShowDownloadModal(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Download Free Product
            </button>
          ) : (
            <>
              {/* Algorand Payment Method */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Payment Method</h3>
                
                {/* Algorand Payment */}
                <button
                  onClick={handleAlgorandPayment}
                  className="w-full p-4 border-2 border-blue-300 bg-blue-50 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wallet size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Algorand (ALGO)</div>
                    <div className="text-sm text-gray-600">Fast, secure, and eco-friendly blockchain payment</div>
                    <div className="text-xs text-blue-600 mt-1">≈ {(product.price * 0.15).toFixed(6)} ALGO</div>
                  </div>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Available
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-medium text-green-900">Secure Algorand Payment</span>
            </div>
            <p className="text-sm text-green-700">
              All payments are processed on the Algorand blockchain with industry-leading security. 
              After successful payment, you'll get immediate access to download your digital product.
            </p>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPurchaseModal;