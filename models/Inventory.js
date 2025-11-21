import mongoose from 'mongoose';

/**
 * Inventory Movement Schema
 * Tracks stock-in, stock-out, lot merging, and splitting
 */
const InventoryMovementSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  movementType: {
    type: String,
    enum: ['stock_in', 'stock_out', 'merge', 'split', 'transfer', 'adjustment', 'damaged', 'sample'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // Quantity Movement
  quantity: {
    weightKg: {
      type: Number,
      required: true,
    },
    bags: Number,
    unit: {
      type: String,
      enum: ['kg', 'bags', 'quintals', 'tons'],
      default: 'kg',
    },
  },
  // Location
  fromLocation: {
    type: {
      type: String,
      enum: ['farm', 'wet_mill', 'dry_mill', 'warehouse', 'drying_area', 'storage', 'transit', 'export'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    section: String,
    shelf: String,
  },
  toLocation: {
    type: {
      type: String,
      enum: ['farm', 'wet_mill', 'dry_mill', 'warehouse', 'drying_area', 'storage', 'transit', 'export'],
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    section: String,
    shelf: String,
  },
  // Lot Operations
  mergeDetails: {
    sourceLots: [{
      lotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lot',
      },
      weightKg: Number,
    }],
    resultingLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
    },
    reason: String,
  },
  splitDetails: {
    parentLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
    },
    childLots: [{
      lotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lot',
      },
      weightKg: Number,
      purpose: String,
    }],
  },
  // Quality at Movement
  qualitySnapshot: {
    grade: String,
    moistureContent: Number,
    defectCount: Number,
    screenSize: String,
  },
  // Transaction Details
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  documentReference: String, // Invoice, delivery note, etc.
  vehicleDetails: {
    plateNumber: String,
    driverName: String,
    driverPhone: String,
  },
  notes: String,
  photos: [String],
}, {
  timestamps: true,
});

/**
 * Warehouse Schema
 * Physical storage locations
 */
const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
  },
  type: {
    type: String,
    enum: ['dry_mill', 'wet_mill', 'storage', 'drying_area', 'export_warehouse'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number], // [lon, lat]
    address: String,
    district: String,
    region: String,
  },
  capacity: {
    totalKg: Number,
    totalBags: Number,
  },
  currentStock: {
    totalKg: {
      type: Number,
      default: 0,
    },
    totalBags: {
      type: Number,
      default: 0,
    },
    lotCount: {
      type: Number,
      default: 0,
    },
  },
  sections: [{
    name: String,
    code: String,
    capacityKg: Number,
    currentStockKg: Number,
    shelves: [String],
  }],
  conditions: {
    temperature: Number, // Celsius
    humidity: Number, // %
    ventilation: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    pestControl: {
      lastDate: Date,
      nextDate: Date,
      method: String,
    },
  },
  certifications: [{
    type: String,
    number: String,
    expiryDate: Date,
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

/**
 * Export Batch Schema
 * Combines multiple lots into export containers
 */
const ExportBatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    unique: true,
    required: true,
  },
  exporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Lot Composition
  lots: [{
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: true,
    },
    weightKg: Number,
    bags: Number,
    grade: String,
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
  }],
  // Batch Details
  totalWeightKg: {
    type: Number,
    required: true,
  },
  totalBags: Number,
  bagType: {
    type: String,
    enum: ['jute', 'grainpro', 'vacuum', 'standard'],
  },
  bagWeightKg: Number, // Individual bag weight
  // Quality Profile
  overallGrade: String,
  qualityReport: {
    moistureContent: Number,
    defectCount: Number,
    screenDistribution: {
      type: Map,
      of: Number, // screen size -> percentage
    },
    cuppingScore: Number,
    cuppingNotes: String,
    certifiedBy: String,
    certificationDate: Date,
    reportUrl: String,
  },
  // Export Documentation
  documents: [{
    type: {
      type: String,
      enum: [
        'phytosanitary_certificate',
        'certificate_of_origin',
        'quality_certificate',
        'EUDR_statement',
        'organic_certificate',
        'fair_trade_certificate',
        'ICO_certificate',
        'commercial_invoice',
        'packing_list',
        'bill_of_lading',
        'insurance_certificate',
        'fumigation_certificate',
        'other',
      ],
    },
    documentNumber: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    url: String,
  }],
  // Container Details
  container: {
    number: String,
    type: {
      type: String,
      enum: ['20ft', '40ft', '40ft_HC', 'refrigerated', 'other'],
    },
    sealNumber: String,
    loadingDate: Date,
    loadingLocation: String,
    temperature: Number, // if refrigerated
  },
  // Shipping Details
  shipping: {
    portOfLoading: String,
    portOfDischarge: String,
    finalDestination: String,
    shippingLine: String,
    vesselName: String,
    bookingNumber: String,
    billOfLadingNumber: String,
    estimatedDepartureDate: Date,
    actualDepartureDate: Date,
    estimatedArrivalDate: Date,
    actualArrivalDate: Date,
    incoterm: {
      type: String,
      enum: ['FOB', 'CIF', 'CFR', 'EXW', 'FCA', 'other'],
    },
  },
  // Financial
  pricing: {
    totalValue: Number,
    currency: String,
    pricePerKg: Number,
    paymentTerms: String,
  },
  // Traceability
  traceabilityReport: {
    generatedAt: Date,
    reportUrl: String,
    qrCodeUrl: String,
    blockchainHash: String, // If using blockchain
  },
  // Status Tracking
  status: {
    type: String,
    enum: [
      'preparation',
      'quality_testing',
      'documentation',
      'ready_for_export',
      'container_loaded',
      'in_transit',
      'arrived',
      'delivered',
      'cancelled',
    ],
    default: 'preparation',
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  }],
  // EUDR Compliance
  eudrCompliant: Boolean,
  eudrStatementUrl: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: String,
}, {
  timestamps: true,
});

// Indexes
InventoryMovementSchema.index({ lotId: 1, date: -1 });
InventoryMovementSchema.index({ movementType: 1 });
InventoryMovementSchema.index({ 'fromLocation.warehouseId': 1 });
InventoryMovementSchema.index({ 'toLocation.warehouseId': 1 });
InventoryMovementSchema.index({ date: -1 });

WarehouseSchema.index({ cooperativeId: 1 });
WarehouseSchema.index({ code: 1 });
WarehouseSchema.index({ location: '2dsphere' });
WarehouseSchema.index({ isActive: 1 });

ExportBatchSchema.index({ batchNumber: 1 });
ExportBatchSchema.index({ exporterId: 1 });
ExportBatchSchema.index({ buyerId: 1 });
ExportBatchSchema.index({ status: 1 });
ExportBatchSchema.index({ 'shipping.actualDepartureDate': -1 });
ExportBatchSchema.index({ createdAt: -1 });

export const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', InventoryMovementSchema);
export const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);
export const ExportBatch = mongoose.models.ExportBatch || mongoose.model('ExportBatch', ExportBatchSchema);
