import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllDestinations } from '../api/destinations';
import { Destination } from '../types';
import { Button, List, ListItem, ListItemText, Paper, Typography, Box } from '@mui/material';

const DestinationList: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await getAllDestinations();
        setDestinations(data.destinations);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };
    
    fetchDestinations();
  }, []);

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Destination List
      </Typography>
      
      <Button variant="contained" color="primary" component={Link} to="/destinations/new" sx={{ marginBottom: 2 }}>
        Create New Destination
      </Button>

      <List>
        {destinations.map((destination) => (
          <ListItem key={destination._id} component={Link} to={`/destinations/${destination._id}`} sx={{ textDecoration: 'none' }}>
            <ListItemText
              primary={destination.name}
              secondary={destination.description || 'No description'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DestinationList;