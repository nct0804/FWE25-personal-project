import React, { useEffect, useState } from 'react';
import { convertCurrency, getSupportedCurrencies } from '../api/currency';
import { TextField, Button, Typography, Paper, Box, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Supported_Currencies = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR'];
const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>(Supported_Currencies);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getSupportedCurrencies();
        setCurrencies(data.currencies);
      } catch (error) {
        console.error('Error fetching supported currencies:', error);
      }
    };
    
    fetchCurrencies();
  }, []);

  const handleConvert = async () => {
    if (amount <= 0) return;
    
    setLoading(true);
    try {
      const result = await convertCurrency(amount, fromCurrency, toCurrency);
      setConvertedAmount(result.convertedAmount);
      setRate(result.rate);
    } catch (error) {
      console.error('Error converting currency:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h5" gutterBottom>
        Currency Converter
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            fullWidth
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>From</InputLabel>
            <Select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as string)}
              label="From"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>To</InputLabel>
            <Select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as string)}
              label="To"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            onClick={handleConvert}
            disabled={loading}
            fullWidth
            sx={{ height: '56px' }}
          >
            {loading ? 'Converting...' : 'Convert'}
          </Button>
        </Grid>
      </Grid>
      
      {convertedAmount !== null && rate !== null && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" gutterBottom>
            Conversion Result
          </Typography>
          <Typography>
            {amount.toFixed(2)} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exchange rate: 1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CurrencyConverter;