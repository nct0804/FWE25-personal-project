import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDestination, updateDestination, getDestinationById } from '../api/destinations';
import { Destination } from '../types';
import { TextField, Button, Typography, Paper, Box, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DestinationFormProps {
  isEdit?: boolean;
}

const DestinationForm: React.FC<DestinationFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<string[]>(['']);
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Destination>({
    defaultValues: {
      name: '',
      description: '',
      activities: [],
      startDate: undefined,
      endDate: undefined,
      photos: [],
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchDestination = async () => {
        try {
          const destinationData = await getDestinationById(id);
          const destination = destinationData.destination;
          
          setValue('name', destination.name);
          setValue('description', destination.description || '');
          setValue('startDate', destination.startDate ? new Date(destination.startDate) : undefined);
          setValue('endDate', destination.endDate ? new Date(destination.endDate) : undefined);
          
          if (destination.activities) {
            setActivities([...destination.activities, '']);
          }
        } catch (error) {
          console.error('Error fetching destination:', error);
        }
      };
      
      fetchDestination();
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: Destination) => {
    try {
      const destinationData = {
        ...data,
        activities: activities.filter(a => a.trim() !== ''),
      };
      
      if (isEdit && id) {
        await updateDestination(id, destinationData);
      } else {
        await createDestination(destinationData);
      }
      
      navigate('/destinations');
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
    
    // Add a new empty field if this is the last one and it's being filled
    if (index === activities.length - 1 && value.trim() !== '') {
      setActivities([...newActivities, '']);
    }
  };

  const handleRemoveActivity = (index: number) => {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Destination' : 'Create New Destination'}
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Destination name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Destination Name"
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
              Activities
            </Typography>
            {activities.map((activity, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <TextField
                  value={activity}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  label={`Activity ${index + 1}`}
                  fullWidth
                />
                {index < activities.length - 1 && (
                  <Button
                    onClick={() => handleRemoveActivity(index)}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/destinations')}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isEdit ? 'Update Destination' : 'Create Destination'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default DestinationForm;