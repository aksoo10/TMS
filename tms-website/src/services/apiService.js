/**
 * ANDRITZ ISC - Tool Management System (TMS)
 * Centralized API & Database Service Layer
 * Supports Localhost MySQL (via Laragon PHP API) and Cloud Standalone Mode (Vercel)
 */

// Determine base API endpoint
export const getApiBaseUrl = () => {
  // If explicitly specified in .env (e.g. VITE_API_BASE_URL=https://api.domain.com/api)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }

  // If running locally in browser (Laragon / localhost)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      // Points to Laragon Nginx/Apache virtual path
      return "http://localhost/TMS-ISC/api";
    }
  }

  // Fallback for Vercel or cloud deployments
  return "/api";
};

const API_BASE = getApiBaseUrl();

// Safe fetch helper with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const apiService = {
  getBaseUrl() {
    return API_BASE;
  },

  isLocalhost() {
    if (typeof window === "undefined") return false;
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
  },

  isVercel() {
    if (typeof window === "undefined") return false;
    return window.location.hostname.includes("vercel.app");
  },

  /**
   * Check connection to PHP / MySQL backend
   */
  async checkConnection() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/index.php`, { method: "GET" }, 2500);
      if (!res.ok) {
        return {
          connected: false,
          mode: this.isVercel() ? "vercel_standalone" : "offline",
          message: `Server returned status ${res.status}`,
          endpoint: API_BASE
        };
      }
      const data = await res.json();
      return {
        connected: true,
        mode: "mysql_connected",
        database: data.database || { name: "tms_isc" },
        statistics: data.statistics || {},
        endpoint: API_BASE,
        message: "Terhubung ke MySQL Database (Localhost / Remote)"
      };
    } catch (err) {
      return {
        connected: false,
        mode: this.isVercel() ? "vercel_standalone" : "offline",
        message: err.name === "AbortError" ? "Koneksi timeout" : err.message,
        endpoint: API_BASE
      };
    }
  },

  // 1. TOOLS CRUD
  async getTools(filter = {}) {
    const query = new URLSearchParams();
    if (filter.site && filter.site !== "ALL") query.append("site", filter.site);
    if (filter.status && filter.status !== "ALL") query.append("status", filter.status);
    if (filter.category && filter.category !== "ALL") query.append("category", filter.category);
    if (filter.q) query.append("q", filter.q);

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await fetchWithTimeout(`${API_BASE}/tools.php${qs}`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createTool(toolData) {
    const res = await fetchWithTimeout(`${API_BASE}/tools.php`, {
      method: "POST",
      body: JSON.stringify(toolData)
    });
    if (!res.ok) throw new Error(`Gagal menyimpan tool (HTTP ${res.status})`);
    return await res.json();
  },

  async updateTool(id, fields) {
    const res = await fetchWithTimeout(`${API_BASE}/tools.php?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...fields })
    });
    if (!res.ok) throw new Error(`Gagal update tool (HTTP ${res.status})`);
    return await res.json();
  },

  async deleteTool(id) {
    const res = await fetchWithTimeout(`${API_BASE}/tools.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Gagal menghapus tool (HTTP ${res.status})`);
    return await res.json();
  },

  // 2. SITES
  async getSites() {
    const res = await fetchWithTimeout(`${API_BASE}/sites.php`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  // 3. MOVEMENTS
  async getMovements() {
    const res = await fetchWithTimeout(`${API_BASE}/movements.php`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async checkoutTool(checkoutData) {
    const res = await fetchWithTimeout(`${API_BASE}/movements.php`, {
      method: "POST",
      body: JSON.stringify({ action: "checkout", ...checkoutData })
    });
    if (!res.ok) throw new Error(`Gagal checkout (HTTP ${res.status})`);
    return await res.json();
  },

  async checkinTool(movementId, returnCondition, notes) {
    const res = await fetchWithTimeout(`${API_BASE}/movements.php`, {
      method: "POST",
      body: JSON.stringify({ action: "checkin", movementId, condition: returnCondition, notes })
    });
    if (!res.ok) throw new Error(`Gagal checkin (HTTP ${res.status})`);
    return await res.json();
  },

  async transferTool(transferData) {
    const res = await fetchWithTimeout(`${API_BASE}/movements.php`, {
      method: "POST",
      body: JSON.stringify({ action: "transfer", ...transferData })
    });
    if (!res.ok) throw new Error(`Gagal transfer (HTTP ${res.status})`);
    return await res.json();
  },

  // 4. INSPECTIONS
  async getInspections() {
    const res = await fetchWithTimeout(`${API_BASE}/inspections.php`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createInspection(inspectionData) {
    const res = await fetchWithTimeout(`${API_BASE}/inspections.php`, {
      method: "POST",
      body: JSON.stringify(inspectionData)
    });
    if (!res.ok) throw new Error(`Gagal simpan inspeksi (HTTP ${res.status})`);
    return await res.json();
  },

  // 5. HISTORICAL AUDIT
  async getHistorical() {
    const res = await fetchWithTimeout(`${API_BASE}/historical.php`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  }
};

export default apiService;
