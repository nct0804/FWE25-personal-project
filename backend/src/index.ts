import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = 'mongodb://mongo:27017/';

mongoose
  .connect(MONGO_URL, { dbName: 'TravelBooking' })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: any) => console.log('Failed to connect to MongoDB', err));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);});
