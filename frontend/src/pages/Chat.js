import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaFileInvoiceDollar, FaCheck, FaTimes, FaFilePdf, FaEdit } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotation, setQuotation] = useState({ description: "", amount: "" });
  const [editingMessageId, setEditingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`${ENDPOINT}/chat/conversations?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        // Ensure we always have an array
        setConversations(Array.isArray(data) ? data : (data.rows || []));
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    const s = io(ENDPOINT);

    s.on("receiveMessage", (message) => {
      const chatId = currentChatRef.current?.id;
      if (chatId && message.conversation_id === chatId) {
        setMessages((prev) => {
          // Try to find if this message replaces a temporary one we sent
          const tempIndex = prev.findIndex(m => 
            String(m.id).startsWith('temp-') && 
            m.content === message.content && 
            String(m.sender_id) === String(message.sender_id)
          );

          if (tempIndex !== -1) {
            const newList = [...prev];
            newList[tempIndex] = message; // Replace temp with real DB message (with real ID)
            return newList;
          }

          // Check if message already exists (edit/update case)
          const existingIndex = prev.findIndex(m => String(m.id) === String(message.id));
          if (existingIndex !== -1) {
            const newList = [...prev];
            newList[existingIndex] = message;
            return newList;
          }

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

    s.on("quotationUpdated", ({ messageId, status, content }) => {
      setMessages(prev => prev.map(m => {
        if (String(m.id) === String(messageId)) {
          try {
            let parsed = JSON.parse(m.content);
            if (content) parsed = JSON.parse(content);
            if (status) parsed.status = status;
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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
    return () => {
      socket.emit("leaveConversation", currentChat.id);
      setIsTyping(false);
    };
  }, [currentChat, socket, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing", currentChat.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", currentChat.id);
    }, 1500);
  };

  // Logic to find if a quotation exists and its current status
  const existingQuotationMsg = messages.find(m => {
    try {
      const data = JSON.parse(m.content);
      return data.type === "quotation";
    } catch (e) { return false; }
  });

  const existingQuotationData = existingQuotationMsg ? JSON.parse(existingQuotationMsg.content) : null;
  const canSendOrUpdate = !existingQuotationMsg || existingQuotationData?.status !== 'accepted';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket) return;

    const content = newMessage.trim();

    // ✅ Optimistic Update
    const tempMsg = {
      id: `temp-${Date.now()}`, 
      content,
      sender_id: session.user.id,
      conversation_id: currentChat.id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("sendMessage", {
      conversationId: currentChat.id,
      content,
      userId: session.user.id,
    });

    setNewMessage("");
    socket.emit("stopTyping", currentChat.id);
  };

  const handleSendQuotation = (e) => {
    e.preventDefault();
    if (!quotation.description || !quotation.amount || !currentChat || !socket) return;

    const content = JSON.stringify({
      type: "quotation",
      description: quotation.description,
      amount: quotation.amount,
      status: "pending"
    });

    if (editingMessageId) {
      // Optimistic update for edit
      setMessages(prev => prev.map(m => 
        String(m.id) === String(editingMessageId) ? { ...m, content } : m
      ));

      socket.emit("updateQuotation", {
        messageId: editingMessageId,
        content,
        conversationId: currentChat.id
      });
      setEditingMessageId(null);
    } else {
      // Optimistic update for the provider (new)
      const tempMsg = {
        id: `temp-${Date.now()}`,
        content,
        sender_id: session.user.id,
        conversation_id: currentChat.id,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      socket.emit("sendMessage", {
        conversationId: currentChat.id,
        content,
        userId: session.user.id,
      });
    }

    setQuotation({ description: "", amount: "" });
    setShowQuotationModal(false);
  };

  const handleQuotationResponse = (messageId, status) => {
    // Optimistic local update for immediate feedback
    setMessages(prev => prev.map(m => {
      if (String(m.id) === String(messageId)) {
        try {
          const content = JSON.parse(m.content);
          content.status = status;
          return { ...m, content: JSON.stringify(content) };
        } catch (e) { return m; }
      }
      return m;
    }));

    socket.emit("respondToQuotation", {
      messageId,
      status,
      conversationId: currentChat.id
    });
  };

  const generateInvoicePDF = (data, msg) => {
    const doc = new jsPDF();
    const dateStr = new Date(msg.created_at).toLocaleDateString();

    // Brand Header
    doc.setFillColor(15, 23, 42); // Dark slate #0f172a
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    
    // 1. Add the Logo Image (x, y, width, height)
    // doc.addImage(LOGO_BASE64, 'PNG', 20, 10, 15, 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("FixHub", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Facture", 20, 32);

    // Invoice Details (Top Right)
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FACTURE", 190, 60, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Facture id: ${msg.id}`, 190, 68, { align: "right" });
    doc.text(`Date: ${dateStr}`, 190, 74, { align: "right" });

    // Bill Parties
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("BILL FROM", 20, 60);
    doc.setFont("helvetica", "normal");
    const providerName = session.user?.role === 'provider' ? session.user.name : currentChat?.other_user_name;
    doc.text(providerName || "Service Provider", 20, 66);

    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 20, 80);
    doc.setFont("helvetica", "normal");
    const clientName = session.user?.role === 'client' ? session.user.name : currentChat?.other_user_name;
    doc.text(clientName || "Valued Client", 20, 86);

    // Table
    autoTable(doc, {
      startY: 95,
      head: [['Service Description', 'Total Amount']],
      body: [[data.description, `${data.amount} TND`]],
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });

    const finalY = doc.lastAutoTable.finalY;

    // Summary & Signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total Paid: ${data.amount} TND`, 190, finalY + 20, { align: "right" });

    const sigY = finalY + 50;
    doc.setDrawColor(203, 213, 225);
    doc.line(130, sigY, 190, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Signature de Prestateur de Service", 120, sigY + 7, { align: "center" });
    doc.text("Signature de Client", 160, sigY + 7, { align: "center" });
    // Bottom Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by FixHub - Thank you for your business!", 105, 285, { align: "center" });

    doc.save(`FixHub_Invoice_${msg.id}.pdf`);
  };

  const renderMessageContent = (msg) => {
    try {
      const data = JSON.parse(msg.content);
      if (data.type === "quotation") {
        // Use String() to prevent type mismatch (string vs number)
        const isOwn = String(msg.sender_id) === String(session.user?.id);
        const isClient = session.user?.role === "client";

        return (
          <div className={`quotation-card status-${data.status}`}>
            <div className="quotation-badge">QUOTATION</div>
            <p>{data.description}</p>
            <div className="quotation-amount">{data.amount} TND</div>
            
            {/* Show actions only if received by a client and still pending */}
            {data.status === "pending" && !isOwn && isClient && (
              <div className="quotation-actions">
                <button 
                  onClick={() => handleQuotationResponse(msg.id, 'accepted')} 
                  className="btn-accept"
                >
                  <FaCheck /> Accept
                </button>
                <button 
                  onClick={() => handleQuotationResponse(msg.id, 'declined')} 
                  className="btn-decline"
                >
                  <FaTimes /> Decline
                </button>
              </div>
            )}
            {data.status !== "pending" && <div className="quotation-status-label">{data.status.toUpperCase()}</div>}

            {/* Provider can update a declined quotation */}
            {data.status === "declined" && isOwn && (
              <button 
                onClick={() => {
                  setQuotation({ description: data.description, amount: data.amount });
                  setEditingMessageId(msg.id);
                  setShowQuotationModal(true);
                }} 
                className="btn-update-quotation"
              >
                <FaEdit /> Update Quotation
              </button>
            )}

            {data.status === "accepted" && (
              <button onClick={() => generateInvoicePDF(data, msg)} className="btn-download-pdf">
                <FaFilePdf /> Download Invoice
              </button>
            )}
          </div>
        );
      }
    } catch (e) { /* Not a quotation */ }
    return msg.content;
  };

  if (!session) return <div className="chat-container">Please sign in.</div>;

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${currentChat ? "mobile-hidden" : ""}`}>
        <div className="sidebar-header"><h3>Messages</h3></div>
        <div className="conversations-list">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-item ${currentChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setCurrentChat(chat)}
            >
              <div className="avatar-placeholder">
                {chat.other_user_image ? <img src={`${ENDPOINT}${chat.other_user_image}`} alt="" /> : <FaUserCircle />}
              </div>
              <div className="conversation-info">
                <h4>{chat.other_user_name}</h4>
                <p>{chat.last_message || "No messages yet"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`chat-main ${!currentChat ? "mobile-hidden" : ""}`}>
        {currentChat ? (
          <>
            <div className="chat-header">
              <button className="mobile-back-btn" onClick={() => setCurrentChat(null)}><FaArrowLeft /></button>
              <h4>{currentChat.other_user_name}</h4>
              {session.user.role === "provider" && canSendOrUpdate && (
                <button 
                  className="create-quotation-btn" 
                  onClick={() => { 
                    if (existingQuotationMsg) {
                      setQuotation({ description: existingQuotationData.description, amount: existingQuotationData.amount });
                      setEditingMessageId(existingQuotationMsg.id);
                    } else {
                      setEditingMessageId(null);
                    }
                    setShowQuotationModal(true); 
                  }}>
                  <FaFileInvoiceDollar /> <span>{existingQuotationMsg ? "Update Quotation" : "Send Quotation"}</span>
                </button>
              )}
            </div>
            <div className="messages-area">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${String(msg.sender_id) === String(session.user?.id) ? "sent" : "received"}`}
                >
                  {renderMessageContent(msg)}
                </div>
              ))}
              {isTyping && (
                <div className="message-bubble received typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              />
              <button type="submit"><FaPaperPlane /></button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected"><h3>Select a conversation</h3></div>
        )}
      </div>

      {showQuotationModal && (
        <div className="modal-overlay">
          <div className="quotation-modal">
            <div className="modal-header">
              <h3>{editingMessageId ? "Update Quotation" : "Create Quotation"}</h3>
              <button className="close-btn" onClick={() => { setShowQuotationModal(false); setEditingMessageId(null); }}><FaTimes /></button>
            </div>
            <form onSubmit={handleSendQuotation}>
              <div className="form-group">
                <label>Description of Work</label>
                <textarea 
                  value={quotation.description} 
                  onChange={(e) => setQuotation({...quotation, description: e.target.value})}
                  placeholder="Outline the services included..." required />
              </div>
              <div className="form-group">
                <label>Total Amount (TND)</label>
                <input type="number" value={quotation.amount} 
                  onChange={(e) => setQuotation({...quotation, amount: e.target.value})}
                  placeholder="0.00" required />
              </div>
              <button type="submit" className="submit-quotation-btn">Send to Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}