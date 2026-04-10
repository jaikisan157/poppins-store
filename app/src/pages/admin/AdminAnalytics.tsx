import { useEffect, useState } from 'react';
import { adminApi, getImageUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Eye, MousePointerClick, AlertTriangle } from 'lucide-react';

interface AnalyticsState {
  trafficSources: { _id: string; count: number }[];
  visitorLocations: { _id: string; country: string; count: number }[];
  vpnUsage: { total: number; vpnCount: number };
  mostViewed: any[];
  clickRates: { name: string; views: number; clicks: number; rate: string }[];
  dailyVisits: { _id: string; count: number }[];
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

  const totalVisits = data.trafficSources.reduce((sum, s) => sum + s.count, 0);
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
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Visits</p>
                <p className="text-xl font-bold text-white">
                  {totalVisits.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Countries</p>
                <p className="text-xl font-bold text-white">
                  {data.visitorLocations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Traffic Sources</p>
                <p className="text-xl font-bold text-white">
                  {data.trafficSources.length}
                </p>
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
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="bg-slate-900 border-slate-800 w-max">
            <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
        </div>

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

          {/* Daily Visits */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Visits (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.dailyVisits.map((day) => (
                  <div key={day._id} className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-24">{day._id}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded"
                        style={{
                          width: `${Math.min((day.count / Math.max(...data.dailyVisits.map(d => d.count), 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium w-12 text-right">{day.count}</span>
                  </div>
                ))}
                {data.dailyVisits.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No visit data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography */}
        <TabsContent value="geography" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Visitor Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.visitorLocations.slice(0, 15).map((loc) => (
                  <div key={loc._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-white">{loc.country || loc._id}</span>
                    <span className="text-primary font-bold">{loc.count} visits</span>
                  </div>
                ))}
                {data.visitorLocations.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No location data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Most Viewed Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Views</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mostViewed.map((project) => (
                      <tr key={project._id} className="border-b border-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {project.images?.[0]?.url && (
                              <img
                                src={getImageUrl(project.images?.[0]?.url)}
                                alt={project.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span className="text-white">{project.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{project.category}</td>
                        <td className="py-3 px-4 text-slate-300">{project.viewCount}</td>
                        <td className="py-3 px-4 text-primary font-medium">{project.clickCount}</td>
                      </tr>
                    ))}
                    {data.mostViewed.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No project data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement / Click-through Rates */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Click-Through Rates (Views → "Get It" Clicks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.clickRates.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 line-clamp-1">{project.name}</span>
                      <span className="text-white font-medium">{project.rate}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all rounded-full"
                        style={{ width: `${Math.min(parseFloat(project.rate), 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{project.views} views</span>
                      <span>{project.clicks} clicks</span>
                    </div>
                  </div>
                ))}
                {data.clickRates.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No engagement data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
