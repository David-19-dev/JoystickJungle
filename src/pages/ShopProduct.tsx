import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Tag, Package, AlertCircle, Check } from 'lucide-react';
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

const ShopProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProduct(data);
        fetchRelatedProducts(data.category, data.id);
        
        // Check if product is already in cart
        if (isInCart(data.id)) {
          setAddedToCart(true);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Une erreur est survenue lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .limit(4);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRelatedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (product) {
      // Ensure quantity is between 1 and available stock
      const newQuantity = Math.max(1, Math.min(value, product.stock));
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock
      });
      setAddedToCart(true);
      
      // Reset after a short delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Produit non trouvé</h2>
            <p className="text-gray-400 mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la boutique
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="rounded-lg overflow-hidden bg-gray-700">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-96"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-500" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">
                    {product.category}
                  </span>
                  
                  {product.stock <= 0 ? (
                    <span className="ml-2 bg-red-900 text-red-200 text-xs px-2 py-1 rounded">
                      Rupture de stock
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="ml-2 bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded">
                      Stock limité: {product.stock} restant(s)
                    </span>
                  ) : (
                    <span className="ml-2 bg-green-900 text-green-200 text-xs px-2 py-1 rounded">
                      En stock: {product.stock} disponible(s)
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                <p className="text-2xl font-bold text-purple-400 mb-4">{formatPrice(product.price)}</p>
                
                {product.description && (
                  <div className="text-gray-300 mb-6">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Quantité</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || product.stock <= 0}
                    className="bg-gray-700 text-white h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 bg-gray-700 text-white text-center py-2 border-x-0 border-y border-gray-600"
                    disabled={product.stock <= 0}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    className="bg-gray-700 text-white h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isInCart(product.id)}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
                    product.stock <= 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : isInCart(product.id)
                        ? 'bg-green-700 text-white'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {product.stock <= 0 ? (
                    <>
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Indisponible
                    </>
                  ) : isInCart(product.id) ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Déjà dans le panier
                    </>
                  ) : addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Ajouté au panier!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Ajouter au panier
                    </>
                  )}
                </button>
                
                <Link
                  to="/cart"
                  className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center"
                >
                  Voir le panier
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <Link to={`/shop/product/${relatedProduct.id}`}>
                    <div className="h-40 overflow-hidden">
                      {relatedProduct.image_url ? (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{relatedProduct.name}</h3>
                      <p className="text-purple-400 font-bold">{formatPrice(relatedProduct.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProduct;