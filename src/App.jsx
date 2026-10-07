import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login.jsx";
import api from "./api.js";

const categories = [
  "Billing",
  "Technical Issues",
  "Product/Service",
  "Account",
  "Delivery",
  "Fraud/Security",
  "Other",
];

const initialComplaints = [
  {
    id: "CMP-1001",
    user: "Aarav Sharma",
    complaint: "I noticed an unauthorized transaction on my account.",
    category: "Fraud/Security",
    priority: "High",
    confidence: 96,
    status: "Pending",
    date: "23 Sep 2026",
  },
  {
    id: "CMP-1002",
    user: "Priya Patel",
    complaint: "My payment was charged twice for the same order.",
    category: "Billing",
    priority: "High",
    confidence: 94,
    status: "Resolved",
    date: "22 Sep 2026",
  },
  {
    id: "CMP-1003",
    user: "Rohan Mehta",
    complaint: "The application keeps crashing when I login.",
    category: "Technical Issues",
    priority: "Medium",
    confidence: 91,
    status: "In Progress",
    date: "21 Sep 2026",
  },
  {
    id: "CMP-1004",
    user: "Neha Singh",
    complaint: "My delivery has not arrived yet.",
    category: "Delivery",
    priority: "Medium",
    confidence: 89,
    status: "Pending",
    date: "20 Sep 2026",
  },
  {
    id: "CMP-1005",
    user: "Vikram Joshi",
    complaint: "I cannot update my registered phone number.",
    category: "Account",
    priority: "Low",
    confidence: 93,
    status: "Resolved",
    date: "19 Sep 2026",
  },
  {
    id: "CMP-1006",
    user: "Sneha Kapoor",
    complaint: "The product I received is damaged.",
    category: "Product/Service",
    priority: "High",
    confidence: 95,
    status: "Pending",
    date: "18 Sep 2026",
  },
];

