import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  data: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ data, size = 128 }) => {
  if (!data) {
    // Render a placeholder if no data is provided to avoid errors.
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-gray-200 dark:bg-dark-border animate-pulse rounded-md" 
        aria-label="QR code placeholder"
      />
    );
  }

  // Use the QRCodeSVG component for a crisp, scalable QR code.
  // This is much more efficient and stable than the previous manual implementation.
  return (
    <QRCodeSVG
      value={data}
      size={size}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"H"} // High error correction level
      includeMargin={true}
      className="w-full h-auto" // Ensure it's responsive within its container
    />
  );
};

// Memoize the component to prevent it from re-rendering if its props haven't changed.
// This is critical for performance on pages with many QR codes like the Setup page.
export default React.memo(QRCode);