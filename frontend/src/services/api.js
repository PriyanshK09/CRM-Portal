import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Set to false for cross-origin requests without credentials
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  googleLogin: async (googleData) => {
    const response = await api.post('/auth/google', googleData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

// Customer Services
export const customerService = {
  getCustomers: async (params) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  
  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

// Segment Services
export const segmentService = {
  getSegments: async () => {
    const response = await api.get('/segments');
    return response.data;
  },
  
  getSegmentById: async (id) => {
    const response = await api.get(`/segments/${id}`);
    return response.data;
  },
  
  createSegment: async (segmentData) => {
    const response = await api.post('/segments', segmentData);
    return response.data;
  },
  
  updateSegment: async (id, segmentData) => {
    const response = await api.put(`/segments/${id}`, segmentData);
    return response.data;
  },
  
  deleteSegment: async (id) => {
    const response = await api.delete(`/segments/${id}`);
    return response.data;
  },
  
  calculateAudienceSize: async (rulesData) => {
    const response = await api.post('/segments/calculate-audience', rulesData);
    return response.data;
  }
};

// Campaign Services
export const campaignService = {
  getCampaigns: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },
  
  getCampaignById: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  
  createCampaign: async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  },
  
  updateCampaign: async (id, campaignData) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },
  
  deleteCampaign: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  }
};

// Order Services
export const orderService = {
  getOrders: async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }
};

// Dashboard Services
export const dashboardService = {
  getStatistics: async () => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
  
  getTopCustomers: async () => {
    const response = await api.get('/dashboard/top-customers');
    return response.data;
  },
  
  getPerformanceMetrics: async (period) => {
    const response = await api.get(`/dashboard/performance-metrics?period=${period}`);
    return response.data;
  }
};

export default api;