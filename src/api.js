const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

/**
 * ComplainAI API Client for Flask Backend
 */
export const api = {
  // 1. User Sign Up
  async signup(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to sign up.");
    }
    return data;
  },

  // 2. User Sign In / Login
  async signin(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to sign in.");
    }
    return data;
  },

  // 3. AI Classification
  async classify(textData) {
    const res = await fetch(`${API_BASE_URL}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(textData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "AI classification failed.");
    }
    return data;
  },

  // 4. Submit Complaint
  async submitComplaint(complaintData) {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(complaintData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit complaint.");
    }
    return data;
  },

  // 5. Get All Complaints
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") params.append("category", filters.category);
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.priority && filters.priority !== "All") params.append("priority", filters.priority);
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sort", filters.sortBy);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/complaints${query}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch complaints.");
    }
    return data;
  },

  // 6. Get Single Complaint
  async getComplaint(id) {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch complaint details.");
    }
    return data;
  },

  // 7. Update Complaint Status
  async updateStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update complaint status.");
    }
    return data;
  },

  // 8. Get Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch analytics.");
    }
    return data;
  },

  // 9. Health Check
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  },
};

export default api;
