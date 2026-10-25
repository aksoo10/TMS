import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Database,
  MapPin,
  PlusCircle,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  Wrench
} from "lucide-react";

export default function Sidebar() {
  const { activeTab, setActiveTab, tools, sites, movements, inspections, logout, setSelectedSiteFilter } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Compute live badge counts
  const availableCount = tools.filter((t) => t.status === "Available").length;
  const checkedOutCount = tools.filter((t) => t.status === "Checked Out").length;
  const inspectionNeeded = tools.filter((t) => t.calibrationStatus === "Due Soon" || t.status === "In Inspection").length;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      desc: "Overview & Status Fleet"
    },
    {
      id: "tools-db",
      label: "Tools Database",
      icon: Database,
      badge: tools.length,
      badgeColor: "var(--atz-cyan)",
      desc: "Master Katalog & Barcode"
    },
    {
      id: "sites-db",
      label: "Site Database",
      icon: MapPin,
      badge: sites.length,
      badgeColor: "var(--color-purple)",
      desc: "Lokasi & Plant Operasional"
    },
    {
      id: "tools-register",
      label: "Tools Register",
      icon: PlusCircle,
      badge: "NEW",
      badgeColor: "var(--color-success)",
      desc: "Registrasi Alat Baru"
    },
    {
      id: "tools-movement",
      label: "Tools Movement",
      icon: ArrowLeftRight,
      badge: checkedOutCount,
      badgeColor: "var(--color-warning)",
      desc: "Check-Out / Check-In"
    },
    {
      id: "inspection",
      label: "Inspection & Form",
      icon: ClipboardCheck,
      badge: inspectionNeeded > 0 ? inspectionNeeded : null,
      badgeColor: "var(--color-danger)",
      desc: "Pemeriksaan & Sertifikasi"
    },
    {
      id: "historical",
      label: "Historical Logs",
      icon: History,
      badge: null,
      desc: "Audit Trail & Riwayat"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
      desc: "Statistik & Utilisasi"
    }
  ];

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width var(--transition-base)",
        position: "sticky",
        top: "var(--navbar-height)",
        height: "calc(100vh - var(--navbar-height))",
        zIndex: 90,
        userSelect: "none"
      }}
    >
      {/* Top Header / Collapser */}
      <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Wrench size={16} color="var(--atz-cyan)" />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)"
              }}
            >
              Navigasi Sistem
            </span>
          </div>
        )}

        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: "32px", height: "32px", padding: 0 }}
          title={collapsed ? "Perlebar menu" : "Kecilkan menu"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "tools-db") {
                  setSelectedSiteFilter("ALL");
                }
                setActiveTab(item.id);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "12px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isActive ? "var(--bg-surface-active)" : "transparent",
                color: isActive ? "var(--atz-cyan)" : "var(--text-secondary)",
                border: "1px solid",
                borderColor: isActive ? "rgba(0, 163, 224, 0.3)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
              title={collapsed ? item.label : undefined}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "15%",
                    bottom: "15%",
                    width: "3px",
                    backgroundColor: "var(--atz-cyan)",
                    borderRadius: "0 3px 3px 0"
                  }}
                />
              )}

              <Icon size={19} color={isActive ? "var(--atz-cyan)" : "currentColor"} />

              {!collapsed && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.925rem", fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </div>
                  </div>

                  {item.badge !== null && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "10px",
                        backgroundColor: item.badgeColor || "var(--bg-surface-elevated)",
                        color: "#ffffff"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Pinned Logout Button */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto"
        }}
      >
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: collapsed ? "12px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            color: "var(--color-danger)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all var(--transition-fast)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.18)";
            e.currentTarget.style.borderColor = "var(--color-danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
          }}
          title="Keluar dari sistem (Logout)"
        >
          <LogOut size={18} color="var(--color-danger)" />
          {!collapsed && (
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", fontWeight: 700 }}>
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
