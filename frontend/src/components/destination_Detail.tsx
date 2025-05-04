import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDestinationById, deleteDestination } from '../api/destinations';
import { getTripsByDestination } from '../api/trips';
import { Destination, Trip } from '../types';
import { Button, Typography, Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import { Delete, Edit, ArrowBack } from '@mui/icons-material';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const destinationData = await getDestinationById(id);
          setDestination(destinationData.destination);
          
          const tripsData = await getTripsByDestination(id);
          setTrips(tripsData.trips);
        }
      } catch (error) {
        console.error('Error fetching destination details:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (id) {
        await deleteDestination(id);
        navigate('/destinations');
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  if (!destination) {
    return <div>Loading...</div>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Button startIcon={<ArrowBack />} component={Link} to="/destinations" variant="outlined">
          Back to List
        </Button>
        <Box>
          <Button startIcon={<Edit />} component={Link} to={`/destinations/${id}/edit`} variant="contained" color="primary" sx={{ marginRight: 1 }}>
            Edit
          </Button>
          <Button startIcon={<Delete />} onClick={handleDelete} variant="contained" color="error">
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
          {new Date(destination.startDate).toLocaleDateString()} - {new Date(destination.endDate).toLocaleDateString()}
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
      
      {trips.length > 0 ? (
        <List>
          {trips.map((trip) => (
            <ListItem key={trip._id} component={Link} to={`/trips/${trip._id}`} sx={{ textDecoration: 'none' }}>
              <ListItemText
                primary={trip.name}
                secondary={trip.startDate && trip.endDate
                  ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
                  : 'No dates specified'}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2">No trips found with this destination</Typography>
      )}
    </Paper>
  );
};

export default DestinationDetail;