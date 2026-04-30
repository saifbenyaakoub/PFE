import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaFileInvoiceDollar, FaCheck, FaTimes, FaFilePdf, FaEdit, FaClock, FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import io from "socket.io-client";
import "./Chat.css";

const ENDPOINT = "http://localhost:5000";
const EMPTY_ITEM = { description: "", qty: 1, unitPrice: "" };

export default function Chat() {
  const [session] = useState(() => getSession());
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotation, setQuotation] = useState({ items: [{ ...EMPTY_ITEM }], duration: "", startDate: "" });
  const [editingMessageId, setEditingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);
  const typingTimeoutRef = useRef(null);

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

  const generateQuotationPDF = (data, msg) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const title = "Devis";
  const accentR = 9, accentG = 104, accentB = 72; 

  const isOwn = String(msg.sender_id) === String(session.user?.id);
  const senderName = isOwn ? (session.user?.name || "Provider") : (currentChat?.other_user_name || "Provider");
  const receiverName = isOwn ? (currentChat?.other_user_name || "Client") : (session.user?.name || "Client");

  // ── HEADER BACKGROUND BLOCK ──────────────────────────────────────────────
  doc.setFillColor(15, 15, 25);
  doc.rect(0, 0, pageWidth, 52, "F");

  // Subtle accent bar on the left edge
  doc.setFillColor(accentR, accentG, accentB);
  doc.rect(0, 0, 4, 52, "F");

  // ── LOGO / BRAND ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("FixHub", 14, 22);


  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 185);
  doc.text("Tunis, Tunisia", 14, 30);
  doc.text("contact@fixhub.com  ·  +216 92 992 297", 14, 35);

  // ── TITLE BLOCK (right side) ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth - 14, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(160, 160, 185);
  const docNum = `N°${String(msg.id).padStart(5, "0")}`;
  doc.text(docNum, pageWidth - 14, 30, { align: "right" });
  doc.text(
    `Délivré : ${new Date(msg.created_at).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    })}`,
    pageWidth - 14, 35, { align: "right" }
  );

  // ── META STRIP ────────────────────────────────────────────────────────────
  const stripY = 52;
  doc.setFillColor(240, 241, 255);
  doc.rect(0, stripY, pageWidth, 22, "F");

  const metaItems = [
    ["De",       senderName],
    ["Vers",         receiverName],
    ["START DATE", data.startDate],
    ["DURATION",   data.duration],
  ];

  metaItems.forEach(([label, value], i) => {
    const x = 14 + i * 46;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(accentR, accentG, accentB);
    doc.text(label, x, stripY + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 40);
    doc.text(String(value), x, stripY + 15);
    doc.text(String(value || "—"), x, stripY + 15, { maxWidth: 42 });
  });

  // ── ITEMS TABLE ───────────────────────────────────────────────────────────
  const items = normalizeItems(data);

  autoTable(doc, {
    startY: 82,
    head: [["DESCRIPTION", "QTY", "UNIT PRICE (TND)", "SUBTOTAL (TND)"]],
    body: items.map((it) => [
      it.description,
      parseInt(it.qty) || 1,
      (parseFloat(it.unitPrice ?? it.amount) || 0).toFixed(2),
      ((parseInt(it.qty) || 1) * (parseFloat(it.unitPrice ?? it.amount) || 0)).toFixed(2),
    ]),
    theme: "plain",
    headStyles: {
      fillColor: [15, 15, 25],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "right",
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    bodyStyles: {
      textColor: [40, 40, 60],
      fontSize: 9,
      cellPadding: { top: 4.5, bottom: 4.5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { halign: "left",  cellWidth: "auto" },
      1: { halign: "right", cellWidth: 18 },
      2: { halign: "right", cellWidth: 38 },
      3: { halign: "right", cellWidth: 38, fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [246, 246, 252] },
    // Thin accent top-border under header
    didDrawPage: (hookData) => {
      const { table } = hookData;
      const headerBottom = table.head[0]?.cells[0]?.y + table.head[0]?.cells[0]?.height;
      if (headerBottom) {
        doc.setDrawColor(accentR, accentG, accentB);
        doc.setLineWidth(0.6);
        doc.line(14, headerBottom, pageWidth - 14, headerBottom);
      }
    },
  });

  // ── TOTAL BLOCK ───────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY || 80;

  // Thin rule above total
  doc.setDrawColor(220, 220, 235);
  doc.setLineWidth(0.3);
  doc.line(14, finalY + 6, pageWidth - 14, finalY + 6);

  // Total pill
  const totalText = `${parseFloat(data.amount).toFixed(2)} TND`;
  const pillW = 64, pillH = 14, pillX = pageWidth - 14 - pillW;
  const pillY = finalY + 10;

  doc.setFillColor(accentR, accentG, accentB);
  doc.roundedRect(pillX, pillY, pillW, pillH, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 255);
  doc.text("TOTAL DUE", pillX + pillW / 2, pillY + 5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(totalText, pillX + pillW / 2, pillY + 11.5, { align: "center" });

  // ── SIGNATURE BLOCK ───────────────────────────────────────────────────────
  const sigY = pageHeight - 45;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(14, sigY, 74, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 140);
  doc.text("CLIENT SIGNATURE", 14, sigY + 5);

  // ── FOOTER ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 15, 25);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");

  doc.setFillColor(accentR, accentG, accentB);
  doc.rect(0, pageHeight - 20, 4, 20, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(160, 160, 185);
  doc.text(
    "",
    pageWidth / 2,
    pageHeight - 9,
    { align: "center" }
  );

  doc.save(`quotation-${msg.id}.pdf`);
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
          <div className={`quotation-card ${isOwn ? 'sent' : 'received'} status-${data.status}`}>
            <div className="quotation-card-inner">

              <div className="quotation-header-row">
                <div className="quotation-badge">
                  <FaFileInvoiceDollar size={9} /> Quotation
                </div>
                {data.status !== "pending" && (
                  <div className="quotation-status-label">
                    {data.status === "accepted" ? <FaCheck size={8} /> : <FaTimes size={8} />}
                    {data.status.toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                <FaCalendarAlt size={12} />
                <span><strong>Start Date:</strong> {data.startDate}</span>
              </div>
              <div className="quotation-duration" style={{ marginBottom: '10px' }}>
                <FaClock size={12} />
                <span><strong>Duration:</strong> {data.duration}</span>
              </div>

              {/* Items table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '4px 6px', fontWeight: 500, color: '#64748b' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 500, color: '#64748b' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 500, color: '#64748b' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const qty      = parseInt(it.qty) || 1;
                    const price    = parseFloat(it.unitPrice ?? it.amount) || 0;
                    const subtotal = (qty * price).toFixed(2);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 6px' }}>{it.description}</td>
                        <td style={{ textAlign: 'right', padding: '5px 6px', color: '#64748b' }}>{qty}</td>
                        <td style={{ textAlign: 'right', padding: '5px 6px' }}>{subtotal} TND</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="quotation-divider" />
              <div className="quotation-amount-row">
                <span className="quotation-amount-label">Total</span>
                <span className="quotation-amount">{parseFloat(data.amount).toFixed(2)}</span>
                <span className="quotation-currency">TND</span>
              </div>

              {data.status === "pending" && !isOwn && isClient && (
                <div className="quotation-actions">
                  <button onClick={() => handleQuotationResponse(msg, 'accepted')} className="btn-accept">
                    <FaCheck size={11} /> Accept
                  </button>
                  <button onClick={() => handleQuotationResponse(msg, 'declined')} className="btn-decline">
                    <FaTimes size={11} /> Decline
                  </button>
                </div>
              )}

              {data.status === "declined" && isOwn && (
                <button onClick={() => openModalForEdit(data, msg.id)} className="btn-update-quotation">
                  <FaEdit size={11} /> Update Quotation
                </button>
              )}

              {(data.status === "accepted" || (data.status === "pending" && isClient)) && (
                <button onClick={() => generateQuotationPDF(data, msg)} className="btn-download-pdf">
                  <FaFilePdf size={12} />
                  {data.status === "accepted" ? "Download Quotation" : "View Quotation"}
                </button>
              )}
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
      const count = parsed.items?.length ?? 1;
      return `${statusEmoji} Quotation: ${count} item(s) — ${parseFloat(parsed.amount).toFixed(2)} TND`;
    }
    return lastMessage;
  } catch (e) {
    return lastMessage;
  }
}

  // ── render ────────────────────────────────────────────────────────────────

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
                {chat.other_user_image
                  ? <img src={`${ENDPOINT}${chat.other_user_image}`} alt="" />
                  : <FaUserCircle />}
              </div>
              <div className="conversation-info">
                <h4>{chat.other_user_name}</h4>
                <p>{getLastMessage(chat.last_message) || "No messages yet"}</p>
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
                  onClick={() => existingQuotationMsg
                    ? openModalForEdit(existingQuotationData, existingQuotationMsg.id)
                    : openModalForNew()
                  }
                >
                  <FaFileInvoiceDollar />
                  <span>{existingQuotationMsg ? "Update Quotation" : "Send Quotation"}</span>
                </button>
              )}
            </div>

            <div className="messages-area" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((msg) => {
                const isQuotation = (() => {
                  try { return JSON.parse(msg.content).type === "quotation"; } catch (e) { return false; }
                })();

                if (isQuotation) {
                  return (
                    <div key={msg.id} className="quotation-msg-wrapper">
                      {renderMessageContent(msg)}
                      <span className="quotation-msg-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble ${String(msg.sender_id) === String(session.user?.id) ? "sent" : "received"}`}
                    style={{
                      alignSelf: String(msg.sender_id) === String(session.user?.id) ? "flex-end" : "flex-start",
                      maxWidth: "75%", wordBreak: "break-word"
                    }}
                  >
                    {renderMessageContent(msg)}
                    <div className="message-time">
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

      {/* Quotation modal */}
      {showQuotationModal && (
        <div className="modal-overlay">
          <div className="quotation-modal">
            <div className="modal-header">
              <h3>{editingMessageId ? "Update Quotation" : "Create Quotation"}</h3>
              <button className="close-btn" onClick={() => { setShowQuotationModal(false); setEditingMessageId(null); }}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSendQuotation}>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={quotation.startDate}
                  onChange={(e) => setQuotation(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estimated Duration</label>
                <input
                  type="text"
                  value={quotation.duration}
                  onChange={(e) => setQuotation(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 2 hours, 3 days..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Line Items</label>
                {quotation.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      required
                    />
                    <input
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
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                >
                  <FaPlus size={11} /> Add item
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
                <span style={{ color: '#64748b' }}>Total:</span>
                <span>{calcTotal(quotation.items).toFixed(2)} TND</span>
              </div>

              <button type="submit" className="submit-quotation-btn">Send to Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}