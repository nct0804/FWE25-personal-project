import { Schema, model } from 'mongoose';

const DestinationSchema = new Schema({
  name: String,
  description: String,
  activities: [String],
  startDate: Date,
  endDate: Date,
  photos: [String],
});

export default model('Destination', DestinationSchema);
