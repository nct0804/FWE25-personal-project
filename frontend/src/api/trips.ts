import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAllTrips = async () => {
  const response = await axios.get(`${API_BASE_URL}/trips`);
  return response.data;
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
export const searchTrips = async (name?: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await axios.get(`${API_BASE_URL}/trips/search?${params.toString()}`);
  return response.data;
};

export const addDestinationToTrip = async (tripId: string, destinationId: string) => {
  const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`);
  return response.data;
}

export const removeDestinationFromTrip = async (tripId: string, destinationId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/trips/${tripId}/destinations/${destinationId}`);
  return response.data;
}
export const getTripsByDestination = async (destinationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/trips/destination/${destinationId}`);
  return response.data;
}