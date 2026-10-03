export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  kycStatus: 'Verified' | 'Pending';
  walletBalance: number;
}

export interface Order {
  orderId: string;
  uid: string;
  productName: string;
  amount: number;
  orderStatus: 'Completed' | 'Processing' | 'Payment Pending' | 'Cancelled';
  paymentStatus: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  paymentMethod: string;
  transactionId: string;
  upiRef: string;
  orderDate: string;
  deliveryStatus: 'Delivered' | 'In Transit' | 'Out for Delivery' | 'Not Dispatched';
  deliveryDate?: string;
  cashbackEligible: boolean;
  cashbackAmount: number;
  cashbackStatus: 'Credited' | 'Pending Verification' | 'Not Eligible' | 'Processing';
  cashbackNotes: string;
}

export interface SupportTicket {
  ticketId: string;
  uid: string;
  email: string;
  userName: string;
  issueCategory: string;
  orderId?: string;
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
    verifiedOrder?: Order;
    ticketId?: string;
    screenshotData?: {
      extracted: any;
      backendVerified: any;
      isVerifiedMatch: boolean;
      disclaimer: string;
    };
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
