import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  X,
  Bot,
  User,
  ShieldCheck,
  Sparkles,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { BRANDING } from '../assets/branding.ts';
import type { ChatMessage, Order } from '../types.ts';
import { VerifiedOrderCard } from './VerifiedOrderCard.tsx';
import { ScreenshotCompareCard } from './ScreenshotCompareCard.tsx';
import { TicketStatusCard } from './TicketStatusCard.tsx';
import { generateClientTradeResponse } from '../services/clientTradeBot.ts';

interface CustomerChatProps {
  currentUid: string;
  currentEmail: string;
  onUpdateIdentity: (uid: string, email: string) => void;
  onNewChat: () => void;
}

export const CustomerChat: React.FC<CustomerChatProps> = ({
  currentUid,
  currentEmail,
  onUpdateIdentity,
  onNewChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>(`CONV-${Date.now()}`);

  // Inline identity input banner states
  const [inlineUid, setInlineUid] = useState(currentUid);
  const [inlineEmail, setInlineEmail] = useState(currentEmail);
  const [showIdentityBanner, setShowIdentityBanner] = useState(!currentUid);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    'Maine Buy Trade order ka payment kiya hai par approval pending dikh raha hai.',
    'Trading Wallet se Sell kiya tha par Primary UPI ID par payout kab aayega?',
    'Payment kat gaya hai, screenshot check karke order approve kijiye.',
    'Maha Sell Trade Portal par Income Rate aur commission kaise calculate hota hai?',
    'Primary Active UPI ID change ya update kaise karein?',
  ];

  // Initialize welcome message
  useEffect(() => {
    const welcomeText = `👋 Hello! Main Maha Sell Trade Portal ka official AI Support Assistant hoon.

Aap Trade Orders (Buy Batches), Approval Status, Sell Payouts (Trading Wallet to Primary UPI), Commission Rates (up to 12%) ya kisi bhi error se related problem yahan share kar sakte hain.

${
  currentUid
    ? `Aapka verified trader session **UID: ${currentUid}** active hai. 😊`
    : `Aapki trade verification ke liye kripya apna **UID** (jaise aapke profile me \`ApBQCdVy07cZHpWnjBKltXJDwIw2\`) aur **Email** ek baar batayein.`
}

Agar aapke paas bank UPI payment receipt ya app screen ka **Screenshot** hai, toh aap yahan upload kar sakte hain, main turant UTR verify kar dunga!`;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        senderName: BRANDING.assistantName,
        text: welcomeText,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setInlineUid(currentUid);
    setInlineEmail(currentEmail);
    if (currentUid) {
      setShowIdentityBanner(false);
    }
  }, [currentUid, currentEmail]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setSelectedImagePreview(resultStr);
        const base64Data = resultStr.split(',')[1];
        setSelectedImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1-Click test: Load sample payment receipt
  const handleLoadSampleReceipt = async () => {
    try {
      setSelectedImagePreview(BRANDING.sampleReceiptUrl);
      const res = await fetch(BRANDING.sampleReceiptUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1];
        setSelectedImageBase64(base64Data);
      };
      reader.readAsDataURL(blob);
      if (!inputValue) {
        setInputValue('Screenshot check karke batao mera payment successful hua ya nahi?');
      }
    } catch (err) {
      console.error('Failed to load sample receipt:', err);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImagePreview(null);
    setSelectedImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const text = customText ?? inputValue;
    if (!text.trim() && !selectedImageBase64) return;

    // Check if user mentioned UID or email in text
    let effectiveUid = currentUid;
    let effectiveEmail = currentEmail;

    const uidMatch = text.match(/(?:uid|id)[:\s]+([a-zA-Z0-9_-]+)/i) || text.match(/\b(MS-[a-zA-Z0-9_-]+)\b/i);
    if (uidMatch && uidMatch[1]) {
      effectiveUid = uidMatch[1].toUpperCase();
      onUpdateIdentity(effectiveUid, effectiveEmail);
    }

    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) {
      effectiveEmail = emailMatch[1];
      onUpdateIdentity(effectiveUid || currentUid, effectiveEmail);
    }

    const currentImg = selectedImagePreview;
    const currentImgBase64 = selectedImageBase64;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      senderName: effectiveUid ? `Aap (${effectiveUid})` : 'Aap',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      imageUrl: currentImg || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    removeSelectedImage();
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          uid: effectiveUid,
          email: effectiveEmail,
          text: userMsg.text,
          imageBase64: currentImgBase64,
          imageMimeType: 'image/jpeg',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.conversation?.uid) {
          onUpdateIdentity(data.conversation.uid, data.conversation.email || currentEmail);
          setShowIdentityBanner(false);
        }
        if (data.aiResponse) {
          setMessages((prev) => [...prev, data.aiResponse]);
          return;
        }
      }
      // If server returned non-ok (e.g. 404 or 500 on Vercel static deployment), fall through to client engine
      throw new Error('Fallback to client engine');
    } catch {
      // Client-side Trade Portal AI fallback - 100% resilient response
      const fallbackResult = generateClientTradeResponse({
        userText: userMsg.text,
        userUid: effectiveUid,
        userEmail: effectiveEmail,
        hasImage: !!currentImgBase64,
      });

      const fallbackAiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        senderName: 'Maha Sell AI Support',
        text: fallbackResult.text,
        timestamp: new Date().toISOString(),
        metadata: fallbackResult.metadata,
      };

      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInlineIdentitySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inlineUid.trim()) {
      onUpdateIdentity(inlineUid.trim().toUpperCase(), inlineEmail.trim());
      setShowIdentityBanner(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-5xl w-full mx-auto bg-[#070B16] text-slate-100 relative">
      {/* Optional Identity Prompter Banner if user has not set UID */}
      {showIdentityBanner && (
        <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/90 border-b border-blue-500/30 px-4 py-3 z-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-sans">
                  Apna Maha Sell UID aur Email batayein
                </p>
                <p className="text-[11px] text-slate-400">
                  Taaki AI aapke orders, payment aur cashback records seedhe check kar sake.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleInlineIdentitySave}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                required
                placeholder="UID (e.g. MS-8821)"
                value={inlineUid}
                onChange={(e) => setInlineUid(e.target.value)}
                className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={inlineEmail}
                onChange={(e) => setInlineEmail(e.target.value)}
                className="w-40 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 hidden md:block"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Set UID
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-900/40">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/60 p-0.5 bg-black shadow-md shrink-0">
                    <img
                      src={BRANDING.avatarUrl}
                      alt="Maha Sell AI"
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-xl">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">
                    {isUser ? msg.senderName : BRANDING.assistantName}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums font-mono text-[10px]">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-950/50'
                      : 'bg-[#0F172A] text-slate-100 border border-slate-800 rounded-tl-xs shadow-md'
                  }`}
                >
                  {/* Uploaded Screenshot if attached */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-700/60 max-w-xs bg-slate-950">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded screenshot"
                        className="max-h-56 w-auto object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Text Message */}
                  <div className="font-normal font-sans">{msg.text}</div>

                  {/* Embedded Verified Order Card */}
                  {msg.metadata?.verifiedOrder && (
                    <VerifiedOrderCard
                      order={msg.metadata.verifiedOrder}
                      onAskAboutOrder={(orderId) => {
                        handleSendMessage(`Order ${orderId} ke delivery aur cashback status ke baare mein batao.`);
                      }}
                    />
                  )}

                  {/* Embedded Screenshot Comparison Card */}
                  {msg.metadata?.screenshotData && (
                    <ScreenshotCompareCard
                      data={msg.metadata.screenshotData}
                      imageUrl={msg.imageUrl}
                    />
                  )}

                  {/* Embedded Ticket Status Card */}
                  {msg.metadata?.ticketId && (
                    <TicketStatusCard ticketId={msg.metadata.ticketId} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400/40 p-0.5 bg-blue-950 shrink-0 shadow-md">
              <img
                src={BRANDING.avatarUrl}
                alt="AI"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-xs flex items-center gap-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400">
                Maha Sell AI analyse aur verify kar raha hai...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Suggested:
          </span>
          {suggestedQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(query)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Attachment Preview Floating */}
      {selectedImagePreview && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={selectedImagePreview}
              alt="Screenshot upload"
              className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-slate-950"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Screenshot Attached
              </span>
              <span className="text-[11px] text-slate-400">
                AI will inspect visible payment details and verify with Maha Sell backend.
              </span>
            </div>
          </div>
          <button
            onClick={removeSelectedImage}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 bg-[#0B132B] border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-950 border border-slate-800 focus-within:border-blue-500 rounded-2xl p-2 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Screenshot Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
            title="Upload payment receipt / app screenshot"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Quick Sample Receipt Button */}
          <button
            onClick={handleLoadSampleReceipt}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/60 border border-blue-700/40 text-[11px] text-blue-300 font-medium transition-colors"
            title="Load sample UPI payment screenshot to test multimodal verification"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Sample Receipt</span>
          </button>

          {/* Text Area */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Apni samasya yahan likhein (Hindi / Hinglish / English)..."
            rows={1}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-1.5 px-2 max-h-32"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={(!inputValue.trim() && !selectedImageBase64) || isTyping}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold transition-all shadow-md shadow-blue-900/40"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-2">
          <span>Press Enter to send · Shift+Enter for new line</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Maha Sell AI Agent
          </span>
        </div>
      </div>
    </div>
  );
};
