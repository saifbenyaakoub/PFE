import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaFileInvoiceDollar, FaCheck, FaTimes, FaFilePdf, FaEdit, FaClock, FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import io from "socket.io-client"
import html2canvas from "html2canvas"; // Replace autoTable with this;
import "./Chat.css";

// 1. IMPROVEMENT: Use environment variables for API endpoints
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMPTY_ITEM = { description: "", qty: 1, unitPrice: "" };

const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) return img;
  return `${ENDPOINT}/uploads/${img}`;
};

export default function Chat() {
  const [session] = useState(() => getSession());
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotation, setQuotation] = useState({ items: [{ ...EMPTY_ITEM }], duration: "", startDate: "" });
  const [editingMessageId, setEditingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);
  const typingTimeoutRef = useRef(null);
  const quotationRef = useRef(null); // Used to target the hidden Canva template[cite: 11]

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const calcTotal = (items) =>
    items.reduce((sum, it) => sum + (parseFloat(it.unitPrice) || 0) * (parseInt(it.qty) || 1), 0);

  const normalizeItems = (data) =>
    (data.items && data.items.length > 0)
      ? data.items
      : [{ description: data.description, qty: 1, unitPrice: data.amount }];

  const openModalForNew = () => {
    setQuotation({ items: [{ ...EMPTY_ITEM }], duration: "", startDate: "" });
    setEditingMessageId(null);
    setShowQuotationModal(true);
  };

  const openModalForEdit = (data, msgId) => {
    setQuotation({
      items: normalizeItems(data),
      duration: data.duration ?? "",
      startDate: data.startDate ?? "",
    });
    setEditingMessageId(msgId);
    setShowQuotationModal(true);
  };

  const updateItem = (idx, field, value) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  const addItem = () =>
    setQuotation(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));

  const removeItem = (idx) =>
    setQuotation(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  // ── fetch / socket ────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`${ENDPOINT}/chat/conversations?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : (data.rows || []));
      }
    } catch (err) { console.error("Error fetching conversations:", err); }
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    const s = io(ENDPOINT);
    s.emit("joinUserNotifications", session.user.id);

    s.on("receiveMessage", (message) => {
      const chatId = currentChatRef.current?.id;
      if (chatId && message.conversation_id === chatId) {
        setMessages((prev) => {
          const tempIndex = prev.findIndex(m =>
            String(m.id).startsWith('temp-') &&
            m.content === message.content &&
            String(m.sender_id) === String(message.sender_id)
          );
          if (tempIndex !== -1) { const nl = [...prev]; nl[tempIndex] = message; return nl; }
          const existingIndex = prev.findIndex(m => String(m.id) === String(message.id));
          if (existingIndex !== -1) { const nl = [...prev]; nl[existingIndex] = message; return nl; }
          return [...prev, message];
        });
      }
      fetchConversations();
    });

    s.on("conversationUpdated", () => fetchConversations());
    s.on("userTyping", ({ conversationId }) => {
      if (currentChatRef.current?.id === conversationId) setIsTyping(true);
    });
    s.on("userStopTyping", ({ conversationId }) => {
      if (currentChatRef.current?.id === conversationId) setIsTyping(false);
    });
    s.on("quotationUpdated", ({ messageId, status, content, conversationId }) => {
      if (currentChatRef.current?.id !== conversationId) return;
      setMessages(prev => prev.map(m => {
        if (String(m.id) === String(messageId)) {
          if (content) return { ...m, content };
          try {
            const parsed = JSON.parse(m.content);
            parsed.status = status;
            return { ...m, content: JSON.stringify(parsed) };
          } catch (e) { return m; }
        }
        return m;
      }));
      fetchConversations();
    });

    setSocket(s);
    return () => s.disconnect();
  }, [session, fetchConversations]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!currentChat || !socket) return;
    socket.emit("joinConversation", currentChat.id);
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${ENDPOINT}/chat/messages/${currentChat.id}?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : (data.rows || []));
        }
      } catch (err) { console.error("Error fetching messages:", err); }
    };
    fetchMessages();
    return () => { socket.emit("leaveConversation", currentChat.id); setIsTyping(false); };
  }, [currentChat, socket, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing", currentChat.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("stopTyping", currentChat.id), 1500);
  };

  const existingQuotationMsg = messages.find(m => {
    try { return JSON.parse(m.content).type === "quotation"; } catch (e) { return false; }
  });
  const existingQuotationData = existingQuotationMsg ? JSON.parse(existingQuotationMsg.content) : null;
  const canSendOrUpdate = !existingQuotationMsg || existingQuotationData?.status !== 'accepted';

  // ── send message ──────────────────────────────────────────────────────────

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket) return;
    const content = newMessage.trim();
    const tempMsg = {
      id: `temp-${Date.now()}`, content,
      sender_id: session.user.id,
      conversation_id: currentChat.id,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    socket.emit("sendMessage", {
      conversationId: currentChat.id, content,
      userId: session.user.id, receiverId: currentChat.other_user_id
    });
    setNewMessage("");
    socket.emit("stopTyping", currentChat.id);
  };

  // ── send quotation ────────────────────────────────────────────────────────

  const handleSendQuotation = (e) => {
    e.preventDefault();
    if (!quotation.items.length || !quotation.duration || !currentChat || !socket) return;

    const total = calcTotal(quotation.items);
    const content = JSON.stringify({
      type: "quotation",
      items: quotation.items,
      duration: quotation.duration,
      startDate: quotation.startDate,
      amount: total.toFixed(2),
      status: "pending",
    });

    const tempMsg = {
      id: `temp-${Date.now()}`, content,
      sender_id: session.user.id,
      conversation_id: currentChat.id,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    socket.emit("sendMessage", {
      conversationId: currentChat.id, content,
      userId: session.user.id, receiverId: currentChat.other_user_id
    });
    setShowQuotationModal(false);
    setEditingMessageId(null);
    socket.emit("stopTyping", currentChat.id);
  };

  // ── quotation response ────────────────────────────────────────────────────

  const handleQuotationResponse = async (msg, status) => {
    if (!socket || !session?.token || !currentChat) return;
    try {
      const data = JSON.parse(msg.content);
      const updatedContent = JSON.stringify({ ...data, status });

      const res = await fetch(`${ENDPOINT}/chat/quotation/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
        body: JSON.stringify({
          messageId: msg.id,
          status,
          content: updatedContent,
          conversationId: currentChat.id,
          receiverId: currentChat.other_user_id,
          senderId: session.user.id
        })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m =>
          String(m.id) === String(msg.id) ? { ...m, content: updatedContent } : m
        ));
        socket.emit("quotationResponse", {
          messageId: msg.id, status, content: updatedContent,
          conversationId: currentChat.id,
          receiverId: currentChat.other_user_id,
          senderId: session.user.id
        });
      }
    } catch (err) { console.error(err); }
  };

  // ── PDF ───────────────────────────────────────────────────────────────────

  // 2. IMPROVEMENT: Refactored PDF Generation for premium look
 const generateQuotationPDF = async (data, msg) => {
  const isSender = String(msg.sender_id) === String(session.user?.id);
  const providerName = isSender ? session.user.name : currentChat.other_user_name;
  const clientName = isSender ? currentChat.other_user_name : session.user.name;

  // Set the data for the specific quotation being downloaded
  setPdfData({ ...data, id: msg.id, items: normalizeItems(data) });
  setPdfData({ ...data, id: msg.id, items: normalizeItems(data), providerName, clientName });

  // Give React a moment to render the hidden template with the new data
  setTimeout(async () => {
    const element = quotationRef.current;
    if (!element) return;

    // Reveal hidden template for capture
    element.style.display = "block";

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // Ensures print quality
        useCORS: true,
        backgroundColor: "#FCFBF7", 
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FixHub_Quotation_${msg.id}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      element.style.display = "none"; // Hide template again
    }
  }, 100);
};

  // ── render message ────────────────────────────────────────────────────────

  const renderMessageContent = (msg) => {
    try {
      const data = JSON.parse(msg.content);
      if (data.type === "quotation") {
        const isOwn    = String(msg.sender_id) === String(session.user?.id);
        const isClient = session.user?.role === "client";
        const items    = normalizeItems(data);

        return (
          // 3. IMPROVEMENT: Refactored In-Chat Card UI
          <div className={`quotation-card modern-ui ${isOwn ? 'sent' : 'received'} status-${data.status}`} style={{
            background: 'var(--card)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            border: '1px solid var(--border)',
            minWidth: '280px'
          }}>
            <div style={{ background: 'var(--ink)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                <FaFileInvoiceDollar style={{ marginRight: '6px' }} /> QUOTATION
              </span>
              <span className={`status-pill ${data.status}`} style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: data.status === 'accepted' ? 'var(--success)' : (data.status === 'declined' ? 'var(--danger)' : 'var(--accent)'),
                color: '#fff',
                fontWeight: 600
              }}>
                {data.status.toUpperCase()}
              </span>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '12px' }}>
                <div style={{ color: 'var(--ink-light)' }}>
                  <FaCalendarAlt style={{ marginRight: '5px' }} /> {data.startDate}
                </div>
                <div style={{ color: 'var(--ink-light)', textAlign: 'right' }}>
                  <FaClock style={{ marginRight: '5px' }} /> {data.duration}
                </div>
              </div>

              <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '15px' }}>
                {items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span>{it.description} <small style={{ opacity: 0.6 }}>x{it.qty}</small></span>
                    <span style={{ fontWeight: 600 }}>{(it.qty * (it.unitPrice || it.amount)).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '2px solid var(--cream-alt)' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>{parseFloat(data.amount).toFixed(2)} TND</span>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data.status === "pending" && !isOwn && isClient && (
                  <>
                    <button onClick={() => handleQuotationResponse(msg, 'accepted')} className="btn-accept" style={{ flex: 1 }}>
                      <FaCheck /> Accept
                    </button>
                    <button onClick={() => handleQuotationResponse(msg, 'declined')} className="btn-decline" style={{ flex: 1 }}>
                      <FaTimes /> Decline
                    </button>
                  </>
                )}
                
                {(data.status === "accepted" || (data.status === "pending" && isClient)) && (
                  <button onClick={() => generateQuotationPDF(data, msg)} className="btn-download-pdf" style={{ width: '100%', justifyContent: 'center', background: 'var(--ink)', color: '#fff' }}>
                    <FaFilePdf style={{ marginRight: '8px' }} /> Download PDF
                  </button>
                )}

                {data.status === "declined" && isOwn && (
                  <button onClick={() => openModalForEdit(data, msg.id)} className="btn-update-quotation" style={{ width: '100%' }}>
                    <FaEdit /> Resubmit Quotation
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }
    } catch (e) { /* not a quotation */ }
    return msg.content;
  };

  // ── guard ─────────────────────────────────────────────────────────────────

  if (!session) return <div className="chat-container">Please sign in.</div>;

  function getLastMessage(lastMessage) {
    if (!lastMessage) return "No messages yet";
    try {
      const parsed = JSON.parse(lastMessage);
      if (parsed.type === "quotation") {
        const statusEmoji = parsed.status === "accepted" ? "✅" : parsed.status === "declined" ? "❌" : "⏳";
        return `${statusEmoji} Quotation: ${parseFloat(parsed.amount).toFixed(2)} TND`;
      }
      return lastMessage;
    } catch (e) {
      return lastMessage;
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="chat-container db-card" style={{ height: 'calc(100vh - 130px)', display: 'flex', padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <style>{`
        .conversations-list::-webkit-scrollbar,
        .messages-area::-webkit-scrollbar {
          display: none;
        }
        .conversations-list,
        .messages-area {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .btn-accept { background: var(--success); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-decline { background: var(--danger); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-download-pdf { display: flex; align-items: center; border: 1px solid var(--border); padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; margin-top: 5px; }
      `}</style>
      
      {/* Sidebar and rest of the UI stays largely the same but uses the refactored logic */}
      <div className={`chat-sidebar ${currentChat ? "mobile-hidden" : ""}`}>
        <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Messages</h3>
        </div>
        <div className="conversations-list" style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-item ${currentChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setCurrentChat(chat)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 20px', 
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                backgroundColor: currentChat?.id === chat.id ? 'var(--cream-alt)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div className="db-booking-avatar" style={{ width: 44, height: 44, fontSize: 14, flexShrink: 0 }}>
                {chat.other_user_image
                  ? <img src={resolveImage(chat.other_user_image)} alt="" className="db-avatar-img" onError={e => e.target.style.display = 'none'} />
                  : (chat.other_user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                }
              </div>
              <div className="conversation-info">
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{chat.other_user_name}</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getLastMessage(chat.last_message) || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`chat-main ${!currentChat ? "mobile-hidden" : ""}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card)' }}>
        {currentChat ? (
          <>
            <div className="chat-header" style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="mobile-back-btn" onClick={() => setCurrentChat(null)}><FaArrowLeft /></button>
              <div className="db-booking-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                {currentChat.other_user_image
                  ? <img src={resolveImage(currentChat.other_user_image)} alt="" className="db-avatar-img" />
                  : (currentChat.other_user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{currentChat.other_user_name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 500 }}>Online</span>
              </div>
              {session.user.role === "provider" && canSendOrUpdate && (
                <button
                  className="db-cta"
                  style={{ padding: '8px 14px', fontSize: '12.5px' }}
                  onClick={() => existingQuotationMsg
                    ? openModalForEdit(existingQuotationData, existingQuotationMsg.id)
                    : openModalForNew()
                  }
                >
                  <FaFileInvoiceDollar />
                  <span style={{ marginLeft: '6px' }}>{existingQuotationMsg ? "Update Quotation" : "Send Quotation"}</span>
                </button>
              )}
            </div>

            <div className="messages-area" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: "flex", flexDirection: "column", gap: "10px", background: 'var(--cream-alt)' }}>
              {messages.map((msg) => {
                const isQuotation = (() => {
                  try { return JSON.parse(msg.content).type === "quotation"; } catch (e) { return false; }
                })();

                if (isQuotation) {
                  return (
                    <div key={msg.id} className="quotation-msg-wrapper" style={{ alignSelf: String(msg.sender_id) === String(session.user?.id) ? "flex-end" : "flex-start", marginBottom: '15px' }}>
                      {renderMessageContent(msg)}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble ${String(msg.sender_id) === String(session.user?.id) ? "sent" : "received"}`}
                    style={{
                      alignSelf: String(msg.sender_id) === String(session.user?.id) ? "flex-end" : "flex-start",
                      maxWidth: "75%", 
                      wordBreak: "break-word",
                      padding: '10px 14px',
                      borderRadius: String(msg.sender_id) === String(session.user?.id) ? '16px 16px 2px 16px' : '2px 16px 16px 16px',
                      fontSize: '13.5px',
                      backgroundColor: String(msg.sender_id) === String(session.user?.id) ? 'var(--ink)' : '#fff',
                      color: String(msg.sender_id) === String(session.user?.id) ? '#fff' : 'var(--ink)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      border: String(msg.sender_id) === String(session.user?.id) ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {msg.content}
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="message-bubble received typing-indicator" style={{ alignSelf: "flex-start" }}>
                  <span></span><span></span><span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage} style={{ padding: '15px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--card)' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', background: 'var(--card)', color: 'var(--ink)' }}
              />
              <button type="submit" className="db-cta" style={{ borderRadius: '8px', width: '42px', padding: 0, justifyContent: 'center' }}><FaPaperPlane /></button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-light)' }}>
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>

      {/* Quotation modal logic remains the same */}
      {showQuotationModal && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <div className="modal-header">
              <h3 className="db-modal-title">{editingMessageId ? "Update Quotation" : "Create Quotation"}</h3>
              <button className="db-icon-btn" onClick={() => { setShowQuotationModal(false); setEditingMessageId(null); }}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSendQuotation}>
              <div className="db-form-group">
                <label className="db-form-label">Start Date</label>
                <input
                  className="db-form-input"
                  type="date"
                  value={quotation.startDate}
                  onChange={(e) => setQuotation(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Estimated Duration</label>
                <input
                  className="db-form-input"
                  type="text"
                  value={quotation.duration}
                  onChange={(e) => setQuotation(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 2 hours, 3 days..."
                  required
                />
              </div>

              <div className="db-form-group">
                <label className="db-form-label">Line Items</label>
                {quotation.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      className="db-form-input"
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      required
                    />
                    <input
                      className="db-form-input"
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      required
                    />
                    <input
                      className="db-form-input"
                      type="number"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#e24b4a', cursor: 'pointer', padding: 0 }}
                      disabled={quotation.items.length === 1}
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontWeight: 600 }}
                >
                  <FaPlus size={11} /> Add item
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--ink-mid)', fontSize: '14px', fontWeight: 500 }}>Total:</span>
                <span>{calcTotal(quotation.items).toFixed(2)} TND</span>
              </div>

              <div className="db-modal-actions">
                <button type="submit" className="db-cta" style={{ width: '100%', justifyContent: 'center' }}>Send to Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── CANVA PDF TEMPLATE (Hidden from UI) ── */}
      {pdfData && (
  
        <div ref={quotationRef} style={{ display: 'none', width: '800px', padding: '60px', background: '#FCFBF7', position: 'absolute', left: '-9999px', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #161629', paddingBottom: '30px', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '48px', margin: 0, color: '#161629', fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>FIXHUB</h1>
              <p style={{ color: '#D85A30', fontWeight: 700, letterSpacing: '2px', fontSize: '14px', marginTop: '5px' }}>OFFICIAL QUOTATION</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#161629' }}>REF: #QT-{pdfData.id}</p>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '13px', color: '#161629' }}>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#D85A30', fontWeight: 700, textTransform: 'uppercase' }}>From (Provider)</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#161629' }}>{pdfData.providerName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#D85A30', fontWeight: 700, textTransform: 'uppercase' }}>To (Client)</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#161629' }}>{pdfData.clientName}</p>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tr style={{ background: '#161629', color: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
              <th style={{ textAlign: 'left', padding: '12px 15px' }}>DESCRIPTION</th>
              <th style={{ textAlign: 'center', padding: '12px 15px' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '12px 15px' }}>UNIT PRICE</th>
              <th style={{ textAlign: 'right', padding: '12px 15px' }}>TOTAL</th>
            </tr>
            {pdfData.items.map((it, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 15px' }}>{it.description}</td>
                <td style={{ textAlign: 'center', padding: '12px 15px' }}>{it.qty}</td>
                <td style={{ textAlign: 'right', padding: '12px 15px' }}>{parseFloat(it.unitPrice || it.amount).toFixed(2)} TND</td>
                <td style={{ textAlign: 'right', padding: '12px 15px', fontWeight: 600 }}>{(it.qty * (it.unitPrice || it.amount)).toFixed(2)} TND</td>
              </tr>
            ))}
          </table>
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#161629', color: '#fff', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>{parseFloat(pdfData.amount).toFixed(2)} TND</h2>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}