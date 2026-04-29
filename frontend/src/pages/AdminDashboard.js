import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, clearSession } from "../lib/session";
import { FaTrash, FaBriefcase, FaTasks, FaSignOutAlt, FaSearch, FaUsers, FaFlag, FaEye, FaTimes } from "react-icons/fa";
import { FaScrewdriverWrench } from "react-icons/fa6";
import apiClient from "../lib/apiClient";

const ENDPOINT = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'services' or 'tasks'
  const [services, setServices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = session?.user;
  const adminName = user?.name || user?.email || "Admin";

  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('session:updated', sync);
    return () => {
      window.removeEventListener('session:updated', sync);
    };
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const data = await apiClient.get("/services");
      setServices(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiClient.get("/tasks");
      setTasks(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const data = await apiClient.get("/admin/reports");
      setReports(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiClient.get("/admin/users");
      setUsers(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchTasks(), fetchUsers(), fetchReports()]);
      setLoading(false);
    };
    if (session) init();
  }, [session, fetchServices, fetchTasks, fetchUsers]);

  const handleDeleteService = async (id) => {
    if (!window.confirm("Permanently delete this service?")) return;
    try {
      await apiClient.delete(`/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Permanently delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Permanently delete this report?")) return;
    try {
      await apiClient.delete(`/admin/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    clearSession();
    navigate("/sign-in");
  };

  if (!session || user?.role !== 'admin') {
    return <div className="p-10 text-center font-bold text-red-500">Access Denied: Admin Only.</div>;
  }

  const filteredItems = (
    activeTab === 'services' ? services : 
    activeTab === 'tasks' ? tasks : 
    activeTab === 'reports' ? reports : 
    users
  ).filter(item => {
    const searchVal = activeTab === 'users' ? item.name : activeTab === 'reports' ? item.reporter_name : item.title;
    return searchVal?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <style>{`
        body { font-family: 'DM Sans', sans-serif; }
        .font-sora { font-family: 'Sora', sans-serif; }
      `}</style>
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] text-white p-6 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 text-xl font-extrabold mb-8 px-2 py-4 border-b border-white/10 font-sora">
          <FaScrewdriverWrench className="text-white" /> <span>FixHub</span>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/50 tracking-widest uppercase">Admin</span>
        </div>
        <nav className="flex-grow space-y-2 font-medium">
          <button onClick={() => setActiveTab("users")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'users' ? 'bg-white text-[#0a0a0a] shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
            <FaUsers /> Users
          </button>
          <button onClick={() => setActiveTab("services")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'services' ? 'bg-white text-[#0a0a0a] shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
            <FaBriefcase /> Services
          </button>
          <button onClick={() => setActiveTab("tasks")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'tasks' ? 'bg-white text-[#0a0a0a] shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
            <FaTasks /> Tasks
          </button>
          <button onClick={() => setActiveTab("reports")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'reports' ? 'bg-white text-[#0a0a0a] shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
            <FaFlag /> Reports
          </button>
        </nav>
        <div className="pt-6 border-t border-white/10 space-y-1">
          <div className="px-4 py-3 text-white/60 text-sm font-semibold truncate">
            {adminName}
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-[800] text-[#0a0a0a] capitalize tracking-tight font-sora">{activeTab} Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and audit community {activeTab}</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..."
              className="pl-11 pr-4 py-2.5 bg-white border border-[#f1f5f9] rounded-xl w-80 focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-[#f1f5f9] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fc] border-b border-[#f1f5f9]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTab === 'users' ? 'Name / Email' : activeTab === 'reports' ? 'Reporter / Reason' : 'Title / Description'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTab === 'services' ? 'Provider' : activeTab === 'tasks' ? 'Client' : activeTab === 'reports' ? 'Target' : 'Role'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-slate-900">{activeTab === 'users' ? item.name : activeTab === 'reports' ? item.reporter_name : item.title}</div>
                    <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{activeTab === 'users' ? item.email : activeTab === 'reports' ? item.reason : item.description}</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 capitalize">{activeTab === 'services' ? item.provider_name : activeTab === 'tasks' ? item.client_name : activeTab === 'reports' ? `${item.target_type} #${item.target_id || item.id}` : item.role}</td>
                  <td className="px-6 py-5 text-right flex justify-end gap-1">
                    {activeTab === 'reports' && (
                      <button onClick={() => setSelectedReport(item)} className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details"><FaEye size={14} /></button>
                    )}
                    <button onClick={() => {
                      if (activeTab === 'services') handleDeleteService(item.id);
                      else if (activeTab === 'tasks') handleDeleteTask(item.id);
                      else if (activeTab === 'reports') { handleDeleteReport(item.id); if (selectedReport?.id === item.id) setSelectedReport(null); }
                      else handleDeleteUser(item.id);
                    }} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete record"><FaTrash size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#f8f9fc]">
              <h3 className="text-lg font-bold text-slate-900 font-sora">Report Details</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reporter</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedReport.reporter_name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Entity</label>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{selectedReport.target_type} #{selectedReport.target_id || selectedReport.id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for reporting</label>
                <div className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg inline-block border border-red-100">
                  {selectedReport.reason}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Additional details</label>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {selectedReport.description || "The reporter did not provide any additional comments."}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Report ID: {selectedReport.id}</span>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedReport(null)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition-all">Close</button>
                  <button onClick={() => { handleDeleteReport(selectedReport.id); setSelectedReport(null); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                    <FaTrash size={12} /> Delete Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}