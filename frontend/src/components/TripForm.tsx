import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTrip, createTrip, updateTrip } from '../api/trips';
import { getAllDestinations } from '../api/destinations';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
interface TripFormProps {
  isEdit?: boolean;
}

interface TripFormData {
  name: string;
  description?: string;
  image?: string;
  participants: string[];
  startDate?: string | Date | undefined;
  endDate?: string | Date | undefined;
  destinations: string[];
  budget?: number;
}

const TripForm: React.FC<TripFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [participants, setParticipants] = React.useState<string[]>(['']);
  const [selectedDestinations, setSelectedDestinations] = React.useState<string[]>([]);
  const [photosPreviews, setPhotosPreview] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>();

  const {
    data: trip,
    isLoading: isTripLoading,
    isError: isTripError,
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id!),
    enabled: isEdit && !!id,
  });

  const {
    data: destinations,
    isLoading: isDestinationsLoading,
    isError: isDestinationsError,
  } = useQuery({
    queryKey: ['destinations'],
    queryFn: getAllDestinations,
  });

  const createMutation = useMutation({
    mutationFn: (tripData: TripFormData) => createTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate('/trips');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (tripData: TripFormData) => updateTrip(id!, tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate(`/trips/${id}`);
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Limit file size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // Calculate new dimensions - reduce size to 800px max
            let width = img.width;
            let height = img.height;
            if (width > 800 || height > 800) {
              const aspectRatio = width / height;
              if (width > height) {
                width = 800;
                height = width / aspectRatio;
              } else {
                height = 800;
                width = height * aspectRatio;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Use lower quality for JPEG compression
            const base64String = canvas.toDataURL('image/jpeg', 0.4);
            resolve(base64String);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    compressImage(file)
      .then((base64String) => {
        setPhotosPreview(base64String);
        setValue('image', base64String);
      })
      .catch((error) => {
        console.error('Error processing image:', error);
        alert('Failed to process the image. Please try a different one.');
      });
  };

  const removeImage = () => {
    setPhotosPreview(null);
    setValue('image', '');
  };

  React.useEffect(() => {
    if (isEdit && trip) {
      console.log("Trip data from backend:", trip); // For debugging
      
      // Basic fields - with more robust handling
      setValue('name', trip.name || '');
      setValue('description', trip.description || '');
      setValue('image', trip.image || '');
      
      // Handle budget - explicit check for undefined
      if (trip.budget !== undefined) {
        setValue('budget', Number(trip.budget));
      }
      
      // Handle dates - ensure proper Date object creation
      if (trip.startDate) {
        try {
          const startDate = new Date(trip.startDate);
          setValue('startDate', !isNaN(startDate.getTime()) ? startDate : undefined);
        } catch (e) {
          console.error("Error parsing startDate:", e);
        }
      }

      if (trip.image) {
      setPhotosPreview(trip.image);
      }
      
      if (trip.endDate) {
        try {
          const endDate = new Date(trip.endDate);
          setValue('endDate', !isNaN(endDate.getTime()) ? endDate : undefined);
        } catch (e) {
          console.error("Error parsing endDate:", e);
        }
      }
      
      if (Array.isArray(trip.participants)) {
        setParticipants([...trip.participants.map((p: any) => String(p)), '']);
      } else if (trip.participants) {
        const participantArray = typeof trip.participants === 'string' 
          ? [trip.participants] 
          : Object.values(trip.participants).map((p: any) => String(p));
        setParticipants([...participantArray, '']);
      } else {
        setParticipants(['']);
      }
      if (trip.destinations) {
        if (Array.isArray(trip.destinations)) {
          const destIds = trip.destinations.map((dest: any) => 
            typeof dest === 'string' ? dest : dest._id || dest.id
          );
          setSelectedDestinations(destIds);
        }
      }
    }
  }, [isEdit, trip, setValue]);

const onSubmit = (data: TripFormData) => {
  const formattedData = {
    ...data,
    startDate: data.startDate ? normalizeDate(data.startDate) : undefined,
    endDate: data.endDate ? normalizeDate(data.endDate) : undefined,
    participants: participants.filter((p) => p.trim() !== ''),
    destinations: selectedDestinations,
    budget: data.budget !== undefined ? Number(data.budget) : undefined,
    image: photosPreviews ?? undefined  // Ensure image is string or undefined
  };

  console.log('Submitting trip data with image:', formattedData.image ? 'Image included' : 'No image');

  if (isEdit && id) {
    updateMutation.mutate(formattedData);
  } else {
    createMutation.mutate(formattedData);
  }
};
  
  const normalizeDate = (date: string | Date): string => {
    const d = new Date(date);
    // Set time to 00:00:00 to avoid timezone issues
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);

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
    setSelectedDestinations(selectedDestinations.filter((id) => id !== destinationId));
  };

  if (isTripLoading || isDestinationsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isTripError || isDestinationsError) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">
          Error loading data. Please try again or contact support.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

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
                    value={field.value || null}
                    onChange={field.onChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                      />
                    )}
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
                    value={field.value || null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                      />
                    )}
                    onChange={(value) => field.onChange(value)}
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
                {destinations
                  ?.filter((dest: any) => !selectedDestinations.includes(dest._id))
                  .map((dest: any) => (
                    <MenuItem key={dest._id} value={dest._id}>
                      {dest.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Box sx={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedDestinations.map((destId) => {
                const dest = destinations?.find((d: any) => d._id === destId);
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
            <Typography variant="subtitle1" gutterBottom>
              Trip Image
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
                disabled={photosPreviews !== null && photosPreviews.length >= 1}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={photosPreviews !== null && photosPreviews.length >= 1}
                />
              </Button>

              {photosPreviews !== null && photosPreviews.length >= 1 && (
                <Typography variant="caption" color="error">
                  Maximum 1 image for thumbnail allowed
                </Typography>
              )}

              {photosPreviews && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <img 
                    src={photosPreviews} 
                    alt="Trip preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      borderRadius: '4px' 
                    }} 
                  />
                  <IconButton 
                    onClick={removeImage}
                    sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(isEdit && id ? `/trips/${id}` : '/trips')}
                disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createMutation.status ==="pending" || updateMutation.status === "pending"}
              >
                {createMutation.status === "pending" || updateMutation.status ==="pending" ? (
                  <CircularProgress size={24} />
                ) : isEdit ? (
                  'Update Trip'
                ) : (
                  'Create Trip'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TripForm;