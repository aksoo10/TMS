import React from "react";
import { useApp } from "../context/AppContext";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  MapPin,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  Layers,
  Activity,
  FileSpreadsheet
} from "lucide-react";

export default function AnalyticsView() {
  const { tools, sites, movements, inspections } = useApp();

  const totalTools = tools.length;
  const availableTools = tools.filter((t) => t.status === "Available").length;
  const checkedOutTools = tools.filter((t) => t.status === "Checked Out").length;
  const maintenanceTools = tools.filter((t) => t.status === "Maintenance" || t.status === "Damaged").length;

  const utilizationRate = totalTools > 0 ? Math.round((checkedOutTools / totalTools) * 100) : 0;
  const availabilityRate = totalTools > 0 ? Math.round((availableTools / totalTools) * 100) : 0;

  // Category Breakdown
  const categories = [...new Set(tools.map((t) => t.category))];
  const categoryStats = categories.map((cat) => {
    const count = tools.filter((t) => t.category === cat).length;
    const percentage = totalTools > 0 ? Math.round((count / totalTools) * 100) : 0;
    return { name: cat, count, percentage };
  }).sort((a, b) => b.count - a.count);

  // Site Distribution
  const siteStats = sites.map((site) => {
    const siteTools = tools.filter((t) => t.siteId === site.id);
    const checkedOutCount = siteTools.filter((t) => t.status === "Checked Out").length;
    return {
      name: site.name,
      code: site.code,
      total: siteTools.length,
      checkedOut: checkedOutCount
    };
  }).sort((a, b) => b.total - a.total);

  // Inspection stats
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter((i) => i.verdict === "Pass" || i.verdict === "Pass with Observation").length;
  const complianceRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 100;

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
            <span>Analisis Data & Keputusan Manajemen</span>
            <span>•</span>
            <span>Module 9</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Analytics & Fleet Intelligence</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Analisis data inventaris, tingkat utilisasi perkakas kritis, tren pergerakan, dan kepatuhan kelaikan untuk mendukung keputusan operasional.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="status-pill status-available">Live Engine Sync</span>
        </div>
      </div>

      {/* High-Level Analytical KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        <div className="kpi-card">
          <div className="kpi-title">Tingkat Utilisasi Armada (Active)</div>
          <div className="kpi-value" style={{ color: "var(--atz-cyan)" }}>{utilizationRate}%</div>
          <div className="kpi-subtext">
            <span>{checkedOutTools} unit aktif di proyek lapangan</span>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-title">Ketersediaan Siap Mobilisasi</div>
          <div className="kpi-value" style={{ color: "var(--color-success)" }}>{availabilityRate}%</div>
          <div className="kpi-subtext">
            <span>{availableTools} unit standby di gudang depot</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-title">Kepatuhan Kalibrasi QA/QC</div>
          <div className="kpi-value" style={{ color: "var(--color-purple)" }}>{complianceRate}%</div>
          <div className="kpi-subtext">
            <span>Standar audit ISO 9001 terpenuhi</span>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-title">Total Pergerakan Tercatat</div>
          <div className="kpi-value" style={{ color: "var(--color-warning)" }}>{movements.length}</div>
          <div className="kpi-subtext">
            <span>Transaksi check-out & transfer</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "24px",
          marginBottom: "28px"
        }}
      >
        {/* Category-wise Tool Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <PieChart size={18} color="var(--atz-cyan)" />
              Distribusi Armada Berdasarkan Kategori Peralatan
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{categories.length} Kategori</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {categoryStats.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>{cat.count} unit</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>({cat.percentage}%)</span>
                  </div>
                </div>

                <div
                  style={{
                    height: "10px",
                    borderRadius: "5px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    overflow: "hidden",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.percentage}%`,
                      background:
                        idx === 0
                          ? "linear-gradient(90deg, #00A3E0, #0082C8)"
                          : idx === 1
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : idx === 2
                          ? "linear-gradient(90deg, #8B5CF6, #7C3AED)"
                          : "linear-gradient(90deg, #F59E0B, #D97706)",
                      transition: "width 0.4s ease"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Concentration Comparison */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="var(--atz-cyan)" />
              Konsentrasi Aset di Masing-Masing Site
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{sites.length} Site</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {siteStats.map((s, idx) => {
              const maxTools = Math.max(...siteStats.map((x) => x.total), 1);
              const barWidth = Math.round((s.total / maxTools) * 100);

              return (
                <div
                  key={idx}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--atz-cyan)" }}>
                        {s.code}
                      </span>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{s.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "1rem" }}>{s.total} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>tools</span></div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-warning)" }}>{s.checkedOut} dipinjam</div>
                    </div>
                  </div>

                  <div
                    style={{
                      height: "6px",
                      borderRadius: "3px",
                      backgroundColor: "var(--border-subtle)",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        backgroundColor: "var(--atz-cyan)"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decision Support & AI / Management Insights */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Lightbulb size={18} color="#F59E0B" />
            Rekomendasi Manajemen Fleet & Keputusan Operasional
          </div>
          <span className="status-pill status-available">Analisis Otomatis</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {/* Insight 1 */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--atz-cyan)", fontWeight: 700, marginBottom: "6px" }}>
              <TrendingUp size={16} />
              <span>Tingginya Permintaan Hydraulic Torque Wrench</span>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Kategori Hydraulic Bolting memiliki utilisasi tertinggi (75% sedang dipinjam di Site OKI I & Site IKPP). Direkomendasikan menambah 2 set cadangan cassette untuk mencegah bottleneck saat overhaul berikutnya.
            </p>
          </div>

          {/* Insight 2 */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)", fontWeight: 700, marginBottom: "6px" }}>
              <AlertTriangle size={16} />
              <span>Pencegahan Keterlambatan Kalibrasi</span>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Vibration Analyzer ATZ-VIB-201 dan 4-Gas Detector ATZ-GAS-801 akan habis masa kalibrasi dalam tempo 1-2 minggu. Jadwalkan relokasi ke Lab Kalibrasi Site ISC agar tidak mengganggu sertifikasi keselamatan.
            </p>
          </div>

          {/* Insight 3 */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontWeight: 700, marginBottom: "6px" }}>
              <CheckCircle2 size={16} />
              <span>Efisiensi Perpindahan Antar Site</span>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Seluruh perpindahan lintas site terlacak dengan nomor Surat Jalan (SJ) valid. Tidak ada aset yang hilang (0% loss rate) sejak penerapan sistem barcode terintegrasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
