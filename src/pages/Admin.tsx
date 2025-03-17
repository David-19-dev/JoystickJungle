import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Mail, Calendar, Users, Trophy, Star, Filter, Search, RefreshCw, Package, ShoppingBag, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendConfirmationEmail } from '../services/emailService';

// Types for our data
interface Reservation {
  id: string;
  type: 'booking' | 'tournament' | 'subscription' | 'contact';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  details: Record<string, any>;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'booking' | 'tournament' | 'subscription' | 'contact'>('booking');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Mock data - in a real app, this would come from your database
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData: Reservation[] = [
        {
          id: 'book-001',
          type: 'booking',
          status: 'pending',
          date: '2025-05-15',
          firstName: 'Amadou',
          lastName: 'Diop',
          email: 'amadou.diop@example.com',
          phone: '+221 77 123 45 67',
          details: {
            platform: 'ps5',
            date: '2025-05-20',
            time: '14:00',
            duration: '120',
            players: '2',
            extras: ['snacks', 'drinks'],
            totalPrice: '7000 FCFA'
          }
        },
        {
          id: 'book-002',
          type: 'booking',
          status: 'approved',
          date: '2025-05-14',
          firstName: 'Fatou',
          lastName: 'Sow',
          email: 'fatou.sow@example.com',
          phone: '+221 76 987 65 43',
          details: {
            platform: 'xbox',
            date: '2025-05-18',
            time: '16:30',
            duration: '60',
            players: '1',
            extras: [],
            totalPrice: '2000 FCFA'
          }
        },
        {
          id: 'tourn-001',
          type: 'tournament',
          status: 'pending',
          date: '2025-05-13',
          firstName: 'Ousmane',
          lastName: 'Ndiaye',
          email: 'ousmane.ndiaye@example.com',
          phone: '+221 70 456 78 90',
          details: {
            tournament: 'fifa',
            platform: 'ps5',
            gamingName: 'SenegalGamer',
            experience: 'advanced'
          }
        },
        {
          id: 'sub-001',
          type: 'subscription',
          status: 'rejected',
          date: '2025-05-10',
          firstName: 'Aissatou',
          lastName: 'Ba',
          email: 'aissatou.ba@example.com',
          phone: '+221 78 234 56 78',
          details: {
            subscriptionType: 'premium',
            startDate: '2025-06-01',
            paymentMethod: 'wave'
          }
        },
        {
          id: 'contact-001',
          type: 'contact',
          status: 'pending',
          date: '2025-05-16',
          firstName: 'Moussa',
          lastName: 'Fall',
          email: 'moussa.fall@example.com',
          phone: '+221 75 345 67 89',
          details: {
            subject: 'Question sur les tournois',
            message: 'Bonjour, j\'aimerais savoir si vous organisez des tournois pour les enfants de 10-12 ans. Merci.'
          }
        }
      ];
      
