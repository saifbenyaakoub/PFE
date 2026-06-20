import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "../lib/session";
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaFileInvoiceDollar, FaCheck, FaTimes, FaFilePdf, FaEdit, FaClock, FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import io from "socket.io-client"
import html2canvas from "html2canvas"; // Replace autoTable with this;
import "./Chat.css"; // aligned with dashboard.css & home.css design system

// 1. IMPROVEMENT: Use environment variables for API endpoints
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMPTY_ITEM = { description: "", qty: 1, unitPrice: "", tvaRate: "19" }; // TVA 19% standard Tunisia

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
  const [quotation, setQuotation] = useState({
    items: [{ ...EMPTY_ITEM }],
    duration: "",
    startDate: "",
    validUntil: "",
    paymentTerms: "À réception",
    providerMatricule: "",
    providerAddress: "",
  });
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [providerServices, setProviderServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quotationError, setQuotationError] = useState("");

  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat);
  const typingTimeoutRef = useRef(null);
  const quotationRef = useRef(null); // Used to target the hidden Canva template[cite: 11]

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const calcTotal = (items) =>
    items.reduce((sum, it) => sum + (parseFloat(it.unitPrice) || 0) * (parseInt(it.qty) || 1), 0);

  const calcTVA = (items) =>
    items.reduce((sum, it) => {
      const ht = (parseFloat(it.unitPrice) || 0) * (parseInt(it.qty) || 1);
      return sum + ht * ((parseFloat(it.tvaRate) || 0) / 100);
    }, 0);

  const calcTTC = (items) => calcTotal(items) + calcTVA(items);

  const normalizeItems = (data) =>
    (data.items && data.items.length > 0)
      ? data.items
      : [{ description: data.description, qty: 1, unitPrice: data.amount }];

  const openModalForNew = () => {
    setQuotation({
      items: [{ ...EMPTY_ITEM }],
      duration: "",
      startDate: "",
      validUntil: "",
      paymentTerms: "À réception",
      providerMatricule: "",
      providerAddress: "",
    });
    setEditingMessageId(null);
    setSelectedServiceId("");
    setQuotationError("");
    setShowQuotationModal(true);
    fetchProviderServices();
  };

  const openModalForEdit = (data, msgId) => {
    setQuotation({
      items: normalizeItems(data),
      duration: data.duration ?? "",
      startDate: data.startDate ?? "",
      validUntil: data.validUntil ?? "",
      paymentTerms: data.paymentTerms ?? "À réception",
      providerMatricule: data.providerMatricule ?? "",
      providerAddress: data.providerAddress ?? "",
    });
    setEditingMessageId(msgId);
    setSelectedServiceId("");
    setQuotationError("");
    setShowQuotationModal(true);
    fetchProviderServices();
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

  // Fetches the logged-in provider's services to pre-populate quotation items
  const fetchProviderServices = useCallback(async () => {
    if (!session?.user || session.user.role !== "provider") return;
    try {
      const res = await fetch(
        `${ENDPOINT}/chat/provider-services?providerId=${session.user.id}`,
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      if (res.ok) setProviderServices(await res.json());
    } catch (err) {
      console.error("Failed to fetch provider services:", err);
    }
  }, [session]);

  // When the provider picks a service from the dropdown, pre-fill the first
  // quotation line with that service's title and price.
  const handleServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    if (!serviceId) return;
    const svc = providerServices.find(s => String(s.id) === String(serviceId));
    if (!svc) return;
    setQuotation(prev => ({
      ...prev,
      items: [
        { description: svc.title, qty: 1, unitPrice: String(svc.price ?? ""), tvaRate: "19" },
        ...prev.items.slice(1),   // keep any extra lines the provider already added
      ],
    }));
  };

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing", currentChat.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("stopTyping", currentChat.id), 1500);
  };

  // Walk the message list backwards to find the MOST RECENT quotation in
  // this conversation (not the first one — messages.find() would always
  // return the oldest quotation ever sent, which meant that once any past
  // quotation in the chat history was accepted, the "Send Quotation" button
  // disappeared forever, even for a brand new, unrelated job).
  const findLatestQuotation = (msgs) => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(msgs[i].content);
        if (parsed.type === "quotation") return { msg: msgs[i], data: parsed };
      } catch (e) { /* not JSON / not a quotation, keep scanning */ }
    }
    return null;
  };

  const latestQuotation = findLatestQuotation(messages);
  const existingQuotationMsg  = latestQuotation?.msg  ?? null;
  const existingQuotationData = latestQuotation?.data ?? null;

  // A new quotation can be sent/updated unless the latest one is still
  // "pending" (awaiting the client's response). Once it's "accepted" or
  // "declined", the provider is free to send a brand new quotation for
  // another job, while the full chat history (including the old quotation
  // card) stays visible above.
  const canSendOrUpdate = !existingQuotationMsg || existingQuotationData?.status !== 'pending';

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

    if (!selectedServiceId) {
      setQuotationError("Please select a service before sending the quotation.");
      return;
    }
    setQuotationError("");

    const totalHT  = calcTotal(quotation.items);
    const totalTVA = calcTVA(quotation.items);
    const totalTTC = calcTTC(quotation.items);

    const content = JSON.stringify({
      type: "quotation",
      serviceId: selectedServiceId || null,
      items: quotation.items,
      duration: quotation.duration,
      startDate: quotation.startDate,
      validUntil: quotation.validUntil,
      paymentTerms: quotation.paymentTerms,
      providerMatricule: quotation.providerMatricule,
      providerAddress: quotation.providerAddress,
      amountHT:  totalHT.toFixed(2),
      amountTVA: totalTVA.toFixed(2),
      amount:    totalTTC.toFixed(2), // TTC — kept as "amount" for backward compat
      status: "pending",
    });

    // Always sent as a brand new message — even when re-opening the modal
    // via "Update Quotation" on an already-resolved (accepted/declined)
    // quotation, this creates a fresh quotation card rather than mutating
    // the old one, so chat history keeps every quotation ever sent.
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
    element.style.display = "flex";

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
          <div className={`quotation-card ${isOwn ? 'sent' : 'received'} status-${data.status}`}>
            <div className="quotation-card-header">
              <span className="quotation-card-label">
                <FaFileInvoiceDollar /> QUOTATION
              </span>
              <span className={`status-pill ${data.status}`}>
                {data.status.toUpperCase()}
              </span>
            </div>

            <div className="quotation-card-body">
              <div className="quotation-meta-row">
                <div className="quotation-meta-item">
                  <FaCalendarAlt /> {data.startDate}
                </div>
                <div className="quotation-meta-item">
                  <FaClock /> {data.duration}
                </div>
              </div>

              <div className="quotation-items-list">
                {items.map((it, i) => (
                  <div key={i} className="quotation-line-item">
                    <span>{it.description} <small>x{it.qty}</small></span>
                    <span className="quotation-line-price">{(it.qty * (it.unitPrice || it.amount)).toFixed(2)} TND</span>
                  </div>
                ))}
              </div>

              <div className="quotation-total-row">
                <span className="quotation-total-label">Total</span>
                <span className="quotation-total-amount">{parseFloat(data.amount).toFixed(2)} TND</span>
              </div>

              <div className="quotation-actions">
                {data.status === "pending" && !isOwn && isClient && (
                  <>
                    <button onClick={() => handleQuotationResponse(msg, 'accepted')} className="btn-accept">
                      <FaCheck /> Accept
                    </button>
                    <button onClick={() => handleQuotationResponse(msg, 'declined')} className="btn-decline">
                      <FaTimes /> Decline
                    </button>
                  </>
                )}

                {(data.status === "accepted" || (data.status === "pending" && isClient)) && (
                  <button onClick={() => generateQuotationPDF(data, msg)} className="btn-download-pdf">
                    <FaFilePdf /> Download PDF
                  </button>
                )}

                {data.status === "declined" && isOwn && (
                  <button onClick={() => openModalForEdit(data, msg.id)} className="btn-update-quotation">
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
    <div className="chat-container">
      
      {/* Sidebar */}
      <div className={`chat-sidebar ${currentChat ? "mobile-hidden" : ""}`}>
        <div className="sidebar-header">
          <h3>Messages</h3>
        </div>
        <div className="conversations-list">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-item ${currentChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setCurrentChat(chat)}
            >
              <div className="db-booking-avatar" style={{ width: 44, height: 44 }}>
                {chat.other_user_image
                  ? <img src={resolveImage(chat.other_user_image)} alt="" className="db-avatar-img" onError={e => e.target.style.display = 'none'} />
                  : (chat.other_user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                }
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
              <div className="db-booking-avatar" style={{ width: 36, height: 36 }}>
                {currentChat.other_user_image
                  ? <img src={resolveImage(currentChat.other_user_image)} alt="" className="db-avatar-img" />
                  : (currentChat.other_user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <h4>{currentChat.other_user_name}</h4>
                <span className="online-status">Online</span>
              </div>
              {session.user.role === "provider" && canSendOrUpdate && (
                <button
                  className="db-cta"
                  onClick={() => openModalForNew()}
                >
                  <FaFileInvoiceDollar />
                  <span style={{ marginLeft: '6px' }}>Send Quotation</span>
                </button>
              )}
            </div>

            <div className="messages-area">
              {messages.map((msg) => {
                const isQuotation = (() => {
                  try { return JSON.parse(msg.content).type === "quotation"; } catch (e) { return false; }
                })();
                const isSent = String(msg.sender_id) === String(session.user?.id);

                if (isQuotation) {
                  return (
                    <div key={msg.id} className="quotation-msg-wrapper" style={{ alignSelf: isSent ? "flex-end" : "flex-start" }}>
                      {renderMessageContent(msg)}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble ${isSent ? "sent" : "received"}`}
                  >
                    {msg.content}
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}

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
              <button type="submit" className="db-cta"><FaPaperPlane /></button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
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

              {/* ── Service selector (providers only) — required, since a
                   quotation must be linked to a service for a booking to
                   be created when the client accepts it. ── */}
              <div className="db-form-group" style={{ marginBottom: '16px' }}>
                <label className="db-form-label">
                  Service <span style={{ color: 'var(--danger, #d33)' }}>*</span>
                </label>
                {providerServices.length > 0 ? (
                  <select
                    className="db-form-input"
                    value={selectedServiceId}
                    onChange={(e) => { handleServiceSelect(e.target.value); setQuotationError(""); }}
                    required
                  >
                    <option value="">— Select a service —</option>
                    {providerServices.map(svc => (
                      <option key={svc.id} value={svc.id}>
                        {svc.title}{svc.price != null ? ` — ${parseFloat(svc.price).toFixed(3)} TND` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--danger, #d33)', margin: 0 }}>
                    You have no services yet. Add a service in your dashboard before sending a quotation.
                  </p>
                )}
                <small style={{ color: 'var(--color-text-muted, #888)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Selecting a service fills in the first line item and links this quotation to it. You can still edit all fields freely.
                </small>
                {quotationError && (
                  <p style={{ fontSize: '12px', color: 'var(--danger, #d33)', marginTop: '6px' }}>
                    {quotationError}
                  </p>
                )}
              </div>

              {/* Provider fiscal info */}
              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Matricule Fiscal</label>
                  <input
                    className="db-form-input"
                    type="text"
                    value={quotation.providerMatricule}
                    onChange={(e) => setQuotation(prev => ({ ...prev, providerMatricule: e.target.value }))}
                    placeholder="ex: 1234567A/M/000"
                  />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Adresse du prestataire</label>
                  <input
                    className="db-form-input"
                    type="text"
                    value={quotation.providerAddress}
                    onChange={(e) => setQuotation(prev => ({ ...prev, providerAddress: e.target.value }))}
                    placeholder="Ville, Gouvernorat"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Date de début</label>
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
                  <label className="db-form-label">Valable jusqu'au</label>
                  <input
                    className="db-form-input"
                    type="date"
                    value={quotation.validUntil}
                    onChange={(e) => setQuotation(prev => ({ ...prev, validUntil: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Duration + Payment */}
              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Durée estimée</label>
                  <input
                    className="db-form-input"
                    type="text"
                    value={quotation.duration}
                    onChange={(e) => setQuotation(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="ex: 2 heures, 3 jours..."
                    required
                  />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Conditions de paiement</label>
                  <select
                    className="db-form-input"
                    value={quotation.paymentTerms}
                    onChange={(e) => setQuotation(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  >
                    <option>À réception</option>
                    <option>30% à la commande, solde à la livraison</option>
                    <option>50% à la commande, 50% à la livraison</option>
                    <option>Paiement intégral à l'avance</option>
                    <option>30 jours date de facture</option>
                  </select>
                </div>
              </div>

              {/* Line items with TVA per row */}
              <div className="db-form-group">
                <label className="db-form-label">Lignes de prestation</label>
                {quotation.items.map((item, idx) => (
                  <div key={idx} className="quotation-item-row">
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
                      placeholder="Qté"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      required
                    />
                    <input
                      className="db-form-input"
                      type="number"
                      placeholder="P.U. HT"
                      min="0"
                      step="0.001"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      required
                    />
                    <select
                      className="db-form-input"
                      value={item.tvaRate ?? "19"}
                      onChange={(e) => updateItem(idx, 'tvaRate', e.target.value)}
                    >
                      <option value="0">0%</option>
                      <option value="7">7%</option>
                      <option value="13">13%</option>
                      <option value="19">19%</option>
                    </select>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeItem(idx)}
                      disabled={quotation.items.length === 1}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={addItem}>
                  <FaPlus size={11} /> Ajouter une ligne
                </button>
              </div>

              {/* HT / TVA / TTC */}
              <div className="modal-totals-block">
                <div className="modal-totals-row">
                  <span>Total HT</span>
                  <span>{calcTotal(quotation.items).toFixed(3)} TND</span>
                </div>
                <div className="modal-totals-row">
                  <span>TVA</span>
                  <span>{calcTVA(quotation.items).toFixed(3)} TND</span>
                </div>
                <div className="modal-totals-row modal-totals-ttc">
                  <span>Total TTC</span>
                  <span>{calcTTC(quotation.items).toFixed(3)} TND</span>
                </div>
              </div>

              <div className="db-modal-actions">
                <button
                  type="submit"
                  className="db-cta"
                  style={{ width: '100%', justifyContent: 'center', opacity: !selectedServiceId ? 0.5 : 1 }}
                  disabled={!selectedServiceId}
                  title={!selectedServiceId ? "Select a service first" : undefined}
                >
                  Envoyer au client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PDF TEMPLATE (hidden, captured by html2canvas) ── */}
      {pdfData && (
        <div ref={quotationRef} style={{
          display: 'none', width: '794px', height: '1123px', padding: '0',
          background: '#fff', position: 'absolute', left: '-9999px',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", color: '#111110',
          flexDirection: 'column', justifyContent: 'space-between'
        }}>

          {/* ══ HEADER BAND ══ */}
          <div style={{ background: '#111110', padding: '32px 52px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

              {/* Left — provider identity */}
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  {pdfData.providerName}
                </div>
                {pdfData.providerAddress && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                    {pdfData.providerAddress}
                  </div>
                )}
                {pdfData.providerMatricule && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    Matricule Fiscal : <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{pdfData.providerMatricule}</span>
                  </div>
                )}
              </div>

              {/* Right — doc identity */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Devis de Prestation
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                  #QT-{pdfData.id}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  Émis le {new Date().toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

            </div>
          </div>

          {/* ══ BODY ══ */}
          <div style={{ padding: '36px 52px', flex: 1 }}>

            {/* ── Client row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1.5px solid #E8E8E4' }}>
              <div style={{ width: '3px', height: '40px', background: '#111110', borderRadius: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#88887E', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Adressé à
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#111110' }}>{pdfData.clientName}</div>
              </div>
            </div>

            {/* ── Items table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '2px' }}>
              <thead>
                <tr style={{ background: '#111110', color: '#fff' }}>
                  <th style={{ textAlign: 'left',   padding: '10px 14px', fontWeight: 700, letterSpacing: '0.4px' }}>DÉSIGNATION</th>
                  <th style={{ textAlign: 'center', padding: '10px 10px', fontWeight: 700 }}>QTÉ</th>
                  <th style={{ textAlign: 'right',  padding: '10px 10px', fontWeight: 700, whiteSpace: 'nowrap' }}>P.U. HT</th>
                  <th style={{ textAlign: 'right',  padding: '10px 10px', fontWeight: 700 }}>TVA</th>
                  <th style={{ textAlign: 'right',  padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>TOTAL TTC</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.items.map((it, i) => {
                  const pu  = parseFloat(it.unitPrice || it.amount) || 0;
                  const qty = parseInt(it.qty) || 1;
                  const rate = parseFloat(it.tvaRate || 0);
                  const ht  = pu * qty;
                  const tva = ht * rate / 100;
                  const ttc = ht + tva;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F7F7F4', borderBottom: '1px solid #EBEBЕ7' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 500, color: '#111110' }}>{it.description}</td>
                      <td style={{ textAlign: 'center', padding: '11px 10px', color: '#444440' }}>{qty}</td>
                      <td style={{ textAlign: 'right',  padding: '11px 10px', color: '#444440' }}>{pu.toFixed(3)} TND</td>
                      <td style={{ textAlign: 'right',  padding: '11px 10px', color: '#88887E' }}>{rate}%</td>
                      <td style={{ textAlign: 'right',  padding: '11px 14px', fontWeight: 700, color: '#111110' }}>{ttc.toFixed(3)} TND</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Totals ── */}
            {(() => {
              const totalHT  = pdfData.items.reduce((s, it) => s + (parseFloat(it.unitPrice || it.amount)||0) * (parseInt(it.qty)||1), 0);
              const totalTVA = pdfData.items.reduce((s, it) => {
                const ht = (parseFloat(it.unitPrice || it.amount)||0) * (parseInt(it.qty)||1);
                return s + ht * (parseFloat(it.tvaRate||0) / 100);
              }, 0);
              const totalTTC = totalHT + totalTVA;
              return (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                  <div style={{ width: '280px', border: '1.5px solid #E8E8E4', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #E8E8E4', fontSize: '12px' }}>
                      <span style={{ color: '#88887E' }}>Total HT</span>
                      <span style={{ fontWeight: 600, color: '#111110' }}>{totalHT.toFixed(3)} TND</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #E8E8E4', fontSize: '12px' }}>
                      <span style={{ color: '#88887E' }}>TVA</span>
                      <span style={{ fontWeight: 600, color: '#111110' }}>{totalTVA.toFixed(3)} TND</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#111110' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>Total TTC</span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{totalTTC.toFixed(3)} TND</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Conditions row ── */}
            {(pdfData.paymentTerms || pdfData.validUntil) && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                {pdfData.paymentTerms && (
                  <div style={{ flex: 1, background: '#F7F7F4', borderRadius: '8px', padding: '12px 16px', borderLeft: '3px solid #C8C8C0' }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#88887E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Conditions de paiement</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#111110' }}>{pdfData.paymentTerms}</div>
                  </div>
                )}
                {pdfData.validUntil && (
                  <div style={{ flex: 1, background: '#F7F7F4', borderRadius: '8px', padding: '12px 16px', borderLeft: '3px solid #C8C8C0' }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#88887E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Devis valable jusqu'au</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#111110' }}>
                      {new Date(pdfData.validUntil).toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Signature block ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ border: '1.5px solid #E8E8E4', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#88887E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '44px' }}>
                  Signature du Prestataire
                </div>
                <div style={{ borderTop: '1px solid #E8E8E4', paddingTop: '8px', fontSize: '11px', color: '#88887E' }}>
                  {pdfData.providerName}
                </div>
              </div>
              <div style={{ border: '1.5px solid #E8E8E4', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#88887E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Bon pour Accord
                </div>
                <div style={{ fontSize: '10px', color: '#ADADAA', marginBottom: '28px' }}>
                  Mention manuscrite « Lu et approuvé »
                </div>
                <div style={{ borderTop: '1px solid #E8E8E4', paddingTop: '8px', fontSize: '11px', color: '#88887E' }}>
                  {pdfData.clientName} — Date : ____________
                </div>
              </div>
            </div>

          </div>

          {/* ══ FOOTER ══ */}
          <div style={{ borderTop: '1.5px solid #E8E8E4', padding: '14px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#ADADAA' }}>
            <span style={{ fontWeight: 700, color: '#111110' }}>{pdfData.providerName}</span>
            <span>Devis N° #QT-{pdfData.id} · {new Date().toLocaleDateString('fr-TN')}</span>
            <span style={{ color: '#ADADAA' }}>Tunisie</span>
          </div>

        </div>
      )}
    </div>
    
  );
}