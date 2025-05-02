import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchTrips = async (searchParams?: { name?: string; startDate?: string; endDate?: string }) => {
  const response = await axios.get(`${API_URL}/trips`, { params: searchParams });
  return response.data;
};

export const fetchTripDetails = async (id: string, currency?: string) => {
  const response = await axios.get(`${API_URL}/trips/${id}`, { 
    params: currency ? { currency } : {} 
  });
  return response.data;
};

export const createTrip = async (tripData: { name: string; startDate: string; endDate: string }) => {
  const response = await axios.post(`${API_URL}/trips`, tripData);
  return response.data;
};
export const updateTrip = async (id: string, tripData: { name?: string; startDate?: string; endDate?: string }) => {
  const response = await axios.put(`${API_URL}/trips/${id}`, tripData);
  return response.data;
}
export const deleteTrip = async (id: string) => {
  const response = await axios.delete(`${API_URL}/trips/${id}`);
  return response.data;
}           