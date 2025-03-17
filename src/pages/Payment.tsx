import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, User, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

interface PaymentFormData {
  name: string;
  phone: string;
  amount: string;
  item_name: string;
  description: string;
}

const Payment = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    name: queryParams.get('name') || '',
    phone: queryParams.get('phone') || '',
    amount: queryParams.get('amount') || '',
    item_name: 'Joystick Jungle Services',
    description: queryParams.get('description') || 'Payment for gaming services'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: boolean;
    message?: string;
    payment_url?: string;
  } | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setPaymentStatus(null);
      
      // Validate form data
      if (!formData.name || !formData.phone || !formData.amount) {
        setPaymentStatus({
          success: false,
          message: 'Veuillez remplir tous les champs obligatoires'
        });
        return;
      }
      
      // Convert amount to number and validate
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setPaymentStatus({
          success: false,
          message: 'Veuillez entrer un montant valide'
        });
        return;
      }
      
      // Make API request to our backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/pay-with-wave`, {
        name: formData.name,
        phone: formData.phone,
        amount: amount,
        item_name: formData.item_name,
        description: formData.description
      });
      
      if (response.data.success && response.data.payment_url) {
        setPaymentStatus({
          success: true,
          message: 'Redirection vers la page de paiement...',
          payment_url: response.data.payment_url
        });
        
        // Redirect to payment page after a short delay
        setTimeout(() => {
          window.location.href = response.data.payment_url;
        }, 1500);
      } else {
        setPaymentStatus({
          success: false,
          message: 'Erreur lors de la création de la demande de paiement'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Une erreur est survenue lors du traitement de votre paiement';
      
      // Extract error message from axios error if available
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setPaymentStatus({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Paiement Wave
          </h1>
          <p className="text-gray-300">
            Effectuez votre paiement en toute sécurité avec Wave Mobile Money
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          {paymentStatus && (
            <div className={`p-4 mb-6 rounded-lg ${
              paymentStatus.success ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
            }`}>
              <div className="flex items-center">
                {paymentStatus.success ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <p data-testid="payment-status-message">{paymentStatus.message}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-2 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Nom complet *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Entrez votre nom complet"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-300 mb-2 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Numéro Wave *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="77 123 45 67"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: 77 XXX XX XX ou 221 77 XXX XX XX
              </p>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-gray-300 mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Montant (FCFA) *
              </label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Entrez le montant"
                min="100"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-300 mb-2 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Description de l'achat
              </label>
              <input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Description de votre achat"
                disabled={isSubmitting}
              />
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
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payer avec Wave
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-2">Comment ça marche :</h3>
            <ol className="text-gray-300 list-decimal pl-5 space-y-1 text-sm">
              <li>Remplissez le formulaire avec vos informations</li>
              <li>Cliquez sur "Payer avec Wave"</li>
              <li>Vous serez redirigé vers la page de paiement Wave</li>
              <li>Suivez les instructions pour compléter votre paiement</li>
              <li>Une fois le paiement effectué, vous serez redirigé vers notre site</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;