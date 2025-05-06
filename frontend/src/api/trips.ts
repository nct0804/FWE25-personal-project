import axios from 'axios';
import { Trip } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAllTrips = async (): Promise<Trip[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trips`);
    return response.data.trips || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // When no trips found, return empty array instead of throwing error
      return [];
    }
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const getTrip = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/trips/${id}`);
  return response.data;
}
export const createTrip = async (tripData: any) => {
  const response = await axios.post(`${API_BASE_URL}/trips`, tripData);
  return response.data;
}
export const updateTrip = async (id: string, tripData: any) => {
  const response = await axios.put(`${API_BASE_URL}/trips/${id}`, tripData);
  return response.data;
}
export const deleteTrip = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/trips/${id}`);
  return response.data;
}

export const searchTrips = async (params: Record<string, string>): Promise<Trip[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trips`, { params });
    return response.data.trips || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // When no trips found, return empty array instead of throwing error
      return [];
    }
    console.error('Error searching trips:', error);
    throw error;
  }
};


export const addDestinationToTrip = async (tripId: string, destinationId: string) => {
  const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`);
  return response.data;
}

export const removeDestinationFromTrip = async (tripId: string, destinationId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`);
  return response.data;
}

export const getTripsByDestination = async (destinationId: string): Promise<Trip[]> => {
  const res = await fetch(`/api/trips?destinationId=${destinationId}`);
  const data = await res.json();
  return data.trips;
};
