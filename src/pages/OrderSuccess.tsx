import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home, Package, Clock, Calendar, ArrowRight } from 'lucide-react';
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
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string | null;
  };
}

const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>();
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
              image_url
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
            <h2 className="text-2xl font-bold text-white mb-4">Commande non trouvée</h2>
            <p className="text-gray-400 mb-6">
              La commande que vous recherchez n'existe pas ou vous n'êtes pas autorisé à y accéder.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-600 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Commande Confirmée !
          </h1>
          
          <p className="text-gray-300 mb-6">
            Merci pour votre commande. Votre commande a été enregistrée avec succès.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Numéro de commande</p>
                <p className="text-white font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Statut</p>
                <p className="text-green-400 font-medium">
                  {order.status === 'pending' ? 'En attente' : 
                   order.status === 'processing' ? 'En traitement' : 
                   order.status === 'completed' ? 'Complétée' : 
                   order.status === 'cancelled' ? 'Annulée' : 
                   order.status}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Méthode de paiement</p>
                <p className="text-white font-medium">
                  {order.payment_method === 'wave' ? 'Wave Mobile Money' : 
                   order.payment_method === 'cash' ? 'Paiement à la livraison' : 
                   order.payment_method}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 text-left">Récapitulatif</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center bg-gray-700 rounded-lg p-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-white font-medium">{item.product.name}</p>
                    <p className="text-gray-400 text-sm">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-purple-400 font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center bg-gray-700 rounded-lg p-4">
              <span className="text-white font-bold">Total</span>
              <span className="text-purple-400 text-xl font-bold">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-purple-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-white font-medium">Prochaines étapes</h3>
                <p className="text-gray-300 text-sm">
                  {order.payment_method === 'wave' 
                    ? 'Votre commande sera traitée dès confirmation du paiement Wave.' 
                    : 'Votre commande sera préparée et vous serez contacté pour la livraison.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à la boutique
            </Link>
            
            <Link
              to="/orders"
              className="flex items-center justify-center px-6 py-3 border border-purple-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Voir mes commandes
            </Link>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Des questions sur votre commande ?{' '}
            <Link to="/contact" className="text-purple-400 hover:text-purple-300">
              Contactez-nous <ArrowRight className="h-4 w-4 inline-block" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;