import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getBudgets = async (tripId: string) => {
  const response = await axios.get(`/trips/${tripId}/budgets`);
  return response.data;
};

export const createBudget = async (tripId: string, budgetData: any) => {
  const response = await axios.post(`/trips/${tripId}/budgets`, budgetData);
  return response.data;
};
export const deleteBudget = async (budgetId: string) => {
  const response = await axios.delete(`/trips/budgets/${budgetId}`);
  return response.data;
}
export const getBudgetSummary = async (tripId: string, currency?: string) => {
  const response = await axios.get(`/trips/${tripId}/budgets/summary${currency ? `?currency=${currency}` : ''}`);
  return response.data;
}