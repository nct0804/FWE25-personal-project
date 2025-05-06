import axios from 'axios';
import { Destination } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';


export const getAllDestinations = async (): Promise<Destination[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations`);
    // Handle both response formats - direct array or nested in 'destinations'
    return response.data.destinations || response.data || [];
  } catch (error) {
    // Handle 404 (no destinations) as empty array instead of error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

export const getDestinationById = async (id: string): Promise<Destination> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations/${id}`);
    return response.data.destination || response.data;
  } catch (error) {
    console.error(`Error fetching destination ${id}:`, error);
    throw error;
  }
};

export const createDestination = async (destinationData: any) => {
  const response = await axios.post(`${API_BASE_URL}/destinations`, destinationData);
  return response.data;
};

export const updateDestination = async (id: string, destinationData: any) => {
  const response = await axios.put(`${API_BASE_URL}/destinations/${id}`, destinationData);
  return response.data;
};

export const deleteDestination = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/destinations/${id}`);
};