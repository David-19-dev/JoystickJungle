import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Calendar, Clock, User, Check, X, 
  Truck, Filter, Search, RefreshCw, ArrowLeft, AlertCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_reference: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string | null;
  user_email?: string;
  items_count?: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string | null;
    category: string;
  };
}

const AdminOrders = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  useEffect(() => {
    // Filter orders based on status and search query
    let filtered = orders;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.user_email?.toLowerCase().includes(query) ||
        order.payment_reference?.toLowerCase().includes(query) ||
        order.shipping_address?.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch orders with user emails
      const { data, error } = await supabase
        .rpc('get_orders_with_user_info')
        .order('created_at', { ascending: false });
      
      if (error) {
        // If the RPC function doesn't exist, fall back to a regular query
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          throw ordersError;
        }
        
        if (ordersData) {
          // Transform the data to include user_email
          const transformedOrders = ordersData.map(order => ({
            ...order,
            user_email: order.profiles?.email || 'Unknown'
          }));
          
          // For each order, fetch the count of items
          const ordersWithItemCount = await Promise.all(
            transformedOrders.map(async (order) => {
              const { count, error: countError } = await supabase
                .from('order_items')
                .select('id', { count: 'exact', head: true })
                .eq('order_id', order.id);
              
              return {
                ...order,
                items_count: count || 0
              };
            })
          );
          
          setOrders(ordersWithItemCount);
        }
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Une erreur est survenue lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          price,
          product:products (
            name,
            image_url,
            category
          )
        `)
        .eq('order_id', orderId);
      
      if (error) {
        throw error;
      }
      
      setOrderItems(data || []);
    } catch (err) {
      console.error('Error fetching order items:', err);
      setError('Une erreur est survenue lors du chargement des détails de la commande');
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setProcessingId(orderId);
      setError(null);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() } 
            : order
        )
      );
      
      // Update selected order if in modal
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      setSuccessMessage(`Statut de la commande mis à jour: ${newStatus}`);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (err) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">En attente</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">En traitement</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Complétée</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Annulée</span>;
      default:
        return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{status}</span>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900 text-red-200 p-8 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-red-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
            <p className="mb-4">Vous n'avez pas les droits d'accès à cette page.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des commandes</h1>
            <p className="text-gray-400">
              Consultez et gérez les commandes des clients
            </p>
          </div>
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-6 flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Toutes
              </button>
              
              <button
                onClick={() => setStatusFilter('pending')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                En attente
              </button>
              
              <button
                onClick={() => setStatusFilter('processing')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  statusFilter === 'processing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                En traitement
              </button>
              
              <button
                onClick={() => setStatusFilter('completed')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  statusFilter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Complétées
              </button>
              
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Annulées
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-400">
              Aucune commande ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </button>
          </div>
        ) : ( <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Commande
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingBag className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-300">#{order.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.user_email || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-400">{formatPrice(order.total_amount)}</div>
                      <div className="text-xs text-gray-400">{order.items_count || '?'} article(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                            className="text-blue-400 hover:text-blue-300"
                            title="Marquer en traitement"
                            disabled={processingId === order.id}
                          >
                            {processingId === order.id ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <Truck className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="text-green-400 hover:text-green-300"
                            title="Marquer comme complétée"
                            disabled={processingId === order.id}
                          >
                            {processingId === order.id ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <Check className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300"
                            title="Annuler la commande"
                            disabled={processingId === order.id}
                          >
                            {processingId === order.id ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <X className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Commande #{selectedOrder.id.substring(0, 8)}
                  </h2>
                  <p className="text-gray-400">
                    Passée le {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Informations client</h3>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email:</span> {selectedOrder.user_email || 'Unknown'}
                  </p>
                  {selectedOrder.shipping_address && (
                    <p className="text-gray-300 mt-2">
                      <span className="text-gray-400">Adresse de livraison:</span> {selectedOrder.shipping_address}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Détails de la commande</h3>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Statut:</span> {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p className="text-gray-300 mt-2">
                    <span className="text-gray-400">Méthode de paiement:</span> {
                      selectedOrder.payment_method === 'wave' ? 'Wave Mobile Money' : 
                      selectedOrder.payment_method === 'cash' ? 'Paiement à la livraison' : 
                      selectedOrder.payment_method
                    }
                  </p>
                  {selectedOrder.payment_reference && (
                    <p className="text-gray-300 mt-2">
                      <span className="text-gray-400">Référence de paiement:</span> {selectedOrder.payment_reference}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Articles</h3>
                <div className="bg-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Produit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Prix unitaire
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Quantité
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-lg overflow-hidden">
                                {item.product.image_url ? (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    className="h-10 w-10 object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{item.product.name}</div>
                                <div className="text-sm text-gray-400">{item.product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{formatPrice(item.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{item.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-purple-400">{formatPrice(item.price * item.quantity)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-800">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-medium text-white">
                          Total
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-purple-400">
                          {formatPrice(selectedOrder.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-400">
                  {selectedOrder.updated_at && (
                    <p>Dernière mise à jour: {formatDate(selectedOrder.updated_at)}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'processing');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      disabled={processingId === selectedOrder.id}
                    >
                      {processingId === selectedOrder.id ? (
                        <>
                          <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Truck className="h-5 w-5 mr-2" />
                          Marquer en traitement
                        </>
                      )}
                    </button>
                  )}
                  
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'completed');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      disabled={processingId === selectedOrder.id}
                    >
                      {processingId === selectedOrder.id ? (
                        <>
                          <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Marquer comme complétée
                        </>
                      )}
                    </button>
                  )}
                  
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'cancelled');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      disabled={processingId === selectedOrder.id}
                    >
                      {processingId === selectedOrder.id ? (
                        <>
                          <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 mr-2" />
                          Annuler la commande
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;