import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/tripRoutes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URI || 'mongodb://mongo:27017/TravelBooking';

// Routes
app.use('/api/trips', tripRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Travel Booking API is running');
});



mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);});
