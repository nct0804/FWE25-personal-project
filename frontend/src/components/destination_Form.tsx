import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDestinationById, createDestination, updateDestination } from '../api/destinations';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DestinationFormProps {
  isEdit?: boolean;
}

interface DestinationFormData {
  name: string;
  description?: string;
  activities: string[];
  startDate?: Date;
  endDate?: Date;
  photos?: string[];
}

const DestinationForm: React.FC<DestinationFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activities, setActivities] = React.useState<string[]>(['']);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DestinationFormData>({
    defaultValues: {
      name: '',
      description: '',
      activities: [],
      photos: []
    }
  });

  const {
    data: destination,
    isLoading: isDestinationLoading,
    isError: isDestinationError,
  } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => getDestinationById(id!),
    enabled: isEdit && !!id,
  });

  const createMutation = useMutation({
    mutationFn: createDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      navigate('/destinations');
    },
  });
  

  const updateMutation = useMutation({
    mutationFn: (destinationData: DestinationFormData) =>
      updateDestination(id!, destinationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination', id] });
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      navigate(`/destinations/${id}`);
    },
  });
  

  React.useEffect(() => {
    if (isEdit && destination) {
      setValue('name', destination.name);
      setValue('description', destination.description || '');
      setValue('startDate', destination.startDate ? new Date(destination.startDate) : undefined);
      setValue('endDate', destination.endDate ? new Date(destination.endDate) : undefined);
      
      if (destination.activities) {
        setActivities([...destination.activities, '']);
      }
    }
  }, [isEdit, destination, setValue]);

  const onSubmit = (data: DestinationFormData) => {
    const destinationData = {
      ...data,
      activities: activities.filter((a) => a.trim() !== ''),
    };

    if (isEdit && id) {
      updateMutation.mutate(destinationData);
    } else {
      createMutation.mutate(destinationData);
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

  if (isDestinationLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isDestinationError) {
    return <Typography color="error">Error loading destination data</Typography>;
  }

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
              <Button
                variant="outlined"
                onClick={() => navigate(isEdit && id ? `/destinations/${id}` : '/destinations')}
                disabled={createMutation.status ==="pending" || updateMutation.status ==="pending"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createMutation.status === "pending" || updateMutation.status === "pending"}
              >
                {createMutation.status ==="pending" || updateMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : isEdit ? (
                  'Update Destination'
                ) : (
                  'Create Destination'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default DestinationForm;