import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTrip, updateTrip, getTrip } from '../api/trips';
import { getAllDestinations } from '../api/destinations';
import { Trip, Destination } from '../types';
import { TextField, Button, Typography, Paper, Box, Grid, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface TripFormProps {
  isEdit?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>(['']);
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Trip>({
    defaultValues: {
      name: '',
      description: '',
      image: '',
      participants: [],
      startDate: undefined,
      endDate: undefined,
      destinations: [],
      budget: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const destinationsData = await getAllDestinations();
        setAvailableDestinations(destinationsData.destinations);
        
        if (isEdit && id) {
          const tripData = await getTrip(id);
          const trip = tripData.trip;
          
          setValue('name', trip.name);
          setValue('description', trip.description || '');
          setValue('image', trip.image || '');
          setValue('startDate', trip.startDate ? new Date(trip.startDate) : undefined);
          setValue('endDate', trip.endDate ? new Date(trip.endDate) : undefined);
          setValue('budget', trip.budget || 0);
          
          if (trip.participants) {
            setParticipants([...trip.participants, '']);
          }
          
          if (trip.destinations) {
            setSelectedDestinations(trip.destinations.map((d: { _id: any; }) => d._id));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: Trip) => {
    try {
      const tripData = {
        ...data,
        participants: participants.filter(p => p.trim() !== ''),
        destinations: selectedDestinations,
      };
      
      if (isEdit && id) {
        await updateTrip(id, tripData);
      } else {
        await createTrip(tripData);
      }
      
      navigate('/trips');
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
    
    // Add a new empty field if this is the last one and it's being filled
    if (index === participants.length - 1 && value.trim() !== '') {
      setParticipants([...newParticipants, '']);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const handleDestinationChange = (event: any) => {
    const destinationId = event.target.value as string;
    if (destinationId && !selectedDestinations.includes(destinationId)) {
      setSelectedDestinations([...selectedDestinations, destinationId]);
    }
  };

  const handleRemoveDestination = (destinationId: string) => {
    setSelectedDestinations(selectedDestinations.filter(id => id !== destinationId));
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Trip' : 'Create New Trip'}
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Trip name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Trip Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Start Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="End Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Participants
            </Typography>
            {participants.map((participant, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <TextField
                  value={participant}
                  onChange={(e) => handleParticipantChange(index, e.target.value)}
                  label={`Participant ${index + 1}`}
                  fullWidth
                />
                {index < participants.length - 1 && (
                  <Button
                    onClick={() => handleRemoveParticipant(index)}
                    color="error"
                    sx={{ marginLeft: 1 }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Budget (€)"
                  type="number"
                  fullWidth
                  inputProps={{ step: '0.01' }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Destinations
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Add Destination</InputLabel>
              <Select
                value=""
                onChange={handleDestinationChange}
                label="Add Destination"
              >
                <MenuItem value="">
                  <em>Select a destination</em>
                </MenuItem>
                {availableDestinations
                  .filter(dest => !selectedDestinations.includes(dest._id))
                  .map((dest) => (
                    <MenuItem key={dest._id} value={dest._id}>
                      {dest.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <Box sx={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedDestinations.map(destId => {
                const dest = availableDestinations.find(d => d._id === destId);
                return (
                  <Chip
                    key={destId}
                    label={dest?.name || destId}
                    onDelete={() => handleRemoveDestination(destId)}
                  />
                );
              })}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/trips')}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isEdit ? 'Update Trip' : 'Create Trip'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TripForm;