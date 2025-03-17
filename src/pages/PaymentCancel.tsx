import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-red-600 rounded-full p-3">
              <XCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Paiement Annulé
          </h1>
          
          <p className="text-gray-300 mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/payment"
              className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Réessayer
            </Link>
            
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 border border-purple-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentCancel;