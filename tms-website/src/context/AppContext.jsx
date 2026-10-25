import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_SITES,
  INITIAL_TOOLS,
  INITIAL_MOVEMENTS,
  INITIAL_INSPECTIONS,
  INITIAL_HISTORICAL
} from "../data/initialData";

const SITES_VERSION_KEY = "andritz_tms_sites_v4_ikpp_ikpd_oki1_oki2_tell_isc";

const sanitizeSites = (saved) => {
  if (!saved) return INITIAL_SITES;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_SITES;
    const hasOldSites = parsed.some(
      (s) =>
        s.id === "SITE-001" ||
        s.code === "ISC-PKU" ||
        s.name?.includes("Asahan") ||
        s.name?.includes("Pelalawan") ||
        s.name?.includes("Central Hub") ||
        s.name?.includes("Cilegon") ||
        s.name?.includes("Balikpapan")
    );
    const hasRequiredSites = ["Site IKPP", "Site IKPD", "Site OKI I", "Site OKI II", "Site TELL", "Site ISC"].every(
      (reqName) => parsed.some((s) => s.name === reqName)
    );
    if (hasOldSites || !hasRequiredSites) {
      return INITIAL_SITES;
    }
    return parsed;
  } catch (e) {
    return INITIAL_SITES;
  }
};

const sanitizeTools = (saved) => {
  if (!saved) return INITIAL_TOOLS;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TOOLS;
    const hasOldSites = parsed.some(
      (t) =>
        t.siteId === "SITE-001" ||
        t.siteName?.includes("Asahan") ||
        t.siteName?.includes("Pelalawan") ||
        t.siteName?.includes("Central Hub") ||
        t.siteName?.includes("Cilegon") ||
        t.siteName?.includes("Balikpapan")
    );
    if (hasOldSites) {
      return INITIAL_TOOLS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_TOOLS;
  }
};

const sanitizeMovements = (saved) => {
  if (!saved) return INITIAL_MOVEMENTS;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MOVEMENTS;
    const hasOldSites = parsed.some(
      (m) =>
        m.fromSite?.includes("Asahan") ||
        m.fromSite?.includes("Pelalawan") ||
        m.toSite?.includes("Asahan") ||
        m.toSite?.includes("Pelalawan") ||
        m.fromSite?.includes("Central Hub") ||
        m.toSite?.includes("Central Hub")
    );
    if (hasOldSites) {
      return INITIAL_MOVEMENTS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_MOVEMENTS;
  }
};

