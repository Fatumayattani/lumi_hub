import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, Wallet, Copy, ExternalLink, Smartphone } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet';
import * as algosdk from 'algosdk';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface AlgorandPaymentModalProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const walletInfo = {
  pera: {
    name: 'Pera Wallet',
    description: 'Most popular Algorand wallet',
    color: 'blue',
    downloadUrl: 'https://perawallet.app/',
    mobileDeepLink: 'pera-wallet://',
  },
  defly: {
    name: 'Defly Wallet',
    description: 'DeFi-focused Algorand wallet',
    color: 'purple',
    downloadUrl: 'https://defly.app/',
    mobileDeepLink: 'defly://',
  },
  exodus: {
    name: 'Exodus Wallet',
    description: 'Multi-chain wallet with Algorand support',
    color: 'indigo',
    downloadUrl: 'https://www.exodus.com/',
    mobileDeepLink: 'exodus://',
  },
  kibisis: {
    name: 'Kibisis Wallet',
    description: 'Privacy-focused Algorand wallet',
    color: 'green',
    downloadUrl: 'https://kibis.is/',
    mobileDeepLink: 'kibisis://',
  },
};

export default function AlgorandPaymentModal({ product, onClose, onSuccess }: AlgorandPaymentModalProps) {
  const { user } = useAuth();
  const { providers, activeAccount, signTransactions, sendTransactions } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentAddress] = useState('LUMIHUB7XQJKL3M2N4P5R6S8T9U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P');
  const [algoAmount, setAlgoAmount] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate ALGO amount (simplified conversion rate for demo)
  useEffect(() => {
    // In production, you'd fetch real-time ALGO/USD rate from an API
    const usdToAlgoRate = 0.15; // Example: 1 USD = 0.15 ALGO
    setAlgoAmount(product.price * usdToAlgoRate);
  }, [product.price]);

  const connectWallet = async (providerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = providers?.find(p => p.metadata.id === providerId);
      if (!provider) {
        // If wallet not found, try to open the wallet app or download page
        const wallet = walletInfo[providerId as keyof typeof walletInfo];
        if (wallet) {
          if (isMobile) {
            // Try to open the mobile app first
            const deepLinkAttempt = window.open(wallet.mobileDeepLink, '_blank');
            
            // If deep link fails, redirect to download page after a short delay
            setTimeout(() => {
              if (!deepLinkAttempt || deepLinkAttempt.closed) {
                window.open(wallet.downloadUrl, '_blank');
              }
            }, 1000);
          } else {
            // On desktop, open download page
            window.open(wallet.downloadUrl, '_blank');
          }
          
          setError(`${wallet.name} not detected. Please install the wallet and try again.`);
        } else {
          setError('Wallet provider not found');
        }
        return;
      }

      await provider.connect();
      setWalletConnected(true);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please make sure your wallet is installed and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (providers) {
        for (const provider of providers) {
          if (provider.isConnected) {
            await provider.disconnect();
          }
        }
      }
      setWalletConnected(false);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
    }
  };

  const makePayment = async () => {
    if (!activeAccount || !user) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create Algorand client
      const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
      
      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
      const amountInMicroAlgos = Math.round(algoAmount * 1000000);
      
      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAccount.address,
        to: paymentAddress,
        amount: amountInMicroAlgos,
        note: new Uint8Array(Buffer.from(`Payment for ${product.name} - Product ID: ${product.id}`)),
        suggestedParams,
      });

      // Sign transaction
      const encodedTxns = [algosdk.encodeUnsignedTransaction(paymentTxn)];
      const signedTxns = await signTransactions(encodedTxns);

      // Send transaction
      const { txId } = await sendTransactions(signedTxns);
      setTransactionId(txId);

      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      // Record the transaction in our database
      await recordSuccessfulPayment(txId);

      setPaymentCompleted(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const recordSuccessfulPayment = async (txId: string) => {
    if (!user) return;

    try {
      // Get the current product to check download count
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('download_count')
        .eq('id', product.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('crypto_transactions')
        .insert([
          {
            product_id: product.id,
            user_id: user.id,
            amount: product.price,
            crypto_amount: algoAmount.toFixed(6),
            currency: 'ALGO',
            status: 'confirmed',
            gateway_payment_id: `algo_${txId}`,
            transaction_hash: txId,
            completed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            transaction_id: transaction.id,
            purchase_type: 'crypto',
            amount_paid: product.price
          }
        ]);

      if (purchaseError) {
        throw purchaseError;
      }

      // Update product download count
      const newDownloadCount = (currentProduct.download_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('products')
        .update({ download_count: newDownloadCount })
        .eq('id', product.id);

      if (updateError) {
        console.error('Failed to update download count:', updateError);
      }

    } catch (err) {
      console.error('Failed to record payment:', err);
      // Don't throw error here as the payment was successful
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClose = () => {
    if (walletConnected) {
      disconnectWallet();
    }
    setError(null);
    setPaymentCompleted(false);
    onClose();
  };

  const getWalletButtonStyle = (walletId: string) => {
    const wallet = walletInfo[walletId as keyof typeof walletInfo];
    const colorMap = {
      blue: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50',
      purple: 'border-purple-300 hover:border-purple-400 hover:bg-purple-50',
      indigo: 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50',
      green: 'border-green-300 hover:border-green-400 hover:bg-green-50',
    };
    return colorMap[wallet?.color as keyof typeof colorMap] || 'border-gray-300 hover:border-gray-400 hover:bg-gray-50';
  };

  const getWalletIconStyle = (walletId: string) => {
    const wallet = walletInfo[walletId as keyof typeof walletInfo];
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      green: 'bg-green-100 text-green-600',
    };
    return colorMap[wallet?.color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Algorand Payment</h2>
            <p className="text-sm text-gray-600">Pay securely with ALGO</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            )}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">≈ {algoAmount.toFixed(6)} ALGO</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Algorand Testnet</p>
                <p className="text-xs text-gray-500">Fast & Secure</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 border rounded-lg flex items-start gap-3 bg-red-50 border-red-200">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-medium text-sm text-red-800">Connection Error</p>
                <p className="text-sm mt-1 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {paymentCompleted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-green-800 font-medium text-sm">Payment Successful!</p>
                <p className="text-green-700 text-sm mt-1">
                  Your purchase has been completed. You can now download your product.
                </p>
                {transactionId && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600">Transaction ID:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-green-100 px-2 py-1 rounded">
                        {transactionId.slice(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(transactionId)}
                        className="p-1 hover:bg-green-100 rounded"
                        title="Copy transaction ID"
                      >
                        <Copy size={12} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => window.open(`https://testnet.algoexplorer.io/tx/${transactionId}`, '_blank')}
                        className="p-1 hover:bg-green-100 rounded"
                        title="View on AlgoExplorer"
                      >
                        <ExternalLink size={12} className="text-green-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          {!walletConnected && !paymentCompleted && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Connect Your Algorand Wallet</h3>
                {isMobile && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Smartphone size={12} />
                    <span>Mobile detected</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(walletInfo).map(([walletId, wallet]) => (
                  <button
                    key={walletId}
                    onClick={() => connectWallet(walletId)}
                    disabled={isLoading}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 disabled:opacity-50 ${getWalletButtonStyle(walletId)}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getWalletIconStyle(walletId)}`}>
                      <Wallet size={20} />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{wallet.name}</div>
                      <div className="text-xs text-gray-600">{wallet.description}</div>
                      {isMobile && (
                        <div className="text-xs text-blue-600 mt-1">Tap to open app</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Wallet Installation Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-900">Don't have a wallet?</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  {isMobile 
                    ? 'Download any of these wallets from your app store, then return here to connect.'
                    : 'Install a browser extension or mobile app for any of these wallets.'
                  }
                </p>
                <div className="text-xs text-blue-600">
                  Recommended: Pera Wallet (most popular) or Defly Wallet (DeFi features)
                </div>
              </div>
            </div>
          )}

          {/* Connected Wallet Info */}
          {walletConnected && activeAccount && !paymentCompleted && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-green-900">Wallet Connected</span>
                </div>
                <div className="text-sm text-green-700">
                  <p className="font-mono break-all">{activeAccount.address}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-mono">{algoAmount.toFixed(6)} ALGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>USD Value:</span>
                    <span>${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>Algorand Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span>~0.001 ALGO</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={makePayment}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    Pay {algoAmount.toFixed(6)} ALGO
                  </>
                )}
              </button>

              {/* Disconnect Wallet */}
              <button
                onClick={disconnectWallet}
                className="w-full text-gray-600 hover:text-gray-800 text-sm py-2"
              >
                Disconnect Wallet
              </button>
            </div>
          )}

          {/* Success Actions */}
          {paymentCompleted && (
            <button
              onClick={onSuccess}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue to Download
            </button>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔒</span>
              </div>
              <span className="font-medium text-blue-900">Secure Algorand Payment</span>
            </div>
            <p className="text-sm text-blue-700">
              Payments are processed on the Algorand blockchain. Your transaction is secure, fast (under 5 seconds), and has minimal fees.
            </p>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Connect your Algorand wallet (will open wallet app on mobile)</li>
              <li>Review payment details and confirm transaction</li>
              <li>Your wallet will prompt you to sign the transaction</li>
              <li>After blockchain confirmation, download your digital product</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}