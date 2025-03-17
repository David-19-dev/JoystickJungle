import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Gamepad, Headset, CreditCard, Star, Crown, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const hourlyRates = [
    {
      icon: <Gamepad className="h-6 w-6" />,
      name: 'PlayStation 4',
      rates: [
        { duration: '30 minutes', price: '500 FCFA' },
        { duration: '1 heure', price: '1 000 FCFA' },
      ],
    },
    {
      icon: <Gamepad className="h-6 w-6" />,
      name: 'PlayStation 5',
      rates: [
        { duration: '30 minutes', price: '1 000 FCFA' },
        { duration: '1 heure', price: '2 000 FCFA' },
      ],
    },
    {
      icon: <Headset className="h-6 w-6" />,
      name: 'Casque Réalité Virtuelle (VR)',
      rates: [
        { duration: '30 minutes', price: '2 500 FCFA' },
        { duration: '1 heure', price: '5 000 FCFA' },
      ],
    },
    {
      icon: <Gamepad className="h-6 w-6" />,
      name: 'Xbox',
      rates: [
        { duration: '30 minutes', price: '500 FCFA' },
        { duration: '1 heure', price: '1 000 FCFA' },
      ],
    },
  ];

  const subscriptions = [
    {
      name: 'Basic',
      price: '15,000',
      icon: <Star className="h-6 w-6" />,
      features: [
        '12h de jeu',
        '5h VR',
        '-5% sur extras',
      ],
      color: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Standard',
      price: '25,000',
      icon: <Trophy className="h-6 w-6" />,
      features: [
        '18h de jeu',
        '3h VR',
        '-5% sur extras',
      ],
      color: 'from-blue-500 to-blue-600',
      popular: true,
    },
    {
      name: 'Premium',
      price: '50,000',
      icon: <Crown className="h-6 w-6" />,
      features: [
        '25h de jeu',
        '5h VR',
        '-10% sur extras',
        'Accès prioritaire aux nouvelles sorties',
      ],
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'VIP',
      price: '100,000',
      icon: <Users className="h-6 w-6" />,
      features: [
        '35h de jeu',
        '8h VR',
        '-15% sur extras',
        'Salle privée',
        'Événements VIP',
      ],
      color: 'from-yellow-500 to-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tarifs horaires */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Tarifs des Sessions de Jeu
          </motion.h1>
          <p className="text-gray-400">
            Choisissez la durée qui vous convient
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {hourlyRates.map((rate, index) => (
            <motion.div
              key={rate.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-600 rounded-lg">
                  {rate.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{rate.name}</h3>
              </div>
              <div className="space-y-3">
                {rate.rates.map((r) => (
                  <div key={r.duration} className="flex justify-between items-center text-gray-300">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {r.duration}
                    </span>
                    <span className="font-semibold">{r.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Abonnements */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Abonnements
          </motion.h2>
          <p className="text-gray-400 mb-8">
            Profitez de nos offres d'abonnement pour plus d'avantages
          </p>
          <div className="inline-flex items-center space-x-4 bg-gray-800 p-2 rounded-lg mb-8">
            <span className="text-white px-4 py-2">Options de paiement :</span>
            <span className="text-gray-300">Mensuel</span>
            <span className="text-purple-400">Trimestriel (-5%)</span>
            <span className="text-purple-400">Annuel (-10%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptions.map((sub, index) => (
            <motion.div
              key={sub.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              {sub.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm">
                  Populaire
                </div>
              )}
              <div className={`p-6 bg-gradient-to-br ${sub.color}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{sub.name}</h3>
                  {sub.icon}
                </div>
                <div className="text-white">
                  <span className="text-3xl font-bold">{sub.price}</span>
                  <span className="text-lg ml-1">FCFA</span>
                  <span className="text-sm ml-2">/mois</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {sub.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <Star className="h-4 w-4 mr-2 text-purple-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/subscription-registration"
                  className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Choisir {sub.name}
                  <CreditCard className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Prêt à commencer votre aventure gaming ?
          </h3>
          <p className="text-gray-400 mb-8">
            Réservez maintenant et profitez de nos installations de pointe
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Réserver une Session
            <Gamepad className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;