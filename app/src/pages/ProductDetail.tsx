import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useSocket } from '@/contexts/SocketContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  AlertTriangle,
  Check,
  Minus,
  Plus,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { joinProduct, leaveProduct } = useSocket();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deliveryCheck, setDeliveryCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
    isVpn?: boolean;
  }>({ checking: false, available: null, message: '' });
  const [countryCode, setCountryCode] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
      joinProduct(id);
    }

    return () => {
      if (id) {
        leaveProduct(id);
      }
    };
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getById(id!);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
      navigate('/checkout');
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  const checkDelivery = async () => {
    if (!product || !countryCode) return;

    setDeliveryCheck({ checking: true, available: null, message: '' });

    try {
      const response = await productsApi.checkDelivery(product._id, {
        countryCode,
        zipCode,
      });

      setDeliveryCheck({
        checking: false,
        available: response.data.available,
        message: response.data.message,
        isVpn: response.data.isVpn,
      });
    } catch (error) {
      setDeliveryCheck({
        checking: false,
        available: false,
        message: 'Failed to check delivery availability.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-cream-300 rounded-sm" />
            <div className="space-y-5">
              <div className="h-8 bg-cream-300 rounded w-3/4" />
              <div className="h-6 bg-cream-300 rounded w-1/4" />
              <div className="h-4 bg-cream-300 rounded w-full" />
              <div className="h-4 bg-cream-300 rounded w-full" />
              <div className="h-12 bg-cream-300 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-cream-200 rounded-sm overflow-hidden">
              <img
                src={product.images[selectedImage]?.url || '/placeholder-product.jpg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-7">
            <div>
              <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-3">
                Product Details
              </p>
              <h1 className="text-3xl lg:text-4xl font-serif font-normal mb-3 text-foreground">{product.name}</h1>
              <p className="text-base font-sans text-muted-foreground leading-relaxed">{product.shortDescription}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-serif font-normal text-foreground">
                ₹{product.price.current.toFixed(0)}
              </span>
              {product.price.compareAt && (
                <>
                  <span className="text-xl font-sans text-muted-foreground line-through">
                    ₹{product.price.compareAt.toFixed(0)}
                  </span>
                  <span className="text-xs font-sans font-semibold tracking-wider uppercase bg-primary/10 text-primary px-3 py-1 rounded-sm">
                    -{product.discountPercentage}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inventory.trackQuantity && product.inventory.quantity <= product.inventory.lowStockThreshold ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-sans font-medium text-orange-600">
                    Only {product.inventory.quantity} left in stock!
                  </span>
                </>
              ) : product.inventory.trackQuantity && product.inventory.quantity > 0 ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-sans text-green-700">In Stock</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-sans text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Delivery Notice */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-sm px-4 py-2.5">
              <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-sans text-blue-800">
                Delivery available across <strong>India</strong> only • 5-10 business days
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Quantity</span>
              <div className="flex items-center border border-border rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-cream-200 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-2 min-w-[3rem] text-center font-sans text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-cream-200 transition-colors"
                  disabled={product.inventory.trackQuantity && quantity >= product.inventory.quantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.inventory.trackQuantity && product.inventory.quantity === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-warm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.inventory.trackQuantity && product.inventory.quantity === 0}
                className="flex-1 inline-flex items-center justify-center px-6 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase border border-border rounded-sm hover:bg-cream-200 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Delivery Checker */}
            <div className="border border-border rounded-sm p-5">
              <h3 className="font-serif text-base font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Check Delivery Availability
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Country Code (e.g., US)"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-cream-100 border-border font-sans text-sm rounded-sm"
                />
                <Input
                  placeholder="ZIP/Postal Code (optional)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="flex-1 bg-cream-100 border-border font-sans text-sm rounded-sm"
                />
                <button
                  onClick={checkDelivery}
                  disabled={deliveryCheck.checking || !countryCode}
                  className="px-5 py-2 bg-primary text-primary-foreground text-xs font-sans font-semibold tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  Check
                </button>
              </div>
              {deliveryCheck.available !== null && (
                <div className={`text-sm font-sans ${deliveryCheck.available ? 'text-green-600' : 'text-red-600'}`}>
                  {deliveryCheck.isVpn && (
                    <p className="text-orange-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      VPN detected. Please disable VPN for accurate delivery checking.
                    </p>
                  )}
                  {deliveryCheck.message}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders ₹500+' },
                { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
                { icon: RotateCcw, title: 'Easy Returns', desc: '30-day policy' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 bg-cream-100 rounded-sm">
                  <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-sans font-medium">{title}</p>
                  <p className="text-[10px] font-sans text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="bg-cream-100 border border-border rounded-sm">
            <TabsTrigger value="description" className="font-sans text-sm data-[state=active]:bg-white rounded-sm">Description</TabsTrigger>
            <TabsTrigger value="shipping" className="font-sans text-sm data-[state=active]:bg-white rounded-sm">Shipping</TabsTrigger>
            <TabsTrigger value="returns" className="font-sans text-sm data-[state=active]:bg-white rounded-sm">Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-8">
            <div className="max-w-3xl">
              <p className="font-sans text-base text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="mt-8">
            <div className="max-w-3xl font-sans text-base text-muted-foreground leading-relaxed space-y-4">
              <p>We ship to most countries worldwide. Delivery times vary by location:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>United States: 7-14 business days</li>
                <li>Europe: 10-18 business days</li>
                <li>Asia: 8-15 business days</li>
                <li>Rest of World: 12-25 business days</li>
              </ul>
              <p>Tracking information will be provided once your order ships.</p>
            </div>
          </TabsContent>
          <TabsContent value="returns" className="mt-8">
            <div className="max-w-3xl font-sans text-base text-muted-foreground leading-relaxed space-y-4">
              <p>We offer a 30-day return policy for all unused items in their original packaging.</p>
              <p>To initiate a return, please contact our customer support team with your order number.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
                You May Also Like
              </p>
              <h2 className="text-2xl lg:text-3xl font-serif font-normal text-foreground">Related Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {product.relatedProducts.map((related) => (
                <Link key={related._id} to={`/product/${related._id}`}>
                  <div className="group">
                    <div className="aspect-square overflow-hidden bg-cream-200 rounded-sm">
                      <img
                        src={related.images[0]?.url || '/placeholder-product.jpg'}
                        alt={related.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-serif text-base font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {related.name}
                      </h3>
                      <p className="font-sans font-semibold mt-1">₹{related.price.current.toFixed(0)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
