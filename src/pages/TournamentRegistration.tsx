import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, CreditCard } from 'lucide-react';
import { sendRegistrationEmail } from '../services/emailService';

interface TournamentFormData {
  firstName: string;
  lastName: string;
  gamingName: string;
  email: string;
  phone: string;
  tournament: string;
  platform: string;
  experience: string;
  team: string;
  paymentMethod: string;
  acceptRules: boolean;
}

const TournamentRegistration = () => {
  const [formData, setFormData] = useState<TournamentFormData>({
    firstName: '',
    lastName: '',
    gamingName: '',
    email: '',
    phone: '',
    tournament: '',
    platform: '',
    experience: '',
    team: '',
    paymentMethod: '',
    acceptRules: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success?: boolean; message?: string} | null>(null);

  const validateForm = () => {
    if (!formData.acceptRules) {
      alert('Veuillez accepter le règlement du tournoi');
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
            type: 'tournament',
            details: {
              gamingName: formData.gamingName,
              tournament: formData.tournament,
              platform: formData.platform,
              experience: formData.experience
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
            gamingName: '',
            email: '',
            phone: '',
            tournament: '',
            platform: '',
            experience: '',
            team: '',
            paymentMethod: '',
            acceptRules: false
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
            Inscription au Tournoi
          </h1>
          <p className="text-xl text-gray-300">
            Rejoignez nos compétitions et affrontez les meilleurs joueurs !
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
                <label className="block text-gray-300 mb-2">Pseudo Gaming *</label>
                <input
                  type="text"
                  value={formData.gamingName}
                  onChange={(e) => setFormData({ ...formData, gamingName: e.target.value })}
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

          {/* Détails du tournoi */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-2" />
              Détails du Tournoi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Tournoi *</label>
                <select
                  value={formData.tournament}
                  onChange={(e) => setFormData({ ...formData, tournament: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez un tournoi</option>
                  <option value="fifa">Tournoi FIFA</option>
                  <option value="cod">Tournoi Call of Duty</option>
                  <option value="fortnite">Tournoi Fortnite</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Plateforme *</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez une plateforme</option>
                  <option value="ps5">PlayStation 5</option>
                  <option value="ps4">PlayStation 4</option>
                  <option value="xbox">Xbox Series X</option>
                  <option value="pc">PC</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Niveau d'expérience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                  <option value="pro">Professionnel</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Nom d'équipe (optionnel)</label>
                <input
                  type="text"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Paiement
            </h2>
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">
                Frais d'inscription : 5,000 FCFA par participant
              </p>
              <div className="space-y-3">
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
                  <span className="text-gray-300">Espèces (sur place)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Règlement */}
          <div className="mb-8">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.acceptRules}
                onChange={(e) => setFormData({ ...formData, acceptRules: e.target.checked })}
                className="form-checkbox h-5 w-5 text-purple-600 mt-1"
                required
                disabled={isSubmitting}
              />
              <span className="text-gray-300">
                J'accepte le règlement du tournoi et je m'engage à respecter les règles de fair-play
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
                <Trophy className="h-5 w-5 mr-2" />
                S'inscrire au tournoi
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default TournamentRegistration;