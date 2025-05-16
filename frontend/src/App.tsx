import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button, Container, CircularProgress } from '@mui/material';

// Lazy load components
const TripList = React.lazy(() => import('./components/TripList'));
const TripDetail = React.lazy(() => import('./components/TripDetail'));
const TripForm = React.lazy(() => import('./components/TripForm'));
const DestinationList = React.lazy(() => import('./components/DestinationList'));
const DestinationDetail = React.lazy(() => import('./components/destination_Detail'));
const DestinationForm = React.lazy(() => import('./components/destination_Form'));
const BudgetSummary = React.lazy(() => import('./components/BudgetSummary'));
const CurrencyConverter = React.lazy(() => import('./components/CurrencyConvention'));

// Navigation Component
const Navigation = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Journey planner
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
);

// BudgetSummary Wrapper Component
const BudgetSummaryWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return id ? <BudgetSummary tripId={id} /> : <div>No trip ID provided</div>;
};

// Loading Component
const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Navigation />
      
      <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </Container>
    </Router>
  );
};

export default App;