'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Download, Share2, QrCode as QrCodeIcon } from 'lucide-react';

export default function TraceabilityQRCode({ 
  lotId, 
  farmerId,
  size = 200, 
  showDownload = true,
  showShare = true,
  title = "Scan for Full Traceability",
  description = "Scan this QR code to see complete farm-to-export journey"
}) {
  const [showQR, setShowQR] = useState(true);
  
  // Generate the traceability URL
  const traceUrl = lotId 
    ? `${window.location.origin}/trace/${lotId}`
    : farmerId 
    ? `${window.location.origin}/farmers/${farmerId}`
    : window.location.href;

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${lotId || farmerId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `traceability-qr-${lotId || farmerId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Coffee Traceability',
          text: 'Scan to see the complete journey of this coffee from farm to export',
          url: traceUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(traceUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-600 rounded-lg">
          <QrCodeIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-coffee-900">{title}</h3>
          <p className="text-sm text-coffee-600">{description}</p>
        </div>
      </div>

      {showQR && (
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <QRCodeSVG 
              id={`qr-${lotId || farmerId}`}
              value={traceUrl}
              size={size}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/logo.png",
                height: size * 0.15,
                width: size * 0.15,
                excavate: true,
              }}
            />
          </div>

          <div className="flex gap-3 mb-3">
            {showDownload && (
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Download QR
              </button>
            )}
            {showShare && (
              <button
                onClick={shareQRCode}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            )}
          </div>

          <p className="text-xs text-center text-coffee-600 max-w-xs">
            This QR code contains verified information about the origin, quality, and journey of this coffee.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-green-200">
        <div className="flex items-center gap-2 text-sm text-coffee-700">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">100% Verified & Traceable</span>
        </div>
      </div>
    </div>
  );
}
