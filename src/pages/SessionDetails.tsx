import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Gamepad, CreditCard, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface GamingSession {
  id: string;
  user_id: string;
  platform: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  players_count: number;
  extras: string[] | null;
  total_price: number;
  created_at: string;
  updated_at: string | null;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
}

const SessionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<GamingSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSessionDetails();
    }
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('gaming_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError) {
        throw sessionError;
      }

      setSession(sessionData);

      // Check if user is authorized to view this session
      if (user?.id !== sessionData.user_id && !isAdmin) {
        navigate('/sessions');
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', sessionData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        setUserProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Une erreur est survenue lors du chargement des détails de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async () => {
    if (!session) return;
    
    try {
      setCancelling(true);
      
      // Update session status to cancelled
      const { error } = await supabase
        .from('gaming_sessions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSession({
        ...session,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      });
      
      setCancelSuccess(true);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error cancelling session:', err);
      setError('Une erreur est survenue lors de l\'annulation de la session');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (err) {
      return dateTimeStr;
    }
  };

  const getPlatformName = (platformId: string) => {
    switch (platformId) {
      case 'ps5': return 'PlayStation 5';
      case 'ps4': return 'PlayStation 4';
      case 'xbox': return 'Xbox Series X';
      case 'vr': return 'Réalité Virtuelle';
      default: return platformId;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">Réservé</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm">En attente</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">Terminé</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-sm">Annulé</span>;
      default:
        return <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">{status}</span>;
    }
  };

  const getExtraName = (extraId: string) => {
    switch (extraId) {
      case 'snacks': return 'Pack Snacks';
      case 'drinks': return 'Pack Boissons';
      case 'premium': return 'Manettes Premium';
      case 'private': return 'Espace Privé';
      default: return extraId;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Session non trouvée</h2>
            <p className="text-gray-400 mb-6">La session que vous recherchez n'existe pas ou a été supprimée.</p>
            <Link
              to="/sessions"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au calendrier
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = session.status === 'booked' && new Date(session.start_time) > new Date();

  return (
    <div className="min-h-screen bg-gray-900 py-16">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/sessions"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Détails de la Session</h1>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Gamepad className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-semibold text-white">
                  {getPlatformName(session.platform)}
                </h2>
                {getStatusBadge(session.status)}
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {session.total_price} FCFA
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                  Date et heure
                </h3>
                <p className="text-gray-300">
                  <span className="text-gray-400">Début:</span> {formatDateTime(session.start_time)}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Fin:</span> {formatDateTime(session.end_time)}
                </p>
                <p className="text-gray-300 mt-2">
                  <span className="text-gray-400">Durée:</span> {session.duration_minutes} minutes
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-400" />
                  Détails
                </h3>
                <p className="text-gray-300">
                  <span className="text-gray-400">Nombre de joueurs:</span> {session.players_count}
                </p>
                {session.extras && session.extras.length > 0 && (
                  <div className="mt-2">
                    <p className="text-gray-400">Extras:</p>
                    <ul className="list-disc list-inside text-gray-300 pl-2">
                      {session.extras.map((extra, index) => (
                        <li key={index}>{getExtraName(extra)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {userProfile && (
              <div className="bg-gray-700 p-4 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Nom:</span> {userProfile.first_name} {userProfile.last_name}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email:</span> {userProfile.email}
                  </p>
                  {userProfile.phone && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Téléphone:</span> {userProfile.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                <p>Réservation créée le {formatDateTime(session.created_at)}</p>
                {session.updated_at && (
                  <p>Dernière mise à jour le {formatDateTime(session.updated_at)}</p>
                )}
              </div>
              
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <X className="h-5 w-5 mr-2" />
                  Annuler la réservation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full"
          >
            <div className="p-6">
              {cancelSuccess ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Réservation annulée</h3>
                  <p className="text-gray-300 mb-6">
                    Votre réservation a été annulée avec succès.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Confirmer l'annulation</h3>
                    <p className="text-gray-300">
                      Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={cancelling}
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleCancelSession}
                      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center ${
                        cancelling ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 mr-2" />
                          Confirmer l'annulation
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails;