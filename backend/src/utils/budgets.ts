import { Schema, model } from 'mongoose';

const BudgetSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other'] 
  },
  amount: { type: Number, required: true, min: 0 },
  description: String,
  date: { type: Date, default: Date.now }
});

export default model('Budget', BudgetSchema);