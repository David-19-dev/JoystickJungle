import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { sendContactEmail } from '../services/emailService';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success?: boolean; message?: string} | null>(null);

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.message) {
      alert('Veuillez remplir tous les champs obligatoires');
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
          result = await sendContactEmail({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            subject: formData.subject || 'Contact depuis le site web',
            message: formData.message || ''
          });
        }

        if (result.success) {
          setSubmitResult({
            success: true,
            message: 'Message envoyé avec succès!'
          });
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          });
        } else {
          setSubmitResult({
            success: false,
            message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-300">
            Une question ? N'hésitez pas à nous contacter !
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-8 rounded-lg"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Nos Coordonnées
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-purple-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Adresse</h3>
                  <p className="text-gray-300">123 Rue Gaming, Dakar, Sénégal</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-purple-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Téléphone</h3>
                  <p className="text-gray-300">+221 77 657 38 28</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-purple-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Email</h3>
                  <p className="text-gray-300">contact@joystickjungle.sn</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-white mb-4">Horaires d'ouverture</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Lundi - Jeudi: 10h - 22h</li>
                <li>Vendredi - Samedi: 10h - 00h</li>
                <li>Dimanche: 14h - 22h</li>
              </ul>
            </div>
          </motion.div>

          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Envoyez-nous un message
              </h2>
              
              {submitResult && (
                <div className={`p-4 mb-6 rounded-lg ${submitResult.success ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                  {submitResult.message}
                </div>
              )}
              
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
              </div>

              <div className="mt-6">
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

              <div className="mt-6">
                <label className="block text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-6">
                <label className="block text-gray-300 mb-2">Sujet</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-6">
                <label className="block text-gray-300 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 h-32"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="mt-8">
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
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;