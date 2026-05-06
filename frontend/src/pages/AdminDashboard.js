import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, clearSession } from "../lib/session";
import { 
  FaTrash, FaBriefcase, FaTasks, FaSignOutAlt, 
  FaSearch, FaUsers, FaFlag, FaEye, FaTimes, FaChartLine 
} from "react-icons/fa";
import { FaScrewdriverWrench } from "react-icons/fa6";
import apiClient from "../lib/apiClient";
import "./dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());
  const [activeTab, setActiveTab] = useState("users");
  const [services, setServices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = session?.user;
  const adminName = user?.name || user?.email || "Admin";
  const initials = adminName.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Sync session
  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('session:updated', sync);
    return () => window.removeEventListener('session:updated', sync);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [srv, tsk, usr, rep] = await Promise.all([
        apiClient.get("/services"),
        apiClient.get("/tasks"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/reports")
      ]);
      setServices(Array.isArray(srv) ? srv : (srv.data || []));
      setTasks(Array.isArray(tsk) ? tsk : (tsk.data || []));
      setUsers(Array.isArray(usr) ? usr : (usr.data || []));
      setReports(Array.isArray(rep) ? rep : (rep.data || []));
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type.slice(0, -1)}?`)) return;
    try {
      const endpoint = type === 'users' || type === 'reports' ? `/admin/${type}/${id}` : `/${type}/${id}`;
      await apiClient.delete(endpoint);
      if (type === 'services') setServices(prev => prev.filter(s => s.id !== id));
      if (type === 'tasks') setTasks(prev => prev.filter(t => t.id !== id));
      if (type === 'users') setUsers(prev => prev.filter(u => u.id !== id));
      if (type === 'reports') setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    clearSession();
    navigate("/sign-in");
  };

  if (!session || user?.role !== 'admin') {
    return <div className="p-10 text-center font-bold text-red-500 font-sora">Access Denied: Admin Only.</div>;
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
    <div className="db-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="flex items-center gap-3 text-xl font-extrabold mb-10 px-2 font-sora">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0a0a0a]">
            <FaScrewdriverWrench size={20} />
          </div>
          <span>FixHub</span>
        </div>
        
        <nav className="db-sidebar-nav">
          {[
            { id: 'users', icon: <FaUsers />, label: 'Users' },
            { id: 'services', icon: <FaBriefcase />, label: 'Services' },
            { id: 'tasks', icon: <FaTasks />, label: 'Tasks' },
            { id: 'reports', icon: <FaFlag />, label: 'Reports' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`db-sidebar-link${activeTab === tab.id ? ' db-sidebar-link--active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs">
               {initials}
             </div>
             <div className="min-w-0">
               <p className="text-sm font-bold truncate">{adminName}</p>
               <p className="text-[10px] text-white/40 uppercase tracking-tight">System Administrator</p>
             </div>
          </div>
          <button onClick={handleSignOut} className="db-cta db-cta--outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">Admin Dashboard</h1>
            <p className="db-page-sub">Monitoring FixHub ecosystem, users, tasks and reports</p>
          </div>
          <div className="db-search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="db-search-box" style={{ position: 'relative', width: 320 }}>
              <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                className="db-form-input"
                style={{ paddingLeft: 42, width: '100%', borderRadius: '999px', background: 'var(--card2)', borderColor: 'var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="db-kpi-grid mb-10">
          {[
            { label: 'Total Users', value: users.length, icon: <FaUsers />, color: 'blue' },
            { label: 'Active Services', value: services.length, icon: <FaBriefcase />, color: 'emerald' },
            { label: 'Open Tasks', value: tasks.length, icon: <FaTasks />, color: 'amber' },
            { label: 'Unresolved Reports', value: reports.length, icon: <FaFlag />, color: 'red' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-[#f1f5f9] shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold text-[#0a0a0a] font-sora">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Table Area */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#f1f5f9] overflow-hidden">
          <div className="px-8 py-6 border-b border-[#f1f5f9] flex justify-between items-center">
            <h2 className="font-sora text-lg font-extrabold capitalize">{activeTab} List</h2>
            <div className="flex gap-2">
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                 {filteredItems.length} Records Found
               </span>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fc]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {activeTab === 'users' ? 'User Identity' : activeTab === 'reports' ? 'Reporter' : 'General Information'}
                </th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {activeTab === 'services' ? 'Provider' : activeTab === 'tasks' ? 'Client' : activeTab === 'reports' ? 'Entity At Fault' : 'Privilege'}
                </th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="3" className="p-20 text-center text-slate-400 font-medium animate-pulse">Synchronizing database...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan="3" className="p-20 text-center text-slate-400 font-medium">No results found matching your search.</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 text-sm">
                      {activeTab === 'users' ? item.name : activeTab === 'reports' ? item.reporter_name : item.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      {activeTab === 'users' ? item.email : activeTab === 'reports' ? <span className="text-red-500 font-semibold">{item.reason}</span> : item.description?.substring(0, 60) + "..."}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${activeTab === 'users' && item.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {activeTab === 'services' ? item.provider_name : activeTab === 'tasks' ? item.client_name : activeTab === 'reports' ? `${item.target_type} #${item.target_id || item.id}` : item.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTab === 'reports' && (
                        <button onClick={() => setSelectedReport(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Review Report"><FaEye size={16} /></button>
                      )}
                      <button 
                        onClick={() => handleDelete(activeTab, item.id)} 
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                        title={`Delete ${activeTab.slice(0, -1)}`}
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modern Modal for Reports */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-[#f8f9fc] border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-[#0a0a0a] font-sora">Case Review</h3>
              <button onClick={() => setSelectedReport(null)} className="bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-black transition-colors"><FaTimes /></button>
            </div>
            <div className="p-10">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Incident Category</p>
                <p className="text-red-700 font-bold">{selectedReport.reason}</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Filed By</label>
                    <p className="text-sm font-bold text-[#0a0a0a]">{selectedReport.reporter_name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Object</label>
                    <p className="text-sm font-bold text-[#0a0a0a] capitalize">{selectedReport.target_type} ID: {selectedReport.target_id || selectedReport.id}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Detailed Testimony</label>
                  <div className="p-6 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed italic border border-[#f1f5f9]">
                    "{selectedReport.description || "No specific details provided by the reporter."}"
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                   onClick={() => { handleDelete('reports', selectedReport.id); setSelectedReport(null); }}
                   className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                >
                  <FaTrash size={14} /> Dismiss & Delete Record
                </button>
                <button onClick={() => setSelectedReport(null)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}