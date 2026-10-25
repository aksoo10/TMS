import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useApp } from "../context/AppContext";
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  QrCode,
  Tag,
  ArrowLeftRight,
  ClipboardCheck,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Eye,
  X,
  FileSpreadsheet,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import BarcodeModal from "../components/BarcodeModal";

export default function ToolsDatabaseView() {
  const {
    tools,
    sites,
    deleteTool,
    updateTool,
    setActiveTab,
    globalSearch,
    setGlobalSearch,
    currentUser,
    selectedSiteFilter,
    setSelectedSiteFilter
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState(selectedSiteFilter || "ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [calibrationFilter, setCalibrationFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Sync site filter from cross-view navigation
  useEffect(() => {
    if (selectedSiteFilter) {
      setSiteFilter(selectedSiteFilter);
    }
  }, [selectedSiteFilter]);

  // Modals state
  const [barcodeTool, setBarcodeTool] = useState(null);
  const [detailTool, setDetailTool] = useState(null);
  const [editingTool, setEditingTool] = useState(null);

  // Extract distinct categories
  const categories = ["ALL", ...new Set(tools.map((t) => t.category))];

  // Filtering Logic
  const filteredTools = tools.filter((tool) => {
    const query = globalSearch.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      tool.name.toLowerCase().includes(query) ||
      tool.code.toLowerCase().includes(query) ||
      tool.barcode.includes(query) ||
      tool.materialNo.toLowerCase().includes(query) ||
      tool.serialNo.toLowerCase().includes(query) ||
      tool.brand.toLowerCase().includes(query) ||
      (tool.siteName && tool.siteName.toLowerCase().includes(query));

    const matchesCategory = categoryFilter === "ALL" || tool.category === categoryFilter;
    const matchesSite = siteFilter === "ALL" || tool.siteId === siteFilter;
    const matchesStatus = statusFilter === "ALL" || tool.status === statusFilter;
    const matchesCalibration = calibrationFilter === "ALL" || tool.calibrationStatus === calibrationFilter;

    return matchesSearch && matchesCategory && matchesSite && matchesStatus && matchesCalibration;
  });

  // Export to Excel (.xlsx) with clean auto-fit widths and text formatting
  const handleExportExcel = () => {
    const exportData = filteredTools.map((t, idx) => ({
      "No": idx + 1,
      "Tool Code": t.code || "-",
      "Tool Name": t.name || "-",
      "Category": t.category || "-",
      "Brand": t.brand || "-",
      "Model / Spec": t.model || "-",
      "Material No (SAP)": String(t.materialNo || "-"),
      "Barcode": String(t.barcode || "-"),
      "Serial Number": String(t.serialNo || "-"),
      "Current Site": t.siteName || "-",
      "Storage Bin": t.binLocation || "-",
      "Status": t.status || "-",
      "Condition": t.condition || "-",
      "Calibration Status": t.calibrationStatus || "-",
      "Last Calibration": t.lastCalibrationDate || "-",
      "Next Calibration": t.nextCalibrationDate || "-",
      "Calibration Cert No": t.calibrationCertNo || "-",
      "Assigned To / PIC": t.assignedTo || "-",
      "Technical Specs": t.specs || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set generous column widths so data is never truncated and dates never show '########'
    ws["!cols"] = [
      { wch: 6 },   // No
      { wch: 18 },  // Tool Code
      { wch: 45 },  // Tool Name
      { wch: 25 },  // Category
      { wch: 22 },  // Brand
      { wch: 24 },  // Model / Spec
      { wch: 20 },  // Material No (SAP)
      { wch: 24 },  // Barcode
      { wch: 24 },  // Serial Number
      { wch: 20 },  // Current Site
      { wch: 16 },  // Storage Bin
      { wch: 16 },  // Status
      { wch: 16 },  // Condition
      { wch: 20 },  // Calibration Status
      { wch: 18 },  // Last Calibration
      { wch: 18 },  // Next Calibration
      { wch: 24 },  // Calibration Cert No
      { wch: 32 },  // Assigned To / PIC
      { wch: 55 }   // Technical Specs
    ];

    // Guarantee that Barcode (col 7), Material No (col 6), and Serial No (col 8)
    // are strictly stored as strings (t: 's', z: '@') to prevent scientific notation (8.99E+11)
    if (ws["!ref"]) {
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Material No (col 6)
        const matCell = XLSX.utils.encode_cell({ r: R, c: 6 });
        if (ws[matCell]) {
          ws[matCell].t = "s";
          ws[matCell].z = "@";
        }
        // Barcode (col 7)
        const barcodeCell = XLSX.utils.encode_cell({ r: R, c: 7 });
        if (ws[barcodeCell]) {
          ws[barcodeCell].t = "s";
          ws[barcodeCell].z = "@";
        }
        // Serial Number (col 8)
        const serialCell = XLSX.utils.encode_cell({ r: R, c: 8 });
        if (ws[serialCell]) {
          ws[serialCell].t = "s";
          ws[serialCell].z = "@";
        }
      }

      // Add Excel auto-filter dropdowns to headers
      ws["!autofilter"] = { ref: ws["!ref"] };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master Tools Database");

    const dateStr = new Date().toISOString().substring(0, 10);
    XLSX.writeFile(wb, `ANDRITZ_ISC_Tools_Database_${dateStr}.xlsx`);
  };

  // Export to CSV with Excel compatibility formulas to preserve text
  const handleExportCSV = () => {
    const headers = [
      "No",
      "Tool Code",
      "Tool Name",
      "Category",
      "Brand",
      "Model",
      "Material No",
      "Barcode",
      "Serial No",
      "Site",
      "Bin Location",
      "Status",
      "Condition",
      "Calibration Status",
      "Next Calibration",
      "Assigned To"
    ];
    const rows = filteredTools.map((t, idx) => [
      idx + 1,
      `"${t.code || ""}"`,
      `"${(t.name || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      `"${t.brand || ""}"`,
      `"${t.model || ""}"`,
      `="${t.materialNo || ""}"`,
      `="${t.barcode || ""}"`,
      `="${t.serialNo || ""}"`,
      `"${t.siteName || ""}"`,
      `"${t.binLocation || ""}"`,
      `"${t.status || ""}"`,
      `"${t.condition || ""}"`,
      `"${t.calibrationStatus || ""}"`,
      `"${t.nextCalibrationDate || ""}"`,
      `"${(t.assignedTo || "").replace(/"/g, '""')}"`
    ]);

    // Use UTF-8 BOM so Excel opens with proper character encoding
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ANDRITZ_ISC_Tools_Database_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return <span className="status-pill status-available">Tersedia</span>;
      case "Checked Out":
        return <span className="status-pill status-checked-out">Dipinjam</span>;
      case "In Inspection":
        return <span className="status-pill status-in-inspection">Inspeksi QA</span>;
      case "Maintenance":
      case "Damaged":
        return <span className="status-pill status-maintenance">Maintenance</span>;
      default:
        return <span className="status-pill">{status}</span>;
    }
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
            <span>Master Asset Fleet</span>
            <span>•</span>
            <span>Module 3</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Tools Master Database</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Database utama perkakas industri ANDRITZ ISC, material number SAP, barcode label, lokasi bin, dan riwayat kalibrasi.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportExcel}
            title="Download database terformat rapi (.xlsx) - Kolom pas, tanggal rapi, barcode format teks"
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
          <button className="btn btn-primary" onClick={() => setActiveTab("tools-register")}>
            <PlusCircle size={16} />
            <span>Registrasi Tool Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div
        className="card"
        style={{
          marginBottom: "20px",
          padding: "16px 20px"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Box */}
          <div style={{ flex: "1 1 300px", position: "relative" }}>
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
              style={{ paddingLeft: "36px", height: "40px" }}
              placeholder="Cari nama, kode (ATZ-...), barcode, material no..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)"
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div style={{ flex: "0 1 200px" }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ height: "40px", fontSize: "0.85rem" }}
            >
              <option value="ALL">Kategori: Semua</option>
              {categories
                .filter((c) => c !== "ALL")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Site Dropdown */}
          <div style={{ flex: "0 1 210px" }}>
            <select
              className="form-select"
              value={siteFilter}
              onChange={(e) => {
                setSiteFilter(e.target.value);
                setSelectedSiteFilter(e.target.value);
              }}
              style={{ height: "40px", fontSize: "0.85rem" }}
            >
              <option value="ALL">Lokasi: Semua Site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ flex: "0 1 170px" }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: "40px", fontSize: "0.85rem" }}
            >
              <option value="ALL">Status: Semua</option>
              <option value="Available">Tersedia (Ready)</option>
              <option value="Checked Out">Sedang Dipinjam</option>
              <option value="In Inspection">Dalam Inspeksi</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--bg-surface-elevated)", padding: "3px", borderRadius: "var(--radius-sm)" }}>
            <button
              className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setViewMode("table")}
              title="Tampilan Tabel"
              style={{ padding: "6px 10px" }}
            >
              <List size={16} />
            </button>
            <button
              className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setViewMode("grid")}
              title="Tampilan Grid Kartu"
              style={{ padding: "6px 10px" }}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div>
            Menampilkan <strong>{filteredTools.length}</strong> dari <strong>{tools.length}</strong> tools
          </div>
          {(categoryFilter !== "ALL" || siteFilter !== "ALL" || statusFilter !== "ALL" || globalSearch) && (
            <button
              onClick={() => {
                setCategoryFilter("ALL");
                setSiteFilter("ALL");
                setStatusFilter("ALL");
                setGlobalSearch("");
              }}
              style={{ background: "transparent", border: "none", color: "var(--atz-cyan)", cursor: "pointer", fontWeight: 600 }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* View Mode: Table */}
      {viewMode === "table" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Tool</th>
                  <th>Nama Peralatan</th>
                  <th>Nomor Material SAP</th>
                  <th>Barcode</th>
                  <th>Kategori</th>
                  <th>Lokasi Site</th>
                  <th>Status</th>
                  <th>Kalibrasi</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Tidak ada tools yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool) => (
                    <tr key={tool.id}>
                      {/* Tool Code */}
                      <td>
                        <div
                          className="font-mono"
                          style={{
                            fontWeight: 700,
                            color: "var(--atz-cyan)",
                            cursor: "pointer"
                          }}
                          onClick={() => setDetailTool(tool)}
                          title="Klik untuk detail"
                        >
                          {tool.code}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          SN: {tool.serialNo}
                        </div>
                      </td>

                      {/* Name & Brand */}
                      <td>
                        <div
                          style={{ fontWeight: 600, cursor: "pointer" }}
                          onClick={() => setDetailTool(tool)}
                        >
                          {tool.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {tool.brand} • {tool.model}
                        </div>
                      </td>

                      {/* Material Number */}
                      <td>
                        <span className="font-mono" style={{ fontSize: "0.825rem", fontWeight: 600 }}>
                          {tool.materialNo}
                        </span>
                      </td>

                      {/* Barcode */}
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          onClick={() => setBarcodeTool(tool)}
                          title="Lihat Label Barcode & QR"
                        >
                          <Tag size={12} color="var(--atz-cyan)" />
                          <span className="font-mono">{tool.barcode.slice(-5)}</span>
                        </button>
                      </td>

                      {/* Category */}
                      <td style={{ fontSize: "0.825rem" }}>{tool.category}</td>

                      {/* Site */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.825rem" }}>
                          <MapPin size={13} color="var(--atz-cyan)" />
                          <span style={{ fontWeight: 600 }}>{tool.siteName}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{tool.binLocation}</div>
                      </td>

                      {/* Status */}
                      <td>{getStatusBadge(tool.status)}</td>

                      {/* Calibration Status */}
                      <td>
                        <div
                          style={{
                            fontSize: "0.775rem",
                            fontWeight: 600,
                            color:
                              tool.calibrationStatus === "Valid"
                                ? "var(--color-success)"
                                : tool.calibrationStatus === "Due Soon"
                                ? "var(--color-warning)"
                                : "var(--color-danger)"
                          }}
                        >
                          {tool.calibrationStatus}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          Exp: {tool.nextCalibrationDate}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", padding: 0 }}
                            onClick={() => setDetailTool(tool)}
                            title="Detail Lengkap"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", padding: 0 }}
                            onClick={() => setBarcodeTool(tool)}
                            title="Cetak Barcode / QR Sticker"
                          >
                            <QrCode size={15} color="var(--atz-cyan)" />
                          </button>

                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", padding: 0 }}
                            onClick={() => setEditingTool(tool)}
                            title="Edit Data"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", padding: 0, color: "var(--color-danger)" }}
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menonaktifkan tool ${tool.code}?`)) {
                                deleteTool(tool.id);
                              }
                            }}
                            title="Hapus / Nonaktifkan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: High-Tech Industrial Grid Cards */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "18px"
          }}
        >
          {filteredTools.map((tool) => (
            <div key={tool.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--atz-cyan)" }}>
                      {tool.code}
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MAT: {tool.materialNo}</div>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>

                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "8px", lineHeight: "1.3" }}>{tool.name}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.4" }}>
                  {tool.specs}
                </p>

                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "0.75rem",
                    marginBottom: "14px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Lokasi:</span>
                    <div style={{ fontWeight: 600 }}>{tool.siteName}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Storage Bin:</span>
                    <div style={{ fontWeight: 600 }} className="font-mono">{tool.binLocation}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Kalibrasi:</span>
                    <div style={{ fontWeight: 600, color: tool.calibrationStatus === "Valid" ? "var(--color-success)" : "var(--color-warning)" }}>
                      {tool.calibrationStatus}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Jatuh Tempo:</span>
                    <div style={{ fontWeight: 600 }}>{tool.nextCalibrationDate}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "12px"
                }}
              >
                <button className="btn btn-outline-cyan btn-sm" onClick={() => setBarcodeTool(tool)}>
                  <QrCode size={14} /> Label Barcode
                </button>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setDetailTool(tool)}>
                    Detail
                  </button>
                  <button className="btn btn-secondary btn-icon" onClick={() => setEditingTool(tool)}>
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barcode Modal */}
      {barcodeTool && <BarcodeModal tool={barcodeTool} onClose={() => setBarcodeTool(null)} />}

      {/* Tool Detail Modal */}
      {detailTool && (
        <div className="modal-overlay" onClick={() => setDetailTool(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Tag size={20} color="var(--atz-cyan)" />
                Detail Spesifikasi Peralatan Fleet
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setDetailTool(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--atz-cyan)" }}>
                    {detailTool.code}
                  </span>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "2px" }}>{detailTool.name}</h2>
                </div>
                {getStatusBadge(detailTool.status)}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  backgroundColor: "var(--bg-surface-elevated)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "20px"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Kategori</div>
                  <div style={{ fontWeight: 600 }}>{detailTool.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Brand / Manufaktur</div>
                  <div style={{ fontWeight: 600 }}>{detailTool.brand}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nomor Material SAP (ERP)</div>
                  <div style={{ fontWeight: 600 }} className="font-mono">{detailTool.materialNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nomor Serial Pabrik</div>
                  <div style={{ fontWeight: 600 }} className="font-mono">{detailTool.serialNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Barcode Tag</div>
                  <div style={{ fontWeight: 600 }} className="font-mono">{detailTool.barcode}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Penempatan Site & Rak</div>
                  <div style={{ fontWeight: 600 }}>{detailTool.siteName} ({detailTool.binLocation})</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Status Kalibrasi</div>
                  <div style={{ fontWeight: 600, color: detailTool.calibrationStatus === "Valid" ? "var(--color-success)" : "var(--color-danger)" }}>
                    {detailTool.calibrationStatus} (Exp: {detailTool.nextCalibrationDate})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sertifikat Kalibrasi</div>
                  <div style={{ fontWeight: 600 }} className="font-mono">{detailTool.calibrationCertNo || "CERT-NA"}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "6px" }}>Spesifikasi Teknis & Kapasitas</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {detailTool.specs}
                </p>
              </div>

              {detailTool.assignedTo && (
                <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-warning)", fontWeight: 700 }}>Sedang Dipinjam Oleh:</div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{detailTool.assignedTo}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setBarcodeTool(detailTool);
                }}
              >
                <QrCode size={16} /> Lihat Sticker Barcode
              </button>
              <button className="btn btn-primary" onClick={() => setDetailTool(null)}>
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {editingTool && (
        <div className="modal-overlay" onClick={() => setEditingTool(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit size={20} color="var(--atz-cyan)" />
                Edit Informasi Alat: {editingTool.code}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingTool(null)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTool(editingTool.id, editingTool);
                setEditingTool(null);
              }}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Peralatan</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingTool.name}
                    onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Material SAP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingTool.materialNo}
                    onChange={(e) => setEditingTool({ ...editingTool, materialNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rak / Bin Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingTool.binLocation}
                    onChange={(e) => setEditingTool({ ...editingTool, binLocation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Peralatan</label>
                  <select
                    className="form-select"
                    value={editingTool.status}
                    onChange={(e) => setEditingTool({ ...editingTool, status: e.target.value })}
                  >
                    <option value="Available">Available (Tersedia)</option>
                    <option value="Checked Out">Checked Out (Dipinjam)</option>
                    <option value="In Inspection">In Inspection (Inspeksi)</option>
                    <option value="Maintenance">Maintenance / Perbaikan</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTool(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
