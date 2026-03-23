import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ordersApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CreditCard, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.street) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
      };

      await ordersApi.checkout(orderData);
      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl font-serif font-normal mb-4">Your cart is empty</h1>
          <p className="text-base font-sans text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary text-primary-foreground px-8 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
            Secure Checkout
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif font-normal text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="border border-border rounded-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-serif font-medium">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">First Name *</label>
                    <Input
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Last Name *</label>
                    <Input
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Street Address *</label>
                    <Input
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">City *</label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">State/Province *</label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Country *</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full p-2.5 bg-cream-50 border border-border rounded-sm font-sans text-sm h-11"
                      required
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">ZIP/Postal Code *</label>
                    <Input
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Phone Number</label>
                    <Input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="border border-border rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-serif font-medium">Billing Address</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                  />
                  <label htmlFor="sameAsShipping" className="font-sans text-sm font-normal text-muted-foreground">
                    Same as shipping address
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">First Name</label>
                      <Input value={billingAddress.firstName} onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Last Name</label>
                      <Input value={billingAddress.lastName} onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Street Address</label>
                      <Input value={billingAddress.street} onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">City</label>
                      <Input value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">State/Province</label>
                      <Input value={billingAddress.state} onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Country</label>
                      <select value={billingAddress.country} onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })} className="w-full p-2.5 bg-cream-50 border border-border rounded-sm font-sans text-sm h-11">
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>{country.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">ZIP/Postal Code</label>
                      <Input value={billingAddress.zipCode} onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="border border-border rounded-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-serif font-medium">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 accent-copper-500"
                    />
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm">Credit/Debit Card</p>
                      <p className="text-xs font-sans text-muted-foreground">Pay securely with Stripe</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 accent-copper-500"
                    />
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs font-sans text-muted-foreground">Pay when you receive</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-4 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-warm disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>Place Order — ₹{total.toFixed(0)}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-cream-100 border border-border rounded-sm p-6 sticky top-24">
              <h2 className="text-xl font-serif font-medium mb-5">Order Summary</h2>

              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <img
                      src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-sm object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-xs font-sans text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-sans font-medium text-sm">₹{(item.product.price.current * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-border" />

              <div className="space-y-2">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
              </div>

              <Separator className="my-4 bg-border" />

              <div className="flex justify-between text-lg font-serif font-medium">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
