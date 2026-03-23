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
  addresses?: Address[];
  totalOrders?: number;
  totalSpent?: number;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  images: { url: string; alt?: string; isMain?: boolean }[];
  price: {
    current: number;
    compareAt?: number;
    cost?: number;
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
  };
  category: string;
  tags?: string[];
  isVisible: boolean;
  isFeatured: boolean;
  shipping?: {
    weight?: number;
    cost?: number;
    countries?: string[];
    freeShippingThreshold?: number;
  };
  viewCount?: number;
  clickCount?: number;
  purchaseCount?: number;
  relatedProducts?: Product[];
  discountPercentage?: number;
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  itemCount?: number;
  subtotal?: number;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User | string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  shipping?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery?: string;
  };
  tracking?: {
    number?: string;
    url?: string;
    carrier?: string;
    events?: {
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  stats: {
    today: { revenue: number; orders: number };
    week: { revenue: number; orders: number };
    month: { revenue: number; orders: number };
    total: { revenue: number; orders: number; customers: number };
  };
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  newCustomersToday: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  estimatedProfit: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
}

export interface CountryData {
  country: string;
  visitors: number;
  uniqueVisitors: number;
  vpnVisitors: number;
  orders: number;
  revenue: number;
  vpnOrders: number;
}

export interface Customer {
  _id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  fullName?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  flagged: boolean;
  flagReason?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
  createdAt: string;
  lastLogin?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    ip?: string;
  };
  utmData?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}