const categoryColors = {
  Billing: "#6366f1",
  "Technical Issues": "#06b6d4",
  "Product/Service": "#8b5cf6",
  Account: "#f59e0b",
  Delivery: "#10b981",
  "Fraud/Security": "#ef4444",
  Other: "#94a3b8",
};

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedLocal = localStorage.getItem("complainai_user");
      if (savedLocal) return JSON.parse(savedLocal);
      const savedSession = sessionStorage.getItem("complainai_user");
      if (savedSession) return JSON.parse(savedSession);
      return null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  // Load complaints from localStorage or initial list
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem("complainai_complaints");
      return saved ? JSON.parse(saved) : initialComplaints;
    } catch {
      return initialComplaints;
    }
  });

  // Fetch complaints from Flask backend on mount
  useEffect(() => {
    let isMounted = true;
    api.getComplaints()
      .then((data) => {
        if (isMounted && data && Array.isArray(data.complaints) && data.complaints.length > 0) {
          setComplaints(data.complaints);
        }
      })
      .catch((err) => {
        console.warn("Backend complaints load notice:", err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync complaints to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("complainai_complaints", JSON.stringify(complaints));
    } catch {
      // ignore
    }
  }, [complaints]);

  // Filters State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // In-app notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "High Priority Alert",
      text: "Complaint CMP-1001 flagged as Fraud/Security with 96% AI confidence.",
      time: "12m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Complaint Resolved",
      text: "Priya Patel's double payment issue (CMP-1002) resolved.",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "AI Engine Status",
      text: "Classification engine operating normally across all 7 categories.",
      time: "4h ago",
      unread: false,
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    attachment: null,
  });

  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleLogin = (user, remember) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem("complainai_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("complainai_user", JSON.stringify(user));
    }
    setActiveTab("dashboard");
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("complainai_user");
    sessionStorage.removeItem("complainai_user");
    setShowProfile(false);
    setShowNotifications(false);
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("newest");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    sortBy !== "newest";

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const highPriority = complaints.filter((c) => c.priority === "High").length;

  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return complaints
      .filter((item) => {
        const matchesSearch =
          !q ||
          item.id.toLowerCase().includes(q) ||
          item.user.toLowerCase().includes(q) ||
          item.complaint.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.priority.toLowerCase().includes(q);

        const matchesCategory =
          categoryFilter === "All" || item.category === categoryFilter;

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        const matchesPriority =
          priorityFilter === "All" || item.priority === priorityFilter;

        return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "confidence-high") return b.confidence - a.confidence;
        if (sortBy === "confidence-low") return a.confidence - b.confidence;
        if (sortBy === "oldest") return a.id.localeCompare(b.id);
        // default: newest
        return b.id.localeCompare(a.id);
      });
  }, [complaints, search, categoryFilter, statusFilter, priorityFilter, sortBy]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);

    try {
      // Submit complaint to Flask backend -> AI Classifier -> MySQL
      const res = await api.submitComplaint({
        title: form.title.trim(),
        description: form.description.trim(),
        user: currentUser?.name || "Anonymous",
        user_id: currentUser?.id || null,
        attachment: form.attachment ? form.attachment.name : null,
      });

      if (res && res.success && res.complaint) {
        const ai = res.ai_result || {
          category: res.complaint.category,
          priority: res.complaint.priority,
          confidence: res.complaint.confidence,
        };
        setAiResult(ai);
        setComplaints((prev) => [res.complaint, ...prev.filter((c) => c.id !== res.complaint.id)]);
        setSubmitting(false);

        // Add to notification center
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: "New Complaint Submitted",
            text: `${res.complaint.id} categorized as ${ai.category} (${ai.priority} Priority).`,
            time: "Just now",
            unread: true,
          },
          ...prev,
        ]);

        showToast(`Complaint ${res.complaint.id} submitted & classified as ${ai.category}!`);
        setForm({
          title: "",
          description: "",
          attachment: null,
        });
        return;
      } else {
        throw new Error(res?.error || "Failed to submit complaint.");
      }
    } catch (apiErr) {
      setSubmitting(false);
      showToast(`Submission Error: ${apiErr.message}`);
      console.error("Backend complaint submission error:", apiErr);
    }
  };

  const updateStatus = async (id, status) => {
    // Optimistic UI update
    setComplaints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    // Persist status change to Flask backend & MySQL
    try {
      const res = await api.updateStatus(id, status);
      if (res && res.success) {
        showToast(`${id} status updated to ${status}`);
      } else {
        throw new Error(res?.error || "Status update failed.");
      }
    } catch (err) {
      showToast(`Error updating ${id}: ${err.message}`);
      console.error("Backend status update error:", err);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  const navItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "submit", icon: "＋", label: "Submit Complaint" },
    { id: "complaints", icon: "▤", label: "All Complaints" },
    { id: "classification", icon: "✦", label: "AI Classification" },
    { id: "analytics", icon: "◔", label: "Analytics" },
  ];

  // If not authenticated, render Login Page
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <strong>ComplainAI</strong>
            <span>Smart Resolution</span>
          </div>
        </div>

        <div className="nav-section-title">MENU</div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="profile-mini"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            title="View Profile"
          >
            <div className="avatar">{currentUser.initials || "AS"}</div>
            <div className="profile-text">
              <strong>{currentUser.name || "Alex Smith"}</strong>
              <span>{currentUser.role || "Administrator"}</span>
            </div>
            <span>•••</span>
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Log out of application"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "submit" && "Submit Complaint"}
              {activeTab === "complaints" && "All Complaints"}
              {activeTab === "classification" && "AI Classification"}
              {activeTab === "analytics" && "Analytics"}
            </h1>
            <p>
              Manage and analyze customer complaints with AI-powered
              classification.
            </p>
          </div>

          <div className="top-actions">
            <button
              className={`notification ${unreadNotificationCount > 0 ? "has-unread" : ""}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              title="Notifications"
            >
              ♢
              {unreadNotificationCount > 0 && <span />}
            </button>

            <button
              className="top-avatar"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              title="Profile Settings"
            >
              {currentUser.initials || "AS"}
            </button>
          </div>
        </header>

        {/* Notifications Popover */}
        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <div>
                <strong>Notifications</strong>
                <span className="notification-badge-count">
                  {unreadNotificationCount} new
                </span>
              </div>
              {unreadNotificationCount > 0 && (
                <button
                  className="mark-read-btn"
                  onClick={markAllNotificationsRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="notifications-list">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notification-item ${item.unread ? "unread" : ""}`}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === item.id ? { ...n, unread: false } : n
                      )
                    );
                  }}
                >
                  <div className="notification-dot-indicator" />
                  <div>
                    <div className="notification-title">{item.title}</div>
                    <div className="notification-desc">{item.text}</div>
                    <div className="notification-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Popover */}
        {showProfile && (
          <div className="profile-popup">
            <div className="avatar large">{currentUser.initials || "AS"}</div>
            <h3>{currentUser.name}</h3>
            <p>{currentUser.role}</p>
            <div className="profile-email-badge">{currentUser.email}</div>
            <div className="profile-actions-column">
              <button
                className="profile-btn-secondary"
                onClick={() => {
                  showToast("Profile settings updated.");
                  setShowProfile(false);
                }}
              >
                Profile Settings
              </button>
              <button className="profile-btn-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Views */}
        {activeTab === "dashboard" && (
          <Dashboard
            total={total}
            pending={pending}
            resolved={resolved}
            highPriority={highPriority}
            complaints={complaints}
            setActiveTab={setActiveTab}
            setSelectedComplaint={setSelectedComplaint}
            handleResetFilters={handleResetFilters}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            setCategoryFilter={setCategoryFilter}
          />
        )}

        {activeTab === "submit" && (
          <SubmitComplaint
            form={form}
            setForm={setForm}
            handleSubmit={handleSubmitComplaint}
            aiResult={aiResult}
            submitting={submitting}
          />
        )}

        {activeTab === "complaints" && (
          <ComplaintsTable
            complaints={filteredComplaints}
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalComplaintsCount={complaints.length}
            updateStatus={updateStatus}
            setSelectedComplaint={setSelectedComplaint}
          />
        )}

        {activeTab === "classification" && (
          <Classification
            complaints={complaints}
            setActiveTab={setActiveTab}
            setSelectedComplaint={setSelectedComplaint}
            setPriorityFilter={setPriorityFilter}
            handleResetFilters={handleResetFilters}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics
            complaints={complaints}
            setActiveTab={setActiveTab}
            setCategoryFilter={setCategoryFilter}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            handleResetFilters={handleResetFilters}
          />
        )}
      </main>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          updateStatus={updateStatus}
        />
      )}
    </div>
  );
}

