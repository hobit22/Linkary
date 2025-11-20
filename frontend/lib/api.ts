import axios, { AxiosError } from 'axios';
import { getToken, removeToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Category enum matching backend
export enum Category {
  ARTICLE = 'Article',
  TUTORIAL = 'Tutorial',
  DOCUMENTATION = 'Documentation',
  TOOL = 'Tool',
  VIDEO = 'Video',
  REPOSITORY = 'Repository',
  RESEARCH = 'Research',
  NEWS = 'News',
  REFERENCE = 'Reference',
  OTHER = 'Other',
}

export interface User {
  _id: string;
  email: string;
  name: string;
  picture: string;
  googleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  _id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  image: string;
  tags: string[];
  category: string;
  relatedLinks: string[] | Link[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphData {
  nodes: {
    id: string;
    label: string;
    url: string;
    category: string;
    tags: string[];
  }[];
  edges: {
    source: string;
    target: string;
  }[];
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  version: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  count?: number;
}

export interface ApiErrorResponse {
  detail: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SearchFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Axios interceptors for authentication
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from API response
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.detail || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export const api = {
  // Health check
  healthCheck: async (): Promise<HealthCheckResponse> => {
    const response = await axios.get<HealthCheckResponse>(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  },

  // Get all links
  getLinks: async (): Promise<Link[]> => {
    const response = await axios.get<ApiSuccessResponse<Link[]>>(`${API_BASE_URL}/links`);
    return response.data.data;
  },

  // Get single link
  getLink: async (id: string): Promise<Link> => {
    const response = await axios.get<ApiSuccessResponse<Link>>(`${API_BASE_URL}/links/${id}`);
    return response.data.data;
  },

  // Create new link
  createLink: async (data: {
    url: string;
    tags?: string[];
    category?: string;
    notes?: string;
    relatedLinks?: string[];
  }): Promise<Link> => {
    const response = await axios.post<ApiSuccessResponse<Link>>(`${API_BASE_URL}/links`, data);
    return response.data.data;
  },

  // Update link
  updateLink: async (id: string, data: Partial<Link>): Promise<Link> => {
    const response = await axios.put<ApiSuccessResponse<Link>>(`${API_BASE_URL}/links/${id}`, data);
    return response.data.data;
  },

  // Delete link
  deleteLink: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/links/${id}`);
  },

  // Get graph data
  getGraphData: async (): Promise<GraphData> => {
    const response = await axios.get<ApiSuccessResponse<GraphData>>(`${API_BASE_URL}/links/graph`);
    return response.data.data;
  },

  // Search links
  searchLinks: async (filters: SearchFilters): Promise<PaginatedResponse<Link>> => {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('page_size', filters.pageSize.toString());

    const response = await axios.get<ApiSuccessResponse<PaginatedResponse<Link> | Link[]>>(`${API_BASE_URL}/links?${params.toString()}`);

    // Check if response is paginated or simple array (backward compatibility)
    const data = response.data.data;

    // If data has 'items' property, it's a paginated response
    if (data && typeof data === 'object' && 'items' in data) {
      const paginatedData = data as any; // Backend returns snake_case fields
      return {
        items: paginatedData.items,
        total: paginatedData.total,
        page: paginatedData.page,
        pageSize: paginatedData.page_size,
        totalPages: paginatedData.total_pages,
      };
    }

    // Otherwise, it's a simple array (backward compatibility for non-filtered requests)
    const items = Array.isArray(data) ? data : [];
    const total = response.data.count || items.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || total;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  },
};

// Auth API
export const authApi = {
  // Google OAuth login
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/google`, {
      credential: credential,
    });
    return response.data;
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get<ApiSuccessResponse<User>>(`${API_BASE_URL}/auth/me`);
    return response.data.data;
  },
};
