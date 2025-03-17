import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CreditCard, User, Settings, LogOut, Gamepad, Trophy, Star, AlertCircle, Save, Eye, EyeOff, Lock, Mail, Phone, Cake, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  birth_date: string | null;
}

interface Subscription {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  remaining_minutes: number;
  status: string;
}

interface GamingSession {
  id: string;
  platform: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  players_count: number;
  total_price: number;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'subscriptions' | 'settings'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<GamingSession[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Settings form states
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditedProfile({...profile});
    }
  }, [profile]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile - use maybeSingle to avoid errors if profile doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, birth_date')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // If profile exists, set it
      if (profileData) {
        setProfile(profileData);
      } else if (user) {
        // If profile doesn't exist but we have a user, create a basic profile
        console.log('Creating profile for user:', user.id);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'user',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          // If there's a duplicate key error, try to fetch the profile again
          if (insertError.code === '23505') {
            console.log('Profile already exists, fetching again');
            const { data: retryData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone, birth_date')
              .eq('id', user.id)
              .maybeSingle();
              
            if (retryData) {
              setProfile(retryData);
            } else {
              console.error('Still could not fetch profile after retry');
            }
          } else {
            console.error('Error creating profile:', insertError);
          }
        } else {
          // Profile created, set basic profile
          setProfile({
            first_name: null,
            last_name: null,
            email: user.email || '',
            phone: null,
            birth_date: null
          });
        }
      }

      // Fetch user gaming sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('gaming_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });

      if (sessionsError) {
        throw sessionsError;
      }

      setSessions(sessionsData || []);

      // Fetch user subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: false });

      if (subscriptionsError) {
        throw subscriptionsError;
      }

      setSubscriptions(subscriptionsData || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Une erreur est survenue lors du chargement de vos données');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile || !user) return;
    
    try {
      setSavingProfile(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          birth_date: editedProfile.birth_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setProfile(editedProfile);
      setEditMode(false);
      setSuccess('Profil mis à jour avec succès');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    try {
      setSavingPassword(true);
      setError(null);
      setSuccess(null);
      
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }
      
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Mot de passe mis à jour avec succès');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (err) {
      return dateTimeStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: fr });
    } catch (err) {
      return dateStr;
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

  const getSubscriptionTypeName = (type: string) => {
    switch (type) {
      case 'basic': return 'Basic';
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      case 'vip': return 'VIP';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Actif</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">En attente</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">Terminé</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Annulé</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">Expiré</span>;
      default:
        return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{status}</span>;
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400">
            Bienvenue, {profile?.first_name || 'Joueur'} ! Gérez vos sessions et abonnements.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-6 flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Mon profil</span>
              </button>
              
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'sessions' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Mes sessions</span>
              </button>
              
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'subscriptions' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Star className="h-5 w-5" />
                <span>Mes abonnements</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700">
              <Link
                to="/sessions"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Gamepad className="h-5 w-5" />
                <span>Réserver une session</span>
              </Link>
              
              <Link
                to="/subscription-registration"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Trophy className="h-5 w-5" />
                <span>Souscrire un abonnement</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Nom complet</p>
                    <p className="text-white font-medium">
                      {profile?.first_name || ''} {profile?.last_name || ''}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{profile?.email || ''}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <p className="text-white font-medium">{profile?.phone || 'Non renseigné'}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Date de naissance</p>
                    <p className="text-white font-medium">
                      {profile?.birth_date ? formatDate(profile.birth_date) : 'Non renseignée'}
                    </p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Membre depuis</p>
                    <p className="text-white font-medium">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Statistiques</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-900 p-3 rounded-full">
                          <Gamepad className="h-6 w-6 text-purple-300" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Sessions totales</p>
                          <p className="text-white text-xl font-semibold">{sessions.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-900 p-3 rounded-full">
                          <Clock className="h-6 w-6 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Heures de jeu</p>
                          <p className="text-white text-xl font-semibold">
                            {Math.round(sessions.reduce((total, session) => total + session.duration_minutes, 0) / 60)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-900 p-3 rounded-full">
                          <CreditCard className="h-6 w-6 text-green-300" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Abonnements actifs</p>
                          <p className="text-white text-xl font-semibold">
                            {subscriptions.filter(sub => sub.status === 'active').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Mes sessions de jeu</h2>
                  <Link
                    to="/sessions"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Nouvelle réservation</span>
                  </Link>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <Gamepad className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Vous n'avez pas encore de sessions de jeu</p>
                    <Link
                      to="/sessions"
                      className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Réserver votre première session
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Gamepad className="h-5 w-5 text-purple-400" />
                              <h3 className="text-white font-medium">{getPlatformName(session.platform)}</h3>
                              {getStatusBadge(session.status)}
                            </div>
                            <p className="text-gray-400 text-sm">
                              {formatDateTime(session.start_time)} - {session.duration_minutes} minutes
                            </p>
                            <p className="text-gray-400 text-sm">
                              {session.players_count} joueur{session.players_count > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="mt-3 md:mt-0 flex items-center space-x-3">
                            <p className="text-white font-medium">{session.total_price} FCFA</p>
                            <Link
                              to={`/sessions/${session.id}`}
                              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors text-sm"
                            >
                              Détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'subscriptions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Mes abonnements</h2>
                  <Link
                    to="/subscription-registration"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Nouvel abonnement</span>
                  </Link>
                </div>
                
                {subscriptions.length === 0 ? (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <Star className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Vous n'avez pas encore d'abonnement</p>
                    <Link
                      to="/subscription-registration"
                      className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Souscrire à un abonnement
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="h-5 w-5 text-yellow-400" />
                              <h3 className="text-white font-medium">
                                Abonnement {getSubscriptionTypeName(subscription.type)}
                              </h3>
                              {getStatusBadge(subscription.status)}
                            </div>
                            <p className="text-gray-300 text-sm">
                              Valide du {formatDate(subscription.start_date)} au {formatDate(subscription.end_date)}
                            </p>
                            <p className="text-gray-300 text-sm">
                              Temps restant: {Math.floor(subscription.remaining_minutes / 60)}h {subscription.remaining_minutes % 60}min
                            </p>
                          </div>
                          <div className="mt-3 md:mt-0 flex items-center">
                            <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors text-sm">
                              Détails
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Paramètres du compte</h2>
                </div>

                {/* Profile Settings */}
                <div className="bg-gray-700 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                    {!editMode ? (
                      <button 
                        onClick={() => setEditMode(true)}
                        className="flex items-center space-x-2 text-purple-400 hover:text-purple-300"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Modifier</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditMode(false);
                          setEditedProfile(profile);
                        }}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                        <span>Annuler</span>
                      </button>
                    )}
                  </div>

                  {editMode && editedProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Prénom</label>
                          <input
                            type="text"
                            value={editedProfile.first_name || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, first_name: e.target.value})}
                            className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Nom</label>
                          <input
                            type="text"
                            value={editedProfile.last_name || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, last_name: e.target.value})}
                            className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={editedProfile.email}
                          disabled
                          className="w-full bg-gray-600 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed"
                        />
                        <p className="text-gray-400 text-sm mt-1">L'email ne peut pas être modifié</p>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Téléphone</label>
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                          placeholder="Votre numéro de téléphone"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Date de naissance</label>
                        <input
                          type="date"
                          value={editedProfile.birth_date || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, birth_date: e.target.value})}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveProfile}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                          disabled={savingProfile}
                        >
                          {savingProfile ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5 mr-2" />
                              Enregistrer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Prénom</p>
                        <p className="text-white">{profile?.first_name || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Nom</p>
                        <p className="text-white">{profile?.last_name || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{profile?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Téléphone</p>
                        <p className="text-white">{profile?.phone || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Date de naissance</p>
                        <p className="text-white">
                          {profile?.birth_date ? formatDate(profile.birth_date) : 'Non renseignée'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Settings */}
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-6">Changer de mot de passe</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500"
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                          onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                        >
                          {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500"
                          placeholder="Votre nouveau mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                          onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                        >
                          {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500"
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                          onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                        >
                          {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        disabled={savingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      >
                        {savingPassword ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Lock className="h-5 w-5 mr-2" />
                            Changer le mot de passe
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-6">Sécurité du compte</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Déconnexion de tous les appareils</p>
                        <p className="text-gray-400 text-sm">Déconnectez-vous de tous les appareils où vous êtes connecté</p>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Déconnecter
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Supprimer mon compte</p>
                        <p className="text-gray-400 text-sm">Supprimer définitivement votre compte et toutes vos données</p>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;