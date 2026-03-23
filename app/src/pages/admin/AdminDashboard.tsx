import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardData {
  revenue: { today: number; week: number; month: number };
  orders: { total: number; pending: number; processing: number; shipped: number; delivered: number };
  profit: { revenue: number; cost: number; shipping: number; profit: number };
  lowStockProducts: any[];
  newSignupsToday: number;
  totalCustomers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminApi.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="h-8 bg-slate-800 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${data.revenue.today.toFixed(0)}`,
      change: `${data.orders.pending} pending`,
      icon: DollarSign,
    },
    {
      title: 'This Week',
      value: `₹${data.revenue.week.toFixed(0)}`,
      change: `${data.orders.total} total orders`,
      icon: TrendingUp,
    },
    {
      title: 'This Month',
      value: `₹${data.revenue.month.toFixed(0)}`,
      change: `Profit: ₹${data.profit.profit.toFixed(0)}`,
      icon: ShoppingBag,
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toString(),
      change: `+${data.newSignupsToday} today`,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.change}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Status & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.orders)
                .filter(([key]) => key !== 'total')
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge
                      variant={
                        status === 'pending' ? 'default'
                        : status === 'delivered' ? 'secondary'
                        : 'outline'
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                    <span className="text-white font-medium">{count}</span>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-slate-400">No low stock products</p>
            ) : (
              <div className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {product.inventory.quantity} remaining
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Profit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Revenue</p>
              <p className="text-xl font-bold text-green-500">₹{data.profit.revenue.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Product Cost</p>
              <p className="text-xl font-bold text-red-400">₹{data.profit.cost.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Shipping Cost</p>
              <p className="text-xl font-bold text-orange-400">₹{data.profit.shipping.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Net Profit</p>
              <p className="text-xl font-bold text-primary">₹{data.profit.profit.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Order #</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {order.user?.name ? `${order.user.name.first} ${order.user.name.last}` : 'Guest'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      ₹{order.pricing.total.toFixed(0)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          order.status === 'pending' ? 'default'
                          : order.status === 'delivered' ? 'secondary'
                          : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
