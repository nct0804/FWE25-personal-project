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
  try {
    const response = await axios.get(`${API_BASE_URL}/trips/${id}`);
    console.log('API response for trip:', response.data);
    // Extract the nested trip object from the response
    return response.data.trip || response.data;
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    throw error;
  }
};

export const createTrip = async (tripData: any) => {
  const response = await axios.post(`${API_BASE_URL}/trips`, tripData);
  return response.data;
}
export const updateTrip = async (id: string, tripData: any) => {
  // Format the data to ensure budget is handled correctly
  const formattedData = {
    ...tripData,
    // Make sure budget is sent as a number and is explicitly included
    budget: tripData.budget !== undefined ? Number(tripData.budget) : 0
  };
  
  console.log('Updating trip with data:', formattedData);
  
  try {
    const response = await axios.put(`${API_BASE_URL}/trips/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};
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
  try {
    const response = await axios.get(`${API_BASE_URL}/trips/destination/${destinationId}/trips`);
    console.log('Trips by destination response:', response.data);
    // Extract the trips array from the response
    return response.data.trips || [];
  } catch (error) {
    console.error('Error fetching trips by destination:', error);
    throw error;
  }
};