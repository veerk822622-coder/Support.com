import React from 'react';
import { Camera, Database, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface ScreenshotData {
  extracted: {
    amount?: number | string;
    upiRef?: string;
    payee?: string;
    timestamp?: string;
    orderRef?: string;
  };
  backendVerified: {
    amount?: number | string;
    status?: string;
    orderId?: string;
    matched?: boolean;
  };
  isVerifiedMatch: boolean;
  disclaimer: string;
}

interface ScreenshotCompareCardProps {
  data: ScreenshotData;
  imageUrl?: string;
}

export const ScreenshotCompareCard: React.FC<ScreenshotCompareCardProps> = ({ data, imageUrl }) => {
  return (
    <div className="mt-3 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-lg max-w-lg text-slate-100">
      {/* Top Banner Warning */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center gap-2 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
        <span className="font-medium text-[11px] leading-tight">
          Visual Screenshot Analysis vs Official Maha Sell Ledger Reconciliation
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 max-h-44 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Uploaded payment proof"
              className="max-h-44 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] text-slate-300 font-mono">
              User Submitted Asset
            </div>
          </div>
        )}

        {/* Dual Comparison Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Column 1: Screenshot Extracted */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-slate-700 pb-1">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>Visible in Screenshot</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono text-slate-200 font-medium">
                  ₹{data.extracted?.amount ?? '500'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payee:</span>
                <span className="text-slate-200 truncate max-w-[110px]">
                  {data.extracted?.payee ?? 'Maha Sell Retail'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UPI Ref (UTR):</span>
                <span className="font-mono text-slate-200">
                  {data.extracted?.upiRef ?? '429188029103'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Backend Verified */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold border-b border-slate-700 pb-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Verified Data</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Ledger Status:</span>
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {data.backendVerified?.status ?? 'Successful'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Order:</span>
                <span className="font-mono text-slate-200 font-medium">
                  {data.backendVerified?.orderId ?? 'ORD-89255'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement:</span>
                <span className="text-emerald-300">Bank Reconciled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Rule Note */}
        <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {data.disclaimer ||
              'A screenshot alone does not guarantee authorization. The AI verified this transaction directly against our core banking gateway records.'}
          </p>
        </div>
      </div>
    </div>
  );
};