function Dashboard({
  total,
  pending,
  resolved,
  highPriority,
  complaints,
  setActiveTab,
  setSelectedComplaint,
  handleResetFilters,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
}) {
  return (
    <div className="page">
      {/* Interactive Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Complaints"
          value={total}
          change="+12.5%"
          icon="▤"
          color="blue"
          hint="View All →"
          onClick={() => {
            handleResetFilters();
            setActiveTab("complaints");
          }}
        />
        <SummaryCard
          title="Pending"
          value={pending}
          change="+4.2%"
          icon="◷"
          color="orange"
          hint="Filter Pending →"
          onClick={() => {
            handleResetFilters();
            setStatusFilter("Pending");
            setActiveTab("complaints");
          }}
        />
        <SummaryCard
          title="Resolved"
          value={resolved}
          change="+18.4%"
          icon="✓"
          color="green"
          hint="Filter Resolved →"
          onClick={() => {
            handleResetFilters();
            setStatusFilter("Resolved");
            setActiveTab("complaints");
          }}
        />
        <SummaryCard
          title="High Priority"
          value={highPriority}
          change="-2.8%"
          icon="!"
          color="red"
          hint="Filter Urgent →"
          onClick={() => {
            handleResetFilters();
            setPriorityFilter("High");
            setActiveTab("complaints");
          }}
        />
      </div>

      {/* Interactive Charts */}
      <div className="charts-grid">
        <CategoryChart
          complaints={complaints}
          setActiveTab={setActiveTab}
          setCategoryFilter={setCategoryFilter}
        />
        <TrendChart complaints={complaints} />
      </div>

      {/* Recent Complaints Section */}
      <div className="section-header">
        <div>
          <h2>Recent Complaints</h2>
          <p>Latest customer complaints and AI classifications (Click to inspect)</p>
        </div>

        <button
          className="outline-btn"
          onClick={() => {
            handleResetFilters();
            setActiveTab("complaints");
          }}
        >
          View All Complaints →
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Complaint</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {complaints.slice(0, 5).map((item) => (
              <tr
                key={item.id}
                className="clickable-row"
                onClick={() => setSelectedComplaint(item)}
                title="Click to view full complaint details"
              >
                <td className="complaint-id">{item.id}</td>
                <td>
                  <div className="complaint-text">{item.complaint}</div>
                </td>
                <td>
                  <CategoryBadge category={item.category} />
                </td>
                <td>
                  <PriorityBadge priority={item.priority} />
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{item.date}</td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No complaints recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, change, icon, color, hint, onClick }) {
  return (
    <div
      className={`summary-card interactive-card ${color}-card`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick()}
      title={`Click to filter complaints by ${title}`}
    >
      <div className={`summary-icon ${color}`}>{icon}</div>
      <div className="summary-info">
        <div className="summary-title-row">
          <span>{title}</span>
          {hint && <span className="card-action-hint">{hint}</span>}
        </div>
        <strong>{value}</strong>
        <small className={change.startsWith("-") ? "negative" : ""}>
          {change} <em>vs last month</em>
        </small>
      </div>
    </div>
  );
}

function CategoryChart({ complaints, setActiveTab, setCategoryFilter }) {
  const counts = categories.map((category) => ({
    category,
    count: complaints.filter((c) => c.category === category).length,
  }));

  const total = complaints.length;

  // Compute actual dynamic conic gradient based on actual data
  const dynamicGradient = useMemo(() => {
    if (total === 0) return "#e2e8f0";

    let currentPct = 0;
    const gradientStops = [];

    counts.forEach((item) => {
      if (item.count > 0) {
        const pct = (item.count / total) * 100;
        const color = categoryColors[item.category] || "#94a3b8";
        gradientStops.push(
          `${color} ${currentPct.toFixed(1)}% ${(currentPct + pct).toFixed(1)}%`
        );
        currentPct += pct;
      }
    });

    return gradientStops.length > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "#e2e8f0";
  }, [counts, total]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Complaints by Category</h3>
          <p>Interactive distribution (Click category to filter)</p>
        </div>
        <span className="live-data-badge">● Live</span>
      </div>

      <div className="pie-layout">
        <div
          className="pie-chart"
          style={{ background: dynamicGradient }}
          title={`${total} total categorized complaints`}
        >
          <div className="pie-center">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>

        <div className="legend">
          {counts.map((item, index) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div
                className="legend-item interactive-legend"
                key={item.category}
                onClick={() => {
                  if (setCategoryFilter && setActiveTab) {
                    setCategoryFilter(item.category);
                    setActiveTab("complaints");
                  }
                }}
                title={`Filter by ${item.category} (${item.count} complaints)`}
              >
                <span
                  style={{
                    background: Object.values(categoryColors)[index],
                  }}
                />
                <label>{item.category}</label>
                <span className="legend-pct">{pct}%</span>
                <strong>{item.count}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TrendChart({ complaints }) {
  const [timeRange, setTimeRange] = useState("30d");

  // Dynamic datasets based on complaints and timeRange
  const trendConfig = useMemo(() => {
    if (timeRange === "7d") {
      return {
        points: "0,140 93,125 186,80 280,95 373,40 466,60 560,35",
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        dataPoints: [
          { x: 0, y: 140, label: "Mon", count: 2 },
          { x: 93, y: 125, label: "Tue", count: 3 },
          { x: 186, y: 80, label: "Wed", count: 6 },
          { x: 280, y: 95, label: "Thu", count: 5 },
          { x: 373, y: 40, label: "Fri", count: 9 },
          { x: 466, y: 60, label: "Sat", count: 8 },
          { x: 560, y: 35, label: "Sun", count: 11 },
        ],
        resolvedRate: "92%",
      };
    } else if (timeRange === "90d") {
      return {
        points: "0,150 112,130 224,100 336,65 448,55 560,25",
        labels: ["July", "Mid Jul", "Aug", "Mid Aug", "Sep", "End Sep"],
        dataPoints: [
          { x: 0, y: 150, label: "Early July", count: 12 },
          { x: 112, y: 130, label: "Mid July", count: 19 },
          { x: 224, y: 100, label: "Early August", count: 31 },
          { x: 336, y: 65, label: "Mid August", count: 48 },
          { x: 448, y: 55, label: "Early September", count: 55 },
          { x: 560, y: 25, label: "Late September", count: complaints.length + 68 },
        ],
        resolvedRate: "89%",
      };
    }
    // Default 30d
    return {
      points: "0,145 70,120 140,130 210,92 280,105 350,62 420,78 490,35 560,50",
      labels: ["Sep 1", "Sep 7", "Sep 14", "Sep 21", "Sep 30"],
      dataPoints: [
        { x: 0, y: 145, label: "Sep 1", count: 4 },
        { x: 70, y: 120, label: "Sep 4", count: 7 },
        { x: 140, y: 130, label: "Sep 7", count: 6 },
        { x: 210, y: 92, label: "Sep 14", count: 12 },
        { x: 280, y: 105, label: "Sep 18", count: 10 },
        { x: 350, y: 62, label: "Sep 21", count: 16 },
        { x: 420, y: 78, label: "Sep 24", count: 14 },
        { x: 490, y: 35, label: "Sep 28", count: 21 },
        { x: 560, y: 50, label: "Sep 30", count: 19 },
      ],
      resolvedRate: "87%",
    };
  }, [timeRange, complaints.length]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Complaints Over Time</h3>
          <p>Volume trends & resolution performance</p>
        </div>

        <select
          className="chart-select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          aria-label="Select trend time range"
        >
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="line-chart">
        <div className="y-axis">
          <span>High</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        <svg viewBox="0 0 560 170" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity=".35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={`M ${trendConfig.points.split(" ").join(" L ")} L 560 170 L 0 170 Z`}
            fill="url(#chartFill)"
          />

          {/* Line stroke */}
          <polyline
            points={trendConfig.points}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots with tooltips */}
          {trendConfig.dataPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth="2.5"
              className="chart-dot"
            >
              <title>{`${pt.label}: ${pt.count} complaints`}</title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="x-axis">
        {trendConfig.labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}

function SubmitComplaint({
  form,
  setForm,
  handleSubmit,
  aiResult,
  submitting,
}) {
  return (
    <div className="page submit-page">
      <div className="form-wrapper">
        <div className="form-intro">
          <div className="ai-orb">✦</div>
          <div>
            <h2>Tell us what happened</h2>
            <p>
              Our AI will automatically categorize your complaint,
              determine priority, and calculate confidence.
            </p>
          </div>
        </div>

        <form className="complaint-form" onSubmit={handleSubmit}>
          <label>
            Complaint Title
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Unauthorized transaction on my account"
            />
          </label>

          <label>
            Complaint Description
            <textarea
              required
              rows="7"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Describe your issue in detail..."
            />
          </label>

          <label>
            Attachment
            <div className="upload-box">
              <input
                type="file"
                onChange={(e) =>
                  setForm({
                    ...form,
                    attachment: e.target.files[0],
                  })
                }
              />
              <div className="upload-content">
                <span className="upload-icon">↑</span>
                <strong>
                  {form.attachment
                    ? form.attachment.name
                    : "Upload supporting document"}
                </strong>
                <small>PNG, JPG, PDF up to 10MB</small>
              </div>
            </div>
          </label>

          <button
            className="submit-btn"
            disabled={submitting || !form.title.trim() || !form.description.trim()}
            type="submit"
          >
            {submitting ? "Analyzing Complaint with AI..." : "Submit Complaint"}
            {!submitting && <span>→</span>}
          </button>
        </form>

        {aiResult && (
          <div className="ai-result">
            <div className="ai-result-header">
              <div className="ai-check">✓</div>
              <div>
                <h3>AI Classification Complete</h3>
                <p>Your complaint has been automatically analyzed and recorded.</p>
              </div>
            </div>

            <div className="ai-result-grid">
              <div>
                <span>Category</span>
                <strong>{aiResult.category}</strong>
              </div>

              <div>
                <span>Priority</span>
                <PriorityBadge priority={aiResult.priority} />
              </div>

              <div>
                <span>AI Confidence</span>
                <strong className="confidence">
                  {aiResult.confidence}%
                </strong>
              </div>
            </div>

            <div className="confidence-bar">
              <span style={{ width: `${aiResult.confidence}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComplaintsTable({
  complaints,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  handleResetFilters,
  hasActiveFilters,
  totalComplaintsCount,
  updateStatus,
  setSelectedComplaint,
}) {
  return (
    <div className="page">
      {/* Search & Comprehensive Filters Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            placeholder="Search complaints, users, categories, or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search-btn"
              onClick={() => setSearch("")}
              title="Clear search text"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          title="Filter by category"
        >
          <option value="All">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          title="Filter by priority"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Sort Filter */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          title="Sort complaints"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="confidence-high">Confidence: High to Low</option>
          <option value="confidence-low">Confidence: Low to High</option>
        </select>

        {/* Reset / Clear Filters Button */}
        {hasActiveFilters && (
          <button
            className="filter-btn active-reset-btn"
            onClick={handleResetFilters}
            title="Clear all active filters"
          >
            ⟲ Reset Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      <div className="active-chips-bar">
        <div className="results-counter">
          Showing <strong>{complaints.length}</strong> of{" "}
          <strong>{totalComplaintsCount}</strong> complaints
        </div>

        <div className="chips-list">
          {search && (
            <span className="filter-chip">
              Search: "{search}"
              <button onClick={() => setSearch("")}>×</button>
            </span>
          )}
          {categoryFilter !== "All" && (
            <span className="filter-chip">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter("All")}>×</button>
            </span>
          )}
          {statusFilter !== "All" && (
            <span className="filter-chip">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("All")}>×</button>
            </span>
          )}
          {priorityFilter !== "All" && (
            <span className="filter-chip">
              Priority: {priorityFilter}
              <button onClick={() => setPriorityFilter("All")}>×</button>
            </span>
          )}
          {sortBy !== "newest" && (
            <span className="filter-chip">
              Sorted
              <button onClick={() => setSortBy("newest")}>×</button>
            </span>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card full-table">
        <table>
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>User</th>
              <th>Complaint</th>
              <th>AI Category</th>
              <th>Priority</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((item) => (
              <tr key={item.id} className="table-data-row">
                <td
                  className="complaint-id clickable"
                  onClick={() => setSelectedComplaint(item)}
                  title="Click to view details"
                >
                  {item.id}
                </td>
                <td>
                  <div className="user-cell">
                    <div className="small-avatar">
                      {item.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {item.user}
                  </div>
                </td>
                <td>
                  <div
                    className="complaint-text clickable"
                    onClick={() => setSelectedComplaint(item)}
                    title="Click to view details"
                  >
                    {item.complaint}
                  </div>
                </td>
                <td>
                  <CategoryBadge category={item.category} />
                </td>
                <td>
                  <PriorityBadge priority={item.priority} />
                </td>
                <td>
                  <strong className="confidence-text">
                    {item.confidence}%
                  </strong>
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>{item.date}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      title="View Details"
                      className="view-btn"
                      onClick={() => setSelectedComplaint(item)}
                    >
                      👁
                    </button>

                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(item.id, e.target.value)
                      }
                      title="Update status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-state">
                  <div className="empty-state-content">
                    <div className="empty-state-icon">⌕</div>
                    <h3>No complaints match your criteria</h3>
                    <p>
                      {hasActiveFilters
                        ? "Try adjusting your search terms or clearing filters to view more complaints."
                        : "No complaints found in the database."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        className="outline-btn"
                        onClick={handleResetFilters}
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Classification({
  complaints,
  setActiveTab,
  setSelectedComplaint,
  setPriorityFilter,
  handleResetFilters,
}) {
  const avgConfidence =
    complaints.length > 0
      ? Math.round(
          complaints.reduce((sum, item) => sum + item.confidence, 0) /
            complaints.length
        )
      : 0;

  const highPriorityCount = complaints.filter(
    (c) => c.priority === "High"
  ).length;

  return (
    <div className="page">
      <div className="classification-hero">
        <div className="hero-ai-icon">✦</div>
        <div>
          <h2>AI Complaint Classification Engine</h2>
          <p>
            Every complaint is automatically parsed and processed using deep NLP
            to determine category, priority urgency, and classification confidence.
          </p>
        </div>
      </div>

      <div className="classification-grid">
        <div
          className="metric-card interactive-metric"
          onClick={() => {
            handleResetFilters();
            setActiveTab("complaints");
          }}
          title="Click to view all classified complaints"
        >
          <span>AI Classified</span>
          <strong>{complaints.length}</strong>
          <small>100% of complaints processed →</small>
        </div>

        <div className="metric-card">
          <span>Average Confidence</span>
          <strong>{avgConfidence}%</strong>
          <small>Classification accuracy model</small>
        </div>

        <div
          className="metric-card interactive-metric"
          onClick={() => {
            handleResetFilters();
            setPriorityFilter("High");
            setActiveTab("complaints");
          }}
          title="Click to filter High Priority complaints"
        >
          <span>High Priority</span>
          <strong>{highPriorityCount}</strong>
          <small>Require immediate attention →</small>
        </div>
      </div>

      <div className="section-header">
        <div>
          <h2>Latest AI Results</h2>
          <p>Recently processed complaints with confidence metrics</p>
        </div>

        <button
          className="outline-btn"
          onClick={() => {
            handleResetFilters();
            setActiveTab("complaints");
          }}
        >
          View All Classified →
        </button>
      </div>

      <div className="classification-list">
        {complaints.slice(0, 6).map((item) => (
          <div
            className="classification-row clickable-row"
            key={item.id}
            onClick={() => setSelectedComplaint(item)}
            title="Click to inspect this classification"
          >
            <div className="classification-main">
              <span className="ai-small">✦</span>
              <div>
                <strong>{item.id}</strong>
                <p>{item.complaint}</p>
              </div>
            </div>

            <CategoryBadge category={item.category} />
            <PriorityBadge priority={item.priority} />

            <div className="confidence-pill">
              {item.confidence}% confidence
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics({
  complaints,
  setActiveTab,
  setCategoryFilter,
  setStatusFilter,
  setPriorityFilter,
  handleResetFilters,
}) {
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const highPriority = complaints.filter((c) => c.priority === "High").length;
  const mediumPriority = complaints.filter((c) => c.priority === "Medium").length;
  const lowPriority = complaints.filter((c) => c.priority === "Low").length;

  const [trendMode, setTrendMode] = useState("Daily");

  const trendHeights = {
    Daily: [35, 48, 40, 62, 55, 78, 67, 82, 72, 90, 78, 96],
    Weekly: [50, 65, 58, 80, 75, 88, 92, 85, 95, 90, 84, 98],
    Monthly: [60, 70, 75, 82, 80, 89, 94, 91, 95, 88, 92, 100],
  };

  return (
    <div className="page">
      <div className="analytics-grid">
        {/* Category Breakdown Bar Chart */}
        <div className="analytics-card large">
          <div className="chart-header">
            <div>
              <h3>Complaints by Category</h3>
              <p>Detailed category distribution (Click bar to filter)</p>
            </div>
            <span className="chart-hint-pill">Interactive</span>
          </div>

          <div className="bar-chart">
            {categories.map((category) => {
              const value = complaints.filter(
                (c) => c.category === category
              ).length;

              const height = Math.max(
                14,
                (value / Math.max(1, complaints.length)) * 100
              );

              return (
                <div
                  className="bar-item interactive-bar"
                  key={category}
                  onClick={() => {
                    handleResetFilters();
                    setCategoryFilter(category);
                    setActiveTab("complaints");
                  }}
                  title={`Filter complaints by ${category} (${value})`}
                >
                  <div className="bar-value">{value}</div>
                  <div
                    className="bar"
                    style={{
                      height: `${height}%`,
                      background: categoryColors[category],
                    }}
                  />
                  <span>{category.split("/")[0].split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Stats Card */}
        <div className="analytics-card">
          <div className="card-header-flex">
            <h3>Complaints by Priority</h3>
            <span className="card-action-sub">Click to filter</span>
          </div>

          <div
            className="priority-stat interactive-stat"
            onClick={() => {
              handleResetFilters();
              setPriorityFilter("High");
              setActiveTab("complaints");
            }}
            title="Filter High Priority"
          >
            <span className="dot red" />
            <label>High Priority</label>
            <strong>{highPriority}</strong>
          </div>

          <div
            className="priority-stat interactive-stat"
            onClick={() => {
              handleResetFilters();
              setPriorityFilter("Medium");
              setActiveTab("complaints");
            }}
            title="Filter Medium Priority"
          >
            <span className="dot orange" />
            <label>Medium Priority</label>
            <strong>{mediumPriority}</strong>
          </div>

          <div
            className="priority-stat interactive-stat"
            onClick={() => {
              handleResetFilters();
              setPriorityFilter("Low");
              setActiveTab("complaints");
            }}
            title="Filter Low Priority"
          >
            <span className="dot green" />
            <label>Low Priority</label>
            <strong>{lowPriority}</strong>
          </div>
        </div>

        {/* Status Progress Bars */}
        <div className="analytics-card">
          <div className="card-header-flex">
            <h3>Complaints by Status</h3>
            <span className="card-action-sub">Click to filter</span>
          </div>

          <div
            className="status-progress interactive-stat"
            onClick={() => {
              handleResetFilters();
              setStatusFilter("Resolved");
              setActiveTab("complaints");
            }}
            title="Filter Resolved Complaints"
          >
            <div>
              <span>Resolved</span>
              <strong>{resolved}</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${(resolved / Math.max(1, complaints.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div
            className="status-progress interactive-stat"
            onClick={() => {
              handleResetFilters();
              setStatusFilter("Pending");
              setActiveTab("complaints");
            }}
            title="Filter Pending Complaints"
          >
            <div>
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>
            <div className="progress orange-progress">
              <span
                style={{
                  width: `${(pending / Math.max(1, complaints.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div
            className="status-progress interactive-stat"
            onClick={() => {
              handleResetFilters();
              setStatusFilter("In Progress");
              setActiveTab("complaints");
            }}
            title="Filter In Progress Complaints"
          >
            <div>
              <span>In Progress</span>
              <strong>{inProgress}</strong>
            </div>
            <div className="progress purple-progress">
              <span
                style={{
                  width: `${(inProgress / Math.max(1, complaints.length)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Performance Metric Card */}
        <div className="analytics-card">
          <h3>Resolution Performance</h3>
          <div className="performance-number">2.4</div>
          <p>Average resolution days per ticket</p>

          <div className="performance-grid">
            <div>
              <strong>87%</strong>
              <span>Resolution Rate</span>
            </div>
            <div>
              <strong>94%</strong>
              <span>AI Accuracy</span>
            </div>
          </div>
        </div>

        {/* Trend Volume Card */}
        <div className="analytics-card large">
          <div className="chart-header">
            <h3>Complaint Inflow Activity</h3>
            <div className="trend-toggle-buttons">
              {["Daily", "Weekly", "Monthly"].map((mode) => (
                <button
                  key={mode}
                  className={`toggle-tab-btn ${trendMode === mode ? "active" : ""}`}
                  onClick={() => setTrendMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mini-trend">
            {trendHeights[trendMode].map((height, index) => (
              <div className="mini-bar" key={index}>
                <span
                  style={{ height: `${height}%` }}
                  title={`${trendMode} interval ${index + 1}: ${height} complaints`}
                />
              </div>
            ))}
          </div>

          <div className="trend-labels">
            <span>Interval 1</span>
            <span>Interval 4</span>
            <span>Interval 8</span>
            <span>Interval 12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintModal({ complaint, onClose, updateStatus }) {
  // Support closing with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          title="Close dialog"
          aria-label="Close dialog"
        >
          ×
        </button>

        <div className="modal-header">
          <div className="modal-icon">✦</div>
          <div>
            <span>{complaint.id}</span>
            <h2>Complaint Details</h2>
          </div>
        </div>

        <div className="modal-user">
          <div className="avatar">
            {complaint.user
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <strong>{complaint.user}</strong>
            <span>Submitted on {complaint.date}</span>
          </div>
        </div>

        <div className="modal-description">
          <label>Complaint Content</label>
          <p>{complaint.complaint}</p>
        </div>

        <div className="modal-grid">
          <div>
            <label>AI Category</label>
            <CategoryBadge category={complaint.category} />
          </div>

          <div>
            <label>Priority Level</label>
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div>
            <label>Confidence</label>
            <strong className="confidence">{complaint.confidence}%</strong>
          </div>

          <div>
            <label>Current Status</label>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="modal-actions">
          {complaint.status !== "Pending" && (
            <button
              className="outline-btn"
              onClick={() => updateStatus(complaint.id, "Pending")}
            >
              Reopen (Pending)
            </button>
          )}

          {complaint.status !== "In Progress" && (
            <button
              className="secondary-btn"
              onClick={() => updateStatus(complaint.id, "In Progress")}
            >
              Mark In Progress
            </button>
          )}

          {complaint.status !== "Resolved" && (
            <button
              className="success-btn"
              onClick={() => updateStatus(complaint.id, "Resolved")}
            >
              Mark Resolved ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }) {
  const color = categoryColors[category] || "#94a3b8";

  return (
    <span
      className="category-badge"
      style={{
        color: color,
        background: `${color}15`,
      }}
    >
      <span className="badge-dot" style={{ background: color }} />
      {category}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    High: "high",
    Medium: "medium",
    Low: "low",
  };

  return (
    <span className={`priority-badge ${styles[priority] || "medium"}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "pending",
    "In Progress": "progress-status",
    Resolved: "resolved",
  };

  return (
    <span className={`status-badge ${styles[status] || "pending"}`}>
      <span />
      {status}
    </span>
  );
}

export default App;