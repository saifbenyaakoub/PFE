import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import io from 'socket.io-client';
import './Chat.css';

const ENDPOINT = "http://localhost:5000"; // Matched to our backend port

export default function Chat() {
  const [session] = useState(() => getSession());
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // 1️⃣ Fetch Conversations (history)
  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;
    try {
      // Endpoint matched to: router.get('/conversations', ...)
      const res = await fetch(`${ENDPOINT}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${session.token}` } // Added auth header
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  }, [session]);

  // 2️⃣ Initialize Socket.io
  useEffect(() => {
    if (!session?.user) return;

    const s = io(ENDPOINT);
    setSocket(s);

    s.on('receive_msg', (message) => { // Matched to backend event name
      if (currentChatRef.current && message.conversation_id === currentChatRef.current.id) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations(); // Refresh list to show latest message preview
    });

    return () => s.disconnect();
  }, [session, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 3️⃣ Load Message History
  useEffect(() => {
    if (!currentChat) return;
    
    if (socket) socket.emit('join_room', currentChat.id); // Matched backend event

    const fetchMessages = async () => {
        try {
            // Endpoint matched to: router.get('/messages/:conversationId', ...)
            const res = await fetch(`${ENDPOINT}/api/chat/messages/${currentChat.id}`, {
              headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };
    fetchMessages();
  }, [currentChat, socket, session.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Send message
  const handleSendMessage = async (e) => {
      e.preventDefault();
      if(!newMessage.trim() || !currentChat) return;

      const messagePayload = {
          conversation_id: currentChat.id,
          text: newMessage, // Changed 'content' to 'text' to match DB
          sender_id: session.user.id,
          created_at: new Date().toISOString()
      };

      // Emit via Socket for real-time
      if(socket) socket.emit('send_msg', messagePayload);

      // Optimistic UI
      setMessages(prev => [...prev, messagePayload]);
      setNewMessage("");

      // Save to DB
      try {
           await fetch(`${ENDPOINT}/api/chat/message`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${session.token}` 
              },
              body: JSON.stringify({
                  text: messagePayload.text, // Matches controller
                  conversationId: messagePayload.conversation_id
              })
           });
      } catch (error) {
          console.error("Error saving message", error);
      }
  };

  // Helper to determine who you are talking to
  const getOtherUserName = (chat) => {
      // In our SQL JOIN, we returned user1_name and user2_name
      return chat.user1_id === session.user.id ? chat.user2_name : chat.user1_name;
  };

  if (!session) return <div className="chat-container">Please sign in.</div>;

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${currentChat ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header"><h3>Messages</h3></div>
        <div className="conversations-list">
            {conversations.map((chat) => (
                <div 
                    key={chat.id} 
                    className={`conversation-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setCurrentChat(chat)}
                >
                    <div className="avatar-placeholder"><FaUserCircle /></div>
                    <div className="conversation-info">
                        <h4>{getOtherUserName(chat)}</h4>
                        <p className="truncate">{chat.last_message || "No messages yet"}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className={`chat-main ${!currentChat ? 'mobile-hidden' : ''}`}>
        {currentChat ? (
            <>
                <div className="chat-header">
                    <button className="mobile-back-btn" onClick={() => setCurrentChat(null)}><FaArrowLeft /></button>
                    <div className="header-info">
                        <FaUserCircle className="header-avatar"/>
                        <h4>{getOtherUserName(currentChat)}</h4>
                    </div>
                </div>

                <div className="messages-area">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.sender_id === session.user.id ? 'sent' : 'received'}`}>
                            <div>{msg.text}</div> 
                            <span className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit"><FaPaperPlane /></button>
                </form>
            </>
        ) : (
            <div className="no-chat-selected">
                <FaPaperPlane size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <h3>Your Inbox</h3>
            </div>
        )}
      </div>
    </div>
  );
}