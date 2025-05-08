import axios from 'axios';
import { BudgetSummaryData } from '../types';
import { getTrip } from './trips';
const API_BASE_URL = 'http://localhost:5000/api';

export const getBudgets = async (tripId: string) => {
  const response = await axios.get(`/trips/${tripId}/budgets`);
  return response.data;
};

export const createBudget = async (tripId: string, expenseData: any) => {
  try {
    console.log('Adding expense:', expenseData);
    // Add a flag to the request to allow negative budget
    const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/budgets`, {
      ...expenseData,
      allowNegative: true // Add this flag for the backend
    });
    console.log('Expense added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  const response = await axios.delete(`/trips/budgets/${budgetId}`);
  return response.data;
}

// In your src/api/budget.ts file
export const getBudgetSummary = async (
  tripId: string, 
  targetCurrency?: string
): Promise<BudgetSummaryData> => {
  try {
    // First, get the trip data to access the budget field
    const tripData = await getTrip(tripId);
    
    // Then, get all budget expenses for this trip (note the plural "budgets")
    const budgetsResponse = await axios.get(`${API_BASE_URL}/trips/${tripId}/budgets`);
    console.log('Budgets response:', budgetsResponse.data);
    
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
    
    // Return the budget summary data
    return {
      budget: tripData.budget || 0,
      totalSpent: totalSpent,
      remaining: (tripData.budget || 0) - totalSpent,
      byCategory: byCategory,
      currency: targetCurrency || 'EUR',
      convertedValues: null
    };
  } catch (error) {
    console.error('Error getting budget summary:', error);
    throw error;
  }
};