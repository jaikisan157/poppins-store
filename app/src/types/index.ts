export interface User {
  id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  fullName?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  phone?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  images: { url: string; alt?: string; isMain?: boolean }[];
  category: string;
  tags?: string[];
  isVisible: boolean;
  isFeatured: boolean;
  videoUrl?: string;
  externalUrl?: string;
  techStack?: string[];
  viewCount?: number;
  clickCount?: number;
  relatedProducts?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  projects: {
    total: number;
    visible: number;
    featured: number;
  };
  engagement: {
    totalViews: number;
    totalClicks: number;
    clickThroughRate: string;
    weeklyVisits: number;
  };
  topByViews: Product[];
  topByClicks: Product[];
  recentProjects: Product[];
}

export interface AnalyticsData {
  trafficSources: { _id: string; count: number }[];
  visitorLocations: { _id: string; country: string; count: number }[];
  vpnUsage: { total: number; vpnCount: number };
  mostViewed: Product[];
  clickRates: {
    name: string;
    views: number;
    clicks: number;
    rate: string;
  }[];
  dailyVisits: { _id: string; count: number }[];
}
