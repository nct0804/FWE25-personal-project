import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { convertCurrency, getSupportedCurrencies } from '../api/currency';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('JPY');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const COMMON_CURRENCIES = ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD', 'CNY'];

  const {
    data: currencies = COMMON_CURRENCIES, 
    isLoading: isCurrenciesLoading,
    isError: isCurrenciesError,
  } = useQuery({ 
    queryKey: ['supportedCurrencies'], 
    queryFn: getSupportedCurrencies,
    retry: 1, 
    staleTime: 1000 * 60 * 60, 
  });

  const convertMutation = useMutation<
  { convertedAmount: number; rate: number },
  unknown,
  { amount: number; fromCurrency: string; toCurrency: string }
>({
  mutationFn: ({ amount, fromCurrency, toCurrency }) => 
    convertCurrency(amount, fromCurrency, toCurrency),
  onSuccess: (data) => {
    setConvertedAmount(data.convertedAmount);
    setRate(data.rate);
  },
  // Add this error handler
  onError: (error) => {
    console.error("Currency conversion failed:", error);
    alert("Failed to convert currency. Please try again.");
  }
});

  
const handleConvert = () => {
  console.log("Convert button clicked", { amount, fromCurrency, toCurrency });
  
  if (amount <= 0) {
    console.warn("Cannot convert zero or negative amount");
    alert("Please enter a positive amount");
    return;
  }
  
  console.log("Attempting currency conversion...");
  convertMutation.mutate({ amount, fromCurrency, toCurrency });
};
  
  if (isCurrenciesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isCurrenciesError) {
    return <Typography color="error">Error loading currency data</Typography>;
  }

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
              {currencies?.map((currency: string) => (
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
              {currencies?.map((currency: string) => (
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
            disabled={convertMutation.status === 'pending'}
            fullWidth
            sx={{ height: '56px' }}
          >
            {convertMutation.status === "pending" ? 'Converting...' : 'Convert'}
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