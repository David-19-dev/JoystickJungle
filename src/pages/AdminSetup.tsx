import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Key, Lock, Mail, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signUp } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to admin page
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create user with Supabase Auth
      const { error: signUpError, user: newUser } = await signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (!newUser) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }
      
      // Set user role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', newUser.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess('Compte administrateur créé avec succès! Vous allez être redirigé vers la page d\'administration.');
      
      // Redirect to admin page after a delay
      setTimeout(() => {
        window.location.href = '/login'; // Use window.location for a full page reload
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating admin user:', err);
      setError(err.message || 'Une erreur est survenue lors de la création du compte administrateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16 flex items-center">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-8 shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">Configuration Administrateur</h1>
            <p className="text-gray-400 mt-2">
              Créez un compte administrateur pour gérer Joystick Jungle
            </p>
          </div>
          
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
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="admin@joystickjungle.sn"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-300 mb-2 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Mot de passe
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
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Confirmer le mot de passe
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
                  Création en cours...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Créer un compte administrateur
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Cette page est réservée à la configuration initiale. Une fois le compte administrateur créé, elle ne sera plus accessible.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSetup;