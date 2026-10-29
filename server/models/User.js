const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'technician', 'viewer'],
    default: 'nurse'
  },
  phone: String,
  specialization: String,          // for doctors e.g. "Critical Care"
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);