      setReservations(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter reservations based on active tab, status filter, and search query
  useEffect(() => {
    let filtered = reservations.filter(res => res.type === activeTab);
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res => 
        res.firstName.toLowerCase().includes(query) || 
        res.lastName.toLowerCase().includes(query) || 
        res.email.toLowerCase().includes(query) ||
        res.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredReservations(filtered);
  }, [reservations, activeTab, statusFilter, searchQuery]);

  // Handle reservation approval
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;
      
      // In a real app, you would call your API to update the status
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send confirmation email
      if (reservation.type !== 'contact') {
        await sendConfirmationEmail({
          firstName: reservation.firstName,
          lastName: reservation.lastName,
          email: reservation.email,
          phone: reservation.phone,
          type: reservation.type,
          details: reservation.details
        });
      }
      
      // Update local state
      const updatedReservations = reservations.map(r => 
        r.id === id ? { ...r, status: 'approved' as const } : r
      );
      setReservations(updatedReservations);
      
      // Close modal if open
      if (showDetailsModal && selectedReservation?.id === id) {
        setSelectedReservation({ ...selectedReservation, status: 'approved' });
      }
    } catch (error) {
      console.error('Error approving reservation:', error);
      alert('Une erreur est survenue lors de l\'approbation.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reservation rejection
  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      // In a real app, you would call your API to update the status
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const updatedReservations = reservations.map(r => 
        r.id === id ? { ...r, status: 'rejected' as const } : r
      );
      setReservations(updatedReservations);
      
      // Close modal if open
      if (showDetailsModal && selectedReservation?.id === id) {
        setSelectedReservation({ ...selectedReservation, status: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      alert('Une erreur est survenue lors du rejet.');
    } finally {
      setProcessingId(null);
    }
  };

  // View reservation details
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  // Get icon based on reservation type
  const getTypeIcon = (type: Reservation['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'tournament':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'subscription':
        return <Star className="h-5 w-5 text-purple-500" />;
      case 'contact':
        return <Mail className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">En attente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Rejeté</span>;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render details based on reservation type
  const renderDetails = (reservation: Reservation) => {
    const { details, type } = reservation;
    
    switch (type) {
      case 'booking':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400">Plateforme</p>
                <p className="text-white font-medium">
                  {details.platform === 'ps5' ? 'PlayStation 5' : 
                   details.platform === 'ps4' ? 'PlayStation 4' : 
                   details.platform === 'xbox' ? 'Xbox Series X' : 
                   details.platform === 'vr' ? 'Réalité Virtuelle' : details.platform}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Date & Heure</p>
                <p className="text-white font-medium">{formatDate(details.date)} à {details.time}</p>
              </div>
              <div>
                <p className="text-gray-400">Durée</p>
                <p className="text-white font-medium">{details.duration} minutes</p>
              </div>
              <div>
                <p className="text-gray-400">Joueurs</p>
                <p className="text-white font-medium">{details.players}</p>
              </div>
            </div>
            
            {details.extras && details.extras.length > 0 && (
              <div>
                <p className="text-gray-400">Extras</p>
                <p className="text-white font-medium">
                  {details.extras.map((extra: string) => 
                    extra === 'snacks' ? 'Pack Snacks' : 
                    extra === 'drinks' ? 'Pack Boissons' : 
                    extra === 'premium' ? 'Manettes Premium' : 
                    extra === 'private' ? 'Espace Privé' : extra
                  ).join(', ')}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-gray-400">Prix Total</p>
              <p className="text-white font-medium text-xl">{details.totalPrice}</p>
            </div>
          </div>
        );
        
      case 'tournament':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400">Tournoi</p>
                <p className="text-white font-medium">
                  {details.tournament === 'fifa' ? 'Tournoi FIFA' : 
                   details.tournament === 'cod' ? 'Tournoi Call of Duty' : 
                   details.tournament === 'fortnite' ? 'Tournoi Fortnite' : details.tournament}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Plateforme</p>
                <p className="text-white font-medium">
                  {details.platform === 'ps5' ? 'PlayStation 5' : 
                   details.platform === 'ps4' ? 'PlayStation 4' : 
                   details.platform === 'xbox' ? 'Xbox Series X' : 
                   details.platform === 'pc' ? 'PC' : details.platform}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Pseudo Gaming</p>
                <p className="text-white font-medium">{details.gamingName}</p>
              </div>
              <div>
                <p className="text-gray-400">Niveau</p>
                <p className="text-white font-medium">
                  {details.experience === 'beginner' ? 'Débutant' : 
                   details.experience === 'intermediate' ? 'Intermédiaire' : 
                   details.experience === 'advanced' ? 'Avancé' : 
                   details.experience === 'pro' ? 'Professionnel' : details.experience}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'subscription':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400">Type d'abonnement</p>
                <p className="text-white font-medium">
                  {details.subscriptionType === 'basic' ? 'Basic' : 
                   details.subscriptionType === 'standard' ? 'Standard' : 
                   details.subscriptionType === 'premium' ? 'Premium' : 
                   details.subscriptionType === 'vip' ? 'VIP' : details.subscriptionType}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Date de début</p>
                <p className="text-white font-medium">{formatDate(details.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-400">Méthode de paiement</p>
                <p className="text-white font-medium">
                  {details.paymentMethod === 'wave' ? 'Wave' : 
                   details.paymentMethod === 'orange-money' ? 'Orange Money' : 
                   details.paymentMethod === 'cash' ? 'Espèces' : details.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'contact':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-gray-400">Sujet</p>
              <p className="text-white font-medium">{details.subject || 'Pas de sujet'}</p>
            </div>
            <div>
              <p className="text-gray-400">Message</p>
              <p className="text-white">{details.message}</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Administration
          </h1>
          <p className="text-xl text-gray-300">
            Gérez les réservations, inscriptions et demandes de contact
          </p>
        </motion.div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            to="/admin"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center mb-3">
              <Calendar className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Réservations</h3>
            </div>
            <p className="text-gray-400">Gérer les réservations et demandes</p>
          </Link>
          
          <Link
            to="/admin/products"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center mb-3">
              <Package className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Produits</h3>
            </div>
            <p className="text-gray-400">Gérer les produits et le stock</p>
          </Link>
          
          <Link
            to="/admin/orders"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center mb-3">
              <ShoppingBag className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Commandes</h3>
            </div>
            <p className="text-gray-400">Gérer les commandes clients</p>
          </Link>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <BarChart2 className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Statistiques</h3>
            </div>
            <p className="text-gray-400">Voir les statistiques de vente</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-700 mb-8">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'booking' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('booking')}
          >
            <Calendar className="inline-block mr-2 h-5 w-5" />
            Réservations
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'tournament' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('tournament')}
          >
            <Trophy className="inline-block mr-2 h-5 w-5" />
            Tournois
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'subscription' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('subscription')}
          >
            <Star className="inline-block mr-2 h-5 w-5" />
            Abonnements
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'contact' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('contact')}
          >
            <Mail className="inline-block mr-2 h-5 w-5" />
            Contacts
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-700 w-full md:w-64"
            />
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Chargement des données...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-300">Aucune donnée trouvée pour les critères sélectionnés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(reservation.type)}
                          <span className="ml-2 text-sm text-gray-300">{reservation.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(reservation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{reservation.firstName} {reservation.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{reservation.email}</div>
                        <div className="text-sm text-gray-400">{reservation.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(reservation)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(reservation.id)}
                                className="text-green-400 hover:text-green-300"
                                title="Approuver"
                                disabled={processingId === reservation.id}
                              >
                                {processingId === reservation.id ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleReject(reservation.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Rejeter"
                                disabled={processingId === reservation.id}
                              >
                                {processingId === reservation.id ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <X className="h-5 w-5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedReservation.type === 'booking' ? 'Détails de la réservation' :
                     selectedReservation.type === 'tournament' ? 'Détails de l\'inscription au tournoi' :
                     selectedReservation.type === 'subscription' ? 'Détails de l\'abonnement' :
                     'Détails du message'}
                  </h2>
                  <p className="text-gray-400">ID: {selectedReservation.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-400">Statut</p>
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                  <div>
                    <p className="text-gray-400">Date de soumission</p>
                    <p className="text-white">{formatDate(selectedReservation.date)}</p>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400">Nom complet</p>
                      <p className="text-white font-medium">{selectedReservation.firstName} {selectedReservation.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="text-white font-medium">{selectedReservation.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Téléphone</p>
                      <p className="text-white font-medium">{selectedReservation.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {selectedReservation.type === 'booking' ? 'Détails de la réservation' :
                     selectedReservation.type === 'tournament' ? 'Détails du tournoi' :
                     selectedReservation.type === 'subscription' ? 'Détails de l\'abonnement' :
                     'Message'}
                  </h3>
                  {renderDetails(selectedReservation)}
                </div>
              </div>
              
              {selectedReservation.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedReservation.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={processingId === selectedReservation.id}
                  >
                    {processingId === selectedReservation.id ? (
                      <>
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Approuver
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleReject(selectedReservation.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    disabled={processingId === selectedReservation.id}
                  >
                    {processingId === selectedReservation.id ? (
                      <>
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 mr-2" />
                        Rejeter
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {selectedReservation.status !== 'pending' && (
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;