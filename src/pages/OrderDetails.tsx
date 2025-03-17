import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, CreditCard, MapPin, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_reference: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string | null;
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

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchOrderDetails(id);
    }
  }, [id, user]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();
      
      if (orderError) {
        throw orderError;
      }
      
      if (orderData) {
        setOrder(orderData);
        
        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
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
        
        if (itemsError) {
          throw itemsError;
        }
        
        if (itemsData) {
          setOrderItems(itemsData);
        }
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Une erreur est survenue lors du chargement des détails de la commande');
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
        return <span className="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm">En attente</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">En traitement</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">Complétée</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-sm">Annulée</span>;
      default:
        return <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Commande non trouvée</h2>
            <p className="text-gray-400 mb-6">
              La commande que vous recherchez n'existe pas ou vous n'êtes pas autorisé à y accéder.
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à mes commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes commandes
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Commande #{order.id.substring(0, 8)}
              </h1>
              <p className="text-gray-400">
                Passée le {formatDate(order.created_at)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Détails de la commande</h2>
              </div>
              
              <div className="divide-y divide-gray-700">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white">{item.product.name}</h3>
                          <p className="text-gray-400 text-sm">{item.product.category}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-gray-300">
                          Quantité: {item.quantity}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-purple-400 font-bold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatPrice(item.price)} / unité
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-purple-400 text-xl">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Informations de paiement</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-purple-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-white font-medium">Méthode de paiement</p>
                    <p className="text-gray-300">
                      {order.payment_method === 'wave' ? 'Wave Mobile Money' : 
                       order.payment_method === 'cash' ? 'Paiement à la livraison' : 
                       order.payment_method}
                    </p>
                  </div>
                </div>
                
                {order.payment_reference && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-purple-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-white font-medium">Référence de paiement</p>
                      <p className="text-gray-300">{order.payment_reference}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {order.shipping_address && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Livraison</h2>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-purple-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-white font-medium">Adresse de livraison</p>
                    <p className="text-gray-300">{order.shipping_address}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start">
                  <Truck className="h-5 w-5 text-purple-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-white font-medium">Statut de livraison</p>
                    <p className="text-gray-300">
                      {order.status === 'pending' ? 'En attente de préparation' :
                       order.status === 'processing' ? 'En cours de préparation' :
                       order.status === 'completed' ? 'Livré' :
                       order.status === 'cancelled' ? 'Annulé' :
                       'Statut inconnu'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;