
const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true, trim: true },
  ward: { type: String, default: 'ICU', trim: true },
  room: { type: String, trim: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'unavailable'],
    default: 'available'
  },
  currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notes: { type: String, trim: true }
}, { timestamps: true });

bedSchema.virtual('isOccupied').get(function() {
  return this.status === 'occupied';
});

bedSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

bedSchema.pre('save', function(next) {
  if (this.currentPatient) {
    this.status = 'occupied';
  } else if (this.status === 'occupied') {
    this.status = 'cleaning';
  }
  next();
});

bedSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.currentPatient === null && update.$set.status !== 'cleaning') {
    update.$set.status = 'cleaning';
  }
  if (update.$set && update.$set.currentPatient && update.$set.status !== 'occupied') {
    update.$set.status = 'occupied';
  }
  next();
});

module.exports = mongoose.model('Bed', bedSchema);