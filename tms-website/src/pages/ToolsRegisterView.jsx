import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PlusCircle,
  QrCode,
  Tag,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  ArrowRight,
  RefreshCw,
  Printer,
  Lock,
  Globe2
} from "lucide-react";
import BarcodeModal from "../components/BarcodeModal";
import BarcodeRenderer from "../components/BarcodeRenderer";

export default function ToolsRegisterView() {
  const { addTool, sites, setActiveTab, currentUser, isSuperAdmin } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    category: "Hydraulic Bolting",
    brand: "",
    model: "",
    code: `ATZ-TRQ-${Math.floor(400 + Math.random() * 590)}`,
    materialNo: `MAT-88${Math.floor(10000 + Math.random() * 89999)}`,
    serialNo: `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `8990142${Math.floor(10000 + Math.random() * 90000)}`,
    siteId: !isSuperAdmin ? (currentUser?.siteId || sites[0]?.id || "SITE-IKPP") : (sites[0]?.id || "SITE-IKPP"),
    binLocation: "RACK-A2-01",
    status: "Available",
    condition: "Good",
    calibrationStatus: "Valid",
    calibrationFrequency: "6 Months",
    calibrationCertNo: `CERT-CAL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    lastCalibrationDate: new Date().toISOString().substring(0, 10),
    nextCalibrationDate: "2027-04-25",
    specs: "Alat hidrolik presisi tinggi standar industri andritz dengan sertifikasi kalibrasi pabrikan."
  });

  // Keep siteId synced to currentUser if site admin
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.siteId) {
      setFormData((prev) => ({ ...prev, siteId: currentUser.siteId }));
    }
  }, [isSuperAdmin, currentUser]);

  const [registeredTool, setRegisteredTool] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  // Quick Preset Templates for industrial ease
  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
      code: `ATZ-${preset.category.substring(0, 3).toUpperCase()}-${Math.floor(300 + Math.random() * 690)}`,
      materialNo: `MAT-88${Math.floor(10000 + Math.random() * 89999)}`,
      serialNo: `${preset.brand.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `8990142${Math.floor(10000 + Math.random() * 90000)}`
    }));
  };

  const presets = [
    {
      title: "Hydraulic Torque Wrench 7,500 Nm",
      name: "Hydraulic Torque Wrench Low Profile 7,500 Nm",
      category: "Hydraulic Bolting",
      brand: "Enerpac / ANDRITZ Spec",
      model: "W8000X-ISC",
      binLocation: "RACK-A1-06",
      specs: "Hex cassette 65mm-105mm, Max 7,500 Nm, Working pressure 700 bar"
    },
    {
      title: "Laser Optical Shaft Alignment",
      name: "Wireless Precision Laser Shaft Alignment Tool",
      category: "Alignment & Measurement",
      brand: "Pruftechnik / Fluke",
      model: "ROTALIGN Touch Plus",
      binLocation: "LAB-CAB-03",
      specs: "Live Move 3D, Cardan shaft bracket, Thermal growth computation"
    },
    {
      title: "Digital 10kV Megger Insulation Tester",
      name: "Industrial 10kV High-Voltage Insulation Tester",
      category: "Electrical Testing",
      brand: "Megger",
      model: "MIT1025-ISC",
      binLocation: "ELEC-SAFE-02",
      specs: "CAT IV 600V safety rating, measurement up to 20 T-Ohm, USB data download"
    },
    {
      title: "Ultrasonic Flow & Clamp Meter",
      name: "Portable Non-Invasive Ultrasonic Flow Meter",
      category: "Condition Monitoring",
      brand: "FLEXIM",
      model: "FLUXUS F601",
      binLocation: "DIAG-BAY-01",
      specs: "Dual channel clamp-on sensors, pipe diameter DN10 to DN6500, ATEX rated"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    const newTool = addTool(formData);
    setRegisteredTool(newTool);
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      category: "Hydraulic Bolting",
      brand: "",
      model: "",
      code: `ATZ-TRQ-${Math.floor(400 + Math.random() * 590)}`,
      materialNo: `MAT-88${Math.floor(10000 + Math.random() * 89999)}`,
      serialNo: `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `8990142${Math.floor(10000 + Math.random() * 90000)}`,
      siteId: sites[0]?.id || "SITE-IKPP",
      binLocation: "RACK-A2-01",
      status: "Available",
      condition: "Good",
      calibrationStatus: "Valid",
      calibrationFrequency: "6 Months",
      calibrationCertNo: `CERT-CAL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      lastCalibrationDate: new Date().toISOString().substring(0, 10),
      nextCalibrationDate: "2027-04-25",
      specs: ""
    });
    setRegisteredTool(null);
  };

  const selectedSite = sites.find((s) => s.id === formData.siteId) || sites[0];

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
              color: "var(--atz-cyan-text, var(--atz-cyan))",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px"
            }}
          >
            <span>Induksi Aset Baru</span>
            <span>•</span>
            <span>Module 5</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Tools Register (Pendaftaran Alat Baru)</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Daftarkan unit peralatan baru ke dalam sistem TMS, tetapkan material number SAP, cetak barcode label, dan atur siklus kalibrasi.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => setActiveTab("tools-db")}>
          <Layers size={16} />
          <span>Ke Master Database</span>
        </button>
      </div>

      {/* Preset Quick Templates */}
      <div className="card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Sparkles size={16} color="var(--atz-cyan)" />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Pilih Template Peralatan Standar ANDRITZ (Quick Fill):
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {presets.map((p, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyPreset(p)}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--atz-cyan)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--atz-cyan)", marginTop: "2px" }}>{p.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Registration Form & Live Badge Preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "28px"
        }}
      >
        {/* Left Column: Industrial Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="card-header">
              <div className="card-title">
                <Wrench size={18} color="var(--atz-cyan)" />
                Formulir Spesifikasi & Data Aset
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetForm}>
                <RefreshCw size={14} /> Reset Form
              </button>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">
                Nama Lengkap Alat / Tool Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Hydraulic Torque Wrench Low Profile 4,500 Nm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Kategori Peralatan</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Hydraulic Bolting">Hydraulic Bolting</option>
                  <option value="Alignment & Measurement">Alignment & Measurement</option>
                  <option value="Condition Monitoring">Condition Monitoring</option>
                  <option value="Hydraulic Power Units">Hydraulic Power Units</option>
                  <option value="Lifting & Spreading">Lifting & Spreading</option>
                  <option value="Electrical Testing">Electrical Testing</option>
                  <option value="Safety & Environmental">Safety & Environmental</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand / Pabrikan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Enerpac, Hytorc, Fluke"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Identification Numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Model / Tipe Spesifik</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: W4000X-ISC"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Serial (Serial No)</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="Contoh: ENP-2026-9921"
                  value={formData.serialNo}
                  onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">
                  Nomor Material SAP (ERP) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="Contoh: MAT-8840210"
                  value={formData.materialNo}
                  onChange={(e) => setFormData({ ...formData, materialNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kode Tool TMS (Auto)</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            {/* Barcode & Storage */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Barcode / QR Identifier</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Bin / Rak Penempatan</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="Contoh: RACK-A1-04"
                  value={formData.binLocation}
                  onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Base Site (Lokasi Induk)</label>
                {isSuperAdmin ? (
                  <select
                    className="form-select"
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser?.site || "Site Anda"}
                      readOnly
                      style={{
                        backgroundColor: "var(--bg-surface-elevated)",
                        cursor: "not-allowed",
                        fontWeight: 600,
                        color: "var(--color-warning)"
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.72rem",
                        color: "var(--color-warning)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600
                      }}
                    >
                      <Lock size={12} /> Terkunci (Admin Site)
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Siklus Kalibrasi Berkala</label>
                <select
                  className="form-select"
                  value={formData.calibrationFrequency}
                  onChange={(e) => setFormData({ ...formData, calibrationFrequency: e.target.value })}
                >
                  <option value="3 Months">Setiap 3 Bulan</option>
                  <option value="6 Months">Setiap 6 Bulan (Standar)</option>
                  <option value="12 Months">Setiap 1 Tahun (12 Bulan)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Spesifikasi Teknis & Kapasitas Alat</label>
              <textarea
                className="form-control"
                placeholder="Rincian rentang kerja, tekanan kerja max, dimensi hex/drive, toleransi kalibrasi..."
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "10px" }}>
              <PlusCircle size={18} />
              <span>Simpan & Daftarkan Tool ke Inventaris TMS</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Interactive Badge & Barcode Sticker Preview */}
        <div>
          <div className="card" style={{ position: "sticky", top: "90px" }}>
            <div className="card-header">
              <div className="card-title">
                <Tag size={18} color="var(--atz-cyan)" />
                Pratinjau Label Fisik (Live Sticker Preview)
              </div>
              <span className="status-pill status-available">Live Sync</span>
            </div>

            <div style={{ marginBottom: "16px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              Label berikut akan di-generate otomatis untuk ditempelkan pada fisik peralatan atau container box.
            </div>

            {/* Industrial Sticker Render */}
            <div className="barcode-sticker" style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
              <div className="barcode-sticker-header">
                <div style={{ textAlign: "left" }}>
                  <img src="/andritz-logo-blue.png" alt="ANDRITZ" style={{ height: "24px", objectFit: "contain", display: "block", marginBottom: "3px" }} />
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#333" }}>
                    INDONESIA SERVICE CENTER
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.7rem", color: "#444" }}>
                  <div><strong>ISO 9001</strong> VERIFIED</div>
                  <div style={{ color: "#00A3E0", fontWeight: "bold" }}>TMS FLEET ASSET</div>
                </div>
              </div>

              <div style={{ textAlign: "left", margin: "10px 0" }}>
                <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase" }}>Tool Identification</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#111" }}>{formData.code}</div>
                <div style={{ fontSize: "0.85rem", color: "#333", fontWeight: 500, margin: "2px 0 6px" }}>
                  {formData.name || "Nama Peralatan Baru..."}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  backgroundColor: "#F8FAFC",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  textAlign: "left",
                  fontSize: "0.72rem",
                  color: "#222"
                }}
              >
                <div>
                  <span style={{ color: "#777" }}>Material No:</span>
                  <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>{formData.materialNo}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Serial No:</span>
                  <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>{formData.serialNo || "-"}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Site:</span>
                  <div style={{ fontWeight: 600 }}>{selectedSite.name}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Bin:</span>
                  <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>{formData.binLocation}</div>
                </div>
              </div>

              {/* Barcode Graphic (Vector SVG) */}
              <div style={{ margin: "14px 0 8px" }}>
                <BarcodeRenderer value={formData.barcode} height={52} />
                <div style={{ fontFamily: "monospace", fontSize: "0.85rem", letterSpacing: "3px", fontWeight: "bold", color: "#111" }}>
                  {formData.barcode}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #E2E8F0",
                  paddingTop: "8px",
                  marginTop: "8px",
                  fontSize: "0.68rem",
                  color: "#555"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <QrCode size={24} color="#00A3E0" />
                  <div style={{ textAlign: "left" }}>
                    <div>Digital Inspection Ready</div>
                    <div><strong>tms.andritz.internal</strong></div>
                  </div>
                </div>
                <div style={{ color: "#059669", fontWeight: "bold" }}>CALIBRATION VALID</div>
              </div>
            </div>

            {/* Success Notification Box if registered */}
            {registeredTool && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success)", fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>Aset Berhasil Terdaftar di Database!</span>
                </div>
                <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  {registeredTool.name} ({registeredTool.code}) siap dimobilisasi dan dipinjam di modul Movement.
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowBarcodeModal(true)}
                  >
                    <Printer size={14} /> Cetak Label Sekarang
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab("tools-db")}
                  >
                    Lihat di Master DB
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBarcodeModal && registeredTool && (
        <BarcodeModal tool={registeredTool} onClose={() => setShowBarcodeModal(false)} />
      )}
    </div>
  );
}
