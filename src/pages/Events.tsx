import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Users, Gamepad, Monitor, Coffee, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const tournaments = [
    {
      title: 'Tournoi FIFA',
      game: 'FIFA 24',
      image: "/image/img-fifa.jpg",
      date: 'Premier samedi de chaque mois',
      format: 'Élimination simple',
      entry: '15,000 FCFA par participant',
      maxParticipants: '32 joueurs',
      prizes: [
        { place: '1ère place', amount: '40,000 FCFA' },
        { place: '2ème place', amount: '20,000 FCFA' },
        { place: '3ème place', amount: 'Carte cadeau de 10,000 FCFA' },
      ],
      logistics: [
        { icon: <Gamepad className="h-5 w-5" />, text: '10 PS5 disponibles' },
        { icon: <Monitor className="h-5 w-5" />, text: '10 écrans dédiés' },
        { icon: <Coffee className="h-5 w-5" />, text: 'Zone spectateurs avec snacks' },
      ],
    },
    {
      title: 'Tournoi Call of Duty',
      game: 'Call of Duty: Warzone',
      image: "/image/img_call_off.jpg",
      date: 'Troisième dimanche de chaque mois',
      format: 'Élimination double',
      entry: '20,000 FCFA par équipe (équipes de 4)',
      maxParticipants: '16 équipes (64 joueurs)',
      prizes: [
        { place: '1ère place', amount: '50,000 FCFA' },
        { place: '2ème place', amount: '25,000 FCFA' },
        { place: '3ème place', amount: 'Carte cadeau de 5,000 FCFA (chacun)' },
      ],
      logistics: [
        { icon: <Gamepad className="h-5 w-5" />, text: '5 PS5 et 5 Xbox' },
        { icon: <Monitor className="h-5 w-5" />, text: '10 écrans dédiés' },
        { icon: <Coffee className="h-5 w-5" />, text: 'Zone spectateurs avec boissons et snacks' },
      ],
    },
    {
      title: 'Tournoi Fortnite',
      game: 'Fortnite',
      image: 'https://images.unsplash.com/photo-1615680022648-2db11101c73a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      date: 'Dernier samedi de chaque mois',
      format: 'Round-robin suivi d\'élimination directe',
      entry: '5,000 FCFA par joueur',
      maxParticipants: '40 joueurs',
      prizes: [
        { place: '1ère place', amount: '25,000 FCFA' },
        { place: '2ème place', amount: '15,000 FCFA' },
        { place: '3ème place', amount: 'Carte cadeau de 10,000 FCFA' },
      ],
      logistics: [
        { icon: <Gamepad className="h-5 w-5" />, text: '5 PS5 et 5 Xbox' },
        { icon: <Monitor className="h-5 w-5" />, text: '10 écrans dédiés' },
        { icon: <Coffee className="h-5 w-5" />, text: 'Zone spectateurs équipée' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Tournois & Événements
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Participez à nos tournois mensuels et affrontez les meilleurs joueurs de Dakar.
            Des prix exceptionnels et une ambiance électrique vous attendent !
          </p>
        </motion.div>

        {/* Tournaments Section */}
        <div className="space-y-16">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-xl"
            >
              <div className="relative h-64">
                <img
                  src={tournament.image}
                  alt={tournament.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h2 className="text-3xl font-bold text-white mb-2">{tournament.title}</h2>
                  <p className="text-xl text-gray-200">{tournament.game}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Informations</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-300">
                        <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                        {tournament.date}
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Trophy className="h-5 w-5 mr-3 text-purple-500" />
                        Format : {tournament.format}
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 mr-3 text-purple-500" />
                        Maximum : {tournament.maxParticipants}
                      </li>
                    </ul>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Prix</h4>
                      <ul className="space-y-2">
                        {tournament.prizes.map((prize) => (
                          <li key={prize.place} className="text-gray-300">
                            <span className="font-semibold">{prize.place}</span> : {prize.amount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Logistique</h3>
                    <ul className="space-y-3">
                      {tournament.logistics.map((item, i) => (
                        <li key={i} className="flex items-center text-gray-300">
                          <span className="mr-3 text-purple-500">{item.icon}</span>
                          {item.text}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <p className="text-xl font-semibold text-purple-500 mb-4">
                        Frais d'inscription : {tournament.entry}
                      </p>
                      <Link
                        to="/tournament-registration"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        S'inscrire au tournoi
                        <Trophy className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 bg-gray-800 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Contact et Localisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3 text-purple-500" />
                  Dakar, Sacré-coeur 3 , Dakar
                </li>
                <li className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3 text-purple-500" />
                  +221 77 657 35 28
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3 text-purple-500" />
                  contact@joystickjungle.sn
                </li>
              </ul>
            </div>
            <div className="h-64 bg-gray-700 rounded-lg">
              {/* Placeholder for Google Maps */}
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Carte Google Maps
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventsPage;