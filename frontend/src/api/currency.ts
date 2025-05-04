import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getSupportedCurrencies = async () => {
  const response = await axios.get('/currency/supported');
  return response.data;
};

export const getExchangeRates = async (base: string = 'EUR') => {
  const response = await axios.get(`/currency/rates?base=${base}`);
  return response.data;
};

export const convertCurrency = async (amount: number, from: string = 'EUR', to: string) => {
  const response = await axios.get(`/currency/convert?amount=${amount}&from=${from}&to=${to}`);
  return response.data;
};

export const getTripBudgetInCurrency = async (tripId: string, currency: string) => {
  const response = await axios.get(`/currency/trip/${tripId}?currency=${currency}`);
  return response.data;
};