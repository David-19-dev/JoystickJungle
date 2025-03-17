import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Users, Calendar, Star, Camera, ArrowRight, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: <Trophy className="h-6 w-6 text-purple-500" />,
      title: 'Tournois Réguliers',
      description: 'Participez à nos tournois hebdomadaires et gagnez des prix exceptionnels.'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: 'Événements Privés',
      description: 'Organisez vos événements gaming dans un cadre unique et professionnel.'
    },
    {
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      title: 'Réservation Flexible',
      description: 'Réservez votre créneau en ligne, 24/7, selon vos disponibilités.'
    },
    {
      icon: <Star className="h-6 w-6 text-purple-500" />,
      title: 'Équipement Premium',
      description: 'Profitez des dernières consoles et PC gaming haute performance.'
    }
  ];

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Zone Gaming Principal',
      description: 'Espace gaming moderne avec écrans 4K'
    },
    {
      url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Espace VR',
      description: 'Zone dédiée à la réalité virtuelle'
    },
    {
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Lounge Gaming',
      description: 'Espace détente et rafraîchissements'
    },
    {
      url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Salle de Tournois',
      description: 'Configuration professionnelle pour les compétitions'
    },
    {
      url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Zone Console',
      description: 'Espace dédié aux consoles dernière génération'
    },
    {
      url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      title: 'Snack Bar',
      description: 'Large sélection de snacks et boissons'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <img
             src="/image/mario-img.jpg"
            alt="Gaming Setup"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Bienvenue dans la Jungle du Gaming
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Découvrez un espace gaming nouvelle génération au cœur de Dakar.
              Vivez une expérience de jeu unique dans un cadre convivial et moderne.
            </p>
            <p className="text-xl text-purple-400 italic mb-8">
              là où le jeu devient une aventure
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Réserver Maintenant
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                Voir les Événements
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Une Expérience Gaming Unique
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Découvrez pourquoi Joystick Jungle est la destination préférée des gamers à Dakar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 p-6 rounded-lg"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Découvrez Nos Installations
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explorez notre espace gaming moderne et professionnel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{image.title}</h3>
                    <p className="text-gray-300">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 border border-purple-500 text-base font-medium rounded-md text-white hover:bg-purple-500 transition-colors"
            >
              <Camera className="mr-2 h-5 w-5" />
              Voir Plus de Photos
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Contactez-nous
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nous sommes à votre disposition pour répondre à toutes vos questions
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-gray-900 p-6 rounded-lg flex items-center space-x-4">
              <Phone className="h-10 w-10 text-purple-500" />
              <div>
                <h3 className="text-lg font-medium text-white">Téléphone</h3>
                <p className="text-gray-300">+221 77 657 38 28</p>
              </div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg flex items-center space-x-4">
              <Mail className="h-10 w-10 text-purple-500" />
              <div>
                <h3 className="text-lg font-medium text-white">Email</h3>
                <p className="text-gray-300">contact@joystickjungle.sn</p>
              </div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg flex items-center space-x-4">
              <MapPin className="h-10 w-10 text-purple-500" />
              <div>
                <h3 className="text-lg font-medium text-white">Adresse</h3>
                <p className="text-gray-300">123 Rue Gaming, Dakar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Prêt à Rejoindre l'Aventure ?
          </h2>
          <Link
            to="/booking"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-900 bg-white hover:bg-gray-100 transition-colors"
          >
            Commencer Maintenant
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;