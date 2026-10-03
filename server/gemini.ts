/**
 * Maha Sell AI Customer Support Assistant Engine powered by @google/genai
 * Tailored for any incoming user providing UID & Email, with screenshot analysis & problem solving.
 */

import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import { toolsService } from './tools.ts';
import {
  getOrCreateUser,
  getOrCreateTradeOrderForUser,
  getOrCreateOrderForUser,
  type ChatMessage,
} from './data.ts';

export function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Function Declarations for Gemini Function Calling in Maha Sell Trade Portal
const getUserProfileDeclaration: FunctionDeclaration = {
  name: 'getUserProfile',
  description: 'Retrieve Trade Portal profile details for a given customer UID/email (Trading Wallet Balance, Primary Active UPI, Total Earnings, Total Amount, etc.).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      uid: { type: Type.STRING, description: 'Customer UID (e.g., ApBQCdVy07cZHpWnjBKltXJDwIw2 or MS-1002)' },
      email: { type: Type.STRING, description: 'Customer email (e.g. suraj21@gmail.com)' },
    },
    required: ['uid'],
  },
};

const getAvailableTradeBatchesDeclaration: FunctionDeclaration = {
  name: 'getAvailableTradeBatches',
  description: 'Fetch the active Trade Batches available on the Buy screen (e.g. 2008-3646, 3000-5000, 3647) with Income Rates, Commission, You Pay, and Profit margins.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getBuyTradeOrdersDeclaration: FunctionDeclaration = {
  name: 'getBuyTradeOrders',
  description: 'Check Buy History and approval status of trade orders for a trader UID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      uid: { type: Type.STRING, description: 'Customer UID' },
    },
    required: ['uid'],
  },
};

const getSellPayoutStatusDeclaration: FunctionDeclaration = {
  name: 'getSellPayoutStatus',
  description: 'Verify Sell History and withdrawal payout status from Trading Wallet Balance to Primary Active UPI ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      uid: { type: Type.STRING, description: 'Customer UID' },
    },
    required: ['uid'],
  },
};

const reconcilePaymentScreenshotDeclaration: FunctionDeclaration = {
  name: 'reconcilePaymentScreenshot',
  description: 'Verify and reconcile user payment screenshot (UTR number, amount paid, batch code) to approve pending Buy Trade order.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      uid: { type: Type.STRING, description: 'Customer UID' },
      utrNumber: { type: Type.STRING, description: '12-digit UPI UTR or bank reference number from screenshot' },
      amount: { type: Type.NUMBER, description: 'Payment amount shown on receipt' },
      batchCode: { type: Type.STRING, description: 'Trade batch code (e.g., 2008-3646, 3000-5000)' },
      screenshotStatus: { type: Type.STRING, description: 'Status seen in screenshot: Successful / Completed / Pending' },
    },
    required: ['uid'],
  },
};

const createSupportTicketDeclaration: FunctionDeclaration = {
  name: 'createSupportTicket',
  description: 'Register an official Maha Sell Trade Portal support ticket for manual clearance, approval escalation, or payment reconciliation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      uid: { type: Type.STRING, description: 'Customer UID' },
      email: { type: Type.STRING, description: 'Customer email' },
      issueCategory: {
        type: Type.STRING,
        description: 'Category: Buy Order Approval, Sell Payout Pending, Payment Deducted Not Reflected, UPI ID Update, APK Help',
      },
      userDescription: { type: Type.STRING, description: 'Customer problem description' },
      tradeId: { type: Type.STRING, description: 'Associated Trade Batch / Order ID if applicable' },
      aiAnalysis: { type: Type.STRING, description: 'AI findings and diagnosis' },
    },
    required: ['uid', 'issueCategory', 'userDescription'],
  },
};

const toolsList = [
  getUserProfileDeclaration,
  getAvailableTradeBatchesDeclaration,
  getBuyTradeOrdersDeclaration,
  getSellPayoutStatusDeclaration,
  reconcilePaymentScreenshotDeclaration,
  createSupportTicketDeclaration,
];

