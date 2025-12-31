'use client';

import Image from 'next/image';
import { useState, useEffect, FormEvent, useRef } from 'react';

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const POLLING_INTERVAL = 5000;
const USERS = ['User A', 'User B'];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showUserSelection, setShowUserSelection] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/get-messages');
      const data = await response.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser,
          content: newMessage.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser && USERS.includes(savedUser)) {
      setCurrentUser(savedUser);
      setShowUserSelection(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const selectUser = (user: string) => {
    setCurrentUser(user);
    localStorage.setItem('chatUser', user);
    setShowUserSelection(false);
  };

  if (showUserSelection) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md bg-[#222e35] rounded-lg shadow-xl p-6 sm:p-8 border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/whatsapp.png"
                alt="WhatsApp Clone Logo"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-[#e9edef] text-lg sm:text-xl font-semibold text-center mb-6 sm:mb-8">WhatsApp Clone</h1>
          <div className="space-y-3">
            {USERS.map((user) => (
              <button
                key={user}
                onClick={() => selectUser(user)}
                className="w-full py-4 sm:py-3 bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] rounded-md transition-all font-bold uppercase tracking-wide shadow-md min-h-[48px] touch-manipulation"
              >
                Join as {user}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0c1317] flex items-center justify-center">
      <div className="w-full h-full bg-[#222e35] flex flex-col shadow-2xl relative overflow-hidden">

        {/* Header */}
        <header className="bg-[#202c33] px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center z-10 shadow-md">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser[currentUser.length - 1]}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[#e9edef] font-medium leading-tight text-sm sm:text-base truncate">Bakchodi Group</h2>
              <p className="text-[#8696a0] text-xs truncate">online • as {currentUser}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 text-[#aebac1]">
            <button
              onClick={() => setShowUserSelection(true)}
              className="hover:text-[#e9edef] text-xs uppercase font-bold px-2 py-1 border border-gray-600 rounded min-h-[32px] touch-manipulation"
            >
              Switch
            </button>
          </div>
        </header>

        {/* Chat Area with Background Doodles Pattern */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0b141a] relative"
          style={{
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
            backgroundBlendMode: 'overlay',
            opacity: 0.95
          }}
        >
          {messages.map((message) => {
            const isMe = message.sender === currentUser;
            return (
              <div key={message._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] px-3 py-2 shadow-md ${isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-l-lg rounded-br-lg'
                    : 'bg-[#202c33] text-[#e9edef] rounded-r-lg rounded-bl-lg'
                    }`}
                >
                  {!isMe && (
                    <div className="text-[#34b7f1] text-[11px] font-bold mb-0.5">
                      {message.sender}
                    </div>
                  )}
                  <div className="text-[14px] sm:text-[14.2px] leading-relaxed pr-12 break-words">
                    {message.content}
                  </div>
                  <div className="absolute right-2 bottom-1 flex items-center space-x-1">
                    <span className="text-[10px] text-[#8696a0]">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {isMe && (
                      <svg viewBox="0 0 16 15" width="16" height="15" fill="#53bdeb"><path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879 5.817 7.7a.374.374 0 00-.531.044l-.436.48a.37.37 0 00.043.53l3.706 2.84a.37.37 0 00.53-.047l5.95-8.83a.365.365 0 00-.063-.501zm-3.56 0l-.478-.372a.365.365 0 00-.51.063L7.334 7.333l-1.07-1.144a.374.374 0 00-.544-.015l-.433.432a.37.37 0 00.015.544l2.004 2.145a.37.37 0 00.542.016l4.103-6.103a.365.365 0 00-.063-.501z"></path></svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <footer className="bg-[#202c33] p-2 sm:p-3 flex items-center space-x-2">
          <button type="button" className="p-2 text-[#8696a0] hover:text-[#e9edef] hidden sm:block">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm3.5-9a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5zm-5 0a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5zm1.5 4.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg>
          </button>

          <form onSubmit={sendMessage} className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] px-4 py-3 rounded-lg focus:outline-none text-sm min-h-[44px] touch-manipulation"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="p-3 bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] rounded-full transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] touch-manipulation"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}