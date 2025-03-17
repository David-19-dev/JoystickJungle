import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // Register the user with Supabase Auth
      const { error, user } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('email already registered')) {
          setError('Cet email est déjà utilisé');
        } else {
          setError(error.message || 'Une erreur est survenue lors de l\'inscription');
        }
        return;
      }
      
      if (user) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (existingProfile) {
            // Profile exists, just update it
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          } else {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }
        } catch (profileError) {
          console.error('Error handling profile:', profileError);
        }
        
        setSuccess('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Créer un compte</h1>
          <p className="text-gray-300">
            Rejoignez Joystick Jungle et profitez de nos services
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg p-8 shadow-lg"
        >
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-gray-300 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Prénom *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Prénom"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-gray-300 mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Nom *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Nom"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-300 mb-2 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="77 123 45 67"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-300 mb-2 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Mot de passe *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                J'accepte les{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  conditions d'utilisation
                </a>
              </label>
            </div>
            
            <button
              type="submit"
              className={`w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Inscription en cours...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Créer un compte
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Vous avez déjà un compte?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;