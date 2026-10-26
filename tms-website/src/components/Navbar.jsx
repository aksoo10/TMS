import React, { useState } from "react";
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
  MapPin
} from "lucide-react";

export default function Navbar() {
  const {
    currentUser,
    logout,
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    movements,
    inspections,
    isSuperAdmin,
    switchRole,
    INITIAL_USERS
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

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

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowRoleDropdown(false);
            }}
            title="Notifikasi & Peringatan Fleet"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              color: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <Bell size={17} />
            <span
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
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
                zIndex: 200,
                color: "var(--text-primary)"
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

        {/* Quick Role & Site Switcher Dropdown */}
        <div style={{ position: "relative" }}>
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
    </header>
  );
}
