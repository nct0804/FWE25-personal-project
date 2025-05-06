// this is the homepage website
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getAllTrips, searchTrips } from '../api/trips';
import { Trip } from '../types';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

interface SearchFormData {
  name?: string;
  startDate?: string;
  endDate?: string;
}

const TripList: React.FC = () => {
  const { register, handleSubmit, formState: { isDirty } } = useForm<SearchFormData>();
  
  const [searchFilters, setSearchFilters] = React.useState<SearchFormData>({});
  const [hasSearched, setHasSearched] = React.useState(false);
  const [showingAllTrips, setShowingAllTrips] = React.useState(false);
  const normalizeDate = (date: string | Date): string => {
    const d = new Date(date);
    // Set time to 00:00:00 to avoid timezone issues
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0]; // Get just the YYYY-MM-DD part
  };
  const {
    data: trips,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Trip[]>({
    queryKey: ['trips', searchFilters, hasSearched, showingAllTrips],
    // Update the queryFn section of your useQuery hook

    queryFn: async () => {
      if (showingAllTrips) {
        try {
          const allTrips = await getAllTrips();
          return allTrips;
        } catch (err) {
          console.error("Error fetching all trips:", err);
          throw err;
        }
      }
      if (!hasSearched) {
        return [];
      }
    
      const params: Record<string, string> = {};
      
      // Add name parameter if provided
      if (searchFilters.name) params.name = searchFilters.name;
      
      // Format dates for backend API call using the normalizeDate helper
      if (searchFilters.startDate) {
        params.startDate = normalizeDate(searchFilters.startDate);
      }
      
      if (searchFilters.endDate) {
        params.endDate = normalizeDate(searchFilters.endDate);
      }
    
      try {
        if (Object.keys(params).length > 0) {
          // Get initial results from backend
          let results = await searchTrips(params);
          
          // Apply exact name matching if name is provided
          if (searchFilters.name) {
            const exactName = searchFilters.name.trim().toLowerCase();
            results = results.filter(trip => 
              trip.name.toLowerCase() === exactName
            );
          }
          
          // Apply exact date matching with normalized dates
          if (searchFilters.startDate || searchFilters.endDate) {
            results = results.filter(trip => {
              const tripStartDate = trip.startDate ? normalizeDate(trip.startDate) : null;
              const tripEndDate = trip.endDate ? normalizeDate(trip.endDate) : null;
              
              const searchStartDateNorm = searchFilters.startDate ? normalizeDate(searchFilters.startDate) : null;
              const searchEndDateNorm = searchFilters.endDate ? normalizeDate(searchFilters.endDate) : null;
              
              const startDateMatches = !searchStartDateNorm ? true : 
                tripStartDate && tripStartDate.includes(searchStartDateNorm);
                
              const endDateMatches = !searchEndDateNorm ? true : 
                tripEndDate && tripEndDate.includes(searchEndDateNorm);
              
              return startDateMatches && endDateMatches;
            });
          }
          
          return results;
        }
        return [];
      } catch (err) {
        console.error("Error fetching trips:", err);
        throw err;
      }
    },
    retry: 2,
  });

  const handleShowAllTrips = () => {
    setShowingAllTrips(true);
    setHasSearched(false);
    setSearchFilters({});
  }

  const onSubmit = (data: SearchFormData) => {
    console.log("Search form submitted with data:", data);
    setShowingAllTrips(false);
    // Check if at least one search field is populated
    const hasSearchTerm = !!data.name || !!data.startDate || !!data.endDate;
    if (!hasSearchTerm) {
      alert("Please enter at least one search criteria");
      return;
    }
    
    // Basic date validation
    if (data.startDate || data.endDate) {
      // If one date is provided, recommend providing both for better results
      if (data.startDate && !data.endDate) {
        if (!window.confirm("You only entered a Start Date. This will pirnt out trips with the exact start date. Continue?")) {
          return;
        }
      } else if (!data.startDate && data.endDate) {
        if (!window.confirm("You only entered an End Date. This will print out trips with the exact end date. Continue?")) {
          return;
        }
      } else if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        // Make sure start date is not after end date
        if (startDate > endDate) {
          alert("Start date cannot be after end date");
          return;
        }
      }
    }
    
    setSearchFilters(data);
    setHasSearched(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">
          Error loading trips: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  const formatTripDates = (trip: Trip) => {
    const startDateStr = trip.startDate ? new Date(trip.startDate).toLocaleDateString() : null;
    const endDateStr = trip.endDate ? new Date(trip.endDate).toLocaleDateString() : null;
    
    if (startDateStr && endDateStr) {
      return `${startDateStr} to ${endDateStr}`;
    } else if (startDateStr) {
      return `From ${startDateStr}`;
    } else if (endDateStr) {
      return `Until ${endDateStr}`;
    } else {
      return 'No dates specified';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Manage your itinerary
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
        <TextField
          label="Search by name"
          {...register('name')}
          variant="outlined"
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          {...register('startDate')}
          variant="outlined"
          inputProps={{ max: searchFilters.endDate }}  
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          {...register('endDate')}
          variant="outlined"
          inputProps={{ min: searchFilters.startDate }} 
        />
        <Button 
          variant="contained" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleShowAllTrips}
          disabled={isLoading || showingAllTrips}
        >Show Trips</Button>
      </Box>
    

      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/trips/new" 
        sx={{ marginBottom: 2 }}
      >
        Create New Trip
      </Button>

      {trips && trips.length > 0 ? (
        <>
          {showingAllTrips && (
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                All available trips are below:
            </Typography>
          )}
          <List>
            {trips.map((trip) => (
              <ListItem 
                key={trip._id} 
                component={Link} 
                to={`/trips/${trip._id}`} 
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemText
                  primary={trip.name}
                  secondary={`${formatTripDates(trip)} - ${
                    trip.destinations ? trip.destinations.length : 0
                  } destinations`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : !hasSearched && !showingAllTrips ? (
        <Typography variant="body1" sx={{ padding: 2 }}>
          Please search for trips above or click "Show Trips".
        </Typography>
      ) : (
        <Typography variant="body1" sx={{ padding: 2 }}>
          No trips {showingAllTrips ? "available" : "match your search criteria"}.
        </Typography>
      )}
    </Paper>
  );
};

export default TripList;