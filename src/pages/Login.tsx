import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error details:', error);
        setError('Identifiants incorrects. Veuillez réessayer.');
        return;
      }
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Login error:', err);
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
          <h1 className="text-3xl font-bold text-white mb-4">Connexion</h1>
          <p className="text-gray-300">
            Connectez-vous pour accéder à votre compte
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
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-300 mb-2 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Mot de passe oublié?
                </a>
              </div>
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
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Vous n'avez pas de compte?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300">
                Créer un compte
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <Link
              to="/admin-setup"
              className="inline-flex items-center text-purple-400 hover:text-purple-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Configuration administrateur
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;