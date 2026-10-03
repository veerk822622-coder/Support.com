import React from 'react';
import type { Order } from '../types.ts';
import { Package, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface VerifiedOrderCardProps {
  order: Order;
  onAskAboutOrder?: (orderId: string) => void;
}

export const VerifiedOrderCard: React.FC<VerifiedOrderCardProps> = ({ order, onAskAboutOrder }) => {
  const isPaid = order.paymentStatus === 'Successful';
  const isPending = order.paymentStatus === 'Pending' || order.orderStatus === 'Payment Pending';
  const isFailed = order.paymentStatus === 'Failed';

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md text-slate-100 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {order.orderId}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Backend Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {order.productName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold font-mono text-white tabular-nums">
            ₹{order.amount.toLocaleString('en-IN')}
          </span>
          <div className="text-[10px] text-slate-400">
            {order.paymentMethod}
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5">Order Status</span>
          <div className="flex items-center gap-1.5 font-medium">
            {order.orderStatus === 'Completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : isFailed ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span
              className={
                order.orderStatus === 'Completed'
                  ? 'text-emerald-300'
                  : isFailed
                  ? 'text-rose-300'
                  : 'text-amber-300'
              }
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5">Delivery</span>
          <div className="font-medium text-slate-200 truncate">
            {order.deliveryStatus}
          </div>
        </div>
      </div>

      {/* Cashback Verification Breakdown */}
      {order.cashbackEligible && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
            <span>Cashback Verification</span>
            <span className="font-mono tabular-nums">₹{order.cashbackAmount}</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            {order.cashbackNotes}
          </p>
        </div>
      )}

      {/* Failed Payment Notice */}
      {isFailed && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
          <span className="font-semibold block mb-0.5">Gateway Timeout Alert:</span>
          Bank settlement was not confirmed. Any deducted amount is refunded by your bank within 3–5 working days (Ref: {order.upiRef || 'NPCI-AUTO'}).
        </div>
      )}

      {onAskAboutOrder && (
        <button
          onClick={() => onAskAboutOrder(order.orderId)}
          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Ask AI about this order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
