import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Users, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsState {
  trafficSources: any[];
  customerLocations: any[];
  vpnUsage: { total: number; vpnCount: number };
  mostViewed: any[];
  conversionRates: any[];
  averageOrderValue: number;
  ordersByCountry: any[];
  ordersBySource: any[];
  dailyOrders: any[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAnalytics();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

  if (!data) return <div className="text-slate-400">No analytics data available</div>;

  const vpnPercentage = data.vpnUsage.total > 0
    ? ((data.vpnUsage.vpnCount / data.vpnUsage.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Traffic Sources</p>
                <p className="text-xl font-bold text-white">
                  {data.trafficSources.reduce((sum, s) => sum + s.count, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Countries</p>
                <p className="text-xl font-bold text-white">
                  {data.customerLocations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg. Order Value</p>
                <p className="text-xl font-bold text-white">₹{data.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">VPN Usage</p>
                <p className="text-xl font-bold text-white">{vpnPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        {/* Traffic Sources */}
        <TabsContent value="traffic" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.trafficSources.map((source) => (
                  <div key={source._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-white font-medium capitalize">{source._id || 'direct'}</span>
                    <span className="text-primary font-bold">{source.count} visits</span>
                  </div>
                ))}
                {data.trafficSources.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No traffic data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Orders by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.ordersBySource.map((source) => (
                  <div key={source._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-white font-medium capitalize">{source._id || 'direct'}</span>
                    <div className="text-right">
                      <p className="text-primary font-bold">{source.count} orders</p>
                      <p className="text-sm text-slate-400">₹{source.revenue.toFixed(0)} revenue</p>
                    </div>
                  </div>
                ))}
                {data.ordersBySource.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No order source data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography */}
        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Visitor Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.customerLocations.slice(0, 10).map((loc) => (
                    <div key={loc._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <span className="text-white">{loc._id}</span>
                      <span className="text-primary font-bold">{loc.count}</span>
                    </div>
                  ))}
                  {data.customerLocations.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No location data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Orders by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.ordersByCountry.slice(0, 10).map((country) => (
                    <div key={country._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <span className="text-white">{country._id}</span>
                      <div className="text-right">
                        <p className="text-primary font-bold">{country.count} orders</p>
                        <p className="text-sm text-slate-400">₹{country.revenue.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                  {data.ordersByCountry.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No order country data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Most Viewed Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Views</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Clicks</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Purchases</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mostViewed.map((product) => (
                      <tr key={product._id} className="border-b border-slate-800">
                        <td className="py-3 px-4 text-white">{product.name}</td>
                        <td className="py-3 px-4 text-slate-300">{product.viewCount}</td>
                        <td className="py-3 px-4 text-slate-300">{product.clickCount}</td>
                        <td className="py-3 px-4 text-green-500 font-medium">{product.purchaseCount}</td>
                        <td className="py-3 px-4 text-white">₹{product.price.current.toFixed(0)}</td>
                      </tr>
                    ))}
                    {data.mostViewed.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No product data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion */}
        <TabsContent value="conversion" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Product Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.conversionRates.map((product) => (
                  <div key={product.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 line-clamp-1">{product.name}</span>
                      <span className="text-white font-medium">{product.rate}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all rounded-full"
                        style={{ width: `${Math.min(parseFloat(product.rate), 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{product.views} views</span>
                      <span>{product.purchases} purchases</span>
                    </div>
                  </div>
                ))}
                {data.conversionRates.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No conversion data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Orders Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Orders (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.dailyOrders.map((day) => (
                  <div key={day._id} className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-24">{day._id}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded"
                        style={{
                          width: `${Math.min((day.count / Math.max(...data.dailyOrders.map(d => d.count))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium w-16 text-right">{day.count} / ₹{day.revenue.toFixed(0)}</span>
                  </div>
                ))}
                {data.dailyOrders.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No daily order data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
