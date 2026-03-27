import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";
import "./Chat.css";

const ENDPOINT = "http://localhost:5000";

export default function Chat() {
  const [session] = useState(() => getSession());
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // ─── Fetch conversations list ──────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`${ENDPOINT}/chat/conversations`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  }, [session]);

  // ─── Initialize Socket.IO with JWT auth ────────────────────────
  useEffect(() => {
    if (!session?.user) return;

    const s = io(ENDPOINT, {
      auth: { token: session.token },
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("connect_error", (err) => {
      console.error("Socket auth error:", err.message);
    });

    // Receive new message from socket
    s.on("receiveMessage", (message) => {
      const chatId = currentChatRef.current?.id;
      if (chatId && message.conversation_id === chatId) {
        setMessages((prev) => {
          // Avoid duplicates (if sender is current user, already added optimistically)
          if (
            message.sender_id === session.user.id &&
            prev.some((m) => m.id === message.id)
          ) {
            return prev;
          }
          // Replace optimistic message or add new
          if (message.sender_id === session.user.id) {
            // Replace the last optimistic message (no id) with the real one
            const idx = prev.findIndex(
              (m) => !m.id && m.text === message.text && m.sender_id === message.sender_id
            );
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = message;
              return updated;
            }
          }
          return [...prev, message];
        });
      }
      // Refresh conversation list to update last message preview
      fetchConversations();
    });

    // Typing indicator
    s.on("userTyping", ({ conversationId }) => {
      if (currentChatRef.current?.id === conversationId) {
        setIsTyping(true);
      }
    });

    s.on("userStopTyping", ({ conversationId }) => {
      if (currentChatRef.current?.id === conversationId) {
        setIsTyping(false);
      }
    });

    // Messages read by partner
    s.on("messagesRead", ({ conversationId }) => {
      if (currentChatRef.current?.id === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === session.user.id ? { ...m, is_read: true } : m
          )
        );
      }
    });

    setSocket(s);

    return () => s.disconnect();
  }, [session, fetchConversations]);

  // ─── Load conversations on mount ───────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ─── Load messages when a conversation is selected ─────────────
  useEffect(() => {
    if (!currentChat || !socket) return;

    // Join room
    socket.emit("joinConversation", currentChat.id);
    // Mark as read
    socket.emit("markAsRead", currentChat.id);

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${ENDPOINT}/chat/messages/${currentChat.id}`,
          { headers: { Authorization: `Bearer ${session.token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();

    // Leave previous room on cleanup
    return () => {
      socket.emit("leaveConversation", currentChat.id);
      setIsTyping(false);
    };
  }, [currentChat, socket, session]);

  // ─── Auto-scroll to bottom ─────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── Typing indicator handler ──────────────────────────────────
  const handleTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing", currentChat.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", currentChat.id);
    }, 1500);
  };

  // ─── Send message via Socket (no REST — socket handles DB save) ─
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket) return;

    const text = newMessage.trim();

    // Optimistic UI — add message instantly
    setMessages((prev) => [
      ...prev,
      {
        text,
        sender_id: session.user.id,
        sender_name: session.user.name,
        conversation_id: currentChat.id,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    // Send via socket — backend will save to DB and broadcast
    socket.emit("sendMessage", {
      conversationId: currentChat.id,
      text,
    });

    setNewMessage("");
    socket.emit("stopTyping", currentChat.id);
  };

  if (!session) return <div className="chat-container">Please sign in.</div>;

  return (
    <div className="chat-container">
      {/* ─── Sidebar: conversations list ─── */}
      <div className={`chat-sidebar ${currentChat ? "mobile-hidden" : ""}`}>
        <div className="sidebar-header">
          <h3>Messages</h3>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>
              No conversations yet
            </div>
          )}
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-item ${currentChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setCurrentChat(chat)}
            >
              <div className="avatar-placeholder">
                {chat.other_user_image ? (
                  <img
                    src={`${ENDPOINT}${chat.other_user_image}`}
                    alt=""
                    style={{ width: 45, height: 45, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <div className="conversation-info">
                <h4>
                  {chat.other_user_name}
                  {chat.unread_count > 0 && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: "#3b82f6",
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "2px 7px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {chat.unread_count}
                    </span>
                  )}
                </h4>
                <p className="truncate">{chat.last_message || "No messages yet"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main chat area ─── */}
      <div className={`chat-main ${!currentChat ? "mobile-hidden" : ""}`}>
        {currentChat ? (
          <>
            <div className="chat-header">
              <button
                className="mobile-back-btn"
                onClick={() => setCurrentChat(null)}
              >
                <FaArrowLeft />
              </button>
              <div className="header-info">
                {currentChat.other_user_image ? (
                  <img
                    src={`${ENDPOINT}${currentChat.other_user_image}`}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle className="header-avatar" />
                )}
                <h4>{currentChat.other_user_name}</h4>
              </div>
            </div>

            <div className="messages-area">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`message-bubble ${
                    msg.sender_id === session.user.id ? "sent" : "received"
                  }`}
                >
                  <div>{msg.text}</div>
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
              />
              <button type="submit">
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FaPaperPlane size={40} style={{ opacity: 0.2, marginBottom: "10px" }} />
            <h3>Your Inbox</h3>
          </div>
        )}
      </div>
    </div>
  );
}
