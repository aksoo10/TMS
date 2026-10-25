import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Search,
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export default function Navbar() {
  const {
    currentUser,
    logout,
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    movements,
    inspections
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Compute urgent notifications
  const overdueMovements = movements.filter((m) => m.status === "Active");
  const pendingInspections = inspections.filter((i) => i.verdict === "Fail");

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

      {/* Actions & Profile: Search Bar (White) next to Notification Bell */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Global Quick Search (White background, positioned next to notification bell) */}
        <div style={{ width: "320px", position: "relative" }}>
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

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifikasi & Peringatan Fleet"
          >
            <Bell size={17} />
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-danger)"
              }}
            />
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "46px",
                width: "320px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "16px",
                zIndex: 200
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-subtle)",
                  paddingBottom: "8px",
                  marginBottom: "12px"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Notifikasi Fleet ISC</div>
                <span className="status-pill status-checked-out" style={{ fontSize: "0.7rem" }}>
                  {overdueMovements.length} Aktif
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                {pendingInspections.length > 0 && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontSize: "0.8rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={14} /> 1 Tool Quarantined
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      Flange Spreader ATZ-FLG-601 memerlukan perbaikan coupler.
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    fontSize: "0.8rem"
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--atz-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={14} /> Kalibrasi Terjadwal
                  </div>
                  <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                    Vibration Analyzer ATZ-VIB-201 jatuh tempo kalibrasi 1 Nov 2026.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "6px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--atz-navy-700)",
              border: "2px solid var(--atz-cyan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.85rem",
              fontFamily: "var(--font-heading)"
            }}
          >
            {currentUser?.avatar || "OP"}
          </div>

          <button
            className="btn btn-secondary btn-icon"
            onClick={logout}
            title="Keluar / Ganti Akun"
            style={{ color: "var(--color-danger)" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
