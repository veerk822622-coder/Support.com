/**
 * Maha Sell Trade Portal - Data Store & Types
 * Tailored specifically for Maha Sell Order Trading & Commission Platform
 */

export interface TradeBatch {
  batchCode: string; // e.g. "2008-3646", "3000-5000", "3647"
  stock: number;
  incomeRate: string; // e.g. "3%+6", "4%+6"
  commissionPercent: number; // e.g. 9, 10
  youPay: number;
  youGet: number;
  profit: number;
  extraBonus: number;
  percentBonus: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  tradingWalletBalance: number;
  primaryActiveUpi: string;
  upiCount: number;
  totalAmount: number;
  totalEarning: number;
  todayEarning: number;
  commissionTier: string;
}

export interface TradeOrder {
  tradeId: string;
  batchCode: string;
  uid: string;
  youPay: number;
  youGet: number;
  profit: number;
  incomeRate: string;
  commissionPercent: number;
  status: 'Approval Pending' | 'Approved & Active' | 'Sold' | 'Payment Pending';
  paymentStatus: 'Successful' | 'Pending Verification' | 'Failed';
  paymentMethod: string;
  transactionId: string;
  upiRef: string;
  createdAt: string;
  approvalEta?: string;
}

export interface SellPayout {
  payoutId: string;
  uid: string;
  amount: number;
  upiId: string;
  status: 'Completed' | 'Processing' | 'Pending Verification' | 'Failed';
  utrNumber: string;
  requestedAt: string;
  completedAt?: string;
}

export interface SupportTicket {
  ticketId: string;
  uid: string;
  email: string;
  userName: string;
  issueCategory: string;
  tradeId?: string;
  batchCode?: string;
  transactionId?: string;
  userDescription: string;
  aiAnalysis: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  metadata?: {
    toolUsed?: string;
    verifiedTrade?: TradeOrder;
    verifiedPayout?: SellPayout;
    ticketId?: string;
    screenshotData?: any;
  };
}

export interface Conversation {
  id: string;
  uid: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  ticketId?: string;
}

// Available Trade Batches in Maha Sell Trade Portal (as seen in app screenshot)
export const TRADE_BATCH_CATALOG: TradeBatch[] = [
  {
    batchCode: '2008-3646',
    stock: 20,
    incomeRate: '3%+6',
    commissionPercent: 9,
    youPay: 2688.0,
    youGet: 2929.92,
    profit: 241.92,
    extraBonus: 6,
    percentBonus: 3,
  },
  {
    batchCode: '3000-5000',
    stock: 80,
    incomeRate: '4%+6',
    commissionPercent: 10,
    youPay: 3008.0,
    youGet: 3308.8,
    profit: 300.8,
    extraBonus: 6,
    percentBonus: 4,
  },
  {
    batchCode: '3647',
    stock: 20,
    incomeRate: '3%+6',
    commissionPercent: 9,
    youPay: 3647.0,
    youGet: 3975.23,
    profit: 328.23,
    extraBonus: 6,
    percentBonus: 3,
  },
];

// In-memory dynamic store
export const dynamicUsers: Record<string, UserProfile> = {};
export const dynamicTradeOrders: Record<string, TradeOrder> = {};
export const dynamicPayouts: Record<string, SellPayout> = {};
export const dynamicTickets: Record<string, SupportTicket> = {};
export const dynamicConversations: Record<string, Conversation> = {};

// Helper to get or dynamically create Trade Portal user
export function getOrCreateUser(uid: string, email: string = ''): UserProfile {
  const cleanUid = uid.trim();
  if (!dynamicUsers[cleanUid]) {
    dynamicUsers[cleanUid] = {
      uid: cleanUid,
      email: email.trim() || `${cleanUid.toLowerCase()}@gmail.com`,
      name: email ? email.split('@')[0] : `Trader (${cleanUid.slice(0, 8)})`,
      tradingWalletBalance: 301.8,
      primaryActiveUpi: '9876543210@ybl',
      upiCount: 2,
      totalAmount: 42180.0,
      totalEarning: 3810.3,
      todayEarning: 0.0,
      commissionTier: 'Up to 12% Commission (Income Rate ke hisaab se)',
    };
  } else if (email && !dynamicUsers[cleanUid].email) {
    dynamicUsers[cleanUid].email = email;
  }
  return dynamicUsers[cleanUid];
}

// Helper to get or dynamically find/generate trade order for any user UID
export function getOrCreateTradeOrderForUser(tradeIdInput: string, uid: string): TradeOrder {
  const cleanId = tradeIdInput.trim().toUpperCase().replace('#', '');
  const formattedId = cleanId.startsWith('TRD-') ? cleanId : `TRD-${cleanId}`;

  if (dynamicTradeOrders[formattedId]) {
    return dynamicTradeOrders[formattedId];
  }

  // Create realistic dynamic trade order linked to this user
  const is3008 = cleanId.includes('3000') || cleanId.includes('3008');
  const batchCode = is3008 ? '3000-5000' : '2008-3646';
  const youPay = is3008 ? 3008.0 : 2688.0;
  const youGet = is3008 ? 3308.8 : 2929.92;
  const profit = is3008 ? 300.8 : 241.92;
  const incomeRate = is3008 ? '4%+6' : '3%+6';
  const commissionPercent = is3008 ? 10 : 9;

  const newTrade: TradeOrder = {
    tradeId: formattedId,
    batchCode,
    uid: uid.trim(),
    youPay,
    youGet,
    profit,
    incomeRate,
    commissionPercent,
    status: 'Approval Pending',
    paymentStatus: 'Successful',
    paymentMethod: 'UPI (Google Pay / PhonePe / Paytm)',
    transactionId: `TXN-${Date.now().toString().slice(-8)}`,
    upiRef: '429188029103',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    approvalEta: 'Within 15 to 30 minutes of payment verification',
  };

  dynamicTradeOrders[formattedId] = newTrade;
  return newTrade;
}

// Backwards-compatible aliases for legacy imports
export const dynamicOrders = dynamicTradeOrders;
export const getOrCreateOrderForUser = (orderIdInput: string, uid: string) => {
  const trd = getOrCreateTradeOrderForUser(orderIdInput, uid);
  return {
    orderId: trd.tradeId,
    uid: trd.uid,
    productName: `Trade Batch ${trd.batchCode} (Profit: +₹${trd.profit})`,
    amount: trd.youPay,
    orderStatus: trd.status,
    paymentStatus: trd.paymentStatus,
    paymentMethod: trd.paymentMethod,
    transactionId: trd.transactionId,
    upiRef: trd.upiRef,
    orderDate: trd.createdAt,
    deliveryStatus: trd.status === 'Approved & Active' ? 'Approved & Ready to Sell' : 'Approval Pending',
    cashbackEligible: true,
    cashbackAmount: trd.profit,
    cashbackStatus: trd.status === 'Sold' ? 'Credited' : 'Pending Verification',
    cashbackNotes: `Income Rate: ${trd.incomeRate}, Commission: ${trd.commissionPercent}%. Returns ₹${trd.youGet} upon Sell.`,
  } as any;
};
export type Order = any;
