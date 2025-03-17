import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Users, Calendar, Star } from 'lucide-react';
import { sendRegistrationEmail } from '../services/emailService';

interface SubscriptionFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subscriptionType: string;
  startDate: string;
  paymentMethod: string;
  acceptTerms: boolean;
}

const SubscriptionRegistration = () => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subscriptionType: '',
    startDate: '',
    paymentMethod: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success?: boolean; message?: string} | null>(null);

  const validateForm = () => {
    if (!formData.acceptTerms) {
      alert('Veuillez accepter les conditions d\'abonnement');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setSubmitResult(null);
        
        // In development, simulate success without actually sending email
        let result;
        if (import.meta.env.DEV && !import.meta.env.VITE_BREVO_API_KEY) {
          // Simulate API call in development
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = { success: true };
        } else {
          result = await sendRegistrationEmail({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            type: 'subscription',
            details: {
              subscriptionType: formData.subscriptionType,
              startDate: formData.startDate,
              paymentMethod: formData.paymentMethod
            }
          });
        }

        if (result.success) {
          setSubmitResult({
            success: true,
            message: 'Inscription envoyée avec succès!'
          });
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            subscriptionType: '',
            startDate: '',
            paymentMethod: '',
            acceptTerms: false
          });
        } else {
          setSubmitResult({
            success: false,
            message: 'Erreur lors de l\'inscription. Veuillez réessayer.'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setSubmitResult({
          success: false,
          message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Inscription Abonnement
          </h1>
          <p className="text-xl text-gray-300">
            Rejoignez notre communauté et profitez d'avantages exclusifs !
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg p-8"
          onSubmit={handleSubmit}
        >
          {submitResult && (
            <div className={`p-4 mb-6 rounded-lg ${submitResult.success ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
              {submitResult.message}
            </div>
          )}
          
          {/* Informations personnelles */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Informations Personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Détails de l'abonnement */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Star className="h-6 w-6 mr-2" />
              Détails de l'Abonnement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Type d'Abonnement *</label>
                <select
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez un abonnement</option>
                  <option value="basic">Basic - 15,000 FCFA/mois</option>
                  <option value="standard">Standard - 25,000 FCFA/mois</option>
                  <option value="premium">Premium - 50,000 FCFA/mois</option>
                  <option value="vip">VIP - 100,000 FCFA/mois</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Mode de Paiement
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="wave"
                  checked={formData.paymentMethod === 'wave'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="form-radio h-5 w-5 text-purple-600"
                  required
                  disabled={isSubmitting}
                />
                <span className="text-gray-300">Wave</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="orange-money"
                  checked={formData.paymentMethod === 'orange-money'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="form-radio h-5 w-5 text-purple-600"
                  disabled={isSubmitting}
                />
                <span className="text-gray-300">Orange Money</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="form-radio h-5 w-5 text-purple-600"
                  disabled={isSubmitting}
                />
                <span className="text-gray-300">Espèces</span>
              </label>
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-8">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="form-checkbox h-5 w-5 text-purple-600 mt-1"
                required
                disabled={isSubmitting}
              />
              <span className="text-gray-300">
                J'accepte les conditions d'abonnement et je comprends que mon abonnement sera renouvelé automatiquement
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <Star className="h-5 w-5 mr-2" />
                Confirmer l'abonnement
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default SubscriptionRegistration;