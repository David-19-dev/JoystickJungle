import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const reference = queryParams.get('reference');
  
  useEffect(() => {
    // You could use this effect to verify the payment status with your backend
    if (token && reference) {
      console.log('Payment verified with token:', token, 'and reference:', reference);
    }
  }, [token, reference]);
  
  return (
    <div className="min-h-screen bg-gray-900 py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
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
            Paiement Réussi !
          </h1>
          
          <p className="text-gray-300 mb-6">
            Votre paiement a été traité avec succès. Merci pour votre achat !
          </p>
          
          {reference && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm">Référence de transaction</p>
              <p className="text-white font-medium">{reference}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
            
            <Link
              to="/booking"
              className="flex items-center justify-center px-6 py-3 border border-purple-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux réservations
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;