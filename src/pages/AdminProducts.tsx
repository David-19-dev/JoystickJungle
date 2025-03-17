import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, Edit, Trash, Plus, Search, Filter, AlertCircle, 
  Save, X, Upload, RefreshCw, ArrowLeft, CheckCircle, 
  BarChart2, ShoppingBag, Tag, Layers
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string | null;
}

interface EditableProduct extends Product {
  isEditing: boolean;
  isNew: boolean;
}

interface CategoryStats {
  category: string;
  count: number;
  totalValue: number;
}

const AdminProducts = () => {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EditableProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<EditableProduct | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'stats'>('products');
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

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

  useEffect(() => {
    if (products.length > 0) {
      calculateStats();
    }
  }, [products]);

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
        const productsWithEditState = data.map(product => ({
          ...product,
          isEditing: false,
          isNew: false
        }));
        
        setProducts(productsWithEditState);
        
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

  const calculateStats = () => {
    // Calculate category statistics
    const catStats: Record<string, CategoryStats> = {};
    let totalValue = 0;
    let lowStock: Product[] = [];
    
    products.forEach(product => {
      // Calculate total inventory value
      const productValue = product.price * product.stock;
      totalValue += productValue;
      
      // Track low stock products (less than or equal to 5)
      if (product.stock <= 5 && product.stock > 0) {
        lowStock.push(product);
      }
      
      // Calculate category stats
      if (!catStats[product.category]) {
        catStats[product.category] = {
          category: product.category,
          count: 0,
          totalValue: 0
        };
      }
      
      catStats[product.category].count += 1;
      catStats[product.category].totalValue += productValue;
    });
    
    setCategoryStats(Object.values(catStats));
    setLowStockProducts(lowStock);
    setTotalInventoryValue(totalValue);
    setProductCount(products.length);
  };

  const handleEditProduct = (productId: string) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, isEditing: true } 
          : product
      )
    );
  };

  const handleCancelEdit = (productId: string) => {
    if (newProduct && newProduct.id === productId) {
      setNewProduct(null);
      return;
    }
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, isEditing: false } 
          : product
      )
    );
  };

  const handleInputChange = (productId: string, field: keyof Product, value: string | number) => {
    if (newProduct && newProduct.id === productId) {
      setNewProduct(prev => prev ? { ...prev, [field]: value } : null);
      return;
    }
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, [field]: value } 
          : product
      )
    );
  };

  const handleSaveProduct = async (productId: string) => {
    try {
      setProcessingId(productId);
      setError(null);
      
      let productToSave: EditableProduct;
      
      if (newProduct && newProduct.id === productId) {
        productToSave = newProduct;
      } else {
        productToSave = products.find(p => p.id === productId)!;
      }
      
      if (!productToSave) {
        throw new Error('Product not found');
      }
      
      // Validate product data
      if (!productToSave.name || !productToSave.category || productToSave.price <= 0) {
        setError('Veuillez remplir tous les champs obligatoires (nom, catégorie, prix)');
        return;
      }
      
      const { id, isEditing, isNew, ...productData } = productToSave;
      
      let result;
      
      if (isNew) {
        // Create new product
        result = await supabase
          .from('products')
          .insert({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      } else {
        // Update existing product
        result = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      if (isNew) {
        // Add the new product to the list
        setProducts(prevProducts => [
          ...prevProducts,
          { ...result.data, isEditing: false, isNew: false }
        ]);
        setNewProduct(null);
        setSuccessMessage('Produit ajouté avec succès');
      } else {
        // Update the product in the list
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id 
              ? { ...result.data, isEditing: false, isNew: false } 
              : product
          )
        );
        setSuccessMessage('Produit mis à jour avec succès');
      }
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Une erreur est survenue lors de l\'enregistrement du produit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }
    
    try {
      setProcessingId(productId);
      setError(null);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        throw error;
      }
      
      // Remove the product from the list
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      setSuccessMessage('Produit supprimé avec succès');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Une erreur est survenue lors de la suppression du produit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddNewProduct = () => {
    const newId = `new-${Date.now()}`;
    const newProductData: EditableProduct = {
      id: newId,
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: categories.length > 0 ? categories[0] : '',
      stock: 0,
      created_at: new Date().toISOString(),
      updated_at: null,
      isEditing: true,
      isNew: true
    };
    
    setNewProduct(newProductData);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const handleBulkStockUpdate = async (increase: boolean) => {
    if (!activeCategory || activeCategory === 'all') {
      setError('Veuillez sélectionner une catégorie spécifique pour mettre à jour le stock');
      return;
    }
    
    const amount = parseInt(prompt(`Entrez la quantité à ${increase ? 'ajouter' : 'retirer'} du stock pour tous les produits de la catégorie "${activeCategory}":`) || '0');
    
    if (isNaN(amount) || amount <= 0) {
      setError('Veuillez entrer un nombre valide supérieur à 0');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get products in the selected category
      const categoryProducts = products.filter(p => p.category === activeCategory);
      
      // Update each product
      for (const product of categoryProducts) {
        const newStock = increase 
          ? product.stock + amount 
          : Math.max(0, product.stock - amount);
        
        const { error } = await supabase
          .from('products')
          .update({
            stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);
        
        if (error) {
          throw error;
        }
      }
      
      // Refresh products
      await fetchProducts();
      
      setSuccessMessage(`Stock ${increase ? 'augmenté' : 'diminué'} de ${amount} unités pour tous les produits de la catégorie "${activeCategory}"`);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Une erreur est survenue lors de la mise à jour du stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900 text-red-200 p-8 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-red-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
            <p className="mb-4">Vous n'avez pas les droits d'accès à cette page.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des produits</h1>
            <p className="text-gray-400">
              Ajoutez, modifiez ou supprimez des produits de la boutique
            </p>
          </div>
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-6 flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'products' 
                ? 'text-purple-500 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="inline-block mr-2 h-5 w-5" />
            Produits
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'stats' 
                ? 'text-purple-500 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart2 className="inline-block mr-2 h-5 w-5" />
            Statistiques
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
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
                
                <div className="flex gap-2">
                  {activeCategory !== 'all' && (
                    <>
                      <button
                        onClick={() => handleBulkStockUpdate(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter au stock
                      </button>
                      <button
                        onClick={() => handleBulkStockUpdate(false)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Retirer du stock
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleAddNewProduct}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={!!newProduct}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter un produit
                  </button>
                </div>
              </div>
            </div>

            {/* New Product Form */}
            {newProduct && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Nouveau produit</h2>
                  <button
                    onClick={() => handleCancelEdit(newProduct.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => handleInputChange(newProduct.id, 'name', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                      placeholder="Nom du produit"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Catégorie *</label>
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={(e) => handleInputChange(newProduct.id, 'category', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                      placeholder="Catégorie"
                      required
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Prix (FCFA) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => handleInputChange(newProduct.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                      placeholder="Prix"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Stock *</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => handleInputChange(newProduct.id, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                      placeholder="Quantité en stock"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">URL de l'image</label>
                    <input
                      type="text"
                      value={newProduct.image_url || ''}
                      onChange={(e) => handleInputChange(newProduct.id, 'image_url', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newProduct.description || ''}
                      onChange={(e) => handleInputChange(newProduct.id, 'description', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 h-32"
                      placeholder="Description du produit"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleCancelEdit(newProduct.id)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleSaveProduct(newProduct.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={processingId === newProduct.id}
                  >
                    {processingId === newProduct.id ? (
                      <>
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
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
              </motion.div>
            )}

            {/* Products Table */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-400">
                  {searchQuery || activeCategory !== 'all' 
                    ? 'Aucun produit ne correspond à vos critères de recherche.' 
                    : 'Aucun produit n\'a été ajouté à la boutique.'}
                </p>
                {(searchQuery || activeCategory !== 'all') && (
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
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Produit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Prix
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        {product.isEditing ? (
                          // Edit mode
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleInputChange(product.id, 'name', e.target.value)}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-1"
                                placeholder="Nom du produit"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={product.category}
                                onChange={(e) => handleInputChange(product.id, 'category', e.target.value)}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-1"
                                placeholder="Catégorie"
                                list="categories"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={product.price}
                                onChange={(e) => handleInputChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-1"
                                placeholder="Prix"
                                min="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={product.stock}
                                onChange={(e) => handleInputChange(product.id, 'stock', parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-1"
                                placeholder="Stock"
                                min="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleCancelEdit(product.id)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleSaveProduct(product.id)}
                                  className="text-green-400 hover:text-green-300"
                                  disabled={processingId === product.id}
                                >
                                  {processingId === product.id ? (
                                    <RefreshCw className="animate-spin h-5 w-5" />
                                  ) : (
                                    <Save className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View mode
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-lg overflow-hidden">
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="h-10 w-10 object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{product.name}</div>
                                  {product.description && (
                                    <div className="text-sm text-gray-400 truncate max-w-xs">{product.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">{product.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-purple-400">{formatPrice(product.price)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                product.stock <= 0 ? 'text-red-400' :
                                product.stock <= 5 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {product.stock}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product.id)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-400 hover:text-red-300"
                                  disabled={processingId === product.id}
                                >
                                  {processingId === product.id ? (
                                    <RefreshCw className="animate-spin h-5 w-5" />
                                  ) : (
                                    <Trash className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          // Statistics Tab
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-900 rounded-full mr-4">
                    <Package className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Total des produits</h3>
                    <p className="text-white text-2xl font-bold">{productCount}</p>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {categories.length} catégories différentes
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-900 rounded-full mr-4">
                    <ShoppingBag className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Valeur du stock</h3>
                    <p className="text-white text-2xl font-bold">{formatPrice(totalInventoryValue)}</p>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  Valeur totale de l'inventaire
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-yellow-900 rounded-full mr-4">
                    <AlertCircle className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Stock faible</h3>
                    <p className="text-white text-2xl font-bold">{lowStockProducts.length}</p>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  Produits avec un stock ≤ 5
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-900 rounded-full mr-4">
                    <Tag className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Catégories</h3>
                    <p className="text-white text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  Nombre de catégories
                </div>
              </div>
            </div>
            
            {/* Low Stock Products */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                Produits à réapprovisionner
              </h3>
              
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-400">Tous les produits ont un stock suffisant.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Produit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Stock actuel
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-lg overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{product.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-yellow-400">{product.stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Category Statistics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-purple-400" />
                Statistiques par catégorie
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Nombre de produits
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Valeur du stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {categoryStats.map((stat) => (
                      <tr key={stat.category}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{stat.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{stat.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-400">{formatPrice(stat.totalValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setActiveCategory(stat.category)}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                          >
                            <Filter className="h-4 w-4 mr-1" />
                            Filtrer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;