import { useEffect, useState } from 'react';
import { adminApi, getImageUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Eye,
  MousePointerClick,
  TrendingUp,
  ArrowUpRight,
  Globe,
} from 'lucide-react';

interface DashboardData {
  projects: { total: number; visible: number; featured: number };
  engagement: { totalViews: number; totalClicks: number; clickThroughRate: string; weeklyVisits: number };
  topByViews: any[];
  topByClicks: any[];
  recentProjects: any[];
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
      title: 'Total Projects',
      value: data.projects.total.toString(),
      change: `${data.projects.visible} visible`,
      icon: Layers,
    },
    {
      title: 'Total Views',
      value: data.engagement.totalViews.toLocaleString(),
      change: `${data.engagement.weeklyVisits} this week`,
      icon: Eye,
    },
    {
      title: '"Get It" Clicks',
      value: data.engagement.totalClicks.toLocaleString(),
      change: `${data.engagement.clickThroughRate}% CTR`,
      icon: MousePointerClick,
    },
    {
      title: 'Featured',
      value: data.projects.featured.toString(),
      change: 'projects highlighted',
      icon: TrendingUp,
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

      {/* Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Views */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Top Projects by Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topByViews.length === 0 ? (
              <p className="text-slate-400">No project views yet</p>
            ) : (
              <div className="space-y-3">
                {data.topByViews.map((project, index) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-5">{index + 1}</span>
                      {project.images?.[0]?.url && (
                        <img
                          src={project.images[0].url}
                          alt={project.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1">
                          {project.name}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {project.category}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-300">
                      {project.viewCount} views
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top by Clicks */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-primary" />
              Top Projects by Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topByClicks.length === 0 ? (
              <p className="text-slate-400">No "Get It" clicks yet</p>
            ) : (
              <div className="space-y-3">
                {data.topByClicks.map((project, index) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-5">{index + 1}</span>
                      {project.images?.[0]?.url && (
                        <img
                          src={getImageUrl(project.images?.[0]?.url)}
                          alt={project.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1">
                          {project.name}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {project.category}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-300">
                      {project.clickCount} clicks
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Views</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Clicks</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map((project) => (
                  <tr key={project._id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white font-medium">{project.name}</td>
                    <td className="py-3 px-4 text-slate-300">{project.category}</td>
                    <td className="py-3 px-4 text-slate-300">{project.viewCount || 0}</td>
                    <td className="py-3 px-4 text-slate-300">{project.clickCount || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={project.isVisible ? 'secondary' : 'default'}>
                          {project.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                        {project.isFeatured && (
                          <Badge variant="outline" className="text-primary border-primary/30">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.recentProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No projects yet
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