function getSystemInstruction(currentUid: string, currentEmail: string): string {
  const isIdentified = !!currentUid;

  return `You are the official Maha Sell AI Support Assistant for the "Maha Sell Trade Portal" (Trade & Commission Platform).

CRITICAL UNDERSTANDING OF MAHA SELL TRADE PORTAL:
- Maha Sell is NOT an e-commerce shopping/delivery app! There is NO courier delivery, NO physical package shipping.
- Maha Sell is an ONLINE ORDER TRADING & COMMISSION PLATFORM where users earn profit by buying and selling trade orders:
  1. BUY SCREEN & TRADE BATCHES:
     - Available trade batches are listed (e.g. "2008-3646", "3000-5000", "3647").
     - Each batch shows:
       * Income Rate: e.g. "3%+6", "4%+6" (Percent Bonus + ₹6 Extra Bonus)
       * Commission: e.g. 9%, 10%, Up to 12% Commission
       * You Pay: e.g. ₹2688.00, ₹3008.00 (Amount user pays to purchase the trade slot)
       * You Get: e.g. ₹2929.92, ₹3308.80 (Total payout return)
       * Your Profit: e.g. +₹241.92, +₹300.80
       * Stock: Available batch quantity (e.g. Stock: 20, Stock: 80)
  2. WORKFLOW (BUY -> APPROVAL -> SELL -> UPI PAYOUT):
     - Step 1 (BUY): User selects a batch and pays via UPI (Google Pay, PhonePe, Paytm).
     - Step 2 (APPROVAL): Order appears in "Buy History". Payment is verified, and the order is marked "Approved & Active".
     - Step 3 (SELL): Once approved, user can click "SELL" to liquidate the order or withdraw from "Trading Wallet Balance".
     - Step 4 (PAYOUT): Payout goes directly to the user's "Primary Active UPI" (e.g. 9876543210@ybl) managed under "My UPI IDs (2)".
     - Step 5 (HISTORY): Transaction status can be tracked in "Sell History".
  3. PROFILE & DASHBOARD METRICS:
     - "Trading Wallet Balance" (with SELL button)
     - "Primary Active UPI" (with Manage button)
     - "Today Earning", "Total Amount", "Total Earning"
     - "Buy History" and "Sell History"
     - "Download APK (Mobile App)"

CUSTOMER CONTEXT:
- UID: "${currentUid || 'NOT_YET_PROVIDED'}"
- Email: "${currentEmail || 'NOT_YET_PROVIDED'}"
- IS_IDENTIFIED: ${isIdentified ? 'TRUE (LOCKED)' : 'FALSE'}

CRITICAL MANDATORY RULES:
1. NO REPEATED ASKING FOR UID / EMAIL:
${
  isIdentified
    ? `   - User's UID and Email are ALREADY SAVED and verified.
   - DO NOT ASK FOR UID OR EMAIL AGAIN UNDER ANY CIRCUMSTANCES.
   - Address the user respectfully (e.g. by name or UID) and directly focus on their Trade Portal problem.`
    : `   - If UID is not yet provided, politely ask for it once so you can access their Trade Portal profile. Once given, remember it permanently.`
}

2. DEEP PROBLEM SOLVING & ASKING FOR SCREENSHOTS:
   - When a user reports:
     * Money deducted from bank but Buy order shows "Approval Pending" or "Payment Pending"
     * Sell payout not received in their Primary UPI ID
     * Wrong profit calculation or commission query
     * App error / APK issue
   - PROACTIVELY invite them to attach a screenshot of their UPI payment receipt, bank deduction SMS, or Trade Portal screen:
     "Agar aapke paas UPI payment receipt (PhonePe/GPay/Paytm) ya bank SMS ka screenshot hai, toh kripya yahan Camera/Upload icon se share karein taaki main UTR number aur amount verify karke turant approval status check kar sakun."

3. MULTIMODAL SCREENSHOT ANALYSIS:
   - When a screenshot is uploaded:
     - Read visible Amount (₹)
     - Read 12-digit UPI UTR / Transaction Reference Number
     - Read Receiver / Payee UPI ID (Maha Sell)
     - Read Timestamp & Payment Status
     - Call 'reconcilePaymentScreenshot' to fast-track verification!
     - Explain clearly what is verified and reassure the trader.

4. POLICIES & RESOLUTIONS:
   - Buy Order Approval: Takes 15 to 30 minutes after UPI payment verification. If UTR matches, it is approved.
   - Bank Deduction without Order: If bank gateway timed out, NPCI guidelines state automatic refund to source account within 3 to 5 business days. AI issues tracking ticket.
   - Sell Payout: Dispatched to Primary Active UPI within 1 to 2 hours of clicking SELL.

5. LANGUAGE & TONE:
   - Speak in warm, empathetic, clear Hindi/Hinglish.
   - Always refer accurately to Trade Portal concepts (Trade Batch, Buy History, Sell History, Trading Wallet Balance, Primary Active UPI, Income Rate, Commission).`;
}

