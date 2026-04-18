import mongoose from 'mongoose';

const FarmSchema = new mongoose.Schema({
  farmerName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  farmName: {
    type: String,
    required: true,
    trim: true,
  },
  cropType: {
    type: String,
    enum: ['Arabica', 'Robusta'],
    required: true,
  },
  notes: {
    type: String,
  },
  area: {
    type: Number,
    required: true,
    min: 0,
  },
  polygon: {
    type: {
      type: String,
      enum: ['Feature'],
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  moderationNotes: {
    type: String,
    trim: true,
    default: '',
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

FarmSchema.index({ 'polygon.geometry': '2dsphere' });
FarmSchema.index({ status: 1, createdAt: -1 });
FarmSchema.index({ cooperativeId: 1, createdAt: -1 });
FarmSchema.index({ ownerUserId: 1, createdAt: -1 });

export default mongoose.models.Farm || mongoose.model('Farm', FarmSchema);
