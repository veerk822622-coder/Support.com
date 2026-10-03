import React, { useState } from 'react';
import { BRANDING } from '../assets/branding.ts';
import { ShieldCheck, User, Edit3, RotateCcw, X, Check } from 'lucide-react';

interface NavbarProps {
  currentUid: string;
  currentEmail: string;
  onUpdateIdentity: (uid: string, email: string) => void;
  onNewChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUid,
  currentEmail,
  onUpdateIdentity,
  onNewChat,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUid, setTempUid] = useState(currentUid);
  const [tempEmail, setTempEmail] = useState(currentEmail);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUid.trim()) {
      onUpdateIdentity(tempUid.trim().toUpperCase(), tempEmail.trim());
      setIsModalOpen(false);
    }
  };

  const handleOpenModal = () => {
    setTempUid(currentUid);
    setTempEmail(currentEmail);
    setIsModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-400/60 shadow-md shadow-amber-500/20 bg-black shrink-0">
            <img
              src={BRANDING.logoUrl}
              alt="Maha Sell Logo"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                Maha<span className="text-amber-400">Sell</span>
                <span className="text-[11px] font-mono tracking-widest text-slate-300 font-medium">TRADE PORTAL</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden sm:inline-block">
                AI Trade Support
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Buy Order Approvals, Sell Payouts & UTR Verification
            </p>
          </div>
        </div>

        {/* Zone 2: User Identity & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User UID / Email Badge */}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs transition-colors text-left"
            title="Click to view or change your UID and Email"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-mono font-bold text-[11px]">
              <User className="w-3.5 h-3.5" />
            </div>

            <div className="flex flex-col">
              {currentUid ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs">
                    {currentUid}
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400" />
                </div>
              ) : (
                <span className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                  Enter UID / Email
                </span>
              )}
              {currentEmail && (
                <span className="text-[10px] text-slate-400 truncate max-w-[130px] hidden md:inline">
                  {currentEmail}
                </span>
              )}
            </div>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Identity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Maha Sell Customer Identity
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Koi registration ya form bharne ki zarurat nahi hai. Apna Maha Sell Trade Portal ka <strong>UID</strong> (jaise Profile screen par <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[11px]"># ApBQCdVy07cZHpWnjBKltXJDwIw2</code>) aur <strong>Email</strong> enter karein.
            </p>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Maha Sell Trader UID (User ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ApBQCdVy07cZHpWnjBKltXJDwIw2 ya MS-1002"
                  value={tempUid}
                  onChange={(e) => setTempUid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set Identity & Continue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
