import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, MapPin, Smartphone, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, checkout } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'wave'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty or user is not logged in
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Create shipping address string
      const shippingAddress = formData.address && formData.city
        ? `${formData.address}, ${formData.city}`
        : null;
      
      // Process checkout
      const result = await checkout(formData.paymentMethod, shippingAddress);
      
      if (result.success && result.orderId) {
        // If payment method is Wave, redirect to payment page
        if (formData.paymentMethod === 'wave') {
          navigate(`/payment?amount=${getCartTotal()}&name=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}&phone=${encodeURIComponent(formData.phone)}&description=${encodeURIComponent('Commande Joystick Jungle')}`);
        } else {
          // Otherwise, go to order success page
          navigate(`/order-success/${result.orderId}`);
        }
      } else {
        setError(result.error || 'Une erreur est survenue lors du traitement de votre commande');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Une erreur est survenue lors du traitement de votre commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Finaliser votre commande</h1>
          <p className="text-xl text-gray-300">
            Complétez vos informations pour finaliser votre achat
          </p>
        </motion.div>

        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au panier
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Informations de livraison (optionnel)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-gray-300 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-gray-300 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Mode de paiement
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wave"
                      checked={formData.paymentMethod === 'wave'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <div className="ml-3">
                      <span className="block text-white font-medium">Wave Mobile Money</span>
                      <span className="block text-gray-400 text-sm">Paiement mobile rapide et sécurisé</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <div className="ml-3">
                      <span className="block text-white font-medium">Paiement à la livraison</span>
                      <span className="block text-gray-400 text-sm">Payez en espèces à la réception</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    {formData.paymentMethod === 'wave' ? (
                      <>
                        <Smartphone className="h-5 w-5 mr-2" />
                        Payer avec Wave
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Confirmer la commande
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Articles ({cart.length})</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-gray-300">
                          {item.name} <span className="text-gray-500">x{item.quantity}</span>
                        </p>
                      </div>
                      <p className="text-gray-300 ml-4">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-purple-400 text-xl">{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;