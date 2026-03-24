import React, { useState, useEffect, useRef } from 'react';
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import './Chat.css';

const ENDPOINT = "http://localhost:5000"; // Ensure this matches your backend URL

export default function Chat() {
  const [session] = useState(() => getSession());
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 2. Fetch Conversations on Load
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchConversations = async () => {
       try {
         const res = await fetch(`${ENDPOINT}/chats?userId=${session.user.id}`);
         if(res.ok) {
            const data = await res.json();
            setConversations(data);
         } else {
            // Mock data for demonstration if backend is not ready
            setConversations([
                { _id: '1', users: [{_id: 'other1', name: 'John Doe'}], latestMessage: { content: 'When can you start?' } },
                { _id: '2', users: [{_id: 'other2', name: 'Service Pro'}], latestMessage: { content: 'The job is done.' } }
            ]);
         }
       } catch (error) {
         console.error("Failed to fetch chats", error);
       }
    };
    fetchConversations();
  }, [session]);

  // 4. Load Messages when a Chat is Selected
  useEffect(() => {
    if (!currentChat) return;
    
    const fetchMessages = async () => {
        try {
            const res = await fetch(`${ENDPOINT}/messages/${currentChat._id}`);
            if(res.ok) {
                const data = await res.json();
                setMessages(data);
            } else {
                 // Mock messages for UI testing
                 setMessages([
                     { _id: 'm1', content: 'Hello!', sender: { _id: 'other1' }, createdAt: new Date(Date.now() - 1000000).toISOString() },
                     { _id: 'm2', content: 'Hi! I have a question about the service.', sender: { _id: session.user.id }, createdAt: new Date().toISOString() }
                 ]);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };
    fetchMessages();
  }, [currentChat, session]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if(!newMessage.trim() || !currentChat) return;

      const messagePayload = {
          content: newMessage,
          chatId: currentChat._id,
          sender: { _id: session.user.id, name: session.user.name },
          createdAt: new Date().toISOString()
      };

      // Optimistic UI Update
      setMessages([...messages, messagePayload]);
      setNewMessage("");
      
      try {
           const res = await fetch(`${ENDPOINT}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  content: messagePayload.content,
                  chatId: messagePayload.chatId,
                  senderId: session.user.id
              })
           });
           
           if(res.ok) {
             // Message sent successfully
           }
      } catch (error) {
          console.error("Error sending message", error);
      }
  };

  const getOtherUser = (chat) => {
      if(!chat.users) return { name: 'Unknown' };
      // Logic to find the user that is NOT the current logged in user
      return chat.users.find(u => u._id !== session.user.id) || { name: 'User' };
  };

  if (!session) return <div className="chat-container">Please sign in to access chat.</div>;

  return (
    <div className="chat-container">
      {/* Sidebar: Conversation List */}
      <div className={`chat-sidebar ${currentChat ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
            <h3>Messages</h3>
        </div>
        <div className="conversations-list">
            {conversations.map((chat) => (
                <div 
                    key={chat._id} 
                    className={`conversation-item ${currentChat?._id === chat._id ? 'active' : ''}`}
                    onClick={() => setCurrentChat(chat)}
                >
                    <div className="avatar-placeholder">
                        <FaUserCircle />
                    </div>
                    <div className="conversation-info">
                        <h4>{getOtherUser(chat).name}</h4>
                        <p>{chat.latestMessage?.content || "No messages yet"}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${!currentChat ? 'mobile-hidden' : ''}`}>
        {currentChat ? (
            <>
                <div className="chat-header">
                    <button className="mobile-back-btn" onClick={() => setCurrentChat(null)}>
                        <FaArrowLeft />
                    </button>
                    <div className="header-info">
                        <FaUserCircle className="header-avatar"/>
                        <h4>{getOtherUser(currentChat).name}</h4>
                    </div>
                </div>

                <div className="messages-area">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.sender._id === session.user.id ? 'sent' : 'received'}`}>
                            <div>{msg.content}</div>
                            <span className="message-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <button type="submit">
                        <FaPaperPlane />
                    </button>
                </form>
            </>
        ) : (
            <div className="no-chat-selected">
                <div>
                    <FaPaperPlane size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                    <h3>Select a conversation</h3>
                    <p>Choose a contact from the left to start chatting.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}