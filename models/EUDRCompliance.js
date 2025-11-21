import mongoose from 'mongoose';

/**
 * EUDR Compliance Schema
 * EU Deforestation Regulation compliance tracking
 * Required for coffee exports to EU markets (effective Dec 2024)
 */
const EUDRComplianceSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
  },
  // Geolocation Requirements
  geoLocation: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      required: true,
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed, // Point: [lon, lat], Polygon: [[[lon, lat]]]
      required: true,
    },
    accuracy: Number, // meters
    collectionMethod: {
      type: String,
      enum: ['gps_device', 'mobile_app', 'satellite', 'manual_input'],
    },
    collectedAt: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  // Deforestation Risk Assessment
  deforestationRisk: {
    riskLevel: {
      type: String,
      enum: ['negligible', 'low', 'medium', 'high', 'critical'],
      required: true,
    },
    assessmentDate: {
      type: Date,
      required: true,
    },
    assessmentMethod: {
      type: String,
      enum: ['satellite_imagery', 'field_verification', 'third_party_audit', 'government_data'],
    },
    baselineDate: Date, // December 31, 2020 (EUDR cutoff)
    forestCoverBaseline: Number, // % forest cover at baseline
    forestCoverCurrent: Number, // % current forest cover
    deforestationDetected: Boolean,
    evidenceUrls: [String], // Satellite images, photos
    notes: String,
  },
  // Due Diligence Statement
  dueDiligence: {
    statementNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    issuedDate: Date,
    validUntil: Date,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['satellite_analysis', 'field_report', 'land_title', 'government_clearance', 'third_party_audit', 'other'],
      },
      url: String,
      issuedDate: Date,
      verifiedBy: String,
    }],
  },
  // Sustainability Attestations
  sustainabilityData: {
    organicCertified: Boolean,
    organicCertNumber: String,
    organicCertExpiry: Date,
    fairTradeCertified: Boolean,
    fairTradeCertNumber: String,
    rainforestCertified: Boolean,
    rainforestCertNumber: String,
    biodiversityScore: Number, // 0-100
    soilHealthScore: Number, // 0-100
    waterManagement: {
      type: String,
      enum: ['excellent', 'good', 'adequate', 'needs_improvement', 'poor'],
    },
    chemicalUse: {
      pesticides: Boolean,
      herbicides: Boolean,
      syntheticFertilizers: Boolean,
      organicAlternatives: Boolean,
    },
    wasteManagement: {
      type: String,
      enum: ['composting', 'recycling', 'proper_disposal', 'minimal_waste', 'needs_improvement'],
    },
  },
  // Legal Compliance
  legalCompliance: {
    landTitleVerified: Boolean,
    landTitleNumber: String,
    landTitleDocumentUrl: String,
    noConflicts: Boolean,
    indigenousRightsRespected: Boolean,
    laborRightsCompliant: Boolean,
    childLaborFree: Boolean,
    governmentPermits: [{
      permitType: String,
      permitNumber: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      documentUrl: String,
    }],
  },
  // Verification & Audit Trail
  verificationHistory: [{
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    verificationType: {
      type: String,
      enum: ['initial', 'annual', 'spot_check', 're_verification', 'audit'],
    },
    result: {
      type: String,
      enum: ['compliant', 'non_compliant', 'pending', 'conditional'],
    },
    findings: String,
    correctiveActions: [String],
    nextVerificationDate: Date,
  }],
  // Compliance Status
  overallStatus: {
    type: String,
    enum: ['compliant', 'non_compliant', 'pending_verification', 'conditional', 'expired'],
    default: 'pending_verification',
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  expiryDate: Date,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
EUDRComplianceSchema.index({ farmerId: 1 });
EUDRComplianceSchema.index({ lotId: 1 });
EUDRComplianceSchema.index({ 'geoLocation': '2dsphere' });
EUDRComplianceSchema.index({ overallStatus: 1 });
EUDRComplianceSchema.index({ 'deforestationRisk.riskLevel': 1 });
EUDRComplianceSchema.index({ expiryDate: 1 });

export default mongoose.models.EUDRCompliance || mongoose.model('EUDRCompliance', EUDRComplianceSchema);
