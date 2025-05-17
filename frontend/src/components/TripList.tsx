// this is the homepage website
import React from 'react';
import { useForm } from 'react-hook-form';
import { Avatar, Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAllTrips, searchTrips, getTripsByDestination } from '../api/trips';
import { getAllDestinations } from '../api/destinations';
import { Trip, Destination} from '../types';
import type { SelectChangeEvent } from '@mui/material/Select';
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
  destinationID?: string;
}

const TripList: React.FC = () => {
  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<SearchFormData>();
  const [searchFilters, setSearchFilters] = React.useState<SearchFormData>({});
  const [hasSearched, setHasSearched] = React.useState(false);
  const [showingAllTrips, setShowingAllTrips] = React.useState(false);
  const [selectedDestinations, setSelectedDestinations] = React.useState<string[]>([]);
  const [currentDestination, setCurrentDestination] = React.useState<string>("");

  const normalizeDate = (date: string | Date): string => {
    const d = new Date(date);
    // Set time to 00:00:00 to avoid timezone issues
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };
  const {
    data: destinations = [],
    isLoading: isDestinationsLoading,
  } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      try {
        return await getAllDestinations();
      } catch (err) {
        console.error("Error fetching destinations:", err);
        return [];
      }
    }
  });
  
  const {
    data: trips,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Trip[]>({
    queryKey: ['trips', searchFilters, hasSearched, showingAllTrips, selectedDestinations],
    queryFn: async () => {
      let baseTrips: Trip[] = [];
      if(selectedDestinations.length > 0) {
          try{
            console.log("Fetching trips containing selected destinations:", selectedDestinations);
            const allTrips = await getAllTrips();
            baseTrips = allTrips.filter(trip => {
              if (!trip.destinations || !Array.isArray(trip.destinations)) {
                return false;
              }
              const tripDestIds = trip.destinations.map(dest => 
                typeof dest === 'string' ? dest : dest._id
              );
              const allDestinationsIncluded = selectedDestinations.every(selectedDestId => 
                tripDestIds.includes(selectedDestId)
              );
              return allDestinationsIncluded;
            });
            
            console.log("Filtered trips containing selected destinations:", baseTrips);
          } catch (err) {
            console.error("Error fetching trips by destination:", err);
            throw err;
          }
      }else if (showingAllTrips) {
        try {
          baseTrips = await getAllTrips();
        } catch (err) {
          console.error("Error fetching all trips:", err);
          throw err;
        }
      }else if (hasSearched) {
            // Create search parameters for API
          const params: Record<string, string> = {};
          if (searchFilters.name) {
            params.name = searchFilters.name;
          }
          if (searchFilters.startDate) {
            params.startDate = normalizeDate(searchFilters.startDate);
          }
          if (searchFilters.endDate) {
            params.endDate = normalizeDate(searchFilters.endDate);
          }
          try {
            if (Object.keys(params).length > 0) {
              baseTrips = await searchTrips(params);
            }
          } catch (err) {
            console.error("Error searching trips:", err);
            throw err;
          }
      }else {return [];}

      if (hasSearched && baseTrips.length > 0) {
      console.log("Applying additional filters to trips:", searchFilters);

         if (searchFilters.name) {
          const searchName = searchFilters.name.trim().toLowerCase();
          baseTrips = baseTrips.filter(trip => 
            trip.name.toLowerCase().includes(searchName)
          );
        }
  
        if (searchFilters.startDate || searchFilters.endDate) {
          baseTrips = baseTrips.filter(trip => {
            const tripStartDate = trip.startDate ? normalizeDate(trip.startDate) : null;
            const tripEndDate = trip.endDate ? normalizeDate(trip.endDate) : null;
            
            const searchStartDateNorm = searchFilters.startDate ? normalizeDate(searchFilters.startDate) : null;
            const searchEndDateNorm = searchFilters.endDate ? normalizeDate(searchFilters.endDate) : null;
            
            const startDateMatches = !searchStartDateNorm ? true : 
              tripStartDate && tripStartDate === searchStartDateNorm;
              
            const endDateMatches = !searchEndDateNorm ? true : 
              tripEndDate && tripEndDate === searchEndDateNorm;
            
            return startDateMatches && endDateMatches;
          });
        }
        }
        return baseTrips;
    },
    retry: 2,
  });
  




  const handleDestinationChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const destinationIds = typeof value === 'string' ? value.split(',') : value;

    if(destinationIds)
    {
    setSelectedDestinations(destinationIds);
    setShowingAllTrips(false);
    setHasSearched(false);
    setSearchFilters({});
    }else {
    setSelectedDestinations([]);
    setShowingAllTrips(true);
    setHasSearched(false);
    setSearchFilters({});
    }

    // reset the form state
    setValue('name', '');
    setValue('startDate', '');
    setValue('endDate', '');
  }

  const clearDestinationFilter = () => {
  setSelectedDestinations([]);
  setShowingAllTrips(true);
  setHasSearched(false);
  setSearchFilters({});
  
  // Reset form fields
  setValue('name', '');
  setValue('startDate', '');
  setValue('endDate', '');
  };

  const clearSearchFilters = () => {
    setSearchFilters({});
    setHasSearched(false);
    
    // Reset form fields
    setValue('name', '');
    setValue('startDate', '');
    setValue('endDate', '');
  };

  const handleShowAllTrips = () => {
    setShowingAllTrips(true);
    setHasSearched(false);
    setSearchFilters({});
  }
  

  const onSubmit = (data: SearchFormData) => {
    console.log("Search form submitted with data:", data);
    
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
        if (!window.confirm("You only entered a Start Date. This will print out trips with the exact start date. Continue?")) {
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
    
    // Set these regardless of whether destination is selected
    setSearchFilters(data);
    setHasSearched(true);
    setShowingAllTrips(false); // Turn off "show all" when searching
  };

  if (isDestinationsLoading) {
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

      <Box sx={{mb: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Typography variant="subtitle1">
          Filter trips by destination:
        </Typography>

        {isDestinationsLoading ? (
          <CircularProgress size={24} sx={{alignSelf: 'flex-start'}} />
        ) : destinations && destinations.length > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ width: 300 }}>
              <InputLabel id="destination-select-label">Select Destination</InputLabel>
              <Select
                labelId="destination-select-label"
                value={currentDestination}
                onChange={(e) => setCurrentDestination(e.target.value as string)}
                label="Select Destination"
              >
                  {destinations.map((destination) => (
                    <MenuItem key={destination._id} value={destination._id}>
                      {destination.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              color="primary"
              disabled={!currentDestination || selectedDestinations.includes(currentDestination)}
              onClick={() => {
                if (currentDestination && !selectedDestinations.includes(currentDestination)) {
                  setSelectedDestinations([...selectedDestinations, currentDestination]);
                  setShowingAllTrips(false);
                  setHasSearched(false);
                  setSearchFilters({});
                }
              }}
            >
              Add Destination
            </Button>     
          
            {selectedDestinations && (
              <Button 
                variant="outlined" 
                onClick={clearDestinationFilter}
                size="small"
              >
                Clear Filter
              </Button>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color ="text.secondary">
            No destinations available. Please add a destination first.
          </Typography>
        )}

      </Box>
        {selectedDestinations.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {selectedDestinations.map(destId => {
              const dest = destinations.find(d => d._id === destId);
              return (
                <Chip 
                  key={destId} 
                  label={dest?.name || ''} 
                  onDelete={() => {
                    // Remove this specific destination from the selected list
                    setSelectedDestinations(prev => prev.filter(id => id !== destId));
                    
                    // If removing the last destination, show all trips
                    if (selectedDestinations.length === 1) {
                      setShowingAllTrips(true);
                    }
                  }}
                  color="primary"
                />
              );
            })}
          </Box>
        )}

      <Box sx={{ height: '1px', bgcolor: 'divider', my: 2 }}></Box>
      
      {selectedDestinations && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Showing trips for destinations: {
            selectedDestinations.map(id => 
              destinations.find(d => d._id === id)?.name
            ).filter(Boolean).join(', ')
          }
        </Typography>
      )}
      
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
          disabled={isLoading || showingAllTrips || selectedDestinations.length > 0}
        >Show Trips</Button>

        {hasSearched && (
          <Button 
            variant="outlined"
            onClick={clearSearchFilters}
          >
            Clear Search
          </Button>
        )}
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

      {(Array.isArray(trips) && trips.length > 0) ? (
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
                {trip.image ? (
                  <Avatar 
                    src={trip.image} 
                    variant="rounded" 
                    sx={{ width: 60, height: 60, mr: 2 }} 
                  />
                ) : (
                  <Avatar 
                    sx={{ width: 60, height: 60, mr: 2 }} 
                    variant="rounded"
                  >
                    <ImageIcon />
                  </Avatar>
                )}
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
      ) : !hasSearched && !showingAllTrips && selectedDestinations.length === 0 ? (
        <Typography variant="body1" sx={{ padding: 2 }}>
          Please search for trips above or click "Show Trips".
        </Typography>
      ) : (
        <Typography variant="body1" sx={{ padding: 2 }}>
          {selectedDestinations.length > 0 
            ? `No trips found that include all ${selectedDestinations.length} selected destinations.` 
            : hasSearched 
              ? "No trips match your search criteria." 
              : "No trips available."}
        </Typography>
      )}
    </Paper>
  );
};

export default TripList;