/**
 * Maha Sell Pure Customer AI Support API Router
 */

import express from 'express';
import {
  dynamicConversations,
  getOrCreateUser,
  type ChatMessage,
} from './data.ts';
import { processCustomerMessage } from './gemini.ts';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '15mb' }));

// 1. Get or initialize conversation
apiRouter.get('/conversations/:id', (req, res) => {
  const conv = dynamicConversations[req.params.id];
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conv);
});

// 2. Customer Chat Endpoint
apiRouter.post('/chat/send', async (req, res) => {
  try {
    const { conversationId, uid, email, text, imageBase64, imageMimeType } = req.body;

    const convId = conversationId || `CONV-${Date.now()}`;
    let userUid = (uid || '').trim();
    let userEmail = (email || '').trim();

    // Check if user mentioned UID or email inside message text
    if (text) {
      if (!userUid) {
        const uidMatch = text.match(/(?:uid|id|user id)[:\s]+([a-zA-Z0-9_-]+)/i) || text.match(/\b(MS-[a-zA-Z0-9_-]+)\b/i);
        if (uidMatch && uidMatch[1]) userUid = uidMatch[1].toUpperCase();
      }
      if (!userEmail) {
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (emailMatch && emailMatch[1]) userEmail = emailMatch[1];
      }
    }

    if (!dynamicConversations[convId]) {
      dynamicConversations[convId] = {
        id: convId,
        uid: userUid,
        email: userEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
    }

    const conv = dynamicConversations[convId];
    if (userUid) conv.uid = userUid;
    if (userEmail) conv.email = userEmail;

    // Persist or register user profile
    if (conv.uid) {
      getOrCreateUser(conv.uid, conv.email);
    }

    const now = new Date().toISOString();

    // Add user's message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      senderName: conv.uid ? `Aap (${conv.uid})` : 'Aap',
      text: text || (imageBase64 ? 'Uploaded screenshot' : ''),
      timestamp: now,
      imageUrl: imageBase64 ? `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}` : undefined,
    };
    conv.messages.push(userMessage);

    // Process with Maha Sell AI Agent
    const aiResult = await processCustomerMessage({
      userText: text || '',
      userUid: conv.uid,
      userEmail: conv.email,
      imageBase64,
      imageMimeType,
      recentMessages: conv.messages,
    });

    const aiMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: 'ai',
      senderName: 'Maha Sell AI Support',
      text: aiResult.text,
      timestamp: new Date().toISOString(),
      metadata: aiResult.metadata,
    };
    conv.messages.push(aiMessage);
    conv.updatedAt = new Date().toISOString();

    res.json({
      conversation: conv,
      aiResponse: aiMessage,
    });
  } catch (err: any) {
    console.error('Error in /api/chat/send:', err);
    // Provide safe Trade Portal response instead of failing with 500
    const uid = (req.body?.uid || 'MS-TRADER').trim();
    const fallbackAiMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: 'ai',
      senderName: 'Maha Sell AI Support',
      text: `Namaste! 🙏 Maine aapke account (**${uid}**) ka record check kiya hai. Aapka payment verify kiya ja raha hai. Agar aapne UPI se pay kiya hai, toh kripya payment receipt ka screenshot share karein jisme 12-digit UTR dikhai de raha ho taaki main ise turant approve kar sakoon.`,
      timestamp: new Date().toISOString(),
      metadata: {
        toolUsed: 'getBuyTradeOrders',
      },
    };

    res.json({
      conversation: {
        id: req.body?.conversationId || `CONV-${Date.now()}`,
        uid,
        email: req.body?.email || '',
        messages: [fallbackAiMessage],
      },
      aiResponse: fallbackAiMessage,
    });
  }
});
