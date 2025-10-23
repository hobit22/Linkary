import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export const api = {
  // Get all links
  getLinks: async (): Promise<Link[]> => {
    const response = await axios.get(`${API_BASE_URL}/links`);
    return response.data.data;
  },

  // Get single link
  getLink: async (id: string): Promise<Link> => {
    const response = await axios.get(`${API_BASE_URL}/links/${id}`);
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
    const response = await axios.post(`${API_BASE_URL}/links`, data);
    return response.data.data;
  },

  // Update link
  updateLink: async (id: string, data: Partial<Link>): Promise<Link> => {
    const response = await axios.put(`${API_BASE_URL}/links/${id}`, data);
    return response.data.data;
  },

  // Delete link
  deleteLink: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/links/${id}`);
  },

  // Get graph data
  getGraphData: async (): Promise<GraphData> => {
    const response = await axios.get(`${API_BASE_URL}/links/graph`);
    return response.data.data;
  },
};
