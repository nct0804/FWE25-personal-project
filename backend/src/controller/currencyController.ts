import express from 'express';
import { CurrencyService } from '../utils/currency';
import Trip from '../utils/trips';

class CurrencyController {
    getSupportedCurrencies = async (req: express.Request, res: express.Response) => {
        try {
            res.status(200).json({
                currencies: CurrencyService.getSupportedCurrencies(),
                defaultCurrency: 'EUR'
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching supported currencies', error });
        }
    };

    getExchangeRates = async (req: express.Request, res: express.Response) => {
        try {
            const { base = 'EUR' } = req.query;
            
            if (!CurrencyService.getSupportedCurrencies().includes(base.toString())) {
                return res.status(400).json({ 
                    message: 'Unsupported base currency',
                    supportedCurrencies: CurrencyService.getSupportedCurrencies()
                });
            }
            const rates = await CurrencyService.getLatestRates(base.toString());
            res.status(200).json(rates);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching exchange rates', error });
        }
    };

    convertCurrency = async (req: express.Request, res: express.Response) => {
        try {
            const { amount, from = 'EUR', to } = req.query;
            if (!amount || !to) {
                return res.status(400).json({ message: 'Amount and to parameters are required' });
            }
            const amountValue = parseFloat(amount.toString());
            if (isNaN(amountValue) || amountValue <= 0) {
                return res.status(400).json({ message: 'Amount must be a positive number' });
            }

            const convertedAmount = await CurrencyService.convertAmount(
                parseFloat(amount.toString()),
                from.toString(),
                to.toString()
            );
            
            res.status(200).json({
                amount: parseFloat(amount.toString()),
                from: from.toString(),
                to: to.toString(),
                convertedAmount,
                rate: convertedAmount / parseFloat(amount.toString())
            });
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Error converting currency',
                supportedCurrencies: CurrencyService.getSupportedCurrencies()
            });
        }
    };

    getTripBudgetInCurrency = async (req: express.Request, res: express.Response) => {
        try {
            const { tripId } = req.params;
            const { currency = 'JPY' } = req.query;
            
            const trip = await Trip.findById(tripId);
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }

            const convertedBudget = await CurrencyService.convertAmount(
                trip.budget || 0,
                'EUR', // Assuming budget is stored in EUR
                currency.toString()
            );
            
            res.status(200).json({
                originalBudget: trip.budget,
                originalCurrency: 'EUR',
                convertedBudget,
                currency: currency.toString(),
                tripId
            });
        } catch (error) {
            res.status(500).json({ message: 'Error converting trip budget', error });
        }
    };
}

export default new CurrencyController();