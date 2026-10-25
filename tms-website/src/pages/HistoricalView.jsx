import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useApp } from "../context/AppContext";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ClipboardCheck,
  PlusCircle,
  Truck,
  Edit,
  Trash2,
  FileSpreadsheet,
  Lock,
  Globe2
} from "lucide-react";

export default function HistoricalView() {
  const { historical, sites, currentUser, isSuperAdmin, isItemInUserScope } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState("ALL");

  const filteredLogs = historical.filter((log) => {
    // If site admin, only show logs relating to user's site
    if (!isSuperAdmin && !isItemInUserScope(null, log.site)) {
      return false;
    }

    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.toolCode.toLowerCase().includes(q) ||
      log.toolName.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.site.toLowerCase().includes(q);

    const matchesType = eventTypeFilter === "ALL" || log.eventType === eventTypeFilter;
    const matchesSite = !isSuperAdmin || siteFilter === "ALL" || log.site.toLowerCase().includes(siteFilter.toLowerCase());

    return matchesSearch && matchesType && matchesSite;
  });

  const getEventBadge = (type) => {
    switch (type) {
      case "Check-Out":
        return (
          <span className="status-pill status-checked-out" style={{ gap: "4px" }}>
            <ArrowUpRight size={12} /> Check-Out
          </span>
        );
      case "Check-In":
        return (
          <span className="status-pill status-available" style={{ gap: "4px" }}>
            <ArrowDownLeft size={12} /> Check-In
          </span>
        );
      case "Inspection":
        return (
          <span className="status-pill status-in-inspection" style={{ gap: "4px" }}>
            <ClipboardCheck size={12} /> Inspection
          </span>
        );
      case "Register":
        return (
          <span className="status-pill" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "var(--color-purple)", border: "1px solid rgba(139, 92, 246, 0.3)", gap: "4px" }}>
            <PlusCircle size={12} /> Registered
          </span>
        );
      case "Transfer":
        return (
          <span className="status-pill" style={{ backgroundColor: "rgba(0, 163, 224, 0.15)", color: "var(--atz-cyan)", border: "1px solid rgba(0, 163, 224, 0.3)", gap: "4px" }}>
            <Truck size={12} /> Transfer
          </span>
        );
      default:
        return <span className="status-pill">{type}</span>;
    }
  };

  const handleExportAuditExcel = () => {
    const exportData = filteredLogs.map((l, idx) => ({
      "No": idx + 1,
      "Log ID": l.id || "-",
      "Timestamp": l.timestamp || "-",
      "Event Type": l.eventType || "-",
      "Tool Code": l.toolCode || "-",
      "Tool Name": l.toolName || "-",
      "Operator / User": l.user || "-",
      "Site Location": l.site || "-",
      "Activity Details": l.details || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set custom column widths
    ws["!cols"] = [
      { wch: 6 },   // No
      { wch: 16 },  // Log ID
      { wch: 22 },  // Timestamp
      { wch: 18 },  // Event Type
      { wch: 18 },  // Tool Code
      { wch: 42 },  // Tool Name
      { wch: 24 },  // Operator / User
      { wch: 20 },  // Site Location
      { wch: 65 }   // Activity Details
    ];

    if (ws["!ref"]) {
      ws["!autofilter"] = { ref: ws["!ref"] };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail Logs");

    const dateStr = new Date().toISOString().substring(0, 10);
    XLSX.writeFile(wb, `ANDRITZ_Audit_Trail_${dateStr}.xlsx`);
  };

  const handleExportAuditCSV = () => {
    const headers = ["No", "ID Log", "Timestamp", "Event Type", "Tool Code", "Tool Name", "Operator User", "Site Location", "Details"];
    const rows = filteredLogs.map((l, idx) => [
      idx + 1,
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.eventType}"`,
      `"${l.toolCode}"`,
      `"${(l.toolName || "").replace(/"/g, '""')}"`,
      `"${l.user}"`,
      `"${l.site}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ANDRITZ_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--atz-cyan)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px"
            }}
          >
            <span>Audit Trail & Integritas Data</span>
            <span>•</span>
            <span>Module 8</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Historical Activity Logs (Audit Trail)</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Rekaman kronologis terverifikasi atas seluruh transaksi peminjaman, pengembalian, pergantian status, hasil inspeksi, dan pergerakan aset.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportAuditExcel}
            title="Download audit trail terformat rapi (.xlsx) - Kolom pas, tidak perlu resize manual"
            style={{
              borderColor: "rgba(16, 185, 129, 0.45)",
              color: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Multi-Site Access Scope Alert Banner */}
      {!isSuperAdmin ? (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "0.825rem",
            color: "var(--text-secondary)",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={16} color="var(--color-warning)" />
            <span>
              <strong style={{ color: "var(--color-warning)" }}>Audit Trail Terisolasi Admin Site ({currentUser?.site}):</strong> Anda hanya melihat rekaman log dan riwayat transaksi pada <strong>{currentUser?.site}</strong>. Sesuai regulasi sistem, hanya <strong>Super Admin</strong> yang dapat mengaudit seluruh site.
            </span>
          </div>
          <span className="status-pill status-checked-out" style={{ fontSize: "0.72rem" }}>
            {filteredLogs.length} Log di Site Ini
          </span>
        </div>
      ) : (
        <div
          style={{
            padding: "10px 18px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(0, 163, 224, 0.1)",
            border: "1px solid rgba(0, 163, 224, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe2 size={15} color="var(--atz-cyan)" />
            <span>
              <strong style={{ color: "var(--atz-cyan)" }}>Audit Trail Global Super Admin:</strong> Mengaudit seluruh riwayat transaksi di <strong>seluruh 6 site</strong> ANDRITZ (OKI I, OKI II, TELL, ISC, IKPP, IKPD).
            </span>
          </div>
          <span className="status-pill status-available" style={{ fontSize: "0.72rem" }}>
            {historical.length} Total Log Global
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 320px", position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: "36px" }}
              placeholder="Cari aktivitas, nama user, kode alat, atau nomor rujukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="form-select"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="ALL">Semua Tipe Aktivitas</option>
              <option value="Check-Out">Check-Out (Peminjaman)</option>
              <option value="Check-In">Check-In (Pengembalian)</option>
              <option value="Inspection">Inspection (Inspeksi QA)</option>
              <option value="Register">Register (Alat Baru)</option>
              <option value="Transfer">Transfer Antar Site</option>
            </select>

            {isSuperAdmin ? (
              <select
                className="form-select"
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="ALL">Semua Site (Global)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <div
                style={{
                  height: "38px",
                  fontSize: "0.825rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "var(--color-warning)"
                }}
                title={`Akses dibatasi khusus ${currentUser?.site}`}
              >
                <Lock size={12} />
                <span style={{ fontWeight: 700 }}>{currentUser?.site || "Site Anda"}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div>
            Menampilkan <strong>{filteredLogs.length}</strong> entri riwayat aktivitas tercatat
          </div>
          {(searchTerm || eventTypeFilter !== "ALL" || siteFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setEventTypeFilter("ALL");
                setSiteFilter("ALL");
              }}
              style={{ background: "transparent", border: "none", color: "var(--atz-cyan)", cursor: "pointer", fontWeight: 600 }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Historical Audit Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Log</th>
                <th>Waktu / Timestamp</th>
                <th>Tipe Transaksi</th>
                <th>Peralatan (Tool)</th>
                <th>Operator / Pelaksana</th>
                <th>Lokasi Site</th>
                <th>Detail & Catatan Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Tidak ada aktivitas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-mono" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {log.id}
                      </span>
                    </td>

                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {log.timestamp}
                    </td>

                    <td>{getEventBadge(log.eventType)}</td>

                    <td>
                      {log.toolCode !== "-" ? (
                        <div>
                          <span className="font-mono" style={{ fontWeight: 700, color: "var(--atz-cyan)" }}>
                            {log.toolCode}
                          </span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {log.toolName}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>-</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: "var(--bg-surface-elevated)",
                            border: "1px solid var(--border-medium)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: 700
                          }}
                        >
                          {log.user ? log.user.substring(0, 2).toUpperCase() : "OP"}
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{log.user}</span>
                      </div>
                    </td>

                    <td style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                      {log.site}
                    </td>

                    <td style={{ fontSize: "0.825rem", color: "var(--text-primary)" }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