const sanitizeHistorical = (saved) => {
  if (!saved) return INITIAL_HISTORICAL;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_HISTORICAL;
    const hasOldSites = parsed.some(
      (h) =>
        h.site?.includes("Asahan") ||
        h.site?.includes("Pelalawan") ||
        h.site?.includes("Central Hub") ||
        h.site?.includes("Cilegon")
    );
    if (hasOldSites) {
      return INITIAL_HISTORICAL;
    }
    return parsed;
  } catch (e) {
    return INITIAL_HISTORICAL;
  }
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Authentication & User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("andritz_tms_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const matched = INITIAL_USERS.find(
          (usr) => usr.id === u.id || usr.roleSlug === u.roleSlug || usr.role === u.role
        );
        if (matched) return matched;
        return u;
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("andritz_tms_auth") !== "false";
  });

  // Authorization & Multi-Site Scope: Only Super Admin can view all sites.
  const isSuperAdmin = !currentUser || currentUser.roleSlug === "super-admin" || currentUser.site === "ALL";
  const userSite = isSuperAdmin ? "ALL" : currentUser?.site;
  const userSiteId = isSuperAdmin ? "ALL" : currentUser?.siteId;

  const isItemInUserScope = (itemSiteId, itemSiteName) => {
    if (isSuperAdmin) return true;
    if (!currentUser?.site) return true;

    // Check by ID
    if (itemSiteId && currentUser.siteId && itemSiteId === currentUser.siteId) {
      return true;
    }
    // Check by Name
    if (itemSiteName && (itemSiteName === currentUser.site || itemSiteName.toLowerCase() === currentUser.site.toLowerCase())) {
      return true;
    }
    // Check core site code
    const normalize = (s) => (s || "").replace(/^site\s+/i, "").trim().toLowerCase();
    const userNorm = normalize(currentUser.site);
    const itemNorm = normalize(itemSiteName);
    if (userNorm && itemNorm && userNorm === itemNorm) {
      return true;
    }
    return false;
  };

  // Navigation tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Theme: 'dark' (Engineering Blue) or 'light' (Technical Clean)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("andritz_tms_theme") || "dark";
  });

  // Global search query
  const [globalSearch, setGlobalSearch] = useState("");

  // Site filter state for cross-view navigation
  const [selectedSiteFilter, setSelectedSiteFilter] = useState(() => {
    return isSuperAdmin ? "ALL" : (currentUser?.siteId || "ALL");
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Data Collections with localStorage persistence and automatic migration to the 6 official sites
  const [sites, setSites] = useState(() => {
    const version = localStorage.getItem("andritz_tms_sites_version");
    if (version !== SITES_VERSION_KEY) {
      localStorage.setItem("andritz_tms_sites_version", SITES_VERSION_KEY);
      localStorage.setItem("andritz_tms_sites", JSON.stringify(INITIAL_SITES));
      return INITIAL_SITES;
    }
    const saved = localStorage.getItem("andritz_tms_sites");
    const sanitized = sanitizeSites(saved);
    if (sanitized === INITIAL_SITES) {
      localStorage.setItem("andritz_tms_sites", JSON.stringify(INITIAL_SITES));
    }
    return sanitized;
  });

  const [tools, setTools] = useState(() => {
    const version = localStorage.getItem("andritz_tms_sites_version");
    if (version !== SITES_VERSION_KEY) {
      localStorage.setItem("andritz_tms_tools", JSON.stringify(INITIAL_TOOLS));
      return INITIAL_TOOLS;
    }
    const saved = localStorage.getItem("andritz_tms_tools");
    const sanitized = sanitizeTools(saved);
    if (sanitized === INITIAL_TOOLS) {
      localStorage.setItem("andritz_tms_tools", JSON.stringify(INITIAL_TOOLS));
    }
    return sanitized;
  });

  const [movements, setMovements] = useState(() => {
    const version = localStorage.getItem("andritz_tms_sites_version");
    if (version !== SITES_VERSION_KEY) {
      localStorage.setItem("andritz_tms_movements", JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    const saved = localStorage.getItem("andritz_tms_movements");
    const sanitized = sanitizeMovements(saved);
    if (sanitized === INITIAL_MOVEMENTS) {
      localStorage.setItem("andritz_tms_movements", JSON.stringify(INITIAL_MOVEMENTS));
    }
    return sanitized;
  });

  const [inspections, setInspections] = useState(() => {
    const version = localStorage.getItem("andritz_tms_sites_version");
    if (version !== SITES_VERSION_KEY) {
      localStorage.setItem("andritz_tms_inspections", JSON.stringify(INITIAL_INSPECTIONS));
      return INITIAL_INSPECTIONS;
    }
    const saved = localStorage.getItem("andritz_tms_inspections");
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [historical, setHistorical] = useState(() => {
    const version = localStorage.getItem("andritz_tms_sites_version");
    if (version !== SITES_VERSION_KEY) {
      localStorage.setItem("andritz_tms_historical", JSON.stringify(INITIAL_HISTORICAL));
      return INITIAL_HISTORICAL;
    }
    const saved = localStorage.getItem("andritz_tms_historical");
    const sanitized = sanitizeHistorical(saved);
    if (sanitized === INITIAL_HISTORICAL) {
      localStorage.setItem("andritz_tms_historical", JSON.stringify(INITIAL_HISTORICAL));
    }
    return sanitized;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("andritz_tms_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_auth", isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_tools", JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_sites", JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_movements", JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_inspections", JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem("andritz_tms_historical", JSON.stringify(historical));
  }, [historical]);

  // Toast Dispatcher
  const showToast = (title, message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Functions
  const login = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.roleSlug === "super-admin" || user.site === "ALL") {
      setSelectedSiteFilter("ALL");
    } else {
      setSelectedSiteFilter(user.siteId || user.site);
    }
    showToast("Login Berhasil", `Selamat datang, ${user.name} (${user.role})`, "success");
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast("Logout", "Anda telah keluar dari sistem", "info");
  };

  const switchRole = (targetRoleOrId) => {
    const matched = INITIAL_USERS.find(
      (u) =>
        u.id === targetRoleOrId ||
        u.roleSlug === targetRoleOrId ||
        u.role === targetRoleOrId ||
        u.site === targetRoleOrId
    );
    if (matched) {
      setCurrentUser(matched);
      if (matched.roleSlug === "super-admin" || matched.site === "ALL") {
        setSelectedSiteFilter("ALL");
      } else {
        setSelectedSiteFilter(matched.siteId || matched.site);
      }
      showToast("Peran Dialihkan", `Mode aktif: ${matched.role} (${matched.site})`, "info");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Audit Log helper
  const addAuditLog = (eventType, toolCode, toolName, site, details) => {
    const newLog = {
      id: `HIST-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      eventType,
      toolCode: toolCode || "-",
      toolName: toolName || "-",
      user: currentUser ? currentUser.name : "System Operator",
      site: site || "Site ISC",
      details
    };
    setHistorical((prev) => [newLog, ...prev]);
  };

  // Tool Management Functions
  const addTool = (toolData) => {
    const newId = `TOOL-${String(tools.length + 1).padStart(3, "0")}`;
    const autoBarcode = toolData.barcode || `8990142${Math.floor(10000 + Math.random() * 90000)}`;
    const autoCode = toolData.code || `ATZ-${toolData.category?.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const siteObj = sites.find((s) => s.id === toolData.siteId) || sites[0];

    const createdTool = {
      ...toolData,
      id: newId,
      code: autoCode,
      barcode: autoBarcode,
      siteId: siteObj.id,
      siteName: siteObj.name,
      status: toolData.status || "Available",
      condition: toolData.condition || "Good",
      calibrationStatus: toolData.calibrationStatus || "Valid",
      purchaseDate: toolData.purchaseDate || new Date().toISOString().substring(0, 10),
      lastInspectionDate: toolData.lastInspectionDate || new Date().toISOString().substring(0, 10)
    };

    setTools((prev) => [createdTool, ...prev]);
    addAuditLog("Register", createdTool.code, createdTool.name, siteObj.name, `New tool registered under Material No ${createdTool.materialNo || "-"}`);
    showToast("Tools Terdaftar", `${createdTool.name} (${createdTool.code}) berhasil didaftarkan`, "success");
    return createdTool;
  };

  const updateTool = (id, updatedFields) => {
    setTools((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updatedFields };
          addAuditLog("Update", updated.code, updated.name, updated.siteName, `Data tool diperbarui`);
          return updated;
        }
        return t;
      })
    );
    showToast("Data Diperbarui", "Informasi tools berhasil disimpan", "success");
  };

  const deleteTool = (id) => {
    const target = tools.find((t) => t.id === id);
    if (!target) return;
    setTools((prev) => prev.filter((t) => t.id !== id));
    addAuditLog("Delete", target.code, target.name, target.siteName, `Tool dinonaktifkan / dihapus dari inventaris`);
    showToast("Tools Dihapus", `${target.code} dihapus dari inventaris`, "warning");
  };

  // Site Management Functions
  const addSite = (siteData) => {
    const newId = `SITE-${siteData.code || "NEW"}-${String(sites.length + 1).padStart(2, "0")}`;
    const newSite = {
      ...siteData,
      id: newId,
      activeToolsCount: 0,
      totalAssigned: 0,
      status: siteData.status || "Operational"
    };
    setSites((prev) => [...prev, newSite]);
    addAuditLog("Site Created", "-", "-", newSite.name, `Site baru didaftarkan: ${newSite.name}`);
    showToast("Site Ditambahkan", `Site ${newSite.name} berhasil disimpan`, "success");
    return newSite;
  };

  const updateSite = (id, siteData) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...siteData };
          addAuditLog("Site Updated", "-", "-", updated.name, `Informasi site diperbarui`);
          return updated;
        }
        return s;
      })
    );
    showToast("Site Diperbarui", "Data lokasi site berhasil disimpan", "success");
  };

  // Movement Functions (Check-Out, Check-In, Transfer)
  const checkOutTool = ({ toolId, borrowerName, borrowerId, destinationSiteId, workOrder, expectedReturnDate, notes }) => {
    const targetTool = tools.find((t) => t.id === toolId);
    if (!targetTool) {
      showToast("Error", "Tool tidak ditemukan", "error");
      return;
    }

    const destSite = sites.find((s) => s.id === destinationSiteId) || sites[0];

    const newMovement = {
      id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      toolId: targetTool.id,
      toolCode: targetTool.code,
      toolName: targetTool.name,
      type: "Check-Out",
      borrowerName,
      borrowerId: borrowerId || "EMP-" + Math.floor(1000 + Math.random() * 9000),
      fromSite: targetTool.siteName,
      toSite: destSite.name,
      workOrder: workOrder || "WO-GENERAL-" + Math.floor(100 + Math.random() * 900),
      checkoutDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      expectedReturnDate: expectedReturnDate || "2026-11-15",
      actualReturnDate: null,
      status: "Active",
      approvedBy: currentUser ? currentUser.name : "Supervisor",
      notes: notes || "Peminjaman operasional site"
    };

    setMovements((prev) => [newMovement, ...prev]);

    // Update tool status
    setTools((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              status: "Checked Out",
              assignedTo: `${borrowerName} (${newMovement.workOrder})`,
              siteName: destSite.name,
              siteId: destSite.id
            }
          : t
      )
    );

    addAuditLog("Check-Out", targetTool.code, targetTool.name, destSite.name, `Dipinjam oleh ${borrowerName} untuk ${newMovement.workOrder}`);
    showToast("Check-Out Berhasil", `${targetTool.code} dipinjam ke ${destSite.name}`, "success");
  };

  const checkInTool = (movementId, returnCondition = "Good", returnNotes = "") => {
    const movement = movements.find((m) => m.id === movementId);
    if (!movement) return;

    const returnTimestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    // Update movement record
    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId
          ? {
              ...m,
              status: "Returned",
              actualReturnDate: returnTimestamp,
              notes: `${m.notes ? m.notes + " | " : ""}Pengembalian: ${returnNotes || "Kondisi terverifikasi"}`
            }
          : m
      )
    );

    // Update tool status
    setTools((prev) =>
      prev.map((t) =>
        t.id === movement.toolId
          ? {
              ...t,
              status: returnCondition === "Damaged" ? "Maintenance" : "Available",
              condition: returnCondition,
              assignedTo: null
            }
          : t
      )
    );

    addAuditLog("Check-In", movement.toolCode, movement.toolName, movement.toSite, `Pengembalian dikonfirmasi. Kondisi: ${returnCondition}.`);
    showToast("Check-In Berhasil", `${movement.toolCode} telah dikembalikan dan diverifikasi`, "success");
  };

  const transferTool = ({ toolId, toSiteId, waybillNumber, notes }) => {
    const targetTool = tools.find((t) => t.id === toolId);
    if (!targetTool) return;
    const destSite = sites.find((s) => s.id === toSiteId) || sites[0];

    const newTransfer = {
      id: `MOV-TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      toolId: targetTool.id,
      toolCode: targetTool.code,
      toolName: targetTool.name,
      type: "Transfer",
      borrowerName: currentUser ? currentUser.name : "Logistics Officer",
      borrowerId: currentUser ? currentUser.id : "LOG-01",
      fromSite: targetTool.siteName,
      toSite: destSite.name,
      workOrder: waybillNumber || `SJ-${Date.now().toString().slice(-6)}`,
      checkoutDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      expectedReturnDate: "N/A",
      actualReturnDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Returned",
      approvedBy: currentUser ? currentUser.name : "Fleet Manager",
      notes: notes || "Relokasi armada antar site ISC"
    };

    setMovements((prev) => [newTransfer, ...prev]);

    setTools((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              siteId: destSite.id,
              siteName: destSite.name
            }
          : t
      )
    );

    addAuditLog("Transfer", targetTool.code, targetTool.name, destSite.name, `Relokasi ke ${destSite.name} via ${newTransfer.workOrder}`);
    showToast("Transfer Selesai", `${targetTool.code} dipindahkan ke ${destSite.name}`, "success");
  };

  const updateMovement = (id, updatedFields) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updatedFields };
          // If status was changed, keep tool status synchronized
          if (updatedFields.status && updatedFields.status !== m.status) {
            setTools((prevTools) =>
              prevTools.map((t) =>
                t.id === m.toolId
                  ? {
                      ...t,
                      status: updatedFields.status === "Active" ? "Checked Out" : "Available",
                      assignedTo: updatedFields.status === "Active" ? `${updated.borrowerName} (${updated.workOrder})` : null
                    }
                  : t
              )
            );
          }
          addAuditLog("Movement Update", updated.toolCode, updated.toolName, updated.toSite, `Data movement ${id} diperbarui (WO: ${updated.workOrder})`);
          return updated;
        }
        return m;
      })
    );
    showToast("Movement Diperbarui", "Data peminjaman berhasil disimpan", "success");
  };

  const deleteMovement = (id) => {
    const target = movements.find((m) => m.id === id);
    if (!target) return;

    // If movement was active, revert the tool status to Available
    if (target.status === "Active") {
      setTools((prev) =>
        prev.map((t) =>
          t.id === target.toolId
            ? { ...t, status: "Available", assignedTo: null }
            : t
        )
      );
    }

    setMovements((prev) => prev.filter((m) => m.id !== id));
    addAuditLog("Movement Delete", target.toolCode, target.toolName, target.toSite, `Catatan pergerakan ${id} dihapus dari sistem`);
    showToast("Movement Dihapus", `Catatan pergerakan ${id} telah dihapus`, "warning");
  };

  // Inspection Functions
  const submitInspection = (inspectionData) => {
    const targetTool = tools.find((t) => t.id === inspectionData.toolId);
    const certNo = `INSP-CERT-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().substring(0, 10);

    const newRecord = {
      id: `INSP-${Date.now().toString().slice(-6)}`,
      toolId: inspectionData.toolId,
      toolCode: targetTool ? targetTool.code : inspectionData.toolCode,
      toolName: targetTool ? targetTool.name : inspectionData.toolName,
      inspectionDate: today,
      inspectorName: currentUser ? currentUser.name : "QA Inspector",
      inspectorId: currentUser ? currentUser.id : "QA-01",
      siteName: targetTool ? targetTool.siteName : "ISC Depot",
      verdict: inspectionData.verdict, // Pass, Pass with Observation, Fail, Quarantine
      calibrationValid: inspectionData.calibrationValid !== false,
      certificateNo: certNo,
      checklist: inspectionData.checklist,
      findings: inspectionData.findings || "Pemeriksaan visual dan operasional telah dilaksanakan sesuai SOP ANDRITZ ISC.",
      nextInspectionDue: inspectionData.nextInspectionDue || "2027-01-25"
    };

    setInspections((prev) => [newRecord, ...prev]);

    // Update Tool status based on inspection verdict
    let newToolStatus = "Available";
    let newCondition = "Good";
    if (inspectionData.verdict === "Fail" || inspectionData.verdict === "Quarantine") {
      newToolStatus = "Maintenance";
      newCondition = "Needs Repair";
    } else if (inspectionData.verdict === "Pass with Observation") {
      newCondition = "Acceptable";
    }

    setTools((prev) =>
      prev.map((t) =>
        t.id === inspectionData.toolId
          ? {
              ...t,
              status: t.status === "Checked Out" ? "Checked Out" : newToolStatus,
              condition: newCondition,
              lastInspectionDate: today,
              calibrationStatus: inspectionData.calibrationValid ? "Valid" : "Overdue"
            }
          : t
      )
    );

    addAuditLog("Inspection", targetTool?.code, targetTool?.name, targetTool?.siteName, `Hasil: ${newRecord.verdict}. Sertifikat: ${certNo}`);
    showToast("Inspeksi Disimpan", `Sertifikat ${certNo} diterbitkan (${newRecord.verdict})`, newRecord.verdict.includes("Pass") ? "success" : "warning");
    return newRecord;
  };

  // Reset to initial demo database
  const resetToDefaults = () => {
    localStorage.removeItem("andritz_tms_tools");
    localStorage.removeItem("andritz_tms_sites");
    localStorage.removeItem("andritz_tms_movements");
    localStorage.removeItem("andritz_tms_inspections");
    localStorage.removeItem("andritz_tms_historical");
    setTools(INITIAL_TOOLS);
    setSites(INITIAL_SITES);
    setMovements(INITIAL_MOVEMENTS);
    setInspections(INITIAL_INSPECTIONS);
    setHistorical(INITIAL_HISTORICAL);
    showToast("Database Reset", "Data kembali ke konfigurasi awal ANDRITZ ISC", "info");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        isSuperAdmin,
        userSite,
        userSiteId,
        isItemInUserScope,
        INITIAL_USERS,
        login,
        logout,
        switchRole,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        globalSearch,
        setGlobalSearch,
        selectedSiteFilter,
        setSelectedSiteFilter,
        toasts,
        showToast,
        dismissToast,
        tools,
        sites,
        movements,
        inspections,
        historical,
        addTool,
        updateTool,
        deleteTool,
        addSite,
        updateSite,
        checkOutTool,
        checkInTool,
        transferTool,
        updateMovement,
        deleteMovement,
        submitInspection,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
