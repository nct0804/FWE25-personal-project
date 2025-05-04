import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAllDestinations = async () => {
  const response = await axios.get('/destinations');
  return response.data;
};

export const getDestinationById = async (id: string) => {
  const response = await axios.get(`/destinations/${id}`);
  return response.data;
};

export const createDestination = async (destinationData: any) => {
  const response = await axios.post('/destinations', destinationData);
  return response.data;
};

export const updateDestination = async (id: string, destinationData: any) => {
  const response = await axios.put(`/destinations/${id}`, destinationData);
  return response.data;
};

export const deleteDestination = async (id: string) => {
  const response = await axios.delete(`/destinations/${id}`);
  return response.data;
};