import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter, Tag, Package, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on active category and search query
    let filtered = products;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, activeCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(product => product.category)));
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Une erreur est survenue lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
      category: product.category,
      stock: product.stock
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Notre Boutique</h1>
          <p className="text-xl text-gray-300">
            Découvrez notre sélection de produits gaming et accessoires
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Tous les produits
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    activeCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-400">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-lg overflow-hidden flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Stock Badge */}
                  {product.stock <= 0 ? (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-900 text-red-200 text-xs px-2 py-1 rounded">
                        Rupture de stock
                      </span>
                    </div>
                  ) : product.stock <= 5 ? (
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded">
                        Stock limité
                      </span>
                    </div>
                  ) : null}
                </div>
                
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                  <p className="text-purple-400 font-bold mb-2">{formatPrice(product.price)}</p>
                  {product.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  )}
                </div>
                
                <div className="p-4 pt-0 flex justify-between items-center">
                  <Link
                    to={`/shop/product/${product.id}`}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    Détails
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0 || isInCart(product.id)}
                    className={`px-3 py-1.5 rounded text-sm flex items-center ${
                      product.stock <= 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isInCart(product.id)
                          ? 'bg-green-700 text-white'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {isInCart(product.id) ? 'Ajouté' : 'Ajouter'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;