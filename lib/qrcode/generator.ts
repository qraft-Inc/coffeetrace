/**
 * QR Code Generator Utility
 * Generates QR codes for farmers and coffee lots with Cloudinary upload
 */

import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

interface QRCodeResult {
  success: boolean;
  qr_code_url?: string;
  qr_code_data?: string;
  error?: string;
}

/**
 * Generate QR code for farmer tip page
 */
export async function generateFarmerQRCode(
  farmerId: string,
  farmerName: string,
  uploadToCloud: boolean = true
): Promise<QRCodeResult> {
  try {
    const tipUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tip/${farmerId}`;

    const options: QRCodeOptions = {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
      color: {
        dark: '#2D3748', // Coffee dark color
        light: '#FFFFFF',
      },
    };

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(tipUrl, options);

    if (!uploadToCloud) {
      return {
        success: true,
        qr_code_data: qrDataUrl,
      };
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: 'coffeetrace/qrcodes/farmers',
      public_id: `farmer_${farmerId}`,
      overwrite: true,
      resource_type: 'image',
      context: {
        farmer_id: farmerId,
        farmer_name: farmerName,
        type: 'farmer_tip_qr',
      },
    });

    return {
      success: true,
      qr_code_url: uploadResult.secure_url,
      qr_code_data: qrDataUrl,
    };

  } catch (error) {
    console.error('Generate farmer QR code error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate QR code for product/lot traceability page
 */
export async function generateLotQRCode(
  lotId: string,
  lotDetails: {
    variety: string;
    farmerId: string;
    traceId?: string;
  },
  uploadToCloud: boolean = true
): Promise<QRCodeResult> {
  try {
    const lotUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/lot/${lotId}`;

    const options: QRCodeOptions = {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
      color: {
        dark: '#2D3748',
        light: '#FFFFFF',
      },
    };

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(lotUrl, options);

    if (!uploadToCloud) {
      return {
        success: true,
        qr_code_data: qrDataUrl,
      };
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
      folder: 'coffeetrace/qrcodes/lots',
      public_id: `lot_${lotId}`,
      overwrite: true,
      resource_type: 'image',
      context: {
        lot_id: lotId,
        variety: lotDetails.variety,
        farmer_id: lotDetails.farmerId,
        trace_id: lotDetails.traceId,
        type: 'lot_traceability_qr',
      },
    });

    return {
      success: true,
      qr_code_url: uploadResult.secure_url,
      qr_code_data: qrDataUrl,
    };

  } catch (error) {
    console.error('Generate lot QR code error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate QR code to file (for local storage)
 */
export async function generateQRCodeToFile(
  url: string,
  filePath: string
): Promise<boolean> {
  try {
    await QRCode.toFile(filePath, url, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    });
    return true;
  } catch (error) {
    console.error('Generate QR code to file error:', error);
    return false;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(url: string): Promise<string | null> {
  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    });
    return svg;
  } catch (error) {
    console.error('Generate QR code SVG error:', error);
    return null;
  }
}

/**
 * Generate QR code as buffer (for API responses)
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer | null> {
  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    console.error('Generate QR code buffer error:', error);
    return null;
  }
}

/**
 * Batch generate QR codes for multiple farmers
 */
export async function batchGenerateFarmerQRCodes(
  farmers: Array<{ id: string; name: string }>
): Promise<Array<{ farmerId: string; result: QRCodeResult }>> {
  const results = [];

  for (const farmer of farmers) {
    const result = await generateFarmerQRCode(farmer.id, farmer.name);
    results.push({
      farmerId: farmer.id,
      result,
    });

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Batch generate QR codes for multiple lots
 */
export async function batchGenerateLotQRCodes(
  lots: Array<{
    id: string;
    variety: string;
    farmerId: string;
    traceId?: string;
  }>
): Promise<Array<{ lotId: string; result: QRCodeResult }>> {
  const results = [];

  for (const lot of lots) {
    const result = await generateLotQRCode(lot.id, {
      variety: lot.variety,
      farmerId: lot.farmerId,
      traceId: lot.traceId,
    });
    results.push({
      lotId: lot.id,
      result,
    });

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

export default {
  generateFarmerQRCode,
  generateLotQRCode,
  generateQRCodeToFile,
  generateQRCodeSVG,
  generateQRCodeBuffer,
  batchGenerateFarmerQRCodes,
  batchGenerateLotQRCodes,
};
