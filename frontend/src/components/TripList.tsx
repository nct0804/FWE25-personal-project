import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
     getAllTrips,
     getTrip,
     searchTrips,
     createTrip,
     updateTrip,
    deleteTrip,
    addDestinationToTrip,
    removeDestinationFromTrip,
} from '../api/trips';
import { Trip } from '../types';
import { TextField, Button, List, ListItem, ListItemText, Paper, Typography, Box } from '@mui/material';

interface SearchFormData {
  name?: string;
  startDate?: string;
  endDate?: string;
}

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getAllTrips();
      setTrips(data.trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await searchTrips(searchTerm, startDate, endDate);
      setTrips(data.trips);
    } catch (error) {
      console.error('Error searching trips:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Trip List
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
        <TextField
          label="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          variant="outlined"
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          variant="outlined"
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Button variant="contained" color="primary" component={Link} to="/trips/new" sx={{ marginBottom: 2 }}>
        Create New Trip
      </Button>

      <List>
        {trips.map((trip) => (
          <ListItem key={trip._id} component={Link} to={`/trips/${trip._id}`} sx={{ textDecoration: 'none' }}>
            <ListItemText
              primary={trip.name}
              secondary={`${trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'} - ${
                trip.destinations ? trip.destinations.length : 0
              } destinations`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TripList;