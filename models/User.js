// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, // Will be stored hashed
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// We'll add password hashing logic in the user registration route, not directly in the model for this plan.
// Pre-save hook for password hashing could be added here in a more advanced setup.

module.exports = mongoose.model('User', userSchema);