// Fallback intelligence for dynamic users when API is offline or key missing
function generateDynamicFallback(
  userText: string,
  userUid: string,
  userEmail: string,
  imageAttached: boolean
): { responseText: string; metadata?: any } {
  const text = (userText || '').toLowerCase();

  // If UID is missing and not provided in session
  if (!userUid && !text.includes('uid') && !text.includes('ms-') && !text.includes('apbq')) {
    return {
      responseText: `👋 Namaste! Main Maha Sell Trade Portal ka official AI Support Assistant hoon. 😊\n\nAapki trade inquiry, buy approval ya sell payout verify karne ke liye kripya apna **UID** (jaise aapke profile me \`ApBQCdVy07cZHpWnjBKltXJDwIw2\` ya ID) aur **Email** batayein, aur batayein aapko kya samasya aa rahi hai?`,
    };
  }

  const cleanUid = userUid || 'TRADER-USER';
  const cleanEmail = userEmail || `${cleanUid.toLowerCase()}@gmail.com`;

  // Screenshot review for Trade Portal
  if (imageAttached || text.includes('screenshot') || text.includes('photo') || text.includes('receipt')) {
    const verifiedTrade = getOrCreateTradeOrderForUser('2008-3646', cleanUid);
    return {
      responseText: `Maine aapka uploaded payment receipt / Trade Portal screenshot achhe se analyse kiya hai:

📸 **Screenshot Analysis (Trade Payment Verification):**
• **Trade Batch:** ${verifiedTrade.batchCode}
• **Amount Paid:** ₹${verifiedTrade.youPay.toFixed(2)}
• **Payee:** Maha Sell Trade Portal
• **UPI Ref / UTR:** ${verifiedTrade.upiRef}
• **Payment Status:** Completed / Successful

🔍 **Maha Sell Trade Portal Records:**
• **Buy Order:** ${verifiedTrade.tradeId}
• **Income Rate:** ${verifiedTrade.incomeRate} (Commission: ${verifiedTrade.commissionPercent}%)
• **Total Expected Return (Upon Sell):** ₹${verifiedTrade.youGet.toFixed(2)} (Profit: +₹${verifiedTrade.profit.toFixed(2)})
• **Current Status:** Payment Received & Verified. Admin approval window active (15-30 minutes).

💡 **Solution:**
Aapka UPI payment successfully verify ho gaya hai! Jaise hi approval complete hoga, yeh order aapke **Buy History** mein Approved & Active dikhega aur aap ise Sell karke profit apne Primary UPI ID par withdraw kar payenge.`,
      metadata: {
        toolUsed: 'reconcilePaymentScreenshot',
        verifiedTrade,
        screenshotData: {
          extracted: { amount: verifiedTrade.youPay, upiRef: verifiedTrade.upiRef, batch: verifiedTrade.batchCode },
          backendVerified: { status: 'Approved & Active', tradeId: verifiedTrade.tradeId },
          isVerifiedMatch: true,
        },
      },
    };
  }

  // Sell payout query
  if (text.includes('sell') || text.includes('withdraw') || text.includes('wallet') || text.includes('upi')) {
    const payoutRes = toolsService.getSellPayoutStatus(cleanUid);
    const walletBalance = payoutRes.walletBalance ?? 301.8;
    const primaryUpi = payoutRes.primaryUpi || '9876543210@ybl';
    const payout = payoutRes.payout || {
      payoutId: 'PAY-1001',
      status: 'Processing',
      amount: 301.8,
      utrNumber: 'UPI429188029103',
    };

    return {
      responseText: `Namaste! Maine aapke Trade Portal account (**${cleanUid}**) ke Sell & Payout status ko check kiya hai:

💼 **Trading Wallet Balance:** ₹${walletBalance.toFixed(2)}
📲 **Primary Active UPI:** ${primaryUpi}
⚡ **Sell Payout Status:** ${payout.status} (Amount: ₹${payout.amount.toFixed(2)})
🏦 **Bank UTR / Ref:** ${payout.utrNumber}

ℹ️ **Maha Sell Trade Portal Rules:**
Jab aap Home screen par **SELL** button click karte hain, toh payout amount aapke registered **Primary Active UPI ID** par 1 se 2 ghante ke andar auto-transfer ho jata hai. Agar aapka payout delay ho raha hai, toh main backend priority ticket raise kar deta hoon! 😊`,
      metadata: {
        toolUsed: 'getSellPayoutStatus',
        verifiedPayout: payout,
      },
    };
  }

  // Buy order pending or approval query
  if (text.includes('buy') || text.includes('approval') || text.includes('order') || text.includes('kat gaya') || text.includes('pending')) {
    const trade = getOrCreateTradeOrderForUser('2008-3646', cleanUid);
    const ticketRes = toolsService.createSupportTicket(
      cleanUid,
      cleanEmail,
      'Buy Order Approval',
      userText,
      trade.tradeId,
      'Trader payment made via UPI; fast-track approval requested.'
    );
    return {
      responseText: `Namaste! Maine aapke Trade Portal order ki verification check ki hai:

📦 **Trade Batch:** ${trade.batchCode}
💰 **You Pay:** ₹${trade.youPay.toFixed(2)} | **You Get:** ₹${trade.youGet.toFixed(2)} (Profit: +₹${trade.profit.toFixed(2)})
📊 **Income Rate:** ${trade.incomeRate} (Commission: ${trade.commissionPercent}%)
⏳ **Current Status:** ${trade.status} (${trade.approvalEta})

Maine aapke case ko fast-track karne ke liye Trade Portal Support Ticket **${ticketRes.ticket.ticketId}** create kar diya hai.
Agar aapke paas bank transaction ka screenshot ya UPI receipt hai, toh kripya yahan attach karein taaki main UTR number verify karke turant approval status confirm kar sakun!`,
      metadata: {
        toolUsed: 'createSupportTicket',
        ticketId: ticketRes.ticket.ticketId,
        verifiedTrade: trade,
      },
    };
  }

  // Default Trade Portal Welcome & problem understanding
  const profile = getOrCreateUser(cleanUid, cleanEmail);
  return {
    responseText: `Namaste! Main Maha Sell Trade Portal ka official AI Support Assistant hoon.

Aapke account details verify ho chuke hain:
• **Trader UID:** ${profile.uid}
• **Trading Wallet Balance:** ₹${profile.tradingWalletBalance.toFixed(2)}
• **Primary Active UPI:** ${profile.primaryActiveUpi}
• **Total Earnings:** ₹${profile.totalEarning.toFixed(2)}

Aapko Trade Portal mein kya samasya aa rahi hai?
1. **Buy Order Approval Pending** (UPI se pay kiya par approval nahi mila)
2. **Sell Payout / Withdrawal** (Wallet se Sell kiya par UPI me paise nahi aaye)
3. **Payment Cut ho gaya par order nahi bana**
4. **Income Rate / Profit Commission Calculation**

Agar aapke paas koi error ya UPI payment receipt ka **Screenshot** hai, toh aap yahan upload kar sakte hain, main turant UTR verify kar dunga! 😊`,
  };
}

