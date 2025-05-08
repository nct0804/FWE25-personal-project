import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getTrip,
  deleteTrip,
  addDestinationToTrip,
  removeDestinationFromTrip,
} from '../api/trips';
import { getAllDestinations } from '../api/destinations';
import { Trip, Destination } from '../types';
import {
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Delete, Edit, ArrowBack } from '@mui/icons-material';
import BudgetSummary from './BudgetSummary';
import CurrencyConverter from './CurrencyConvention';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tabValue, setTabValue] = useState('1');
  const [selectedDestination, setSelectedDestination] = useState('');

  const {
    data: trip,
    isLoading: isTripLoading,
    isError: isTripError,
  } = useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id!), 
    enabled: !!id,
  });

  const {
    data: destinations,
    isLoading: isDestinationsLoading,
    isError: isDestinationsError,
  } = useQuery<Destination[]>({
    queryKey: ['destinations'],
    queryFn: () => getAllDestinations(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate('/trips');
    },
  });

  const addDestinationMutation = useMutation({
    mutationFn: () => addDestinationToTrip(id!, selectedDestination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      setSelectedDestination('');
    },
  });

  const removeDestinationMutation = useMutation({
    mutationFn: (destinationId: string) =>
      removeDestinationFromTrip(id!, destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
    },
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  if (isTripLoading || isDestinationsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isTripError || !trip) {
    return <Typography color="error">Error loading trip details.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Button startIcon={<ArrowBack />} component={Link} to="/trips" variant="outlined">
          Back to List
        </Button>
        <Box>
          <Button startIcon={<Edit />} component={Link} to={`/trips/${id}/edit`} variant="contained" sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={() => deleteMutation.mutate()}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom>{trip.name}</Typography>

      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange}>
            <Tab label="Overview" value="1" />
            <Tab label="Destinations" value="2" />
            <Tab label="Budget" value="3" />
          </TabList>
        </Box>

        <TabPanel value="1">
          <Typography variant="h6" gutterBottom>Start Date - End date</Typography>
          <Typography variant="subtitle1" gutterBottom>
            {trip.startDate && trip.endDate
              ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
              : 'No dates specified'}
          </Typography>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph>{trip.description || 'No description provided'}</Typography>
          {(trip.participants ?? []).length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>Participants</Typography>
              <List>
                {(trip.participants ?? []).map((p, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={p} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>

        <TabPanel value="2">
          <Typography variant="h5" gutterBottom>Destinations</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel>Add Destination</InputLabel>
                <Select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  label="Add Destination"
                >
                  <MenuItem value="">
                    <em>Select a destination</em>
                  </MenuItem>
                  {destinations?.map((dest) => (
                    <MenuItem key={dest._id} value={dest._id}>{dest.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: '56px' }}
                onClick={() => addDestinationMutation.mutate()}
                disabled={!selectedDestination}
              >
                Add Destination
              </Button>
            </Grid>
          </Grid>

          <List>
            {(trip.destinations ?? []).length > 0 ? (
              (trip.destinations ?? []).map((d) => (
                <ListItem
                  key={d._id}
                  sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeDestinationMutation.mutate(d._id)}
                    >
                      Remove
                    </Button>
                  }
                >
                  <ListItemText
                    primary={d.name}
                    secondary={d.description || 'No description'}
                  />
                </ListItem>
              ))
            ) : (
              <Typography>No destinations added yet</Typography>
            )}
          </List>
        </TabPanel>

        <TabPanel value="3">{id && <BudgetSummary tripId={id} />}</TabPanel>
      </TabContext>
    </Paper>
  );
};

export default TripDetail;
