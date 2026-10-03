import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CustomerChat } from './components/CustomerChat.tsx';

export default function App() {
  // Dynamic user identity: stores whatever UID & Email the user provides
  const [currentUid, setCurrentUid] = useState<string>(() => {
    return localStorage.getItem('mahasell_uid') || '';
  });
  const [currentEmail, setCurrentEmail] = useState<string>(() => {
    return localStorage.getItem('mahasell_email') || '';
  });
  const [sessionKey, setSessionKey] = useState<number>(Date.now());

  const handleUpdateIdentity = (uid: string, email: string) => {
    const cleanUid = uid.trim().toUpperCase();
    const cleanEmail = email.trim();
    setCurrentUid(cleanUid);
    setCurrentEmail(cleanEmail);
    if (cleanUid) localStorage.setItem('mahasell_uid', cleanUid);
    if (cleanEmail) localStorage.setItem('mahasell_email', cleanEmail);
  };

  const handleNewChat = () => {
    setSessionKey(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sleek Top Bar with Identity & Brand */}
      <Navbar
        currentUid={currentUid}
        currentEmail={currentEmail}
        onUpdateIdentity={handleUpdateIdentity}
        onNewChat={handleNewChat}
      />

      {/* Pure Customer AI Support Chat Interface */}
      <main className="flex-1 flex flex-col">
        <CustomerChat
          key={sessionKey}
          currentUid={currentUid}
          currentEmail={currentEmail}
          onUpdateIdentity={handleUpdateIdentity}
          onNewChat={handleNewChat}
        />
      </main>
    </div>
  );
}
