import { Schema, model } from 'mongoose';

const TripSchema = new Schema({
  name: String,
  description: String,
  image: String,
  participants: [String],
  startDate: Date,
  endDate: Date,
  destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
});

export default model('Trip', TripSchema);