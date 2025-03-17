import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Zap, Trophy, Gamepad } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Vincent GOMIS',
      role: 'Fondateur & CEO',
      image: "/image/vince.jpg",
      description: 'Passionné de jeux vidéo depuis son plus jeune âge, Vincent a créé Joystick Jungle pour offrir aux gamers dakarois un espace à la hauteur de leurs attentes.',
    },
    {
      name: 'Prudence D. NDONG',
      role: 'Directrice des Opérations',
      image: "/image/prudence.jpg",
      description: 'Experte en gestion d\'événements, Mme Ndong assure le bon déroulement de tous nos tournois et la satisfaction de nos clients',
    },
    {
      name: 'Omar Kane',
      role: 'Responsable Technique',
      image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      description: 'Technicien chevronné, Omar veille au maintien et à l\'optimisation de notre équipement gaming de pointe.',
    },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Passion',
      description: 'Notre amour pour les jeux vidéo guide chacune de nos actions.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Communauté',
      description: 'Nous créons un espace où les gamers peuvent se rencontrer et partager leur passion.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans nos services et notre équipement.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Innovation',
      description: 'Nous restons à la pointe de la technologie gaming.',
    },
  ];

  const facilities = [
    {
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Zone Console',
      description: 'Espace dédié aux consoles dernière génération',
    },
    {
      image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Espace VR',
      description: 'Zone immersive pour la réalité virtuelle',
    },
    {
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Lounge Gaming',
      description: 'Espace détente et rafraîchissements',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Joystick Jungle Gaming Center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Notre Histoire
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bienvenue dans la première salle de jeux vidéo premium de Dakar,
            où passion et technologie se rencontrent pour créer une expérience gaming unique.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Notre Mission</h2>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Joystick Jungle a été créé en 2024 avec une vision claire : 
              offrir aux passionnés de jeux vidéo de Dakar un espace moderne et 
              accueillant où ils peuvent vivre pleinement leur passion. Notre mission 
              est de promouvoir l'e-sport au Sénégal et de créer une communauté gaming 
              dynamique et inclusive.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 p-6 rounded-lg text-center"
              >
                <div className="text-purple-500 mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-12 text-center"
          >
            Nos Installations
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-lg overflow-hidden group"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{facility.title}</h3>
                  <p className="text-gray-300">{facility.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Notre Équipe</h2>
            <p className="text-gray-400">
              Des passionnés au service de votre expérience gaming
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-purple-500 mb-4">{member.role}</p>
                  <p className="text-gray-400">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Rejoignez l'Aventure Gaming
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Découvrez la meilleure salle de jeux vidéo de Dakar et rejoignez une communauté 
              passionnée d'e-sport au Sénégal.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/booking"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Réserver une Session
                <Gamepad className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                Voir nos Événements
                <Trophy className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;