import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Gamepad, CreditCard, Coffee, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendRegistrationEmail } from '../services/emailService';

interface BookingData {
  platform: string;
  duration: string;
  players: string;
  date: string;
  time: string;
  extras: string[];
  payment: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface PlatformOption {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  available: number;
}

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    platform: '',
    duration: '',
    players: '1',
    date: '',
    time: '',
    extras: [],
    payment: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success?: boolean; message?: string} | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [proceedToPayment, setProceedToPayment] = useState(false);

  // Platforms available for booking
  const platforms: PlatformOption[] = [
    {
      id: 'ps5',
      name: 'PlayStation 5',
      description: 'Console dernière génération avec manettes DualSense et jeux 4K',
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      price: 2000,
      available: 5
    },
    {
      id: 'ps4',
      name: 'PlayStation 4',
      description: 'Console avec large bibliothèque de jeux et manettes DualShock',
      image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      price: 1000,
      available: 8
    },
    {
      id: 'xbox',
      name: 'Xbox Series X',
      description: 'Console puissante avec Game Pass et performances optimales',
      image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      price: 2000,
      available: 4
    },
    {
      id: 'vr',
      name: 'Réalité Virtuelle',
      description: 'Expérience immersive avec casque VR dernière génération',
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      price: 5000,
      available: 2
    }
  ];

  // Duration options
  const durations = [
    { id: '30', label: '30 minutes', price: 0.5 },
    { id: '60', label: '1 heure', price: 1 },
    { id: '90', label: '1 heure 30', price: 1.5 },
    { id: '120', label: '2 heures', price: 2 },
    { id: '180', label: '3 heures', price: 3 },
  ];

  // Extra options
  const extraOptions = [
    { id: 'snacks', label: 'Pack Snacks', price: 2000, description: 'Chips, pop-corn, et biscuits' },
    { id: 'drinks', label: 'Pack Boissons', price: 1500, description: 'Sodas, eau et jus de fruits' },
    { id: 'premium', label: 'Manettes Premium', price: 1000, description: 'Manettes pro avec grip amélioré' },
    { id: 'private', label: 'Espace Privé', price: 5000, description: 'Zone réservée pour votre groupe' },
  ];

  // Generate time slots based on date
  useEffect(() => {
    if (bookingData.date) {
      // In a real app, this would come from an API
      const slots: TimeSlot[] = [];
      for (let hour = 10; hour < 22; hour++) {
        // Generate slots every 30 minutes
        ['00', '30'].forEach(minutes => {
          const timeString = `${hour}:${minutes}`;
          // Randomly mark some slots as unavailable for demo purposes
          const available = Math.random() > 0.3;
          slots.push({
            id: `${hour}-${minutes}`,
            time: timeString,
            available
          });
        });
      }
      setAvailableTimeSlots(slots);
    }
  }, [bookingData.date]);

  // Calculate total price
  useEffect(() => {
    let price = 0;
    
    // Platform price
    const selectedPlatform = platforms.find(p => p.id === bookingData.platform);
    if (selectedPlatform && bookingData.duration) {
      const durationMultiplier = durations.find(d => d.id === bookingData.duration)?.price || 0;
      price += selectedPlatform.price * durationMultiplier;
    }
    
    // Extras
    bookingData.extras.forEach(extraId => {
      const extra = extraOptions.find(e => e.id === extraId);
      if (extra) {
        price += extra.price;
      }
    });
    
    // Additional players (first player is included in base price)
    const additionalPlayers = parseInt(bookingData.players) - 1;
    if (additionalPlayers > 0) {
      price += additionalPlayers * 500; // 500 FCFA per additional player
    }
    
    setTotalPrice(price);
  }, [bookingData.platform, bookingData.duration, bookingData.extras, bookingData.players]);

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1 && !bookingData.platform) {
      alert('Veuillez sélectionner une plateforme');
      return;
    }
    if (currentStep === 2 && (!bookingData.date || !bookingData.time)) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }
    if (currentStep === 3 && !bookingData.duration) {
      alert('Veuillez sélectionner une durée');
      return;
    }
    if (currentStep === 4 && !bookingData.payment) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
          type: 'booking',
          details: {
            platform: bookingData.platform,
            date: bookingData.date,
            time: bookingData.time,
            duration: bookingData.duration,
            players: bookingData.players,
            extras: bookingData.extras,
            totalPrice: `${totalPrice} FCFA`
          }
        });
      }

      if (result.success) {
        if (bookingData.payment === 'wave') {
          setProceedToPayment(true);
        } else {
          setSubmitResult({
            success: true,
            message: 'Réservation envoyée avec succès! Vous recevrez une confirmation par email.'
          });
          setBookingData({
            platform: '',
            duration: '',
            players: '1',
            date: '',
            time: '',
            extras: [],
            payment: '',
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
          });
          setCurrentStep(1);
        }
      } else {
        setSubmitResult({
          success: false,
          message: 'Erreur lors de la réservation. Veuillez réessayer.'
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
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Get minimum date (today) for date picker
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now) for date picker
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step 
                  ? 'bg-purple-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </div>
            {step < 5 && (
              <div 
                className={`w-10 h-1 ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-700'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render step title
  const renderStepTitle = () => {
    const titles = [
      'Choisissez votre plateforme',
      'Sélectionnez date et heure',
      'Personnalisez votre session',
      'Informations de paiement',
      'Vos coordonnées'
    ];
    return (
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        {titles[currentStep - 1]}
      </h2>
    );
  };

  // Render platform selection (Step 1)
  const renderPlatformSelection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className={`bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all ${
              bookingData.platform === platform.id 
                ? 'ring-2 ring-purple-500 transform scale-[1.02]' 
                : 'hover:bg-gray-600'
            }`}
            onClick={() => setBookingData({ ...bookingData, platform: platform.id })}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={platform.image} 
                alt={platform.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
                <span className="text-purple-400 font-semibold">{platform.price} FCFA/h</span>
              </div>
              <p className="text-gray-300 mb-3">{platform.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">
                  <span className={platform.available > 2 ? 'text-green-500' : 'text-yellow-500'}>
                    {platform.available}
                  </span> disponibles
                </span>
                {bookingData.platform === platform.id && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    Sélectionné
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render date and time selection (Step 2)
  const renderDateTimeSelection = () => {
    return (
      <div className="space-y-8">
        <div>
          <label className="block text-gray-300 mb-2 text-lg">
            <Calendar className="inline-block mr-2 h-5 w-5" />
            Date de réservation
          </label>
          <input
            type="date"
            value={bookingData.date}
            min={getMinDate()}
            max={getMaxDate()}
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-lg"
            required
          />
          {bookingData.date && (
            <p className="mt-2 text-purple-400">
              {formatDate(bookingData.date)}
            </p>
          )}
        </div>

        {bookingData.date && (
          <div>
            <label className="block text-gray-300 mb-2 text-lg">
              <Clock className="inline-block mr-2 h-5 w-5" />
              Heure de début
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!slot.available}
                  className={`py-2 px-3 rounded-lg text-center transition-colors ${
                    bookingData.time === slot.time
                      ? 'bg-purple-600 text-white'
                      : slot.available
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, time: slot.time })}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected platform info */}
        {bookingData.platform && (
          <div className="bg-gray-700 p-4 rounded-lg mt-6">
            <h3 className="text-white font-semibold mb-2">Plateforme sélectionnée</h3>
            <p className="text-purple-400">
              {platforms.find(p => p.id === bookingData.platform)?.name}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render session customization (Step 3)
  const renderSessionCustomization = () => {
    return (
      <div className="space-y-8">
        <div>
          <label className="block text-gray-300 mb-2 text-lg">
            <Clock className="inline-block mr-2 h-5 w-5" />
            Durée de la session
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {durations.map((duration) => (
              <button
                key={duration.id}
                type="button"
                className={`py-2 px-3 rounded-lg text-center transition-colors ${
                  bookingData.duration === duration.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                onClick={() => setBookingData({ ...bookingData, duration: duration.id })}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-lg">
            <Users className="inline-block mr-2 h-5 w-5" />
            Nombre de joueurs
          </label>
          <div className="flex items-center">
            <button
              type="button"
              className="bg-gray-700 text-white h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-gray-600"
              onClick={() => {
                const currentPlayers = parseInt(bookingData.players);
                if (currentPlayers > 1) {
                  setBookingData({ ...bookingData, players: (currentPlayers - 1).toString() });
                }
              }}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="4"
              value={bookingData.players}
              onChange={(e) => setBookingData({ ...bookingData, players: e.target.value })}
              className="w-16 bg-gray-700 text-white text-center py-2 border-x-0 border-y border-gray-600"
              required
            />
            <button
              type="button"
              className="bg-gray-700 text-white h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-gray-600"
              onClick={() => {
                const currentPlayers = parseInt(bookingData.players);
                if (currentPlayers < 4) {
                  setBookingData({ ...bookingData, players: (currentPlayers + 1).toString() });
                }
              }}
            >
              +
            </button>
            <span className="ml-3 text-gray-400">
              {parseInt(bookingData.players) > 1 && '(+500 FCFA par joueur supplémentaire)'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-3 text-lg">
            <Coffee className="inline-block mr-2 h-5 w-5" />
            Extras
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extraOptions.map((extra) => (
              <div 
                key={extra.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  bookingData.extras.includes(extra.id)
                    ? 'bg-purple-900 border border-purple-500'
                    : 'bg-gray-700 border border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => {
                  const newExtras = bookingData.extras.includes(extra.id)
                    ? bookingData.extras.filter(id => id !== extra.id)
                    : [...bookingData.extras, extra.id];
                  setBookingData({ ...bookingData, extras: newExtras });
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{extra.label}</h4>
                    <p className="text-gray-400 text-sm">{extra.description}</p>
                  </div>
                  <span className="text-purple-400 font-semibold">{extra.price} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking summary */}
        <div className="bg-gray-700 p-4 rounded-lg mt-6">
          <h3 className="text-white font-semibold mb-2">Récapitulatif</h3>
          <div className="space-y-1 text-gray-300">
            <p>
              <span className="text-gray-400">Plateforme:</span>{' '}
              {platforms.find(p => p.id === bookingData.platform)?.name}
            </p>
            <p>
              <span className="text-gray-400">Date:</span>{' '}
              {formatDate(bookingData.date)}
            </p>
            <p>
              <span className="text-gray-400">Heure:</span>{' '}
              {bookingData.time}
            </p>
            {bookingData.duration && (
              <p>
                <span className="text-gray-400">Durée:</span>{' '}
                {durations.find(d => d.id === bookingData.duration)?.label}
              </p>
            )}
            <p>
              <span className="text-gray-400">Joueurs:</span>{' '}
              {bookingData.players}
            </p>
            {bookingData.extras.length > 0 && (
              <p>
                <span className="text-gray-400">Extras:</span>{' '}
                {bookingData.extras.map(id => extraOptions.find(e => e.id === id)?.label).join(', ')}
              </p>
            )}
            <p className="text-xl font-semibold text-purple-400 mt-2">
              Total: {totalPrice} FCFA
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render payment information (Step 4)
  const renderPaymentInformation = () => {
    return (
      <div className="space-y-8">
        <div>
          <label className="block text-gray-300 mb-3 text-lg">
            <CreditCard className="inline-block mr-2 h-5 w-5" />
            Mode de Paiement
          </label>
          <div className="space-y-3">
            {[
              { id: 'wave', name: 'Wave Mobile Money', description: 'Paiement mobile rapide et sécurisé' },
              { id: 'orange-money', name: 'Orange Money', description: 'Transfert d\'argent via Orange' },
              { id: 'cash', name: 'Espèces', description: 'Paiement sur place avant la session' }
            ].map((method) => (
              <div 
                key={method.id}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  bookingData.payment === method.id
                    ? 'bg-purple-900 border border-purple-500'
                    : 'bg-gray-700 border border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setBookingData({ ...bookingData, payment: method.id })}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      bookingData.payment === method.id ? 'border-purple-500' : 'border-gray-500'
                    }`}>
                      {bookingData.payment === method.id && (
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{method.name}</h4>
                    <p className="text-gray-400 text-sm">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking summary */}
        <div className="bg-gray-700 p-4 rounded-lg mt-6">
          <h3 className="text-white font-semibold mb-2">Récapitulatif de la commande</h3>
          <div className="space-y-1 text-gray-300">
            <p>
              <span className="text-gray-400">Plateforme:</span>{' '}
              {platforms.find(p => p.id === bookingData.platform)?.name}
            </p>
            <p>
              <span className="text-gray-400">Date:</span>{' '}
              {formatDate(bookingData.date)}
            </p>
            <p>
              <span className="text-gray-400">Heure:</span>{' '}
              {bookingData.time}
            </p>
            {bookingData.duration && (
              <p>
                <span className="text-gray-400">Durée:</span>{' '}
                {durations.find(d => d.id === bookingData.duration)?.label}
              </p>
            )}
            <p>
              <span className="text-gray-400">Joueurs:</span>{' '}
              {bookingData.players}
            </p>
            {bookingData.extras.length > 0 && (
              <p>
                <span className="text-gray-400">Extras:</span>{' '}
                {bookingData.extras.map(id => extraOptions.find(e => e.id === id)?.label).join(', ')}
              </p>
            )}
            <div className="border-t border-gray-600 my-2 pt-2">
              <p className="text-xl font-semibold text-purple-400">
                Total: {totalPrice} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render personal information (Step 5)
  const renderPersonalInformation = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
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
              value={bookingData.firstName}
              onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Nom *</label>
            <input
              type="text"
              value={bookingData.lastName}
              onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Email *</label>
          <input
            type="email"
            value={bookingData.email}
            onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Téléphone *</label>
          <input
            type="tel"
            value={bookingData.phone}
            onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Final booking summary */}
        <div className="bg-gray-700 p-4 rounded-lg mt-6">
          <h3 className="text-white font-semibold mb-2">Récapitulatif final</h3>
          <div className="space-y-1 text-gray-300">
            <p>
              <span className="text-gray-400">Plateforme:</span>{' '}
              {platforms.find(p => p.id === bookingData.platform)?.name}
            </p>
            <p>
              <span className="text-gray-400">Date:</span>{' '}
              {formatDate(bookingData.date)}
            </p>
            <p>
              <span className="text-gray-400">Heure:</span>{' '}
              {bookingData.time}
            </p>
            {bookingData.duration && (
              <p>
                <span className="text-gray-400">Durée:</span>{' '}
                {durations.find(d => d.id === bookingData.duration)?.label}
              </p>
            )}
            <p>
              <span className="text-gray-400">Joueurs:</span>{' '}
              {bookingData.players}
            </p>
            {bookingData.extras.length > 0 && (
              <p>
                <span className="text-gray-400">Extras:</span>{' '}
                {bookingData.extras.map(id => extraOptions.find(e => e.id === id)?.label).join(', ')}
              </p>
            )}
            <p>
              <span className="text-gray-400">Paiement:</span>{' '}
              {bookingData.payment === 'wave' ? 'Wave Mobile Money' : 
               bookingData.payment === 'orange-money' ? 'Orange Money' : 'Espèces'}
            </p>
            <div className="border-t border-gray-600 my-2 pt-2">
              <p className="text-xl font-semibold text-purple-400">
                Total: {totalPrice} FCFA
              </p>
            </div>
          </div>
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
              Confirmer la Réservation
            </>
          )}
        </button>
      </form>
    );
  };

  // Render payment redirect
  const renderPaymentRedirect = () => {
    return (
      <div className="text-center py-8">
        <div className="bg-green-800 text-green-100 p-4 rounded-lg mb-6">
          <p>Votre réservation a été enregistrée avec succès!</p>
          <p>Vous allez être redirigé vers la page de paiement Wave.</p>
        </div>
        
        <div className="bg-gray-700 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Récapitulatif de la réservation</h3>
          <div className="space-y-2 text-left">
            <p className="text-gray-300">
              <span className="text-gray-400">Nom:</span> {bookingData.firstName} {bookingData.lastName}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Réservation:</span> {platforms.find(p => p.id === bookingData.platform)?.name}, {formatDate(bookingData.date)} à {bookingData.time}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Durée:</span> {durations.find(d => d.id === bookingData.duration)?.label}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Montant:</span> {totalPrice} FCFA
            </p>
          </div>
        </div>
        
        <Link
          to={{
            pathname: "/payment",
            search: `?amount=${totalPrice}&name=${encodeURIComponent(bookingData.firstName + ' ' + bookingData.lastName)}&phone=${encodeURIComponent(bookingData.phone)}&description=${encodeURIComponent(`Réservation ${platforms.find(p => p.id === bookingData.platform)?.name} - ${formatDate(bookingData.date)}`)}`
          }}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Procéder au paiement
        </Link>
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    if (proceedToPayment) {
      return renderPaymentRedirect();
    }
    
    switch (currentStep) {
      case 1:
        return renderPlatformSelection();
      case 2:
        return renderDateTimeSelection();
      case 3:
        return renderSessionCustomization();
      case 4:
        return renderPaymentInformation();
      case 5:
        return renderPersonalInformation();
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderNavButtons = () => {
    if (proceedToPayment) {
      return null;
    }
    
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Précédent
          </button>
        )}
        {currentStep < 5 && (
          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ml-auto"
          >
            Suivant
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Réservation</h1>
          <p className="text-xl text-gray-300">
            Réservez votre session de jeu en quelques étapes simples
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg p-8"
        >
          {!proceedToPayment && renderStepIndicators()}
          {!proceedToPayment && renderStepTitle()}
          {renderStepContent()}
          {!proceedToPayment && currentStep < 5 && renderNavButtons()}
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;