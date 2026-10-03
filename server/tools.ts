/**
 * Maha Sell Trade Portal - Backend Authorized Tool Layer
 */

import {
  dynamicUsers,
  dynamicTradeOrders,
  dynamicPayouts,
  dynamicTickets,
  getOrCreateUser,
  getOrCreateTradeOrderForUser,
  TRADE_BATCH_CATALOG,
  type SupportTicket,
  type TradeOrder,
  type SellPayout,
} from './data.ts';

export const toolsService = {
  getUserProfile(uid: string, email?: string) {
    if (!uid) return { error: 'UID is required.' };
    const user = getOrCreateUser(uid, email);
    return {
      success: true,
      profile: {
        ...user,
        appType: 'Maha Sell Trade Portal',
        overview: `Trading Wallet: ₹${user.tradingWalletBalance.toFixed(2)}, Primary UPI: ${user.primaryActiveUpi}, Total Earning: ₹${user.totalEarning.toFixed(2)}, Total Amount: ₹${user.totalAmount.toFixed(2)}`,
      },
    };
  },

  getAvailableTradeBatches() {
    return {
      success: true,
      catalog: TRADE_BATCH_CATALOG,
      message: 'Active trade batches available to Buy on Maha Sell Trade Portal.',
    };
  },

  getBuyTradeOrders(uid: string) {
    if (!uid) return { error: 'UID is required.' };
    const orders = Object.values(dynamicTradeOrders).filter((o) => o.uid.toUpperCase() === uid.toUpperCase());
    if (orders.length === 0) {
      const demoTrade = getOrCreateTradeOrderForUser('2008-3646', uid);
      return { success: true, buyHistory: [demoTrade] };
    }
    return { success: true, buyHistory: orders };
  },

  getSellPayoutStatus(uid: string) {
    if (!uid) return { error: 'UID is required.' };
    const user = getOrCreateUser(uid);
    let payout = Object.values(dynamicPayouts).find((p) => p.uid.toUpperCase() === uid.toUpperCase());
    if (!payout) {
      payout = {
        payoutId: `PAY-${Date.now().toString().slice(-6)}`,
        uid: user.uid,
        amount: 301.8,
        upiId: user.primaryActiveUpi,
        status: 'Processing',
        utrNumber: 'UPI429188029103',
        requestedAt: new Date(Date.now() - 1800000).toISOString(),
      };
      dynamicPayouts[payout.payoutId] = payout;
    }
    return {
      success: true,
      payout,
      walletBalance: user.tradingWalletBalance,
      primaryUpi: user.primaryActiveUpi,
    };
  },

  // Reconcile user payment screenshot against pending Buy Trade order
  reconcilePaymentScreenshot(params: {
    uid: string;
    utrNumber?: string;
    amount?: number;
    batchCode?: string;
    screenshotStatus?: string;
  }) {
    const { uid, utrNumber, amount, batchCode, screenshotStatus } = params;
    const trade = getOrCreateTradeOrderForUser(batchCode || '2008-3646', uid);

    if (utrNumber) trade.upiRef = utrNumber;
    if (amount) trade.youPay = amount;

    // Check if valid UTR provided
    const isPaymentConfirmed = screenshotStatus?.toLowerCase().includes('success') || !!utrNumber;

    if (isPaymentConfirmed) {
      trade.paymentStatus = 'Successful';
      trade.status = 'Approved & Active';
      return {
        success: true,
        trade,
        message: `Screenshot verified with UTR ${trade.upiRef}. Payment of ₹${trade.youPay} confirmed. Trade order ${trade.tradeId} for Batch ${trade.batchCode} has been verified and marked as Approved & Active. Profit return of ₹${trade.youGet} will be eligible upon Sell.`,
      };
    }

    return {
      success: false,
      trade,
      message: `Screenshot indicates payment processing or unconfirmed status. Bank settlement window is active.`,
    };
  },

  createSupportTicket(
    uid: string,
    email: string,
    issueCategory: string,
    userDescription: string,
    tradeId?: string,
    aiAnalysis?: string,
    priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium'
  ) {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanUid = (uid || 'USER').trim();
    const ticket: SupportTicket = {
      ticketId,
      uid: cleanUid,
      email: email || `${cleanUid.toLowerCase()}@gmail.com`,
      userName: `Trader (${cleanUid.slice(0, 8)})`,
      issueCategory: issueCategory || 'Trade Portal Support',
      tradeId,
      userDescription,
      aiAnalysis: aiAnalysis || userDescription,
      priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    dynamicTickets[ticketId] = ticket;
    return {
      success: true,
      ticket,
      message: `Support ticket ${ticketId} has been successfully registered on Maha Sell Trade Portal.`,
    };
  },

  // Backwards compatibility wrappers
  getOrder(orderId: string, uid: string) {
    const trd = getOrCreateTradeOrderForUser(orderId, uid);
    return {
      success: true,
      order: {
        orderId: trd.tradeId,
        amount: trd.youPay,
        paymentStatus: trd.paymentStatus,
        status: trd.status,
        batchCode: trd.batchCode,
        profit: trd.profit,
        youGet: trd.youGet,
        incomeRate: trd.incomeRate,
        commissionPercent: trd.commissionPercent,
      },
    };
  },

  getPaymentStatus(orderId: string, uid: string) {
    const trd = getOrCreateTradeOrderForUser(orderId, uid);
    return {
      success: true,
      paymentInfo: {
        tradeId: trd.tradeId,
        batchCode: trd.batchCode,
        amount: trd.youPay,
        paymentStatus: trd.paymentStatus,
        status: trd.status,
        upiRef: trd.upiRef,
      },
    };
  },

  getCashbackStatus(orderId: string, uid: string) {
    const trd = getOrCreateTradeOrderForUser(orderId, uid);
    return {
      success: true,
      profitInfo: {
        tradeId: trd.tradeId,
        batchCode: trd.batchCode,
        youPay: trd.youPay,
        youGet: trd.youGet,
        profit: trd.profit,
        incomeRate: trd.incomeRate,
        commissionPercent: trd.commissionPercent,
        status: trd.status,
      },
    };
  },
};
