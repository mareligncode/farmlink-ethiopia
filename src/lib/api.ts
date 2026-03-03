const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: 'farmer' | 'merchant' | 'admin';
  phone?: string;
  avatarUrl?: string;
  languagePreference?: string;
  farmName?: string;
  farmLocation?: string;
  farmSize?: string;
  region?: string;
  woreda?: string;
  businessName?: string;
  businessLocation?: string;
  businessType?: string;
}

export interface Product {
  id: string;
  _id?: string;
  nameEn: string;
  nameAm?: string;
  descriptionEn?: string;
  descriptionAm?: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  category: string;
  imageUrls?: string[];
  farmerId: User;
  location?: string;
  harvestDate?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  _id?: string;
  userId: string;
  productId: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  _id?: string;
  merchantId: User;
  farmerId: User;
  items: (OrderItem & { productId: Product })[];
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  type: string;
  titleEn: string;
  titleAm?: string;
  messageEn: string;
  messageAm?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Review {
  id: string;
  _id?: string;
  productId: string;
  reviewerId: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SalesTrend {
  date: string;
  totalSales: number;
}

export interface ProductStats {
  productId: string;
  name: string;
  soldQuantity: number;
}

export interface RevenueStats {
  month: string;
  totalRevenue: number;
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; role: string }) =>
    fetchAPI<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => fetchAPI<{ success: boolean; user: User }>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    fetchAPI<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    fetchAPI<{ success: boolean; message: string }>('/password-reset/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetToken: (token: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/password-reset/verify/${token}`),

  resetPassword: (token: string, password: string) =>
    fetchAPI<{ success: boolean; message: string }>('/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    fetchAPI<{ success: boolean; message: string }>('/settings/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; farmerId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.farmerId) searchParams.set('farmerId', params.farmerId);
    const query = searchParams.toString();
    return fetchAPI<{ success: boolean; data: Product[] }>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    fetchAPI<{ success: boolean; data: Product }>(`/products/${id}`),

  create: (data: Partial<Product>) =>
    fetchAPI<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Product>) =>
    fetchAPI<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Cart API
export const cartAPI = {
  getItems: () =>
    fetchAPI<{ success: boolean; data: CartItem[] }>('/cart'),

  addItem: (productId: string, quantity: number) =>
    fetchAPI<{ success: boolean; data: CartItem }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateQuantity: (id: string, quantity: number) =>
    fetchAPI<{ success: boolean; data: CartItem | null }>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (id: string) =>
    fetchAPI<{ success: boolean }>(`/cart/${id}`, {
      method: 'DELETE',
    }),

  clear: () =>
    fetchAPI<{ success: boolean }>('/cart', {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  getAll: () =>
    fetchAPI<{ success: boolean; data: Order[] }>('/orders'),

  getById: (id: string) =>
    fetchAPI<{ success: boolean; data: Order }>(`/orders/${id}`),

  create: (data: {
    farmerId: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryAddress?: string;
    deliveryNotes?: string;
    paymentMethod: string;
  }) =>
    fetchAPI<{ success: boolean; data: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<{ success: boolean; data: Order }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () =>
    fetchAPI<{ success: boolean; data: Notification[] }>('/notifications'),

  getUnreadCount: () =>
    fetchAPI<{ success: boolean; count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    fetchAPI<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    fetchAPI<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) =>
    fetchAPI<{ success: boolean; data: Review[] }>(`/reviews/product/${productId}`),

  create: (data: { productId: string; rating: number; comment?: string }) =>
    fetchAPI<{ success: boolean; data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Payments API
export const paymentsAPI = {
  initializeChapa: (data: {
    orderId: string;
    amount: number;
    email: string;
    firstName: string;
    lastName: string;
    callbackUrl: string;
  }) =>
    fetchAPI<{ success: boolean; checkoutUrl: string; txRef: string }>('/payments/chapa/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verify: (txRef: string) =>
    fetchAPI<{ success: boolean; data: unknown }>(`/payments/verify/${txRef}`),
};

// Upload API
export const uploadAPI = {
  uploadProductImages: async (files: File[]) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/products`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data as { success: boolean; data: { imageUrls: string[]; count: number } };
  },

  deleteProductImage: (filename: string) =>
    fetchAPI<{ success: boolean }>(`/upload/products/${filename}`, {
      method: 'DELETE',
    }),
};

// Re-export API_BASE_URL for external use
export const getApiBaseUrl = () => API_BASE_URL;

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    fetchAPI<{
      success: boolean;
      data: {
        totalRevenue: number;
        totalOrders: number;
        totalProducts: number;
        averageOrderValue: number;
        revenueByMonth: Array<{ month: string; revenue: number }>;
        ordersByStatus: Array<{ status: string; count: number }>;
        topProducts: Array<{ product: Product; totalSold: number; revenue: number }>;
        recentOrders: Order[];
      };
    }>('/analytics/dashboard'),

  getSalesTrends: (period: 'week' | 'month' | 'year' = 'month') =>
    fetchAPI<{
      success: boolean;
      data: Array<{ date: string; revenue: number; orders: number }>;
    }>(`/analytics/sales-trends?period=${period}`),

  getProductPerformance: () =>
    fetchAPI<{
      success: boolean;
      data: Array<{ product: Product; views: number; sales: number; revenue: number }>;
    }>('/analytics/product-performance'),
};

// Settings API
export const settingsAPI = {
  getNotificationPreferences: () =>
    fetchAPI<{
      success: boolean;
      data: {
        emailNotifications: boolean;
        orderUpdates: boolean;
        promotions: boolean;
        newsletter: boolean;
      };
    }>('/settings/notifications'),

  updateNotificationPreferences: (preferences: {
    emailNotifications?: boolean;
    orderUpdates?: boolean;
    promotions?: boolean;
    newsletter?: boolean;
  }) =>
    fetchAPI<{ success: boolean; message: string }>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),
};
