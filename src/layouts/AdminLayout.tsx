import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Settings, 
  Package, 
  ShoppingBag, 
  Calendar, 
  Home,
  Users,
  BarChart2,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/admin', label: 'Tableau de bord', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/admin/products', label: 'Produits', icon: <Package className="h-5 w-5" /> },
    { path: '/admin/orders', label: 'Commandes', icon: <ShoppingBag className="h-5 w-5" /> },
  ];

  const userMenuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <User className="h-5 w-5" /> },
    { path: '/sessions', label: 'Sessions de jeu', icon: <Calendar className="h-5 w-5" /> },
    { path: '/orders', label: 'Commandes', icon: <ShoppingBag className="h-5 w-5" /> },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#00c2cb] rounded-full flex items-center justify-center">
              <img 
                src="https://i.ibb.co/Qj1bBwL/joystick-jungle-logo.png" 
                alt="Joystick Jungle" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Joystick Jungle
            </span>
          </div>
          <button 
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="py-4">
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400">
            Menu
          </div>
          <nav className="mt-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${
                  location.pathname === item.path ? 'bg-gray-700 text-white' : ''
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="px-4 py-2 mt-6 text-xs uppercase tracking-wider text-gray-400">
            Navigation
          </div>
          <nav className="mt-2">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Home className="h-5 w-5" />
              <span className="ml-3">Site public</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-gray-700">
          <div className="px-4 py-4">
            <div className="relative">
              <button
                className="flex items-center w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? 'Administrateur' : 'Utilisateur'}</p>
                </div>
                {userMenuOpen ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-md shadow-lg py-1">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="bg-gray-800 shadow-md">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              className="text-gray-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;