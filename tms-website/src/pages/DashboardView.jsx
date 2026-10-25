import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Database,
  Tag,
  FileText,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowLeftRight,
  ClipboardCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  Wrench,
  Boxes
} from "lucide-react";
import BarcodeModal from "../components/BarcodeModal";

// Top & Secondary KPI Card Component with Colored Left Accent Strip
function MetricKpiCard({ title, value, subtext, icon: Icon, accentColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "10px",
        padding: "16px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: "transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "105px"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <Icon size={16} color={accentColor} />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em"
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: "1.65rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          lineHeight: 1.15,
          marginBottom: "4px"
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {subtext}
      </div>
    </div>
  );
}

// Pure SVG Pie Chart Component
function SvgPieChart({ data, size = 190 }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  if (total === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: `${size}px` }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Belum ada data distribusi</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  let currentAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const activeSlices = data.filter((d) => d.value > 0);

  const slices = activeSlices.map((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle += sliceAngle;

    const pct = Math.round((item.value / total) * 100);

    // Single 100% slice case
    if (sliceAngle >= 2 * Math.PI * 0.999) {
      return (
        <g key={index}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={item.color}
            stroke="var(--bg-surface)"
            strokeWidth="2.5"
          >
            <title>{`${item.label}: ${item.value} (${pct}%)`}</title>
          </circle>
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="12"
            fontWeight="700"
            style={{ pointerEvents: "none" }}
          >
            {pct}%
          </text>
        </g>
      );
    }

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = (startAngle + endAngle) / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return (
      <g key={index}>
        <path
          d={pathData}
          fill={item.color}
          stroke="var(--bg-surface)"
          strokeWidth="2.5"
          style={{ transition: "opacity 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <title>{`${item.label}: ${item.value} (${pct}%)`}</title>
        </path>
        {pct >= 12 && (
          <text
            x={lx}
            y={ly + 4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="700"
            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {pct}%
          </text>
        )}
      </g>
    );
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
      </svg>
    </div>
  );
}

export default function DashboardView() {
  const { tools, sites, movements, inspections, setActiveTab, setSelectedSiteFilter, setGlobalSearch } = useApp();
  const [selectedToolForBarcode, setSelectedToolForBarcode] = useState(null);

  // Compute live statistics
  const totalRegisteredTools = tools.length;
  // Calculate total physical stock units (sum of stock units or items)
  const totalPhysicalUnits = tools.reduce((sum, t) => sum + (t.stockQty || t.quantity || 1), 0);

  const availableTools = tools.filter((t) => t.status === "Available");
  const checkedOutTools = tools.filter((t) => t.status === "Checked Out");
  const maintenanceTools = tools.filter((t) => t.status === "Maintenance" || t.status === "Damaged");

  // Secondary metrics
  const totalTransactions = movements.length;
  const returnedMovements = movements.filter((m) => m.status === "Returned");
  const goodReturns = returnedMovements.filter(
    (m) => !m.notes?.toLowerCase().includes("damaged") && !m.notes?.toLowerCase().includes("rusak")
  ).length;
  const totalReturnedCount = returnedMovements.length || 1;
  const goodReturnRate = Math.round((goodReturns / totalReturnedCount) * 100);

  // Needs Attention / Issues
  const issuesCount = tools.filter(
    (t) =>
      t.status === "Maintenance" ||
      t.status === "Damaged" ||
      t.calibrationStatus === "Overdue" ||
      t.condition === "Needs Repair" ||
      t.condition === "Damaged"
  ).length;

  // Site Distribution Data for Chart 1
  const siteColors = {
    "Site IKPD": "#00A3E0", // Cyan
    "Site OKI I": "#10B981", // Green
    "Site ISC": "#F59E0B", // Amber
    "Site TELL": "#8B5CF6", // Purple
    "Site OKI II": "#EC4899", // Pink
    "Site IKPP": "#3B82F6" // Blue
  };

  const locationChartData = sites.map((site) => {
    const count = tools.filter(
      (t) =>
        t.siteId === site.id ||
        t.siteName === site.name ||
        (t.siteName && t.siteName.toLowerCase() === site.name.toLowerCase())
    ).length;
    return {
      id: site.id,
      label: site.name,
      value: count,
      color: siteColors[site.name] || "#00A3E0"
    };
  });

  // Return Condition Data for Chart 2
  const goodConditionCount = tools.filter((t) => t.condition === "Good" || t.status === "Available").length;
  const brokenConditionCount = tools.filter(
    (t) => t.status === "Maintenance" || t.condition === "Damaged" || t.condition === "Minor Defect"
  ).length;
  const missingConditionCount = tools.filter(
    (t) => t.calibrationStatus === "Overdue" && t.status !== "Maintenance"
  ).length;
  const transferredConditionCount = movements.filter((m) => m.type === "Transfer").length;

  const conditionChartData = [
    { label: "Good", value: goodConditionCount, color: "#10B981" },
    { label: "Broken", value: brokenConditionCount, color: "#F59E0B" },
    { label: "Missing", value: missingConditionCount, color: "#EF4444" },
    { label: "Transferred", value: transferredConditionCount, color: "#00A3E0" }
  ];

  // Recent lists
  const recentTools = tools.slice(0, 5);
  const recentTransactions = movements.slice(0, 5);

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
            Monitoring inventaris armada perkakas, status ketersediaan di site, distribusi lokasi, dan transaksi pergerakan.
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

      {/* Row 1: Top 4 KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        {/* Total Registered Tools */}
        <MetricKpiCard
          title="TOTAL REGISTERED TOOLS"
          value={`${totalRegisteredTools} Items`}
          subtext="Registered asset types (All Sites)"
          icon={Database}
          accentColor="#00A3E0"
          onClick={() => setActiveTab("tools-db")}
        />

        {/* Total Physical Stock */}
        <MetricKpiCard
          title="TOTAL PHYSICAL STOCK"
          value={`${totalPhysicalUnits} Units`}
          subtext="Total stock units (All Sites)"
          icon={Tag}
          accentColor="#06B6D4"
          onClick={() => setActiveTab("tools-db")}
        />

        {/* Currently Borrowed */}
        <MetricKpiCard
          title="CURRENTLY BORROWED"
          value={`${checkedOutTools.length} Active`}
          subtext="Tools currently in active use"
          icon={FileText}
          accentColor="#F59E0B"
          onClick={() => setActiveTab("tools-movement")}
        />

        {/* Ready to Use (Available) */}
        <MetricKpiCard
          title="READY TO USE (AVAILABLE)"
          value={`${availableTools.length} Ready`}
          subtext="Tools ready for checkout / use"
          icon={CheckCircle2}
          accentColor="#10B981"
          onClick={() => setActiveTab("tools-db")}
        />
      </div>

      {/* Row 2: Two Interactive Pie Charts Side-by-Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        {/* Chart 1: Tools Distribution by Location */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Tools Distribution by Location</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab("sites-db")}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              Site Master <ChevronRight size={13} />
            </button>
          </div>

          <SvgPieChart data={locationChartData} size={200} />

          {/* Legend Items */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 16px",
              justifyContent: "center",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-subtle)"
            }}
          >
            {sites.map((site) => {
              const count = tools.filter(
                (t) =>
                  t.siteId === site.id ||
                  t.siteName === site.name ||
                  (t.siteName && t.siteName.toLowerCase() === site.name.toLowerCase())
              ).length;
              const pct = totalRegisteredTools > 0 ? Math.round((count / totalRegisteredTools) * 100) : 0;
              const color = siteColors[site.name] || "#00A3E0";

              return (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSiteFilter(site.id);
                    setGlobalSearch("");
                    setActiveTab("tools-db");
                  }}
                  title={`Klik untuk melihat ${count} tools di ${site.name}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "transform 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      display: "inline-block",
                      flexShrink: 0
                    }}
                  />
                  <span>
                    {site.name}{" "}
                    <strong style={{ color: "var(--text-secondary)" }}>
                      ({count} • {pct}%)
                    </strong>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Tools Return Condition Status */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Tools Return Condition Status</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab("tools-movement")}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              Logistik <ChevronRight size={13} />
            </button>
          </div>

          <SvgPieChart data={conditionChartData} size={200} />

          {/* Legend Items */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 16px",
              justifyContent: "center",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-subtle)"
            }}
          >
            {conditionChartData.map((cond) => {
              const totalCond = conditionChartData.reduce((s, c) => s + c.value, 0);
              const pct = totalCond > 0 ? Math.round((cond.value / totalCond) * 100) : 0;

              return (
                <div
                  key={cond.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem"
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: cond.color,
                      display: "inline-block",
                      flexShrink: 0
                    }}
                  />
                  <span>
                    {cond.label}{" "}
                    <strong style={{ color: "var(--text-secondary)" }}>
                      ({cond.value} • {pct}%)
                    </strong>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Secondary 3 KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        {/* Total Site Transactions */}
        <MetricKpiCard
          title="TOTAL SITE TRANSACTIONS"
          value={`${totalTransactions} Trx`}
          subtext="Circulation history (All Sites)"
          icon={FileText}
          accentColor="#6366F1"
          onClick={() => setActiveTab("tools-movement")}
        />

        {/* Returned in Good Condition */}
        <MetricKpiCard
          title="RETURNED IN GOOD CONDITION"
          value={`${goodReturns} / ${totalReturnedCount} (${goodReturnRate}%)`}
          subtext="Tools returned in ready condition"
          icon={CheckCircle2}
          accentColor="#10B981"
          onClick={() => setActiveTab("tools-movement")}
        />

        {/* Needs Attention / Issues */}
        <MetricKpiCard
          title="NEEDS ATTENTION / ISSUES"
          value={`${issuesCount} Unit Issues`}
          subtext="Damaged / missing tools require follow up"
          icon={AlertTriangle}
          accentColor="#EF4444"
          onClick={() => setActiveTab("inspection")}
        />
      </div>

      {/* Row 4: Two Lists Side-by-Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "20px"
        }}
      >
        {/* Left Column: Recent Inventory Entries */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Recent Inventory Entries</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab("tools-db")}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              Lihat Semua <ExternalLink size={12} />
            </button>
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
            {recentTools.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Belum ada entri tools terbaru
              </div>
            ) : (
              recentTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => {
                    setSelectedToolForBarcode(tool);
                  }}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    {tool.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--atz-cyan)",
                      marginTop: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>{tool.siteName || "Site ISC"}</span>
                    <span>•</span>
                    <span>Stock Qty: 1 Pcs</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {tool.purchaseDate || "2026-09-11 09:38"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Tool Transactions (All Sites) */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Recent Tool Transactions (All Sites)</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab("tools-movement")}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              Semua Log <ExternalLink size={12} />
            </button>
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
            {recentTransactions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Belum ada transaksi peminjaman terbaru
              </div>
            ) : (
              recentTransactions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveTab("tools-movement")}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)"
                  }}
                >
                  <div
                    className="font-mono"
                    style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}
                  >
                    {m.id}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--atz-cyan)",
                      marginTop: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>{m.type}</span>
                    <span>•</span>
                    <span>{m.borrowerName}</span>
                    <span>•</span>
                    <span>{m.status === "Returned" ? "Good" : "Active"}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {m.checkoutDate} • {m.toSite}
                  </div>
                </div>
              ))
            )}
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
