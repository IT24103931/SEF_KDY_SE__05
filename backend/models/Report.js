import mongoose from 'mongoose';

const wasteTypes = [
  'Illegal Dumping',
  'Overflowing Garbage',
  'Plastic Waste',
  'Organic Waste',
  'Construction Waste',
  'Hazardous Waste',
  'Other'
];

const sizes = ['Small', 'Medium', 'Large'];
const urgencies = ['Low', 'Medium', 'High'];
const priorityLevels = ['Low', 'Medium', 'High'];
const statuses = ['Reported', 'In Review', 'Resolved'];

// Store optional coordinates separately so location support can grow without changing core report fields.
const locationSchema = new mongoose.Schema({
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  reporterName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  location: {
    type: locationSchema,
    default: undefined
  },
  wasteType: {
    type: String,
    required: true,
    enum: wasteTypes
  },
  size: {
    type: String,
    required: true,
    enum: sizes
  },
  urgency: {
    type: String,
    required: true,
    enum: urgencies
  },
  sensitiveLocation: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  priorityScore: {
    type: Number,
    required: true,
    min: 0
  },
  priorityLevel: {
    type: String,
    required: true,
    enum: priorityLevels
  },
  status: {
    type: String,
    enum: statuses,
    default: 'Reported'
  },
  verified: {
    type: Boolean,
    default: false
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resolvedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true });

const scoreValues = {
  urgency: { Low: 1, Medium: 2, High: 3 },
  size: { Small: 1, Medium: 2, Large: 3 },
  wasteType: {
    'Hazardous Waste': 3,
    'Illegal Dumping': 2,
    'Construction Waste': 2,
    'Overflowing Garbage': 2,
    'Plastic Waste': 1,
    'Organic Waste': 1,
    Other: 1
  }
};

const calculatePriority = ({ urgency, size, wasteType, sensitiveLocation }) => {
  const priorityScore =
    scoreValues.urgency[urgency] +
    scoreValues.size[size] +
    scoreValues.wasteType[wasteType] +
    (sensitiveLocation ? 2 : 0);

  const priorityLevel = priorityScore >= 8
    ? 'High'
    : priorityScore >= 5
      ? 'Medium'
      : 'Low';

  return { priorityScore, priorityLevel };
};

const Report = mongoose.model('Report', reportSchema);

export { Report as default, calculatePriority, wasteTypes, sizes, urgencies };