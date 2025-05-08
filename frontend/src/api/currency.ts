import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const COMMON_CURRENCIES = ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD', 'CNY'];


export const getSupportedCurrencies = async (): Promise<string[]> => {
  try {
    // Call your backend endpoint that exposes the Frankfurter currency list
    const response = await axios.get(`${API_BASE_URL}/currencies`);
    console.log('Currencies response:', response.data);
    return response.data.currencies || response.data || [];
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    // Return common currencies as fallback
    return ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD', 'CNY'];
  }
};

export const getExchangeRates = async (base: string = 'EUR') => {
  const response = await axios.get(`/currency/rates?base=${base}`);
  return response.data;
};

export const convertCurrency = async (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<{ convertedAmount: number; rate: number }> => {
  try {
    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
    
    // First get the exchange rate without specifying amount
    const rateResponse = await axios.get(`https://api.frankfurter.app/latest`, {
      params: { 
        from: fromCurrency,
        to: toCurrency 
      }
    });
    
    console.log('Rate response:', rateResponse.data);
    
    // Extract the exchange rate
    if (rateResponse.data && rateResponse.data.rates && rateResponse.data.rates[toCurrency]) {
      const rate = rateResponse.data.rates[toCurrency];
      const convertedAmount = amount * rate;
      
      return {
        convertedAmount: Number(convertedAmount),
        rate: Number(rate)
      };
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    console.error('Error converting currency:', error);
    
    // Fallback to approximations for common currency pairs
    const fallbackRates: Record<string, Record<string, number>> = {
      'EUR': { 'USD': 1.07, 'JPY': 167.5, 'GBP': 0.85, 'CHF': 0.97, 'CAD': 1.46, 'AUD': 1.63, 'CNY': 7.85 },
      'USD': { 'EUR': 0.93, 'JPY': 156.5, 'GBP': 0.79, 'CHF': 0.91, 'CAD': 1.36, 'AUD': 1.52, 'CNY': 7.23 }
    };
    
    if (fromCurrency in fallbackRates && toCurrency in fallbackRates[fromCurrency]) {
      const rate = fallbackRates[fromCurrency][toCurrency];
      return {
        convertedAmount: amount * rate,
        rate: rate
      };
    } else if (toCurrency in fallbackRates && fromCurrency in fallbackRates[toCurrency]) {
      const rate = 1 / fallbackRates[toCurrency][fromCurrency];
      return {
        convertedAmount: amount * rate,
        rate: rate
      };
    }
    
    throw error;
  }
};

export const getTripBudgetInCurrency = async (tripId: string, currency: string) => {
  const response = await axios.get(`/currency/trip/${tripId}?currency=${currency}`);
  return response.data;
};