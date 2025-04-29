import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/tripRoutes';
import destinationRoutes from './routes/destinationRoutes';
import budgetRoutes from './routes/budgetRoutes';
import currencyRoutes from './routes/currencyRoutes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URI || 'mongodb://mongo:27017/TravelBooking';

// Routes
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', budgetRoutes);
app.use('/api/currency', currencyRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Travel Booking API hehe'); 
});



mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);});
