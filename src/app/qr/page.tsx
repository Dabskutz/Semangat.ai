'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function QRPage() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const downloadQR = () => {
    const svg = document.querySelector('.qr-svg') as SVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'semangat-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl space-y-8 text-center">
        <div className="flex items-center gap-4 text-left">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">QR Code Generator</h1>
        </div>

        <div className="flex justify-center p-4 bg-slate-100 rounded-2xl">
          {url && (
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin={true}
              className="qr-svg"
            />
          )}
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Tunjukkan QR ini agar orang lain bisa mendapatkan semangat juga!
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 break-all">
            {url}
          </div>
          <button
            onClick={downloadQR}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PNG
          </button>
        </div>
      </div>
    </main>
  );
}
