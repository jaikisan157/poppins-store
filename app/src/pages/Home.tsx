import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { ArrowRight, Truck, Shield, Clock, Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CATEGORIES = [
  { name: 'Electronics', icon: '⚡', gradient: 'from-blue-500/20 to-indigo-500/20' },
  { name: 'Fashion', icon: '👗', gradient: 'from-pink-500/20 to-rose-500/20' },
  { name: 'Home & Garden', icon: '🏡', gradient: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Beauty', icon: '✨', gradient: 'from-purple-500/20 to-fuchsia-500/20' },
  { name: 'Sports', icon: '⚽', gradient: 'from-orange-500/20 to-amber-500/20' },
  { name: 'Kids', icon: '🧸', gradient: 'from-yellow-500/20 to-lime-500/20' },
  { name: 'Stationery', icon: '📝', gradient: 'from-cyan-500/20 to-teal-500/20' },
  { name: 'Health', icon: '💊', gradient: 'from-red-500/20 to-pink-500/20' },
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images?.[0]?.url || 'https://placehold.co/400x400?text=Product';
  const discount = product.price.compareAt && product.price.compareAt > product.price.current
    ? Math.round(((product.price.compareAt - product.price.current) / product.price.compareAt) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
    } catch {
      // toast already handled in CartContext
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-cream-200 rounded-lg">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-sans font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{discount}%
          </div>
        )}

        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={handleAddToCart}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => e.preventDefault()}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          <Link
            to={`/product/${product._id}`}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            title="Quick View"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        {/* Add to Cart Bar */}
        <div className={`absolute bottom-0 inset-x-0 transition-all duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary/95 backdrop-blur text-white text-xs font-sans font-semibold tracking-[0.1em] uppercase py-3.5 hover:bg-primary transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] font-sans font-medium tracking-[0.1em] uppercase text-primary/70">
          {product.category}
        </p>
        <h3 className="font-serif text-base font-medium line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs font-sans text-muted-foreground line-clamp-1">
            {product.shortDescription}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <span className="font-sans font-bold text-lg text-foreground">
            ₹{product.price.current.toFixed(0)}
          </span>
          {product.price.compareAt && product.price.compareAt > product.price.current && (
            <>
              <span className="text-sm font-sans text-muted-foreground line-through">
                ₹{product.price.compareAt.toFixed(0)}
              </span>
              <span className="text-xs font-sans font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [allResp, featuredResp] = await Promise.allSettled([
        productsApi.getAll({ limit: 12 }),
        productsApi.getFeatured(),
      ]);

      if (allResp.status === 'fulfilled') {
        setAllProducts(allResp.value.data.products || []);
      }
      if (featuredResp.status === 'fulfilled') {
        setFeaturedProducts(featuredResp.value.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts;

  return (
    <div className="min-h-screen">
      {/* Hero Banner — Compact */}
      <section className="relative bg-gradient-to-br from-cream-200 via-cream-100 to-cream-200 py-14 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 animate-fade-in-up">
              <p className="text-xs font-sans font-semibold tracking-[0.25em] uppercase text-primary mb-4">
                ✦ New Arrivals
              </p>
              <h1 className="text-4xl lg:text-6xl font-serif font-normal leading-[1.1] mb-5 text-foreground">
                Discover Products{' '}
                <span className="lumina-accent">You'll Love</span>
              </h1>
              <p className="text-base font-sans text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Curated collections of trending products at the best prices.
                Free shipping on orders over ₹500.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-warm hover:-translate-y-0.5"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 border-2 border-foreground/20 px-8 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-lg hover:border-primary hover:text-primary transition-all duration-300"
                >
                  Browse All
                </Link>
              </div>
            </div>

            {/* Hero Product Preview */}
            {displayProducts.length > 0 && (
              <div className="flex-1 hidden lg:block">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                    {displayProducts.slice(0, 4).map((product, idx) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${idx === 0 ? 'row-span-2' : ''}`}
                      >
                        <div className={`${idx === 0 ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden`}>
                          <img
                            src={product.images?.[0]?.url || 'https://placehold.co/300x300?text=Product'}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                          <p className="text-white text-sm font-sans font-medium line-clamp-1">{product.name}</p>
                          <p className="text-white/80 text-sm font-sans font-bold">₹{product.price.current.toFixed(0)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 bg-white border-y border-border/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: Clock, title: 'Fast Delivery', desc: '5-10 business days' },
              { icon: Star, title: 'Quality Assured', desc: 'Satisfaction guaranteed' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold">{title}</h3>
                  <p className="text-xs font-sans text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14 bg-cream-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
                Browse
              </p>
              <h2 className="text-2xl lg:text-3xl font-serif font-normal text-foreground">
                Shop by Category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`group flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br ${cat.gradient} border border-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                <span className="text-xs font-sans font-semibold text-foreground text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
                Our Collection
              </p>
              <h2 className="text-2xl lg:text-3xl font-serif font-normal text-foreground">
                {featuredProducts.length > 0 ? 'Featured Products' : 'Latest Products'}
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-sans font-medium text-foreground hover:text-primary transition-colors group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-cream-300 rounded-lg" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-cream-300 rounded w-1/3" />
                    <div className="h-4 bg-cream-300 rounded w-3/4" />
                    <div className="h-4 bg-cream-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🛍️</p>
              <h3 className="text-xl font-serif text-foreground mb-2">No products yet</h3>
              <p className="text-sm font-sans text-muted-foreground mb-6">
                Products will appear here once they're added by the admin.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-sans font-semibold tracking-[0.1em] uppercase rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-sans font-medium text-primary"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-cream-200 to-primary/10">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-sans font-semibold tracking-[0.25em] uppercase text-primary mb-3">
            Don't miss out
          </p>
          <h2 className="text-3xl lg:text-4xl font-serif font-normal text-foreground mb-4">
            New products added <span className="lumina-accent">every week</span>
          </h2>
          <p className="text-base font-sans text-muted-foreground mb-8 max-w-md mx-auto">
            Sign up to get notified about our latest arrivals and exclusive deals.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-warm hover:-translate-y-0.5"
          >
            Explore All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
