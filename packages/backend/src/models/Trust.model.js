const mongoose = require('mongoose');

const trusteeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  role: String,
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  accountName: String,
  accountNumber: String,
  ifsc: String,
  bank: String,
  branch: String,
}, { _id: false });

const trustSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registrationNumber: { type: String, unique: true, sparse: true },
  pan: { type: String },
  tan: { type: String },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  trusteeDetails: [trusteeSchema],
  bankDetails: bankDetailsSchema,
  documents: [String],
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

trustSchema.index({ name: 1 });

const Trust = mongoose.model('Trust', trustSchema);

module.exports = Trust;


