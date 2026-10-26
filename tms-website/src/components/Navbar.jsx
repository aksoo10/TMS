import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  Search,
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe2,
  ChevronDown,
  Shield,
  MapPin,
  CheckCheck,
  Clock,
  X,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Tag,
  Database,
  Cloud
} from "lucide-react";
import DatabaseSyncModal from "./DatabaseSyncModal";

export default function Navbar() {
  const {
    currentUser,
    logout,
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    tools,
    movements,
    inspections,
    isSuperAdmin,
    isItemInUserScope,
    switchRole,
    INITIAL_USERS,
    showToast,
    dbStatus,
    isSyncModalOpen,
    setIsSyncModalOpen
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all"); // 'all' | 'critical'

  // Persistent read and dismissed notification IDs
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("andritz_tms_read_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("andritz_tms_dismissed_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notifRef = useRef(null);
  const roleRef = useRef(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNotifDropdown(false);
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Compute live, dynamic notifications based on real asset fleet state
  const allNotifications = useMemo(() => {
    const list = [];

    // 1. QA Inspections Fail / Quarantined
    inspections.forEach((insp) => {
      if (insp.verdict === "Fail") {
        const toolObj = tools.find((t) => t.id === insp.toolId || t.code === insp.toolCode);
        const site = insp.siteName || toolObj?.siteName;
        if (!isSuperAdmin && !isItemInUserScope(toolObj?.siteId, site)) return;

        list.push({
          id: `notif-insp-${insp.id}`,
          type: "qa_defect",
          severity: "danger",
          title: `Karantina QA: ${insp.toolCode}`,
          message: `${insp.toolName || "Alat"} di ${site || "Site ISC"} tidak lolos uji mutu QA. ${insp.findings || "Memerlukan perbaikan segera sebelum dapat beroperasi."}`,
          time: insp.inspectionDate ? `Inspeksi: ${insp.inspectionDate}` : "Pemeriksaan QA",
          targetTab: "inspection",
          targetSearch: insp.toolCode,
          badgeText: "QA DEFECT",
          siteName: site || "Site ISC"
        });
      }
    });

    // 2. Tools Maintenance / Damaged
    tools.forEach((tool) => {
      if (tool.status === "Maintenance" || tool.status === "Damaged" || tool.condition === "Needs Repair") {
        if (!isSuperAdmin && !isItemInUserScope(tool.siteId, tool.siteName)) return;

        const alreadyAdded = list.some((n) => n.targetSearch === tool.code && n.type === "qa_defect");
        if (!alreadyAdded) {
          list.push({
            id: `notif-maint-${tool.id}`,
            type: "maintenance",
            severity: "danger",
            title: `Unit Maintenance: ${tool.code}`,
            message: `${tool.name} di ${tool.siteName} (${tool.binLocation}) berstatus ${tool.status}. Membutuhkan jadwal perbaikan teknisi.`,
            time: `Status: ${tool.status}`,
            targetTab: "tools-db",
            targetSearch: tool.code,
            badgeText: "MAINTENANCE",
            siteName: tool.siteName
          });
        }
      }
    });

    // 3. Kalibrasi Kadaluarsa (Overdue) & Jatuh Tempo Segera (Due Soon)
    tools.forEach((tool) => {
      if (!isSuperAdmin && !isItemInUserScope(tool.siteId, tool.siteName)) return;

      if (tool.calibrationStatus === "Overdue") {
        list.push({
          id: `notif-cal-overdue-${tool.id}`,
          type: "cal_overdue",
          severity: "danger",
          title: `Kalibrasi Expired: ${tool.code}`,
          message: `Sertifikasi kalibrasi ${tool.name} telah kadaluarsa (${tool.nextCalibrationDate || "Lewat Waktu"}). Dilarang digunakan untuk pekerjaan berisiko tinggi.`,
          time: `Expired: ${tool.nextCalibrationDate || "-"}`,
          targetTab: "tools-db",
          targetSearch: tool.code,
          badgeText: "EXPIRED",
          siteName: tool.siteName
        });
      } else if (tool.calibrationStatus === "Due Soon") {
        list.push({
          id: `notif-cal-duesoon-${tool.id}`,
          type: "cal_due_soon",
          severity: "warning",
          title: `Jatuh Tempo Kalibrasi: ${tool.code}`,
          message: `Perkakas presisi ${tool.name} di ${tool.siteName} wajib dijadwalkan uji kalibrasi sebelum ${tool.nextCalibrationDate}.`,
          time: `Jatuh Tempo: ${tool.nextCalibrationDate}`,
          targetTab: "tools-db",
          targetSearch: tool.code,
          badgeText: "DUE SOON",
          siteName: tool.siteName
        });
      }
    });

    // 4. Peminjaman Aktif / Jatuh Tempo Pengembalian (Movements)
    movements.forEach((mov) => {
      if (mov.status === "Active") {
        if (!isSuperAdmin) {
          const matchFrom = isItemInUserScope(null, mov.fromSite);
          const matchTo = isItemInUserScope(null, mov.toSite);
          if (!matchFrom && !matchTo) return;
        }

        list.push({
          id: `notif-mov-${mov.id}`,
          type: "borrow_active",
          severity: "warning",
          title: `Peminjaman Aktif: ${mov.toolCode}`,
          message: `Sedang digunakan oleh ${mov.borrowerName} (${mov.workOrder}) di ${mov.toSite}. Target kembali: ${mov.expectedReturnDate || "-"}.`,
          time: `Target Kembali: ${mov.expectedReturnDate || "Aktif"}`,
          targetTab: "tools-movement",
          targetSearch: mov.toolCode,
          badgeText: "DIPINJAM",
          siteName: mov.toSite
        });
      }
    });

    // Filter out dismissed notifications
    return list.filter((item) => !dismissedNotifIds.includes(item.id));
  }, [tools, inspections, movements, isSuperAdmin, isItemInUserScope, dismissedNotifIds]);

  const unreadCount = allNotifications.filter((n) => !readNotifIds.includes(n.id)).length;
  const criticalCount = allNotifications.filter((n) => n.severity === "danger").length;

  const displayedNotifications = useMemo(() => {
    if (notifFilter === "critical") {
      return allNotifications.filter((n) => n.severity === "danger");
    }
    return allNotifications;
  }, [allNotifications, notifFilter]);

  const markAsRead = (id) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem("andritz_tms_read_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem("andritz_tms_read_notifs", JSON.stringify(allIds));
    if (showToast) {
      showToast("Semua Dibaca", `${allNotifications.length} notifikasi ditandai sebagai sudah dibaca`, "info");
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("andritz_tms_dismissed_notifs", JSON.stringify(updated));
      return updated;
    });
    if (showToast) {
      showToast("Notifikasi Diarsipkan", "Peringatan telah dihapus dari daftar notifikasi", "info");
    }
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifDropdown(false);
    if (notif.targetSearch) {
      setGlobalSearch(notif.targetSearch);
    }
    setActiveTab(notif.targetTab);
    if (showToast) {
      showToast(notif.title, `Membuka modul ${notif.targetTab === "inspection" ? "Inspeksi QA" : notif.targetTab === "tools-movement" ? "Tools Movement" : "Tools Database"}`, notif.severity);
    }
  };

  return (
    <header
      style={{
        height: "var(--navbar-height)",
        backgroundColor: "#000000",
        borderBottom: "1px solid #1E293B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.8)"
      }}
    >
      {/* Brand & Subtitle */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div
          onClick={() => setActiveTab("dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          {/* Official ANDRITZ Logo (Gambar 1) */}
          <img
            src="/andritz-logo-blue.png"
            alt="ANDRITZ"
            style={{
              height: "34px",
              width: "auto",
              objectFit: "contain",
              display: "block"
            }}
          />

          <div style={{ borderLeft: "1px solid #334155", paddingLeft: "14px" }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: "700",
                fontSize: "1rem",
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ color: "#FFFFFF" }}>ISC</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.5, color: "#94A3B8" }}>|</span>
              <span style={{ color: "var(--atz-cyan)" }}>Tool Management System</span>
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#94A3B8",
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}
            >
              Indonesia Service Center
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Profile: Search Bar, Notifications, Site Scope Badge, User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Global Quick Search (White background) */}
        <div style={{ width: "300px", position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748B"
            }}
          />
          <input
            type="text"
            className="form-control"
            style={{
              paddingLeft: "38px",
              paddingRight: "14px",
              height: "38px",
              fontSize: "0.85rem",
              borderRadius: "20px",
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              color: "#0F172A",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)"
            }}
            placeholder="Cari tool, barcode, material no..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveTab("tools-db");
              }
            }}
          />
        </div>

        {/* Site Scope Pill Badge */}
        {isSuperAdmin ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "rgba(0, 163, 224, 0.18)",
              border: "1px solid rgba(0, 163, 224, 0.4)",
              color: "var(--atz-cyan)",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.02em"
            }}
            title="Akses Super Admin: Menampilkan seluruh 6 site ANDRITZ"
          >
            <Globe2 size={13} />
            <span>Semua Site (Super Admin)</span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              color: "var(--color-warning)",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.02em"
            }}
            title={`Akses Terbatas: Hanya data ${currentUser?.site}`}
          >
            <Lock size={12} />
            <span>{currentUser?.site || "Site Admin"}</span>
          </div>
        )}

        {/* Database & Cloud Sync Status Badge */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "20px",
            backgroundColor: dbStatus?.online ? "rgba(16, 185, 129, 0.16)" : "rgba(245, 158, 11, 0.16)",
            border: dbStatus?.online ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid rgba(245, 158, 11, 0.45)",
            color: "#FFFFFF",
            cursor: "pointer",
            fontSize: "0.74rem",
            fontWeight: 700,
            transition: "all var(--transition-fast)"
          }}
          title="Klik untuk membuka Pusat Sinkronisasi Database Localhost & Vercel"
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: dbStatus?.online ? "#10B981" : "#F59E0B",
              boxShadow: dbStatus?.online ? "0 0 6px #10B981" : "0 0 6px #F59E0B"
            }}
          />
          {dbStatus?.online ? (
            <>
              <Database size={13} color="#10B981" />
              <span>MySQL ({tools.length})</span>
            </>
          ) : (
            <>
              <Cloud size={13} color="#F59E0B" />
              <span>Cloud / Sync ({tools.length})</span>
            </>
          )}
        </button>

        {/* Notification Bell with Dynamic Unread Badge */}

        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowRoleDropdown(false);
            }}
            title="Pusat Notifikasi & Peringatan Fleet"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: showNotifDropdown ? "rgba(0, 163, 224, 0.22)" : "rgba(255, 255, 255, 0.08)",
              border: showNotifDropdown ? "1px solid var(--atz-cyan)" : "1px solid rgba(255, 255, 255, 0.16)",
              color: showNotifDropdown ? "var(--atz-cyan)" : "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => {
              if (!showNotifDropdown) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.16)";
            }}
            onMouseLeave={(e) => {
              if (!showNotifDropdown) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  padding: "0 4px",
                  background: "var(--color-danger)",
                  color: "#FFFFFF",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 8px rgba(239, 68, 68, 0.7)",
                  border: "2px solid #000000",
                  lineHeight: 1
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "46px",
                width: "400px",
                maxWidth: "90vw",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "0",
                overflow: "hidden",
                zIndex: 200,
                color: "var(--text-primary)",
                animation: "modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={16} color="var(--atz-cyan)" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Notifikasi Fleet ISC</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        backgroundColor: "rgba(239, 68, 68, 0.12)",
                        color: "var(--color-danger)",
                        border: "1px solid rgba(239, 68, 68, 0.3)"
                      }}
                    >
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--atz-cyan)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      transition: "background var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    title="Tandai semua notifikasi sebagai sudah dibaca"
                  >
                    <CheckCheck size={14} />
                    <span>Tandai Dibaca</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div
                style={{
                  display: "flex",
                  padding: "8px 12px",
                  gap: "6px",
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)"
                }}
              >
                <button
                  onClick={() => setNotifFilter("all")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "0.74rem",
                    fontWeight: notifFilter === "all" ? 700 : 500,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: notifFilter === "all" ? "var(--bg-surface-active)" : "transparent",
                    color: notifFilter === "all" ? "var(--atz-cyan)" : "var(--text-muted)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  Semua ({allNotifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter("critical")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "0.74rem",
                    fontWeight: notifFilter === "critical" ? 700 : 500,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: notifFilter === "critical" ? "rgba(239, 68, 68, 0.12)" : "transparent",
                    color: notifFilter === "critical" ? "var(--color-danger)" : "var(--text-muted)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  Kritis / Defect ({criticalCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: "330px", overflowY: "auto", padding: "8px" }}>
                {displayedNotifications.length === 0 ? (
                  <div style={{ padding: "34px 20px", textAlign: "center" }}>
                    <ShieldCheck size={38} color="var(--color-success)" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                      Semua Armada Siap Operasional
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Tidak ada peringatan kritis atau kalibrasi kadaluarsa saat ini.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {displayedNotifications.map((notif) => {
                      const isUnread = !readNotifIds.includes(notif.id);
                      const isDanger = notif.severity === "danger";

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: isUnread
                              ? (isDanger ? "rgba(239, 68, 68, 0.05)" : "var(--bg-surface-elevated)")
                              : "transparent",
                            border: "1px solid",
                            borderColor: isUnread
                              ? (isDanger ? "rgba(239, 68, 68, 0.3)" : "rgba(0, 163, 224, 0.25)")
                              : "var(--border-subtle)",
                            cursor: "pointer",
                            transition: "all var(--transition-fast)",
                            position: "relative"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDanger
                              ? "rgba(239, 68, 68, 0.1)"
                              : "var(--bg-surface-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isUnread
                              ? (isDanger ? "rgba(239, 68, 68, 0.05)" : "var(--bg-surface-elevated)")
                              : "transparent";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                              {/* Severity Icon */}
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  backgroundColor: isDanger ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}
                              >
                                {isDanger ? (
                                  <AlertTriangle size={15} color="var(--color-danger)" />
                                ) : (
                                  <Clock size={15} color="var(--color-warning)" />
                                )}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: isDanger ? "var(--color-danger)" : "var(--text-primary)" }}>
                                    {notif.title}
                                  </span>
                                  {isUnread && (
                                    <span
                                      style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--atz-cyan)",
                                        display: "inline-block",
                                        flexShrink: 0
                                      }}
                                      title="Belum dibaca"
                                    />
                                  )}
                                </div>
                                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px" }}>
                                  <span style={{ fontWeight: 600 }}>{notif.siteName}</span> • <span className="font-mono">{notif.badgeText}</span>
                                </div>
                              </div>
                            </div>

                            {/* Dismiss X button */}
                            <button
                              onClick={(e) => handleDismiss(e, notif.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Hapus / Arsipkan notifikasi"
                              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div
                            style={{
                              fontSize: "0.77rem",
                              color: "var(--text-secondary)",
                              margin: "6px 0 6px 36px",
                              lineHeight: "1.4"
                            }}
                          >
                            {notif.message}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginLeft: "36px",
                              fontSize: "0.7rem",
                              color: "var(--text-muted)"
                            }}
                          >
                            <span>{notif.time}</span>
                            <span
                              style={{
                                color: "var(--atz-cyan)",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                            >
                              Buka modul <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Action */}
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <button
                  onClick={() => {
                    setActiveTab("historical");
                    setShowNotifDropdown(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--atz-cyan)",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>Buka Riwayat Lengkap di Historical Logs</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Role & Site Switcher Dropdown */}
        <div ref={roleRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowNotifDropdown(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px 4px 6px",
              borderRadius: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              cursor: "pointer",
              color: "#FFFFFF"
            }}
            title="Klik untuk beralih Admin Site / Super Admin"
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: isSuperAdmin ? "var(--atz-cyan)" : (currentUser?.badgeColor || "#10B981"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "0.75rem",
                fontFamily: "var(--font-heading)"
              }}
            >
              {currentUser?.avatar || "OP"}
            </div>
            <div style={{ textAlign: "left", lineHeight: "1.2" }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                {currentUser?.name?.split(" ")[0] || "User"}
              </div>
              <div style={{ fontSize: "0.66rem", color: "#94A3B8", whiteSpace: "nowrap" }}>
                {isSuperAdmin ? "Super Admin" : currentUser?.site}
              </div>
            </div>
            <ChevronDown size={14} color="#94A3B8" />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "290px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "12px",
                zIndex: 200,
                color: "var(--text-primary)"
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  paddingBottom: "8px",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "8px"
                }}
              >
                Ganti Akun Demo (Hak Akses Site)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {INITIAL_USERS?.map((usr) => {
                  const isCurrent = currentUser?.id === usr.id;
                  const isSuper = usr.roleSlug === "super-admin";
                  return (
                    <div
                      key={usr.id}
                      onClick={() => {
                        switchRole(usr.id);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "6px",
                        backgroundColor: isCurrent ? "var(--bg-surface-active)" : "transparent",
                        border: isCurrent ? "1px solid var(--atz-cyan)" : "1px solid transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "background var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: usr.badgeColor || (isSuper ? "#00A3E0" : "#10B981")
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isCurrent ? "var(--atz-cyan)" : "var(--text-primary)" }}>
                            {usr.role}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            {usr.name} • {usr.site}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <CheckCircle2 size={14} color="var(--atz-cyan)" />}
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "8px", paddingTop: "8px" }}>
                <button
                  onClick={logout}
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center", gap: "6px", fontSize: "0.76rem", color: "var(--color-danger)" }}
                >
                  <LogOut size={13} />
                  Keluar ke Halaman Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Keluar / Ganti Akun"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
          }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Database & Cloud Sync Modal */}
      <DatabaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </header>
  );
}

