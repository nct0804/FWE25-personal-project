import axios from 'axios';

const API_BASE = 'https://api.frankfurter.app';
const SUPPORTED_CURRENCIES = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR'];

interface ExchangeRates {
    rates: Record<string, number>;
    base: string;
    date: string;
}

export const CurrencyService = {

    getSupportedCurrencies(): string[] {
        return SUPPORTED_CURRENCIES;
    },

    async getLatestRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
        if (!SUPPORTED_CURRENCIES.includes(baseCurrency)) {
            throw new Error(`Unsupported base currency: ${baseCurrency}`);
        }
        try {
            const response = await axios.get(`${API_BASE}/latest?from=${baseCurrency}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw new Error('Failed to fetch exchange rates');
        }
    },

    async convertAmount(amount: number, from: string, to: string): Promise<number> {
        if (!SUPPORTED_CURRENCIES.includes(from) || !SUPPORTED_CURRENCIES.includes(to)) {
            throw new Error('Unsupported currency pair');
        }
        try {
            if (from === to) return amount;
            
            const response = await axios.get(`${API_BASE}/latest?amount=${amount}&from=${from}&to=${to}`);
            return response.data.rates[to];
        } catch (error) {
            console.error('Error converting currency:', error);
            throw new Error('Failed to convert currency');
        }
    },

    async getHistoricalRates(date: string, baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
        try {
            const response = await axios.get(`${API_BASE}/${date}?from=${baseCurrency}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching historical rates:', error);
            throw new Error('Failed to fetch historical rates');
        }
    }
};