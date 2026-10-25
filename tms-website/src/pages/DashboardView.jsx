import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ArrowRight,
  PlusCircle,
  ArrowLeftRight,
  ClipboardCheck,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import BarcodeModal from "../components/BarcodeModal";

export default function DashboardView() {
  const { tools, sites, movements, inspections, setActiveTab } = useApp();
  const [selectedToolForBarcode, setSelectedToolForBarcode] = useState(null);

  // Compute live statistics
  const totalTools = tools.length;
  const availableTools = tools.filter((t) => t.status === "Available");
  const checkedOutTools = tools.filter((t) => t.status === "Checked Out");
  const maintenanceTools = tools.filter((t) => t.status === "Maintenance" || t.status === "Damaged");
  const inInspectionTools = tools.filter((t) => t.status === "In Inspection");
  const calibrationDue = tools.filter((t) => t.calibrationStatus === "Due Soon" || t.calibrationStatus === "Overdue");

  const availabilityRate = totalTools > 0 ? Math.round((availableTools.length / totalTools) * 100) : 0;
  const utilizationRate = totalTools > 0 ? Math.round((checkedOutTools.length / totalTools) * 100) : 0;

  // Recent 5 movements
  const recentMovements = movements.slice(0, 5);

  return (
    <div style={{ padding: "28px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Page Header */}
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
            <span>ANDRITZ ISC</span>
            <span>•</span>
            <span>Industrial Tool Fleet Control</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Fleet Operations Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Ringkasan status kesiapan armada, ketersediaan, peralatan di lapangan, dan kepatuhan kalibrasi berkala.
          </p>
        </div>

        {/* Quick Operations Button Bar */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setActiveTab("tools-register")}>
            <PlusCircle size={16} />
            <span>Daftar Tool Baru</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab("tools-movement")}>
            <ArrowLeftRight size={16} />
            <span>Peminjaman (Check-Out)</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab("inspection")}>
            <ClipboardCheck size={16} />
            <span>Form Inspeksi</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        {/* Total Fleet */}
        <div className="kpi-card" onClick={() => setActiveTab("tools-db")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Total Armada Tools</div>
          <div className="kpi-value">{totalTools}</div>
          <div className="kpi-subtext">
            <span style={{ color: "var(--atz-cyan)", fontWeight: 600 }}>100%</span>
            <span>Aset terdaftar di master database</span>
          </div>
        </div>

        {/* Available in Warehouses */}
        <div className="kpi-card success" onClick={() => setActiveTab("tools-db")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Tersedia di Gudang (Ready)</div>
          <div className="kpi-value" style={{ color: "var(--color-success)" }}>
            {availableTools.length}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: "var(--color-success)", fontWeight: 700 }}>{availabilityRate}%</span>
            <span>Kesiapan mobilisasi armada</span>
          </div>
        </div>

        {/* Checked Out on Site */}
        <div className="kpi-card warning" onClick={() => setActiveTab("tools-movement")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Sedang Dipinjam / On-Site</div>
          <div className="kpi-value" style={{ color: "var(--color-warning)" }}>
            {checkedOutTools.length}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: "var(--color-warning)", fontWeight: 700 }}>{utilizationRate}%</span>
            <span>Tingkat utilisasi di proyek lapangan</span>
          </div>
        </div>

        {/* Calibration & Inspection Due */}
        <div className="kpi-card danger" onClick={() => setActiveTab("inspection")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Jatuh Tempo Kalibrasi</div>
          <div className="kpi-value" style={{ color: "var(--color-danger)" }}>
            {calibrationDue.length}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: "var(--color-danger)", fontWeight: 700 }}>Perhatian</span>
            <span>Memerlukan rekalsertifikasi QA/QC</span>
          </div>
        </div>

        {/* Maintenance / Quarantine */}
        <div className="kpi-card purple" onClick={() => setActiveTab("tools-db")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Maintenance / Karantina</div>
          <div className="kpi-value" style={{ color: "var(--color-purple)" }}>
            {maintenanceTools.length}
          </div>
          <div className="kpi-subtext">
            <span>Perbaikan seal / coupler</span>
          </div>
        </div>

        {/* Active Sites */}
        <div className="kpi-card" onClick={() => setActiveTab("sites-db")} style={{ cursor: "pointer" }}>
          <div className="kpi-title">Site & Lokasi Aktif</div>
          <div className="kpi-value">{sites.length}</div>
          <div className="kpi-subtext">
            <span>Workshop & site klien ANDRITZ</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Fleet Health & Calibration Alerts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "24px",
          marginBottom: "28px"
        }}
      >
        {/* Fleet Availability & Health Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--atz-cyan)" />
              Distribusi Status Kesiapan Armada
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("analytics")}>
              Detail Analisis <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Ketersediaan Siap Kerja:</span>
              <strong style={{ color: "var(--color-success)" }}>{availableTools.length} dari {totalTools} unit ({availabilityRate}%)</strong>
            </div>

            {/* Segmented Progress Bar */}
            <div
              style={{
                height: "14px",
                borderRadius: "7px",
                backgroundColor: "var(--bg-surface-elevated)",
                overflow: "hidden",
                display: "flex",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div
                style={{
                  width: `${(availableTools.length / totalTools) * 100}%`,
                  backgroundColor: "var(--color-success)",
                  transition: "width 0.4s"
                }}
                title={`Available: ${availableTools.length}`}
              />
              <div
                style={{
                  width: `${(checkedOutTools.length / totalTools) * 100}%`,
                  backgroundColor: "var(--color-warning)",
                  transition: "width 0.4s"
                }}
                title={`Checked Out: ${checkedOutTools.length}`}
              />
              <div
                style={{
                  width: `${(inInspectionTools.length / totalTools) * 100}%`,
                  backgroundColor: "var(--atz-cyan)",
                  transition: "width 0.4s"
                }}
                title={`In Inspection: ${inInspectionTools.length}`}
              />
              <div
                style={{
                  width: `${(maintenanceTools.length / totalTools) * 100}%`,
                  backgroundColor: "var(--color-danger)",
                  transition: "width 0.4s"
                }}
                title={`Maintenance: ${maintenanceTools.length}`}
              />
            </div>
          </div>

          {/* Status Breakdown Legend & Counts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-success)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Tersedia (Ready)</span>
              </div>
              <strong style={{ fontSize: "1.1rem" }}>{availableTools.length}</strong>
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-warning)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Dipinjam di Proyek</span>
              </div>
              <strong style={{ fontSize: "1.1rem" }}>{checkedOutTools.length}</strong>
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--atz-cyan)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Sedang Inspeksi QA</span>
              </div>
              <strong style={{ fontSize: "1.1rem" }}>{inInspectionTools.length}</strong>
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-danger)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Karantina / Rusak</span>
              </div>
              <strong style={{ fontSize: "1.1rem" }}>{maintenanceTools.length}</strong>
            </div>
          </div>
        </div>

        {/* Urgent Calibration & Inspection Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={18} color="var(--color-warning)" />
              Peringatan Kalibrasi & Inspeksi
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("inspection")}>
              Ke Form Inspeksi <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {calibrationDue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                Semua peralatan dalam kondisi kalibrasi valid.
              </div>
            ) : (
              calibrationDue.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: "var(--atz-cyan)", fontSize: "0.85rem" }}>
                        {tool.code}
                      </span>
                      <span
                        className="status-pill"
                        style={{
                          backgroundColor: tool.calibrationStatus === "Overdue" ? "var(--color-danger-bg)" : "var(--color-warning-bg)",
                          color: tool.calibrationStatus === "Overdue" ? "var(--color-danger)" : "var(--color-warning)",
                          fontSize: "0.7rem"
                        }}
                      >
                        {tool.calibrationStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" }}>{tool.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Lokasi: {tool.siteName} • Exp: <strong>{tool.nextCalibrationDate}</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-cyan btn-sm"
                    onClick={() => setActiveTab("inspection")}
                    title="Jadwalkan atau laksanakan inspeksi sekarang"
                  >
                    Inspeksi
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Movements Table & Active Sites Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px"
        }}
      >
        {/* Recent Movements Stream */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ArrowLeftRight size={18} color="var(--atz-cyan)" />
              Aktivitas Pergerakan Tools Terkini (Movement)
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("tools-movement")}>
              Lihat Semua Movement <ChevronRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Tipe</th>
                  <th>Kode Tool</th>
                  <th>Peminjam / WO</th>
                  <th>Tujuan Site</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                      {m.checkoutDate.substring(5, 16)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: m.type === "Check-Out" ? "var(--color-warning)" : m.type === "Check-In" ? "var(--color-success)" : "var(--atz-cyan)"
                        }}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 600 }}>{m.toolCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.borrowerName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.workOrder}</div>
                    </td>
                    <td style={{ fontSize: "0.825rem" }}>{m.toSite.split(" ")[0]}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          m.status === "Active" ? "status-checked-out" : "status-available"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Site Allocation Highlights */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="var(--atz-cyan)" />
              Alokasi Tools di Site ANDRITZ
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("sites-db")}>
              Site Master <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => setActiveTab("sites-db")}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "border-color var(--transition-fast)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{site.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    PIC: {site.pic} • {site.region}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--atz-cyan)" }}>
                    {site.activeToolsCount} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}>tools</span>
                  </div>
                  <span className="status-pill status-available" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                    {site.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barcode Modal if triggered */}
      {selectedToolForBarcode && (
        <BarcodeModal tool={selectedToolForBarcode} onClose={() => setSelectedToolForBarcode(null)} />
      )}
    </div>
  );
}
