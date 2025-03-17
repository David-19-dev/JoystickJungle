import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Coffee, ShoppingBag, Trophy, Gamepad, Wrench, Headphones, Calendar, Video, Laptop, Monitor, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      category: "Espaces Premium",
      items: [
        {
          title: "Gaming Room Privée",
          description: "Salle privatisée idéale pour les groupes d'amis ou les événements spéciaux",
          icon: <Users className="h-6 w-6" />,
          features: [
            "Capacité de 10-15 personnes",
            "Équipement gaming haut de gamme",
            "Système audio surround",
            "Parfait pour anniversaires et team-building"
          ]
        },
        {
          title: "Salle VIP",
          description: "Expérience gaming exclusive avec prestations haut de gamme",
          icon: <Crown className="h-6 w-6" />,
          features: [
            "Fauteuils gaming ergonomiques",
            "Collations et boissons premium incluses",
            "Service personnalisé",
            "Ambiance luxueuse"
          ]
        }
      ]
    },
    {
      category: "Restauration & Boissons",
      items: [
        {
          title: "Menu Gamer",
          description: "Une sélection de snacks et boissons pour rester au top",
          icon: <Coffee className="h-6 w-6" />,
          features: [
            "Boissons énergisantes",
            "Sandwichs et burgers",
            "Formules combinées jeu + snack",
            "Options végétariennes disponibles"
          ]
        }
      ]
    },
    {
      category: "Équipement Gaming",
      items: [
        {
          title: "Vente & Location",
          description: "Tout l'équipement nécessaire pour une expérience optimale",
          icon: <ShoppingBag className="h-6 w-6" />,
          features: [
            "Manettes professionnelles",
            "Casques gaming haute qualité",
            "Accessoires gaming",
            "Location d'équipement VR"
          ]
        },
        {
          title: "Maintenance & Réparation",
          description: "Service technique professionnel pour votre matériel",
          icon: <Wrench className="h-6 w-6" />,
          features: [
            "Réparation de consoles",
            "Maintenance préventive",
            "Nettoyage et optimisation",
            "Diagnostic gratuit"
          ]
        }
      ]
    },
    {
      category: "Coaching & Formation",
      items: [
        {
          title: "Sessions de Coaching",
          description: "Améliorez votre niveau avec nos coachs professionnels",
          icon: <Headphones className="h-6 w-6" />,
          features: [
            "Coaching individuel",
            "Sessions en groupe",
            "Analyse de gameplay",
            "Stratégies avancées"
          ]
        }
      ]
    },
    {
      category: "Événements Spéciaux",
      items: [
        {
          title: "Nuits Gaming & Tournois",
          description: "Des événements uniques pour la communauté gaming",
          icon: <Calendar className="h-6 w-6" />,
          features: [
            "Nuits gaming (22h-6h)",
            "Tournois hebdomadaires",
            "Soirées thématiques",
            "Prix à gagner"
          ]
        }
      ]
    },
    {
      category: "Création de Contenu",
      items: [
        {
          title: "Studio Streaming",
          description: "Espace professionnel pour les créateurs de contenu",
          icon: <Video className="h-6 w-6" />,
          features: [
            "Setup streaming complet",
            "Overlay personnalisé",
            "Connexion haut débit",
            "Support technique"
          ]
        }
      ]
    },
    {
      category: "Réalité Virtuelle",
      items: [
        {
          title: "Zone VR Avancée",
          description: "Immersion totale dans le monde virtuel",
          icon: <Monitor className="h-6 w-6" />,
          features: [
            "Derniers jeux VR",
            "Simulations de course",
            "Expériences multi-joueurs",
            "Équipement professionnel"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Services Gaming"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Nos Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Découvrez notre gamme complète de services gaming premium, 
            conçus pour offrir une expérience immersive et inoubliable.
          </p>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <span className="mr-3">{category.category}</span>
                <div className="h-px flex-grow bg-purple-500 opacity-20"></div>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.items.map((service, serviceIndex) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (serviceIndex * 0.1) }}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-600 rounded-lg mr-4">
                          {service.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-400">
                            <Star className="h-4 w-4 text-purple-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
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
              Prêt à Vivre l'Expérience Gaming Ultime ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Réservez dès maintenant et découvrez pourquoi Joystick Jungle est la 
              destination gaming préférée à Dakar.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/booking"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Réserver Maintenant
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                Voir les Tarifs
                <Gamepad className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;