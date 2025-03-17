import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Package, Clock, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  items_count: number;
}

const OrderHistory = () => {
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
    try {
      setLoading(true);
      setError(null);
      
      // Fetch orders with count of items
      const { data, error } = await supabase
        .rpc('get_orders_with_item_count', { user_id_param: user?.id })
        .order('created_at', { ascending: false });
      
      if (error) {
        // If the RPC function doesn't exist, fall back to a regular query
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          throw ordersError;
        }
        
        if (ordersData) {
          // For each order, fetch the count of items
          const ordersWithItemCount = await Promise.all(
            ordersData.map(async (order) => {
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
      setError('Une erreur est survenue lors du chargement de vos commandes');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Historique des commandes</h1>
          <p className="text-gray-300">
            Consultez l'historique de vos commandes et leur statut
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune commande</h3>
            <p className="text-gray-400 mb-6">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Package className="h-5 w-5 mr-2" />
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-purple-400 mr-2" />
                        <span className="text-gray-300">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">Commande #{order.id.substring(0, 8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <p className="text-purple-400 font-bold text-xl">{formatPrice(order.total_amount)}</p>
                      <p className="text-gray-400 text-sm text-right">
                        {order.items_count} article{order.items_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-700">
                    <div className="flex items-center text-gray-300 mb-4 sm:mb-0">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>
                        {order.status === 'pending' ? 'En attente de traitement' :
                         order.status === 'processing' ? 'En cours de préparation' :
                         order.status === 'completed' ? 'Commande livrée' :
                         order.status === 'cancelled' ? 'Commande annulée' :
                         'Statut inconnu'}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center text-purple-400 hover:text-purple-300"
                    >
                      Voir les détails
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;