import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBudgetSummary } from '../api/budget';
import { Typography, Paper, Box, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface BudgetSummaryData {
  budget: number;
  totalSpent: number;
  remaining: number;
  byCategory: Record<string, number>;
  currency: string;
  convertedValues: {
    budget: number;
    totalSpent: number;
    remaining: number;
    byCategory: Record<string, number>;
    currency: string;
    rate: number;
  } | null;
}
interface BudgetSummaryProps {
    tripId: string;
  }
  

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ tripId }) => {
const [summary, setSummary] = useState<BudgetSummaryData | null>(null);
const [loading, setLoading] = useState(true);
const [currency, setCurrency] = useState('EUR');
  

    useEffect(() => {
        const fetchSummary = async () => {
        try {
            const data = await getBudgetSummary(tripId, currency);
            setSummary(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching budget summary:', error);
            setLoading(false);
        }
    };
        
    fetchSummary();
  }, [tripId, currency]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return <Typography>No budget data available</Typography>;
  }

  const displayData = currency === 'EUR' || !summary.convertedValues 
    ? summary 
    : summary.convertedValues;

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h5" gutterBottom>
        Budget Summary
      </Typography>
      
      <FormControl sx={{ marginBottom: 3, minWidth: 120 }}>
        <InputLabel>Currency</InputLabel>
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as string)}
          label="Currency"
        >
          <MenuItem value="EUR">EUR</MenuItem>
          {summary.convertedValues && (
            <MenuItem value={summary.convertedValues.currency}>
              {summary.convertedValues.currency}
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Budget
            </Typography>
            <Typography variant="h4">
              {displayData.currency} {displayData.budget.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Spent
            </Typography>
            <Typography variant="h4" color="error">
              {displayData.currency} {displayData.totalSpent.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Remaining
            </Typography>
            <Typography variant="h4" color={displayData.remaining >= 0 ? 'success.main' : 'error'}>
              {displayData.currency} {displayData.remaining.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
            Spending by Category
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(displayData.byCategory).map(([category, amount]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Paper elevation={1} sx={{ padding: 2 }}>
                  <Typography variant="subtitle1">{category}</Typography>
                  <Typography variant="body1">
                    {displayData.currency} {amount.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BudgetSummary;