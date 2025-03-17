import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { getItemsCount } = useCart();
  const location = useLocation();
  const [itemCount, setItemCount] = useState(0);

  // Update cart count whenever it changes
  useEffect(() => {
    setItemCount(getItemsCount());
  }, [getItemsCount]);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À Propos', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Événements', path: '/events' },
    { name: 'Boutique', path: '/shop' },
    { name: 'Tarifs', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
            <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden">
             <img 
                src="/image/logo2.png"
                 alt="Joystick Jungle" 
               className="h-full w-full object-contain"
            />
            </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Joystick Jungle
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path ? 'text-white bg-gray-800' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Cart Icon with Badge */}
              <Link
                to="/cart"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              
              {/* User Menu or Login */}
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
              )}
              
              <Link
                to="/booking"
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Réserver
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Cart Icon with Badge for Mobile */}
            <Link
              to="/cart"
              className="text-gray-300 hover:text-white rounded-md transition-colors relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path ? 'text-white bg-gray-800' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* User Menu or Login for Mobile */}
            {user ? (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Mon Compte
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            )}
            
            <Link
              to="/booking"
              className="bg-purple-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700"
              onClick={() => setIsOpen(false)}
            >
              Réserver
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;