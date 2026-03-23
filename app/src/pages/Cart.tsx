import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { cart, isLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: string, newQuantity: number, variant?: any) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity, variant);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId: string, variant?: any) => {
    try {
      await removeFromCart(productId, variant);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-cream-300 rounded w-1/4" />
            <div className="h-32 bg-cream-300 rounded-sm" />
            <div className="h-32 bg-cream-300 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
            <h1 className="text-3xl font-serif font-normal mb-3">Your cart is empty</h1>
            <p className="text-base font-sans text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all duration-300"
            >
              <Package className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
            Your Selection
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif font-normal text-foreground">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-0">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <p className="text-sm font-sans text-muted-foreground">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-sm font-sans text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Cart
              </button>
            </div>

            {cart.items.map((item) => (
              <div key={`${item.product._id}-${item.variant?.value || 'default'}`} className="py-6 border-b border-border">
                <div className="flex gap-5">
                  <div className="w-24 h-24 bg-cream-200 rounded-sm overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/product/${item.product._id}`}
                          className="font-serif text-lg font-medium hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm font-sans text-muted-foreground mt-0.5">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="font-sans font-medium mt-1">
                          ₹{item.product.price.current.toFixed(0)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product._id, item.variant)}
                        className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-sm">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity - 1, item.variant)
                          }
                          className="p-2 hover:bg-cream-200 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 py-1.5 min-w-[2.5rem] text-center font-sans text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity + 1, item.variant)
                          }
                          className="p-2 hover:bg-cream-200 transition-colors"
                          disabled={
                            item.product.inventory.trackQuantity &&
                            item.quantity >= item.product.inventory.quantity
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-sans font-semibold text-lg">
                        ₹{(item.product.price.current * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-cream-100 border border-border rounded-sm p-6 sticky top-24">
              <h2 className="text-xl font-serif font-medium mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs font-sans text-green-600">
                    You qualify for free shipping!
                  </p>
                )}
              </div>

              <Separator className="my-4 bg-border" />

              <div className="flex justify-between text-lg font-serif font-medium mb-6">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-warm"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/products"
                className="w-full inline-flex items-center justify-center mt-3 px-6 py-3 text-xs font-sans font-medium tracking-[0.1em] uppercase border border-border rounded-sm hover:bg-cream-200 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
