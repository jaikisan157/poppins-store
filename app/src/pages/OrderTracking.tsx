import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackingApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('order') || '');
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      setIsLoading(true);
      const response = await trackingApi.trackOrder(trackingNumber);
      setOrderData(response.data.order);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Order not found');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800';
      case 'processing': return 'bg-blue-50 text-blue-800';
      case 'shipped': return 'bg-purple-50 text-purple-800';
      case 'delivered': return 'bg-green-50 text-green-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-cream-200 py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl text-center">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Order Status
          </p>
          <h1 className="text-4xl lg:text-5xl font-serif font-normal text-foreground mb-4">
            Track Your Order
          </h1>
          <p className="text-base font-sans text-muted-foreground">
            Enter your order number or tracking number to check the status
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <form onSubmit={handleTrack} className="flex gap-3 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter order number or tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-11 bg-cream-100 border-border font-sans text-sm h-12 rounded-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-8 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {orderData && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Order Status */}
              <div className="border border-border rounded-sm p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-sans text-muted-foreground tracking-wider uppercase mb-1">Order Number</p>
                    <p className="text-xl font-serif font-medium">{orderData.orderNumber}</p>
                  </div>
                  <Badge className={`${getStatusColor(orderData.status)} font-sans text-xs tracking-wider uppercase border-0`}>
                    {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-px bg-border" />
                  <div className="relative flex justify-between">
                    {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                      const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(
                        orderData.status
                      ) >= index;
                      const isCurrent = orderData.status === step;

                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isActive
                                ? 'bg-primary border-primary text-white'
                                : 'bg-cream-100 border-border text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/15' : ''}`}
                          >
                            {index === 0 && <Clock className="h-4 w-4" />}
                            {index === 1 && <Package className="h-4 w-4" />}
                            {index === 2 && <Truck className="h-4 w-4" />}
                            {index === 3 && <CheckCircle className="h-4 w-4" />}
                          </div>
                          <p
                            className={`text-[10px] font-sans mt-2 capitalize tracking-wider uppercase ${
                              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {orderData.tracking?.number && (
                <div className="border border-border rounded-sm p-6">
                  <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Tracking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-sans text-muted-foreground tracking-wider uppercase mb-1">Carrier</p>
                      <p className="font-sans font-medium text-sm">{orderData.tracking.carrier || 'Standard Shipping'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-sans text-muted-foreground tracking-wider uppercase mb-1">Tracking Number</p>
                      <a
                        href={orderData.tracking.url || `https://17track.net/?nums=${orderData.tracking.number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans font-medium text-sm text-primary hover:underline"
                      >
                        {orderData.tracking.number}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="border border-border rounded-sm p-6">
                <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </h3>
                <div className="font-sans text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">
                    {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                  </p>
                  <p>{orderData.shippingAddress.street}</p>
                  <p>
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                    {orderData.shippingAddress.zipCode}
                  </p>
                  <p>{orderData.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-border rounded-sm p-6">
                <h3 className="font-serif text-lg font-medium mb-5">Order Items</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="h-20 w-20 rounded-sm object-cover bg-cream-200"
                      />
                      <div className="flex-1">
                        <p className="font-sans font-medium text-sm">{item.name}</p>
                        <p className="text-xs font-sans text-muted-foreground mt-0.5">
                          Qty: {item.quantity} × ₹{item.price.toFixed(0)}
                        </p>
                        <p className="font-sans font-medium text-sm mt-1">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-6 pt-4 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{orderData.pricing.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{orderData.pricing.shipping.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{orderData.pricing.tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif font-medium pt-2">
                    <span>Total</span>
                    <span>₹{orderData.pricing.total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
