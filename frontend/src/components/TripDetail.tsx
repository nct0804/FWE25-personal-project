import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTrip, deleteTrip, addDestinationToTrip, removeDestinationFromTrip } from '../api/trips';
import { getAllDestinations } from '../api/destinations';
import { Trip, Destination } from '../types';
import { Button, Typography, Paper, List, ListItem, ListItemText, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Delete, Edit, ArrowBack } from '@mui/icons-material';
import Grid from '@mui/material/Grid';

import BudgetSummary from './BudgetSummary';
import CurrencyConverter from './CurrencyConvention';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState('1');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const tripData = await getTrip(id);
          setTrip(tripData.trip);
          
          const destinationsData = await getAllDestinations();
          setDestinations(destinationsData.destinations);
        }
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (id) {
        await deleteTrip(id);
        navigate('/trips');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleAddDestination = async () => {
    try {
      if (id && selectedDestination) {
        await addDestinationToTrip(id, selectedDestination);
        const updatedTrip = await getTrip(id);
        setTrip(updatedTrip.trip);
        setSelectedDestination('');
      }
    } catch (error) {
      console.error('Error adding destination:', error);
    }
  };

  const handleRemoveDestination = async (destinationId: string) => {
    try {
      if (id) {
        await removeDestinationFromTrip(id, destinationId);
        const updatedTrip = await getTrip(id);
        setTrip(updatedTrip.trip);
      }
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  if (!trip) {
    return <div>Loading...</div>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Button startIcon={<ArrowBack />} component={Link} to="/trips" variant="outlined">
          Back to List
        </Button>
        <Box>
          <Button startIcon={<Edit />} component={Link} to={`/trips/${id}/edit`} variant="contained" color="primary" sx={{ marginRight: 1 }}>
            Edit
          </Button>
          <Button startIcon={<Delete />} onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </Box>
      </Box>
  
      <Typography variant="h4" gutterBottom>
        {trip.name}
      </Typography>
      
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="tabs">
            <Tab label="Overview" value="1" />
            <Tab label="Destinations" value="2" />
            <Tab label="Budget" value="3" />
            <Tab label="Currency" value="4" />
          </TabList>
        </Box>
        
        <TabPanel value="1">
          <Typography variant="subtitle1" gutterBottom>
            {trip.startDate && trip.endDate
              ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
              : 'No dates specified'}
          </Typography>
          <Typography variant="body1" paragraph>
            {trip.description || 'No description provided'}
          </Typography>
  
          {trip.participants && trip.participants.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Participants
              </Typography>
              <List>
                {trip.participants.map((participant, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={participant} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>
        
        <TabPanel value="2">
          <Typography variant="h5" gutterBottom>
            Destinations
          </Typography>
  
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel>Add Destination</InputLabel>
                <Select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value as string)}
                  label="Add Destination"
                >
                  <MenuItem value="">
                    <em>Select a destination</em>
                  </MenuItem>
                  {destinations.map((dest) => (
                    <MenuItem key={dest._id} value={dest._id}>
                      {dest.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={handleAddDestination}
                disabled={!selectedDestination}
                fullWidth
                sx={{ height: '56px' }}
              >
                Add Destination
              </Button>
            </Grid>
          </Grid>
  
          <List>
            {trip.destinations && trip.destinations.length > 0 ? (
              trip.destinations.map((destination) => (
                <ListItem key={destination._id} sx={{ border: '1px solid #eee', marginBottom: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={destination.name}
                    secondary={destination.description || 'No description'}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveDestination(destination._id)}
                  >
                    Remove
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2">No destinations added yet</Typography>
            )}
          </List>
        </TabPanel>
        
        <TabPanel value="3">
          {id && <BudgetSummary tripId={id} />}
        </TabPanel>
        
        <TabPanel value="4">
          <CurrencyConverter />
        </TabPanel>
      </TabContext>
    </Paper>
  );
};

export default TripDetail;