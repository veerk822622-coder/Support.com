import React from 'react';
import { Ticket, Clock, UserCheck, ShieldAlert } from 'lucide-react';
import type { SupportTicket } from '../types.ts';

interface TicketStatusCardProps {
  ticketId: string;
  category?: string;
  status?: string;
  priority?: string;
  assignedAgent?: string;
  ticket?: SupportTicket;
}

export const TicketStatusCard: React.FC<TicketStatusCardProps> = ({
  ticketId,
  category = 'General Support',
  status = 'Open',
  priority = 'High',
  assignedAgent = 'Queue',
  ticket,
}) => {
  const actualCategory = ticket?.issueCategory || category;
  const actualStatus = ticket?.status || status;
  const actualPriority = ticket?.priority || priority;
  const actualAgent = (ticket as any)?.assignedAgent || assignedAgent;

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md text-slate-100 max-w-md">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {ticketId}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {actualCategory}
            </span>
          </div>
        </div>

        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {actualStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Priority: </span>
          <span className="font-semibold text-amber-400">{actualPriority}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Agent: </span>
          <span className="font-medium text-slate-200 truncate">{actualAgent}</span>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          Support specialists track this issue with continuous conversation context.
        </span>
      </div>
    </div>
  );
};
