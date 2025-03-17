import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addMinutes, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Gamepad, Users, Clock, X, Calendar, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Platform {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    platform: string;
    status: string;
    userId: string;
  };
}

interface BookingFormData {
  platform: string;
  date: string;
  time: string;
  duration: string;
  players: string;
  extras: string[];
}

const SessionCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    platform: '',
    date: '',
    time: '',
    duration: '60',
    players: '1',
    extras: []
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{time: string, available: boolean}[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const platforms: Platform[] = [
    {
      id: 'ps5',
      name: 'PlayStation 5',
      description: 'Console dernière génération avec manettes DualSense et jeux 4K',
      price: 2000,
      available: 5,
      color: '#3a86ff'
    },
    {
      id: 'ps4',
      name: 'PlayStation 4',
      description: 'Console avec large bibliothèque de jeux et manettes DualShock',
      price: 1000,
      available: 8,
      color: '#4361ee'
    },
    {
      id: 'xbox',
      name: 'Xbox Series X',
      description: 'Console puissante avec Game Pass et performances optimales',
      price: 2000,
      available: 4,
      color: '#38b000'
    },
    {
      id: 'vr',
      name: 'Réalité Virtuelle',
      description: 'Expérience immersive avec casque VR dernière génération',
      price: 5000,
      available: 2,
      color: '#ff006e'
    }
  ];

  const durations = [
    { id: '30', label: '30 minutes', price: 0.5 },
    { id: '60', label: '1 heure', price: 1 },
    { id: '90', label: '1 heure 30', price: 1.5 },
    { id: '120', label: '2 heures', price: 2 },
    { id: '180', label: '3 heures', price: 3 },
  ];

  const extraOptions = [
    { id: 'snacks', label: 'Pack Snacks', price: 2000, description: 'Chips, pop-corn, et biscuits' },
    { id: 'drinks', label: 'Pack Boissons', price: 1500, description: 'Sodas, eau et jus de fruits' },
    { id: 'premium', label: 'Manettes Premium', price: 1000, description: 'Manettes pro avec grip amélioré' },
    { id: 'private', label: 'Espace Privé', price: 5000, description: 'Zone réservée pour votre groupe' },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedPlatform) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedPlatform]);

  useEffect(() => {
    calculateTotalPrice();
  }, [bookingForm]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('gaming_sessions')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform sessions into calendar events
      const calendarEvents = data.map(session => {
        const platform = platforms.find(p => p.id === session.platform);
        return {
          id: session.id,
          title: `${platform?.name || session.platform} - ${session.status === 'booked' ? 'Réservé' : 'Disponible'}`,
          start: session.start_time,
          end: session.end_time,
          backgroundColor: platform?.color || '#3788d8',
          borderColor: platform?.color || '#3788d8',
          textColor: '#ffffff',
          extendedProps: {
            platform: session.platform,
            status: session.status,
            userId: session.user_id
          }
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Une erreur est survenue lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const clickedDate = new Date(info.date);
    const now = new Date();
    
    // Prevent booking in the past
    if (clickedDate < now) {
      alert('Impossible de réserver une date passée');
      return;
    }
    
    setSelectedDate(clickedDate);
    setBookingForm({
      ...bookingForm,
      date: format(clickedDate, 'yyyy-MM-dd'),
      time: '',
      platform: ''
    });
    setSelectedPlatform('');
    setShowBookingModal(true);
  };

  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    navigate(`/sessions/${eventId}`);
  };

  const generateTimeSlots = async () => {
    if (!selectedDate || !selectedPlatform) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      // Fetch existing bookings for the selected date and platform
      const { data: existingBookings, error } = await supabase
        .from('gaming_sessions')
        .select('start_time, end_time')
        .eq('platform', selectedPlatform)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`);
      
      if (error) {
        throw error;
      }
      
      // Generate time slots from 10:00 to 22:00 with 30-minute intervals
      const slots = [];
      const openingTime = 10; // 10:00
      const closingTime = 22; // 22:00
      
      for (let hour = openingTime; hour < closingTime; hour++) {
        for (let minute of [0, 30]) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if this time slot overlaps with any existing booking
          const slotStart = new Date(`${dateStr}T${timeStr}:00`);
          
          // Check if slot is available (not overlapping with existing bookings)
          const isAvailable = !existingBookings.some(booking => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            return slotStart >= bookingStart && slotStart < bookingEnd;
          });
          
          slots.push({
            time: timeStr,
            available: isAvailable
          });
        }
      }
      
      setAvailableTimeSlots(slots);
    } catch (err) {
      console.error('Error generating time slots:', err);
      setError('Une erreur est survenue lors du chargement des créneaux disponibles');
    }
  };

  const calculateTotalPrice = () => {
    let price = 0;
    
    // Platform price
    const selectedPlatformObj = platforms.find(p => p.id === bookingForm.platform);
    if (selectedPlatformObj && bookingForm.duration) {
      const durationMultiplier = durations.find(d => d.id === bookingForm.duration)?.price || 0;
      price += selectedPlatformObj.price * durationMultiplier;
    }
    
    // Extras
    bookingForm.extras.forEach(extraId => {
      const extra = extraOptions.find(e => e.id === extraId);
      if (extra) {
        price += extra.price;
      }
    });
    
    // Additional players (first player is included in base price)
    const additionalPlayers = parseInt(bookingForm.players) - 1;
    if (additionalPlayers > 0) {
      price += additionalPlayers * 500; // 500 FCFA per additional player
    }
    
    setTotalPrice(price);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!bookingForm.platform || !bookingForm.date || !bookingForm.time || !bookingForm.duration) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const startTime = `${bookingForm.date}T${bookingForm.time}:00`;
      const durationMinutes = parseInt(bookingForm.duration);
      const endTime = format(
        addMinutes(new Date(startTime), durationMinutes),
        "yyyy-MM-dd'T'HH:mm:ss"
      );
      
      // Create the gaming session
      const { data, error } = await supabase
        .from('gaming_sessions')
        .insert({
          user_id: user.id,
          platform: bookingForm.platform,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: durationMinutes,
          status: 'booked',
          players_count: parseInt(bookingForm.players),
          extras: bookingForm.extras.length > 0 ? bookingForm.extras : null,
          total_price: totalPrice,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Success
      setBookingSuccess(true);
      
      // Refresh sessions
      fetchSessions();
      
      // Reset form after a delay
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setBookingForm({
          platform: '',
          date: '',
          time: '',
          duration: '60',
          players: '1',
          extras: []
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Une erreur est survenue lors de la création de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
    setSelectedDate(null);
    setSelectedPlatform('');
    setBookingForm({
      platform: '',
      date: '',
      time: '',
      duration: '60',
      players: '1',
      extras: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Calendrier des Sessions</h1>
          <p className="text-gray-400">
            Consultez les disponibilités et réservez votre session de jeu
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {platforms.map((platform) => (
              <div 
                key={platform.id}
                className="flex items-center space-x-2"
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: platform.color }}
                ></div>
                <span className="text-gray-300">{platform.name}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale="fr"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="10:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '10:00',
                endTime: '22:00',
              }}
              slotDuration="00:30:00"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
            />
          </div>
          
          <div className="mt-4 flex items-center space-x-2 text-gray-400">
            <Info className="h-5 w-5" />
            <p className="text-sm">Cliquez sur une date pour réserver une session, ou sur un événement pour voir les détails</p>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Réserver une Session
                    </h2>
                    <p className="text-gray-400">
                      {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {bookingSuccess ? (
                  <div className="bg-green-900 text-green-200 p-6 rounded-lg text-center">
                    <div className="bg-green-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-200" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Réservation Confirmée!</h3>
                    <p>Votre session a été réservée avec succès.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit}>
                    {/* Platform Selection */}
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2 text-lg flex items-center">
                        <Gamepad className="h-5 w-5 mr-2" />
                        Choisissez votre plateforme
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platforms.map((platform) => (
                          <div 
                            key={platform.id}
                            className={`bg-gray-700 p-4 rounded-lg cursor-pointer transition-all ${
                              bookingForm.platform === platform.id 
                                ? 'ring-2 ring-purple-500 transform scale-[1.02]' 
                                : 'hover:bg-gray-600'
                            }`}
                            onClick={() => {
                              setBookingForm({ ...bookingForm, platform: platform.id });
                              setSelectedPlatform(platform.id);
                            }}
                          >
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
                              {bookingForm.platform === platform.id && (
                                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                  Sélectionné
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Time Selection */}
                    {bookingForm.platform && (
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 text-lg flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Choisissez l'heure
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {availableTimeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              className={`py-2 px-3 rounded-lg text-center transition-colors ${
                                bookingForm.time === slot.time
                                  ? 'bg-purple-600 text-white'
                                  : slot.available
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={() => setBookingForm({ ...bookingForm, time: slot.time })}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Duration Selection */}
                    {bookingForm.time && (
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 text-lg flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Durée de la session
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {durations.map((duration) => (
                            <button
                              key={duration.id}
                              type="button"
                              className={`py-2 px-3 rounded-lg text-center transition-colors ${
                                bookingForm.duration === duration.id
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-700 text-white hover:bg-gray-600'
                              }`}
                              onClick={() => setBookingForm({ ...bookingForm, duration: duration.id })}
                            >
                              {duration.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Players Count */}
                    {bookingForm.duration && (
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2 text-lg flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Nombre de joueurs
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="bg-gray-700 text-white h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-gray-600"
                            onClick={() => {
                              const currentPlayers = parseInt(bookingForm.players);
                              if (currentPlayers > 1) {
                                setBookingForm({ ...bookingForm, players: (currentPlayers - 1).toString() });
                              }
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="4"
                            value={bookingForm.players}
                            onChange={(e) => setBookingForm({ ...bookingForm, players: e.target.value })}
                            className="w-16 bg-gray-700 text-white text-center py-2 border-x-0 border-y border-gray-600"
                            required
                          />
                          <button
                            type="button"
                            className="bg-gray-700 text-white h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-gray-600"
                            onClick={() => {
                              const currentPlayers = parseInt(bookingForm.players);
                              if (currentPlayers < 4) {
                                setBookingForm({ ...bookingForm, players: (currentPlayers + 1).toString() });
                              }
                            }}
                          >
                            +
                          </button>
                          <span className="ml-3 text-gray-400">
                            {parseInt(bookingForm.players) > 1 && '(+500 FCFA par joueur supplémentaire)'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Extras */}
                    {bookingForm.players && (
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-3 text-lg flex items-center">
                          <Coffee className="h-5 w-5 mr-2" />
                          Extras (optionnel)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {extraOptions.map((extra) => (
                            <div 
                              key={extra.id}
                              className={`p-3 rounded-lg cursor-pointer transition-all ${
                                bookingForm.extras.includes(extra.id)
                                  ? 'bg-purple-900 border border-purple-500'
                                  : 'bg-gray-700 border border-gray-700 hover:border-gray-500'
                              }`}
                              onClick={() => {
                                const newExtras = bookingForm.extras.includes(extra.id)
                                  ? bookingForm.extras.filter(id => id !== extra.id)
                                  : [...bookingForm.extras, extra.id];
                                setBookingForm({ ...bookingForm, extras: newExtras });
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
                    )}
                    
                    {/* Summary */}
                    <div className="bg-gray-700 p-4 rounded-lg mb-6">
                      <h3 className="text-white font-semibold mb-2">Récapitulatif</h3>
                      <div className="space-y-2">
                        {bookingForm.platform && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Plateforme:</span>
                            <span className="text-white">
                              {platforms.find(p => p.id === bookingForm.platform)?.name}
                            </span>
                          </div>
                        )}
                        {bookingForm.date && bookingForm.time && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Date et heure:</span>
                            <span className="text-white">
                              {format(new Date(`${bookingForm.date}T${bookingForm.time}`), 'dd/MM/yyyy à HH:mm')}
                            </span>
                          </div>
                        )}
                        {bookingForm.duration && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Durée:</span>
                            <span className="text-white">
                              {durations.find(d => d.id === bookingForm.duration)?.label}
                            </span>
                          </div>
                        )}
                        {bookingForm.players && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Joueurs:</span>
                            <span className="text-white">{bookingForm.players}</span>
                          </div>
                        )}
                        {bookingForm.extras.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Extras:</span>
                            <span className="text-white">
                              {bookingForm.extras.map(id => extraOptions.find(e => e.id === id)?.label).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-300">Total:</span>
                            <span className="text-purple-400 text-xl">{totalPrice} FCFA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center ${
                          submitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        disabled={submitting || !bookingForm.platform || !bookingForm.time || !bookingForm.duration}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-5 w-5 mr-2" />
                            Confirmer la réservation
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCalendar;