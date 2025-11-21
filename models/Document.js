import mongoose from 'mongoose';

/**
 * Document Schema
 * For storing KYC documents, certifications, land documents
 */
const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entityType: {
    type: String,
    enum: ['farmer', 'buyer', 'cooperative'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  documentType: {
    type: String,
    enum: [
      'national_id',
      'passport',
      'driving_license',
      'land_title',
      'lease_agreement',
      'tax_certificate',
      'business_registration',
      'organic_certificate',
      'fairtrade_certificate',
      'rainforest_certificate',
      'farm_photo',
      'other',
    ],
    required: true,
  },
  documentNumber: {
    type: String,
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number, // in bytes
  },
  mimeType: {
    type: String,
  },
  issuedDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ entityId: 1, entityType: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ verificationStatus: 1 });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
