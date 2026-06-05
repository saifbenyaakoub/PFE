import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, clearSession } from "../lib/session";
import {
  FaTrash, FaBriefcase, FaTasks, FaSignOutAlt,
  FaSearch, FaUsers
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = session?.user;
  const adminName = user?.name || user?.email || "Admin";
  const initials = adminName.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Sync session
  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener("session:updated", sync);
    return () => window.removeEventListener("session:updated", sync);
  }, []);

  // ✅ CORRECTION : 4 appels avec le bon préfixe /admin/
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usr, tsk, srv] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/tasks"),
        apiClient.get("/admin/services"),
      ]);
      setUsers(Array.isArray(usr) ? usr : (usr.data || []));
      setTasks(Array.isArray(tsk) ? tsk : (tsk.data || []));
      setServices(Array.isArray(srv) ? srv : (srv.data || []));
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  // ✅ CORRECTION : prefix /admin/ pour tous les types
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type.slice(0, -1)}?`)) return;
    try {
      await apiClient.delete(`/admin/${type}/${id}`);
      if (type === "services") setServices(prev => prev.filter(s => s.id !== id));
      if (type === "tasks")    setTasks(prev => prev.filter(t => t.id !== id));
      if (type === "users")    setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    clearSession();
    navigate("/sign-in");
  };

  if (!session || user?.role !== "admin") {
    return (
      <div className="p-10 text-center font-bold text-red-500 font-sora">
        Access Denied: Admin Only.
      </div>
    );
  }

  const filteredItems = (
    activeTab === "services" ? services :
    activeTab === "tasks"    ? tasks    :
    users
  ).filter(item => {
    const searchVal =
      activeTab === "users"   ? item.name :
      item.title;
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
            { id: "users",    icon: <FaUsers />,    label: "Users"    },
            { id: "services", icon: <FaBriefcase />, label: "Services" },
            { id: "tasks",    icon: <FaTasks />,     label: "Tasks"    },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
              className={`db-sidebar-link${activeTab === tab.id ? " db-sidebar-link--active" : ""}`}
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
          <button
            onClick={handleSignOut}
            className="db-cta db-cta--outline"
            style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">Admin Dashboard</h1>
            <p className="db-page-sub">Monitoring FixHub ecosystem, users, services and tasks</p>
          </div>
          <div className="db-search-wrap" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="db-search-box" style={{ position: "relative", width: 320 }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="db-form-input"
                style={{ paddingLeft: 42, width: "100%", borderRadius: "999px", background: "var(--card2)", borderColor: "var(--border)" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="db-kpi-grid db-kpi-grid--admin mb-10">
          {[
            { label: "Total Users",        value: users.length,    icon: <FaUsers />,    color: "blue"   },
            { label: "Active Services",    value: services.length, icon: <FaBriefcase />, color: "emerald" },
            { label: "Open Tasks",         value: tasks.length,    icon: <FaTasks />,    color: "amber"  },
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

        {/* Content Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#f1f5f9] overflow-hidden">
          <div className="px-8 py-6 border-b border-[#f1f5f9] flex justify-between items-center">
            <h2 className="font-sora text-lg font-extrabold capitalize">{activeTab} List</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {filteredItems.length} Records Found
            </span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f8f9fc]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {activeTab === "users" ? "User Identity" : "General Information"}
                </th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {activeTab === "services" ? "Provider"       :
                   activeTab === "tasks"    ? "Client"         : "Privilege"}
                </th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                  Control
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center text-slate-400 font-medium animate-pulse">
                    Synchronizing database...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center text-slate-400 font-medium">
                    No results found matching your search.
                  </td>
                </tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 text-sm">
                      {activeTab === "users" ? item.name : item.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {activeTab === "users"   ? item.email :
                       item.description?.substring(0, 60) + "..."}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      activeTab === "users" && item.role === "admin"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {activeTab === "services" ? item.provider_name :
                       activeTab === "tasks"    ? item.client_name   :
                       item.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(activeTab, item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
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
    </div>
  );
}
