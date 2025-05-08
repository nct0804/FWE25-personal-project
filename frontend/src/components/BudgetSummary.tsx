import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBudgetSummary, createBudget } from '../api/budget';
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  TextField,
  Button,
  Grid,
} from '@mui/material';

interface BudgetSummaryProps {
  tripId: string;
}

interface ExpenseData {
  category: string;
  amount: number;
  description?: string;
}

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

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ tripId }) => {
  const [currency, setCurrency] = React.useState('EUR');
  const queryClient = useQueryClient();
  const [newExpense, setNewExpense] = useState<ExpenseData>({
    category: '',
    amount: 0,
    description: ''
  });

const addExpenseMutation = useMutation({
  mutationFn: (expense: ExpenseData) => createBudget(tripId, expense),
  onSuccess: () => {
    console.log('Expense added successfully');
    // Reset form and refetch data
    setNewExpense({ category: '', amount: 0, description: '' });
    queryClient.invalidateQueries({ queryKey: ['budgetSummary', tripId] });
  },
  onError: (error) => {
    console.error('Failed to add expense:', error);
    // Only show generic error, don't alert about exceeding budget
    alert('Error adding expense. Please try again.');
  }
});

  const {
    data: summary,
    isLoading,
    isError,
    error
  } = useQuery<BudgetSummaryData>({
    queryKey: ['budgetSummary', tripId, currency],
    queryFn: () => getBudgetSummary(tripId, currency !== 'EUR' ? currency : undefined),
  });
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">Error loading budget summary</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Trip ID: {tripId}, Currency: {currency}
        </Typography>
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

      <Grid container spacing={3}>
      </Grid>
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
                    {displayData.currency} {(amount as number).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Expense
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Category"
              select
              value={newExpense.category}
              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            >
              <MenuItem value="Accommodation">Accommodation</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transportation">Transportation</MenuItem>
              <MenuItem value="Activities">Activities</MenuItem>
              <MenuItem value="Shopping">Shopping</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Amount (Euro)"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Description (optional)"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => addExpenseMutation.mutate(newExpense)}
              disabled={!newExpense.category || newExpense.amount <= 0 || addExpenseMutation.isPending}
            >
              {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
            {addExpenseMutation.isError && (
              <Typography color="error" sx={{ mt: 1 }}>
                Failed to add expense. Please try again.
              </Typography>
            )}
          </Grid>

        </Grid>
      </Box>
    </Paper>
  );
};

export default BudgetSummary;