import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDestinationById, deleteDestination } from '../api/destinations';
import { getTripsByDestination } from '../api/trips';
import { Destination, Trip } from '../types';
import {
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
} from '@mui/material';
import { Delete, Edit, ArrowBack } from '@mui/icons-material';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: destination,
    isLoading: isDestinationLoading,
    isError: isDestinationError,
  } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => getDestinationById(id!),
    enabled: !!id,
  });

const {
  data: trips,
  isLoading: isTripsLoading,
  isError: isTripsError,
} = useQuery({
  queryKey: ['tripsByDestination', id],
  queryFn: async () => {
    // Get all trips from the API
    const allTrips = await getTripsByDestination(id!);
    
    return allTrips.filter(trip => {
      if (!trip.destinations) return false;

      return trip.destinations.some(dest => {
        if (typeof dest === 'string') {
          return dest === id;
        }
        return (dest._id === id || dest.id === id);
      });
    });
  },
  enabled: !!id,
});

  const deleteMutation = useMutation({
    mutationFn: () => deleteDestination(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      navigate('/destinations');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isDestinationLoading || isTripsLoading) return <CircularProgress />;
  if (isDestinationError || !destination) return <Typography>Error loading destination.</Typography>;

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Button startIcon={<ArrowBack />} component={Link} to="/destinations" variant="outlined">
          Back to List
        </Button>
        <Box>
          <Button
            startIcon={<Edit />}
            component={Link}
            to={`/destinations/${id}/edit`}
            variant="contained"
            color="primary"
            sx={{ marginRight: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom>
        {destination.name}
      </Typography>

      <Typography variant="body1" paragraph>
        {destination.description || 'No description provided'}
      </Typography>

      {destination.startDate && destination.endDate && (
        <Typography variant="subtitle1" gutterBottom>
          {new Date(destination.startDate).toLocaleDateString()} -{' '}
          {new Date(destination.endDate).toLocaleDateString()}
        </Typography>
      )}

      {destination.activities && destination.activities.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Activities
          </Typography>
          <List>
            {destination.activities.map((activity, index) => (
              <ListItem key={index}>
                <ListItemText primary={activity} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
        Trips including this destination
      </Typography>

      {isTripsError ? (
        <Typography>Error loading trips.</Typography>
      ) : isTripsLoading ? (
        <Box sx={{ display: 'flex', py: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Loading trips...</Typography>
        </Box>
        ) : trips && trips.length > 0 ? (
        <List>
          {trips.map((trip) => (
            <ListItem
              key={trip._id}
              component={Link}
              to={`/trips/${trip._id}`}
              sx={{ textDecoration: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderRadius: 1}
               }}
            >
              <ListItemText
                primary={trip.name}
                secondary={
                  trip.startDate && trip.endDate
                    ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
                        trip.endDate
                      ).toLocaleDateString()}`
                    : 'No dates specified'
                }
              />
            </ListItem>
          ))}
        </List>
      ) :  (
        <Box sx={{ py: 2, px: 1 }}>
          <Typography variant="body1">
            This destination hasn't been added to any trips yet.
          </Typography>
        </Box>)}
    </Paper>
  );
};

export default DestinationDetail;
