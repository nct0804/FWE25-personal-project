import axios from 'axios';
import { BudgetSummaryData } from '../types';
import { getTrip } from './trips';
const API_BASE_URL = 'http://localhost:5000/api';

export const getBudgets = async (tripId: string) => {
  const response = await axios.get(`/trips/${tripId}/budgets`);
  return response.data;
};

export const deleteBudget = async (budgetId: string) => {
  const response = await axios.delete(`/trips/budgets/${budgetId}`);
  return response.data;
}

export const getBudgetSummary = async (
  tripId: string, 
  targetCurrency?: string
): Promise<BudgetSummaryData> => {
  try {
    // First, get the trip data to access the budget field
    const tripData = await getTrip(tripId);
    
    try {
      // Use the CORRECT endpoint based on your backend structure
      const budgetSummaryUrl = `${API_BASE_URL}/trips/${tripId}/budgets`;
      const queryParams = targetCurrency ? `?currency=${targetCurrency}` : '';
      const budgetsResponse = await axios.get(`${budgetSummaryUrl}${queryParams}`);
      console.log('Budget response:', budgetsResponse.data);
      
      // Extract budget items from response
      const budgetItems = budgetsResponse.data.budgets || [];
      
      // Calculate total spent by summing all expense amounts
      const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      
      // Calculate spending by category
      const byCategory: Record<string, number> = {};
      budgetItems.forEach((item: any) => {
        const category = item.category || 'Other';
        byCategory[category] = (byCategory[category] || 0) + (Number(item.amount) || 0);
      });
      
      return {
        budget: tripData.budget || 0,
        totalSpent: totalSpent,
        remaining: (tripData.budget || 0) - totalSpent,
        byCategory: byCategory,
        currency: targetCurrency || 'EUR',
        convertedValues: null
      };
    } catch (error) {
      // Handle 404 errors for new trips by returning empty budget structure
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('No budget data yet for this trip, creating empty structure');
        return {
          budget: tripData.budget || 0,
          totalSpent: 0,
          remaining: tripData.budget || 0,
          byCategory: {},
          currency: targetCurrency || 'EUR',
          convertedValues: null
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting budget summary:', error);
    throw error;
  }
};

export const createBudget = async (tripId: string, expenseData: any) => {
  try {
    console.log('Adding expense:', expenseData);
    // Use the correct endpoint based on your backend structure
    const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/budgets`, {
      category: expenseData.category,
      amount: expenseData.amount,
      description: expenseData.description || ''
    });
    console.log('Expense added successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};