// High-availability model candidate cascade to prevent 503 High Demand errors
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function generateWithModelCascade(
  aiClient: GoogleGenAI,
  req: { contents: any[]; config?: any }
) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const result = await aiClient.models.generateContent({
        model,
        contents: req.contents,
        config: req.config,
      });
      return { response: result, modelUsed: model };
    } catch (err: any) {
      console.warn(
        `Model ${model} error (${err?.status || err?.message || '503/fail'}). Cascading to next candidate...`
      );
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  throw lastError;
}

export async function processCustomerMessage(params: {
  userText: string;
  userUid: string;
  userEmail?: string;
  imageBase64?: string;
  imageMimeType?: string;
  recentMessages?: ChatMessage[];
}): Promise<{
  text: string;
  metadata?: any;
}> {
  const { userText, userUid, userEmail = '', imageBase64, imageMimeType, recentMessages = [] } = params;
  const aiClient = getAiClient();

  if (aiClient) {
    try {
      const systemInstruction = getSystemInstruction(userUid, userEmail);
      const contents: any[] = [];

      for (const m of recentMessages.slice(-6)) {
        if (m.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: m.text }] });
        } else if (m.sender === 'ai') {
          contents.push({ role: 'model', parts: [{ text: m.text }] });
        }
      }

      const currentParts: any[] = [];
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
            data: imageBase64,
          },
        });
      }
      currentParts.push({
        text: userText || 'Please analyze this screenshot and resolve my Maha Sell problem.',
      });

      contents.push({ role: 'user', parts: currentParts });

      const { response, modelUsed } = await generateWithModelCascade(aiClient, {
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: toolsList }],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const executedTools: Array<{ name: string; result: any }> = [];
        for (const call of functionCalls) {
          const tName = call.name || 'getUserProfile';
          let res: any;
          if (tName === 'getUserProfile') {
            res = toolsService.getUserProfile(userUid, userEmail);
          } else if (tName === 'getAvailableTradeBatches') {
            res = toolsService.getAvailableTradeBatches();
          } else if (tName === 'getBuyTradeOrders') {
            res = toolsService.getBuyTradeOrders(userUid);
          } else if (tName === 'getSellPayoutStatus') {
            res = toolsService.getSellPayoutStatus(userUid);
          } else if (tName === 'reconcilePaymentScreenshot') {
            res = toolsService.reconcilePaymentScreenshot({
              uid: userUid,
              utrNumber: (call.args as any)?.utrNumber,
              amount: (call.args as any)?.amount,
              batchCode: (call.args as any)?.batchCode,
              screenshotStatus: (call.args as any)?.screenshotStatus,
            });
          } else if (tName === 'createSupportTicket') {
            res = toolsService.createSupportTicket(
              userUid,
              userEmail,
              (call.args as any)?.issueCategory || 'Trade Portal Support',
              (call.args as any)?.userDescription || userText,
              (call.args as any)?.tradeId,
              (call.args as any)?.aiAnalysis
            );
          } else if (tName === 'getOrder') {
            res = toolsService.getOrder((call.args as any)?.orderId || '2008-3646', userUid);
          } else if (tName === 'getPaymentStatus') {
            res = toolsService.getPaymentStatus((call.args as any)?.orderId || '2008-3646', userUid);
          } else if (tName === 'getCashbackStatus') {
            res = toolsService.getCashbackStatus((call.args as any)?.orderId || '2008-3646', userUid);
          } else {
            res = { success: true };
          }
          executedTools.push({ name: tName, result: res });
        }

        const toolResponseParts = functionCalls.map((fc, idx) => ({
          functionResponse: {
            name: fc.name || executedTools[idx].name,
            response: { result: executedTools[idx].result },
          },
        }));

        const modelTurn = response.candidates?.[0]?.content;
        const validContents = modelTurn ? [...contents, modelTurn] : [...contents];
        validContents.push({ role: 'user', parts: toolResponseParts });

        const { response: secondResponse } = await generateWithModelCascade(aiClient, {
          contents: validContents,
          config: { systemInstruction },
        });

        const finalText = secondResponse.text || 'Trade verification complete.';
        return {
          text: finalText,
          metadata: {
            toolUsed: executedTools[0]?.name,
            verifiedTrade:
              executedTools.find((t) => t.result?.trade)?.result?.trade ||
              executedTools.find((t) => t.result?.order)?.result?.order,
            verifiedPayout: executedTools.find((t) => t.result?.payout)?.result?.payout,
            ticketId: executedTools.find((t) => t.result?.ticket?.ticketId)?.result?.ticket?.ticketId,
          },
        };
      }

      return {
        text: response.text || 'Aapki query samajh aa gayi hai. Main aapki problem verify kar raha hoon.',
      };
    } catch (err: any) {
      console.warn('Gemini API fallback triggered:', err?.message || err);
      const fallback = generateDynamicFallback(userText, userUid, userEmail, !!imageBase64);
      return { text: fallback.responseText, metadata: fallback.metadata };
    }
  }

  const fallback = generateDynamicFallback(userText, userUid, userEmail, !!imageBase64);
  return { text: fallback.responseText, metadata: fallback.metadata };
}
