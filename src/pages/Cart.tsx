import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash, Plus, Minus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

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
          <h1 className="text-4xl font-bold text-white mb-4">Votre Panier</h1>
          <p className="text-xl text-gray-300">
            Vérifiez vos articles avant de passer à la caisse
          </p>
        </motion.div>

        {cart.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Votre panier est vide</h2>
            <p className="text-gray-400 mb-6">
              Vous n'avez pas encore ajouté d'articles à votre panier.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Articles ({cart.length})</h2>
                    <button
                      onClick={clearCart}
                      className="text-gray-400 hover:text-red-400 flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Vider le panier
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-700">
                  {cart.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-white">{item.name}</h3>
                            <p className="text-gray-400 text-sm">{item.category}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="bg-gray-700 text-white h-8 w-8 rounded-l-lg flex items-center justify-center hover:bg-gray-600"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 bg-gray-700 text-white text-center py-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="bg-gray-700 text-white h-8 w-8 rounded-r-lg flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            
                            {item.quantity >= item.stock && (
                              <span className="ml-2 text-yellow-400 text-xs">
                                Stock max
                              </span>
                            )}
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
              
              <div className="mt-6">
                <Link
                  to="/shop"
                  className="inline-flex items-center text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continuer vos achats
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-purple-400 text-xl">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
                
                {!user ? (
                  <div className="mb-4 p-3 bg-yellow-900 text-yellow-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Connexion requise</p>
                      <p className="text-sm">Vous devez être connecté pour finaliser votre commande.</p>
                      <Link to="/login" className="text-white underline mt-1 inline-block">
                        Se connecter
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/checkout"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    Passer à la caisse
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;