import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Filter, Eye, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    status: 'all',
    search: '',
  });
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    carrier: '',
    trackingUrl: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params: any = { page: filters.page, limit: 20 };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await adminApi.getOrders(params);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const addTracking = async (orderId: string) => {
    try {
      await adminApi.updateOrderTracking(orderId, { number: trackingData.trackingNumber, carrier: trackingData.carrier });
      toast.success('Tracking information added');
      setTrackingData({ trackingNumber: '', carrier: '', trackingUrl: '' });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to add tracking');
    }
  };

  const processRefund = async (orderId: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: 'refunded' });
      toast.success('Refund processed');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Order #</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Customer</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Items</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-800">
                      <td className="py-4 px-6 text-white font-medium">{order.orderNumber}</td>
                      <td className="py-4 px-6 text-slate-300">
                        {(order as any).user?.name ? `${(order as any).user.name.first} ${(order as any).user.name.last}` : 'Guest'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-slate-300">{order.items.length}</td>
                      <td className="py-4 px-6 text-white font-medium">
                        ₹{order.pricing.total.toFixed(0)}
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Order Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-slate-400">Customer</p>
                                  <p className="font-medium">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    {(order as any).user?.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-400">Order Date</p>
                                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <p className="text-sm text-slate-400 mb-2">Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 p-3 bg-slate-800 rounded"
                                    >
                                      <img
                                        src={item.image || '/placeholder-product.jpg'}
                                        alt={item.name}
                                        className="h-12 w-12 rounded object-cover"
                                      />
                                      <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-slate-400">
                                          Qty: {item.quantity} × ₹{item.price.toFixed(0)}
                                        </p>
                                      </div>
                                      <p className="font-medium">
                                        ₹{(item.price * item.quantity).toFixed(0)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Pricing */}
                              <div className="border-t border-slate-800 pt-4">
                                <div className="space-y-1 text-right">
                                  <p className="text-slate-400">
                                    Subtotal: ₹{order.pricing.subtotal.toFixed(0)}
                                  </p>
                                  <p className="text-slate-400">
                                    Shipping: ₹{order.pricing.shipping.toFixed(0)}
                                  </p>
                                  <p className="text-slate-400">
                                    Tax: ₹{order.pricing.tax.toFixed(0)}
                                  </p>
                                  <p className="text-xl font-bold">
                                    Total: ₹{order.pricing.total.toFixed(0)}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="border-t border-slate-800 pt-4 space-y-4">
                                <div>
                                  <p className="text-sm text-slate-400 mb-2">Update Status</p>
                                  <div className="flex gap-2">
                                    {['pending', 'processing', 'shipped', 'delivered'].map(
                                      (status) => (
                                        <Button
                                          key={status}
                                          size="sm"
                                          variant={order.status === status ? 'default' : 'outline'}
                                          onClick={() => updateOrderStatus(order._id, status)}
                                        >
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Button>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Add Tracking */}
                                {order.status === 'shipped' && !order.tracking?.number && (
                                  <div>
                                    <p className="text-sm text-slate-400 mb-2">Add Tracking</p>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Tracking Number"
                                        value={trackingData.trackingNumber}
                                        onChange={(e) =>
                                          setTrackingData({
                                            ...trackingData,
                                            trackingNumber: e.target.value,
                                          })
                                        }
                                        className="bg-slate-800 border-slate-700"
                                      />
                                      <Input
                                        placeholder="Carrier"
                                        value={trackingData.carrier}
                                        onChange={(e) =>
                                          setTrackingData({
                                            ...trackingData,
                                            carrier: e.target.value,
                                          })
                                        }
                                        className="bg-slate-800 border-slate-700"
                                      />
                                      <Button onClick={() => addTracking(order._id)}>
                                        <Truck className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Refund */}
                                {order.status !== 'refunded' && order.status !== 'cancelled' && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => processRefund(order._id)}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Process Refund
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
