import React, { useState, useEffect } from 'react';
import { Package, Download, Clock, CheckCircle, AlertCircle, ExternalLink, Calendar, DollarSign, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  transaction_id: string;
  purchase_type: string;
  amount_paid: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    image_url: string;
    file_url: string;
  };
  transaction: {
    id: string;
    status: string;
    crypto_amount: string;
    currency: string;
    transaction_hash: string;
    completed_at: string;
  } | null;
  customer_email?: string;
}

interface OrdersTabProps {
  // No props needed for now
}

function OrdersTab({}: OrdersTabProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch orders for products owned by the current user
      const { data, error: fetchError } = await supabase
        .from('user_purchases')
        .select(`
          *,
          product:products!inner (
            id,
            name,
            image_url,
            file_url,
            user_id
          ),
          transaction:crypto_transactions (
            id,
            status,
            crypto_amount,
            currency,
            transaction_hash,
            completed_at
          )
        `)
        .eq('product.user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching orders:', fetchError);
        setError('Failed to load orders. Please try again.');
        return;
      }

      // Fetch customer email for each order
      const ordersWithCustomerInfo = await Promise.all(
        (data || []).map(async (order) => {
          try {
            // Get customer email from auth.users using the service role
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', order.user_id)
              .single();

            // If profiles table doesn't exist, we'll just use the user_id
            const customerEmail = userData?.email || `User ${order.user_id.slice(0, 8)}...`;

            return {
              ...order,
              customer_email: customerEmail
            };
          } catch (error) {
            console.error('Error fetching customer info:', error);
            return {
              ...order,
              customer_email: `User ${order.user_id.slice(0, 8)}...`
            };
          }
        })
      );

      setOrders(ordersWithCustomerInfo);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDownloadLink = async (fileUrl: string, productName: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = urlParts.slice(-2).join('/'); // Get user_id/filename

      // Generate a signed URL for download
      const { data, error } = await supabase.storage
        .from('product-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error generating download link:', error);
        alert('Failed to generate download link. Please try again.');
        return;
      }

      // Open the download link in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error generating download link:', error);
      alert('Failed to generate download link. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            <AlertCircle size={12} />
            Failed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            <AlertCircle size={12} />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            <Clock size={12} />
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
          <p className="text-gray-600 mt-1">Track orders for your digital products</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Download size={16} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">
            When customers purchase your products, their orders will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Order Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.product.image_url || 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'}
                          alt={order.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{order.product.name}</p>
                          <p className="text-sm text-gray-500">ID: {order.product.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-900">{order.customer_email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            ${order.amount_paid.toFixed(2)}
                          </span>
                        </div>
                        {order.transaction?.crypto_amount && (
                          <p className="text-xs text-gray-500">
                            {order.transaction.crypto_amount} {order.transaction.currency}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(order.transaction?.status || 'unknown')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar size={14} />
                        <span className="text-sm">{formatDate(order.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {order.transaction?.status === 'confirmed' && order.product.file_url && (
                          <button
                            onClick={() => generateDownloadLink(order.product.file_url, order.product.name)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Generate download link for customer"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        {order.transaction?.transaction_hash && (
                          <button
                            onClick={() => {
                              // In a real app, this would link to a blockchain explorer
                              alert(`Transaction Hash: ${order.transaction?.transaction_hash}`);
                            }}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View transaction details"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(order => order.transaction?.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  ${orders
                    .filter(order => order.transaction?.status === 'confirmed')
                    .reduce((sum, order) => sum + order.amount_paid, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersTab;