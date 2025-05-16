import { PhotoCamera, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
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
  imageListClasses,
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
  const [photosPreviews, setPhotosPreviews] = React.useState<string[]>([]);

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
    onError: (error) => {
      // Add proper error handling
      console.error('Error creating destination:', error);
      alert('Failed to create destination. The image may be too large.');
    }
  });
  

  const updateMutation = useMutation({
    mutationFn: (destinationData: DestinationFormData) =>
      updateDestination(id!, destinationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination', id] });
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      navigate(`/destinations/${id}`);
    },
    onError: (error) => {
      console.error('Error updating destination:', error);
      alert('Failed to update destination. The images may be too large. Try with fewer or smaller images.');
    }
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
      if (destination.photos && destination.photos.length > 0) {
        setPhotosPreviews(destination.photos);
        setValue('photos', destination.photos);
      }
    }
  }, [isEdit, destination, setValue]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Reduce max size to 2MB
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
            if (width > 500 || height > 500) {
              const aspectRatio = width / height;
              if (width > height) {
                width = 500;
                height = width / aspectRatio;
              } else {
                height = 500;
                width = height * aspectRatio;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const base64String = canvas.toDataURL('image/jpeg', 0.2);

            const sizeInKB = Math.round(base64String.length / 1024);
            console.log(`Compressed image size: ${sizeInKB}KB`);


            if (sizeInKB > 100) {
              const canvas2 = document.createElement('canvas');
              canvas2.width = Math.round(width * 0.6); 
              canvas2.height = Math.round(height * 0.6);
              const ctx2 = canvas2.getContext('2d');
              ctx2?.drawImage(img, 0, 0, canvas2.width, canvas2.height);
              const furtherCompressed = canvas2.toDataURL('image/jpeg', 0.15); // Even lower quality
              console.log(`Further reduced size: ${Math.round(furtherCompressed.length / 1024)}KB`);
              resolve(furtherCompressed);
            } else {
              resolve(base64String);}
            };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    compressImage(file)
      .then((base64String) => {
        // Add to the array instead of replacing
        const newPhotosPreviews = [...photosPreviews, base64String];
        setPhotosPreviews(newPhotosPreviews);
        setValue('photos', newPhotosPreviews);
      })
      .catch((error) => {
        console.error('Error processing image:', error);
        alert('Failed to process the image. Please try a different one.');
      });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newPhotos = photosPreviews.filter((_, index) => index !== indexToRemove);
    setPhotosPreviews(newPhotos);
    setValue('photos', newPhotos);
  };

  const onSubmit = (data: DestinationFormData) => {
    const destinationData = {
      ...data,
      activities: activities.filter((a) => a.trim() !== ''),
      photos: photosPreviews,
    };

    console.log('Submitting destination with data:', {
      ...destinationData,
      photoCount: photosPreviews.length,
      photoSizes: photosPreviews.map(img => Math.round(img.length / 1024) + 'KB')
    });

    console.log('Photo sizes:', photosPreviews.map(p => Math.round(p.length / 1024) + 'KB'));
    console.log('Total payload size:', Math.round(
        (JSON.stringify(destinationData).length) / 1024
      ) + 'KB');
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
            <Typography variant="subtitle1" gutterBottom>
              Destination Photos
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mr: 2 }}
                disabled={photosPreviews.length >= 3} 
              >
                Add Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={photosPreviews.length >= 3}
                />
              </Button>
              {photosPreviews.length >= 3 && (
                <Typography variant="caption" color="error">
                  Maximum 3 photos allowed
                </Typography>
              )}
            </Box>
            
            {photosPreviews.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {photosPreviews.map((photo, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '4px' 
                      }}
                    />
                    <IconButton 
                      onClick={() => handleRemoveImage(index)}
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)',
                        padding: '4px'
                         } 
                      }}
                    >
                      <Delete fontSize="small"/>
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
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