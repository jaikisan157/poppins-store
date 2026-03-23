import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'processing':
      return <Package className="h-4 w-4 text-blue-600" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-purple-600" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'cancelled':
    case 'refunded':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'delivered':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-gray-50 text-gray-800';
  }
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getMyOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-serif font-normal text-foreground">My Orders</h1>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-border rounded-sm p-6">
                <div className="h-4 bg-cream-300 rounded w-1/4 mb-4" />
                <div className="h-4 bg-cream-300 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
          <h1 className="text-3xl font-serif font-normal mb-3">No orders yet</h1>
          <p className="text-base font-sans text-muted-foreground mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-2">
            Order History
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif font-normal text-foreground">My Orders</h1>
        </div>

        <div className="space-y-0">
          {orders.map((order) => (
            <div key={order._id} className="border-t border-border py-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-lg font-medium">{order.orderNumber}</h3>
                    <Badge variant="outline" className={`${getStatusColor(order.status)} font-sans text-[10px] tracking-wider uppercase`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm font-sans text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-medium">₹{order.pricing.total.toFixed(0)}</p>
                  <p className="text-sm font-sans text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="h-16 w-16 rounded-sm object-cover bg-cream-200"
                    />
                    <div>
                      <p className="font-sans font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs font-sans text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="flex items-center">
                    <p className="text-sm font-sans text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/50">
                {order.tracking?.number && (
                  <div className="flex items-center gap-2 text-sm font-sans">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tracking:</span>
                    <a
                      href={order.tracking.url || `https://17track.net/?nums=${order.tracking.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {order.tracking.number}
                    </a>
                  </div>
                )}
                <div className="flex-1" />
                <Link
                  to={`/track-order?order=${order.orderNumber}`}
                  className="px-5 py-2 border border-border rounded-sm text-xs font-sans font-medium tracking-[0.1em] uppercase hover:bg-cream-200 transition-colors"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
