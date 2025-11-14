import QRCode from 'qrcode';

/**
 * Generates a QR code as a data URL for a given trace ID
 * 
 * @param {string} traceId - The unique trace identifier
 * @param {string} baseUrl - Base URL of the application (e.g., https://coffeetrace.app)
 * @returns {Promise<string>} Data URL of the generated QR code
 */
export async function generateQRCode(traceId, baseUrl = process.env.NEXTAUTH_URL) {
  try {
    const url = `${baseUrl}/lot/${traceId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generates a QR code as a buffer (useful for saving to file or cloud storage)
 * 
 * @param {string} traceId - The unique trace identifier
 * @param {string} baseUrl - Base URL of the application
 * @returns {Promise<Buffer>} Buffer containing the QR code image
 */
export async function generateQRCodeBuffer(traceId, baseUrl = process.env.NEXTAUTH_URL) {
  try {
    const url = `${baseUrl}/lot/${traceId}`;
    const buffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}
