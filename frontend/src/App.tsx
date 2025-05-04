import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import TripForm from './components/TripForm';
import DestinationList from './components/DestinationList';
import DestinationDetail from './components/destination_Detail';
import DestinationForm from './components/destination_Form';

import BudgetSummary from './components/BudgetSummary';
import CurrencyConverter from './components/CurrencyConvention';

const BudgetSummaryWrapper = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>No trip ID provided</div>;
  }

  return <BudgetSummary tripId={id} />;
};


const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Travel Planner
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/trips">
              Trips
            </Button>
            <Button color="inherit" component={Link} to="/destinations">
              Destinations
            </Button>
            <Button color="inherit" component={Link} to="/currency-converter">
              Currency Converter
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Routes>
          {/* Trip Routes */}
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/new" element={<TripForm />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/:id/edit" element={<TripForm isEdit />} />
          
          {/* Trip Budget Routes */}
          <Route path="/trips/:id/budget" element={<BudgetSummaryWrapper />} />
          
          {/* Destination Routes */}
          <Route path="/destinations" element={<DestinationList />} />
          <Route path="/destinations/new" element={<DestinationForm />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/destinations/:id/edit" element={<DestinationForm isEdit />} />
          
          {/* Currency Routes */}
          <Route path="/currency-converter" element={<CurrencyConverter />} />
          
          {/* Default Route */}
          <Route path="/" element={<TripList />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;