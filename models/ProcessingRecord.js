import mongoose from 'mongoose';

/**
 * Wet Mill Processing Schema
 * Tracks all wet processing steps (pulping, fermentation, washing)
 */
const WetMillProcessingSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Pulping/Depulping
  pulping: {
    method: {
      type: String,
      enum: ['mechanical', 'manual', 'eco_pulper', 'disc_pulper'],
    },
    startTime: Date,
    endTime: Date,
    cherryWeightKg: Number,
    parchmentWeightKg: Number,
    waterUsed: Number, // liters
    defectsSeparated: [{
      type: {
        type: String,
        enum: ['unripe', 'overripe', 'floaters', 'insect_damaged', 'foreign_matter'],
      },
      weightKg: Number,
    }],
  },
  // Fermentation
  fermentation: {
    method: {
      type: String,
      enum: ['dry', 'wet', 'semi_wet', 'controlled', 'natural'],
    },
    tankNumber: String,
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    duration: Number, // hours
    temperature: [{
      value: Number, // Celsius
      timestamp: Date,
    }],
    pH: [{
      value: Number,
      timestamp: Date,
    }],
    mucilageRemoval: {
      type: String,
      enum: ['complete', 'partial', 'minimal'],
    },
    stirringFrequency: String,
    notes: String,
  },
  // Washing
  washing: {
    method: {
      type: String,
      enum: ['channel_washing', 'tank_washing', 'mechanical_washing', 'manual_washing'],
    },
    numberOfWashes: Number,
    waterUsed: Number, // liters per kg
    waterSource: {
      type: String,
      enum: ['river', 'well', 'municipal', 'rainwater', 'recycled'],
    },
    waterQuality: {
      type: String,
      enum: ['clean', 'acceptable', 'requires_treatment'],
    },
    wasteWaterManagement: {
      type: String,
      enum: ['treatment_plant', 'settling_tanks', 'biofilter', 'none'],
    },
    startTime: Date,
    endTime: Date,
  },
  // Grading (Density Separation)
  densityGrading: {
    performed: Boolean,
    grades: [{
      grade: {
        type: String,
        enum: ['AA', 'A', 'B', 'C', 'floaters'],
      },
      weightKg: Number,
      percentage: Number,
    }],
  },
  // Quality Control
  qualityControl: {
    moistureContent: Number, // % after washing
    visualInspection: {
      color: {
        type: String,
        enum: ['normal', 'discolored', 'mixed'],
      },
      smell: {
        type: String,
        enum: ['normal', 'sour', 'fermented', 'moldy', 'other'],
      },
      texture: {
        type: String,
        enum: ['normal', 'slimy', 'dry', 'other'],
      },
    },
    samplePhotos: [String],
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inspectionDate: Date,
  },
  // Environmental & Sustainability
  sustainability: {
    waterRecycled: Number, // liters
    energyUsed: Number, // kWh
    wasteGenerated: Number, // kg
    wasteRecycled: Number, // kg
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'aborted'],
    default: 'in_progress',
  },
  notes: String,
}, {
  timestamps: true,
});

/**
 * Dry Mill Processing Schema
 * Tracks all dry processing steps (hulling, sorting, grading, polishing)
 */
const DryMillProcessingSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  inputWeightKg: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Hulling
  hulling: {
    method: {
      type: String,
      enum: ['mechanical', 'disc_huller', 'abrasive_huller'],
    },
    startTime: Date,
    endTime: Date,
    parchmentInputKg: Number,
    greenBeanOutputKg: Number,
    hullWeightKg: Number,
    hullPercentage: Number,
    breakageRate: Number, // %
    settings: {
      speed: Number, // RPM
      gap: Number, // mm
      pressure: Number, // bar
    },
  },
  // Density Sorting
  densitySorting: {
    method: {
      type: String,
      enum: ['gravity_table', 'air_jet', 'vibrating_table', 'manual'],
    },
    grades: [{
      density: String, // e.g., 'high', 'medium', 'low'
      weightKg: Number,
      percentage: Number,
    }],
  },
  // Size Grading (Screen Sorting)
  sizeGrading: {
    screens: [{
      screenSize: Number, // in 1/64 inch
      grade: {
        type: String,
        enum: ['AAA', 'AA', 'A', 'B', 'C', 'PB', 'peaberry'],
      },
      weightKg: Number,
      percentage: Number,
    }],
  },
  // Color Sorting
  colorSorting: {
    method: {
      type: String,
      enum: ['electronic', 'manual', 'hybrid', 'none'],
    },
    defectsRemoved: [{
      type: {
        type: String,
        enum: ['black', 'sour', 'insect_damage', 'discolored', 'broken', 'shells', 'foreign_matter'],
      },
      weightKg: Number,
    }],
    rejectionRate: Number, // %
  },
  // Polishing (Optional)
  polishing: {
    performed: Boolean,
    method: {
      type: String,
      enum: ['friction', 'abrasive', 'none'],
    },
    passes: Number,
    weightLoss: Number, // kg
  },
  // Final Grading & Quality
  finalGrading: {
    grades: [{
      grade: {
        type: String,
        enum: ['AAA', 'AA', 'AB', 'A', 'B', 'C', 'PB', 'reject'],
      },
      weightKg: Number,
      percentage: Number,
      bags: Number,
      defectCount: Number, // per 300g sample
    }],
  },
  qualityControl: {
    moistureContent: Number, // % final
    screenTest: {
      above18: Number, // %
      screen18: Number,
      screen17: Number,
      screen16: Number,
      screen15: Number,
      screen14: Number,
      below14: Number,
    },
    defectAnalysis: {
      category1Defects: Number, // per 300g
      category2Defects: Number,
      totalDefects: Number,
    },
    cupping: {
      score: Number, // 0-100
      notes: String,
      cuppers: [String],
    },
    samplePhotos: [String],
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inspectionDate: Date,
  },
  // Output Summary
  outputSummary: {
    totalGreenBeanKg: Number,
    totalBags: Number,
    avgBagWeightKg: Number,
    totalWasteKg: Number,
    yieldPercentage: Number, // green bean / input parchment
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'aborted'],
    default: 'in_progress',
  },
  notes: String,
}, {
  timestamps: true,
});

/**
 * Drying Record Schema
 * Tracks coffee drying process (critical for quality)
 */
const DryingRecordSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  batchNumber: String,
  method: {
    type: String,
    enum: ['raised_bed', 'ground_tarp', 'solar_dryer', 'mechanical_dryer', 'greenhouse', 'parabolic', 'mixed'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  initialWeightKg: {
    type: Number,
    required: true,
  },
  finalWeightKg: Number,
  // Drying Conditions
  conditions: [{
    date: Date,
    time: String,
    temperature: Number, // Celsius
    humidity: Number, // %
    weatherCondition: {
      type: String,
      enum: ['sunny', 'partly_cloudy', 'cloudy', 'rainy'],
    },
    turningsDone: Number,
    thickness: Number, // cm of coffee layer
    moistureReading: Number, // %
    notes: String,
  }],
  // Moisture Evolution
  moistureReadings: [{
    date: Date,
    moisturePercent: Number,
    measuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    method: {
      type: String,
      enum: ['meter', 'visual', 'bite_test'],
    },
  }],
  // Drying Duration
  totalDays: Number,
  hoursOfSunlight: Number,
  // Quality Issues
  issues: [{
    date: Date,
    issue: {
      type: String,
      enum: ['mold', 'over_fermentation', 'uneven_drying', 'rain_damage', 'contamination', 'insect_damage', 'other'],
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe'],
    },
    actionTaken: String,
  }],
  // Final Quality
  finalQuality: {
    moistureContent: Number, // % (target 10-12%)
    uniformity: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    color: {
      type: String,
      enum: ['consistent', 'slightly_varied', 'highly_varied'],
    },
    smell: {
      type: String,
      enum: ['normal', 'slightly_off', 'moldy', 'fermented'],
    },
    photos: [String],
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'interrupted'],
    default: 'in_progress',
  },
  notes: String,
}, {
  timestamps: true,
});

// Indexes
WetMillProcessingSchema.index({ lotId: 1 });
WetMillProcessingSchema.index({ batchNumber: 1 });
WetMillProcessingSchema.index({ startDate: -1 });
WetMillProcessingSchema.index({ status: 1 });

DryMillProcessingSchema.index({ lotId: 1 });
DryMillProcessingSchema.index({ batchNumber: 1 });
DryMillProcessingSchema.index({ startDate: -1 });
DryMillProcessingSchema.index({ status: 1 });

DryingRecordSchema.index({ lotId: 1 });
DryingRecordSchema.index({ startDate: -1 });
DryingRecordSchema.index({ method: 1 });
DryingRecordSchema.index({ status: 1 });

export const WetMillProcessing = mongoose.models.WetMillProcessing || mongoose.model('WetMillProcessing', WetMillProcessingSchema);
export const DryMillProcessing = mongoose.models.DryMillProcessing || mongoose.model('DryMillProcessing', DryMillProcessingSchema);
export const DryingRecord = mongoose.models.DryingRecord || mongoose.model('DryingRecord', DryingRecordSchema);
