import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Calendar,
  User,
  Wrench,
  Search,
  ExternalLink,
  PlusCircle,
  Clock,
  Layers,
  Award,
  Lock,
  Globe2
} from "lucide-react";

export default function InspectionView() {
  const { tools, inspections, submitInspection, currentUser, setActiveTab, isSuperAdmin, isItemInUserScope } = useApp();

  const [activeTab, setActiveTabLocal] = useState("dashboard"); // 'dashboard', 'form', 'certificate'
  const [selectedInspectionForCert, setSelectedInspectionForCert] = useState(null);

  // Scoped data according to user role
  const scopedTools = isSuperAdmin ? tools : tools.filter((t) => isItemInUserScope(t.siteId, t.siteName));
  const scopedInspections = isSuperAdmin ? inspections : inspections.filter((i) => isItemInUserScope(null, i.siteName));

  // Form state
  const [formData, setFormData] = useState({
    toolId: scopedTools[0]?.id || "",
    verdict: "Pass",
    calibrationValid: true,
    findings: "Kondisi peralatan fisik dan fungsional dalam parameter prima. Telah dites tanpa beban.",
    nextInspectionDue: "2027-01-25",
    checklist: {
      physicalHousing: "Pass",
      cablesAndHoses: "Pass",
      quickCouplers: "Pass",
      gaugeAndSeals: "Pass",
      electricalSafety: "N/A",
      cleanliness: "Pass"
    }
  });

  // Calculate stats based on scoped inspections
  const totalInspections = scopedInspections.length;
  const passedInspections = scopedInspections.filter((i) => i.verdict === "Pass" || i.verdict === "Pass with Observation").length;
  const failedInspections = scopedInspections.filter((i) => i.verdict === "Fail" || i.verdict === "Quarantine").length;
  const complianceRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 100;

  // Tools needing inspection (scoped)
  const toolsNeedingInspection = scopedTools.filter(
    (t) => t.calibrationStatus === "Due Soon" || t.calibrationStatus === "Overdue" || t.status === "In Inspection"
  );

  const selectedTool = scopedTools.find((t) => t.id === formData.toolId) || scopedTools[0] || tools[0];

  const handleChecklistChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: value
      }
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRecord = submitInspection({
      toolId: formData.toolId,
      toolCode: selectedTool?.code,
      toolName: selectedTool?.name,
      verdict: formData.verdict,
      calibrationValid: formData.calibrationValid,
      checklist: formData.checklist,
      findings: formData.findings,
      nextInspectionDue: formData.nextInspectionDue
    });

    setSelectedInspectionForCert(newRecord);
    setActiveTabLocal("certificate");
  };

  const checklistCriteria = [
    {
      id: "physicalHousing",
      title: "1. Integritas Fisik & Housing Alat",
      desc: "Tidak ada retak, deformasi bodi mekanis, keausan drastis, atau kerusakan baut pengikat."
    },
    {
      id: "cablesAndHoses",
      title: "2. Selang Hidrolik & Saluran Tekanan Tinggi",
      desc: "Tidak ada retak selang (kinking), kebocoran oli, atau kerusakan pelindung spiral."
    },
    {
      id: "quickCouplers",
      title: "3. Quick Coupler & Sambungan Ulir",
      desc: "Konektor mengunci sempurna (ball detent bekerja), tidak ada rembesan di coupling under-pressure."
    },
    {
      id: "gaugeAndSeals",
      title: "4. Manometer / Indikator & Segel Kalibrasi",
      desc: "Jarum manometer kembali ke angka nol saat lepas tekanan. Segel kalibrasi pabrikan utuh."
    },
    {
      id: "electricalSafety",
      title: "5. Keamanan Listrik & Grounding Safety (Jika Ada)",
      desc: "Kabel power CAT IV insulasi utuh, switch darurat (E-Stop) bekerja seketika."
    },
    {
      id: "cleanliness",
      title: "6. Kebersihan & Pelumasan Fungsional",
      desc: "Bebas kontaminan pasir/serbuk kimia, bagian yang bergerak dilumasi gemuk khusus."
    }
  ];

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
            <span>Kualitas & Kelaikan Operasional QA/QC</span>
            <span>•</span>
            <span>Module 7</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Inspection Dashboard & Digital Form</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Pantau kepatuhan pemeriksaan berkala peralatan kerja, lakukan inspeksi digital multi-point, dan terbitkan sertifikat kelaikan ANDRITZ.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTabLocal("dashboard")}
          >
            <Layers size={16} />
            <span>Inspection Dashboard</span>
          </button>
          <button
            className={`btn ${activeTab === "form" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTabLocal("form")}
          >
            <PlusCircle size={16} />
            <span>Isi Form Inspeksi</span>
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
              <strong style={{ color: "var(--color-warning)" }}>Scope QA/QC Admin Site ({currentUser?.site}):</strong> Anda menginspeksi dan melihat kepatuhan alat khusus pada <strong>{currentUser?.site}</strong>. Sesuai regulasi sistem, hanya <strong>Super Admin</strong> yang dapat mengaudit seluruh site.
            </span>
          </div>
          <span className="status-pill status-checked-out" style={{ fontSize: "0.72rem" }}>
            {scopedTools.length} Tools di Site Ini
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
              <strong style={{ color: "var(--atz-cyan)" }}>Audit Mutu Terpusat Super Admin:</strong> Memantau kelaikan teknis & kalibrasi di seluruh 6 site ANDRITZ (OKI I, OKI II, TELL, ISC, IKPP, IKPD).
            </span>
          </div>
          <span className="status-pill status-available" style={{ fontSize: "0.72rem" }}>
            Audit Seluruh Site Aktif
          </span>
        </div>
      )}

      {/* View: Dashboard */}
      {activeTab === "dashboard" && (
        <div>
          {/* KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
              marginBottom: "24px"
            }}
          >
            <div className="kpi-card success">
              <div className="kpi-title">Tingkat Kepatuhan (Pass Rate)</div>
              <div className="kpi-value" style={{ color: "var(--color-success)" }}>{complianceRate}%</div>
              <div className="kpi-subtext">Standar ISO 9001 ISC terpenuhi</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-title">Total Inspeksi Terlaksana</div>
              <div className="kpi-value">{totalInspections}</div>
              <div className="kpi-subtext">Audit trail tersimpan lengkap</div>
            </div>

            <div className="kpi-card warning">
              <div className="kpi-title">Antrean Jatuh Tempo</div>
              <div className="kpi-value" style={{ color: "var(--color-warning)" }}>{toolsNeedingInspection.length}</div>
              <div className="kpi-subtext">Perlu inspeksi atau kalibrasi</div>
            </div>

            <div className="kpi-card danger">
              <div className="kpi-title">Alat Karantina / Defect</div>
              <div className="kpi-value" style={{ color: "var(--color-danger)" }}>{failedInspections}</div>
              <div className="kpi-subtext">Dilarang digunakan di site</div>
            </div>
          </div>

          {/* Tools Inspection Queue Table */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--color-warning)" />
                Antrean Peralatan Memerlukan Pemeriksaan & Kalibrasi
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (toolsNeedingInspection.length > 0) {
                    setFormData((prev) => ({ ...prev, toolId: toolsNeedingInspection[0].id }));
                  }
                  setActiveTabLocal("form");
                }}
              >
                Mulai Inspeksi Sekarang <CheckCircle2 size={14} />
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode Tool</th>
                    <th>Nama Peralatan</th>
                    <th>Site Penempatan</th>
                    <th>Status Kalibrasi</th>
                    <th>Tgl Kalibrasi Terakhir</th>
                    <th>Jatuh Tempo</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {toolsNeedingInspection.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        Semua peralatan dalam kondisi inspeksi dan kalibrasi valid.
                      </td>
                    </tr>
                  ) : (
                    toolsNeedingInspection.map((tool) => (
                      <tr key={tool.id}>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 700, color: "var(--atz-cyan)" }}>
                            {tool.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{tool.name}</td>
                        <td>{tool.siteName}</td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              backgroundColor: tool.calibrationStatus === "Overdue" ? "var(--color-danger-bg)" : "var(--color-warning-bg)",
                              color: tool.calibrationStatus === "Overdue" ? "var(--color-danger)" : "var(--color-warning)"
                            }}
                          >
                            {tool.calibrationStatus}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>{tool.lastCalibrationDate}</td>
                        <td style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--color-danger)" }}>
                          {tool.nextCalibrationDate}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-outline-cyan btn-sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, toolId: tool.id }));
                              setActiveTabLocal("form");
                            }}
                          >
                            <ClipboardCheck size={14} /> Periksa Tool Ini
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Inspections Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} color="var(--atz-cyan)" />
                Riwayat Sertifikasi & Laporan Inspeksi Terkini
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nomor Sertifikat</th>
                    <th>Tanggal</th>
                    <th>Kode Alat</th>
                    <th>Nama Peralatan</th>
                    <th>Inspektur QA</th>
                    <th>Hasil (Verdict)</th>
                    <th>Catatan Temuan</th>
                    <th style={{ textAlign: "right" }}>Sertifikat</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((insp) => (
                    <tr key={insp.id}>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 700, color: "var(--atz-cyan)", fontSize: "0.8rem" }}>
                          {insp.certificateNo}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{insp.inspectionDate}</td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{insp.toolCode}</span>
                      </td>
                      <td style={{ fontSize: "0.85rem", fontWeight: 600 }}>{insp.toolName}</td>
                      <td style={{ fontSize: "0.825rem" }}>{insp.inspectorName}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor:
                              insp.verdict === "Pass"
                                ? "var(--color-success-bg)"
                                : insp.verdict === "Pass with Observation"
                                ? "var(--color-warning-bg)"
                                : "var(--color-danger-bg)",
                            color:
                              insp.verdict === "Pass"
                                ? "var(--color-success)"
                                : insp.verdict === "Pass with Observation"
                                ? "var(--color-warning)"
                                : "var(--color-danger)"
                          }}
                        >
                          {insp.verdict}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {insp.findings}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedInspectionForCert(insp);
                            setActiveTabLocal("certificate");
                          }}
                        >
                          <FileText size={14} /> Lihat Sertifikat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View: Digital Inspection Form */}
      {activeTab === "form" && (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ClipboardCheck size={20} color="var(--atz-cyan)" />
                Formulir Pemeriksaan Kelaikan & Keselamatan Peralatan (QA/QC Checklist)
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTabLocal("dashboard")}>
                Batal
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Select Tool */}
              <div className="form-group">
                <label className="form-label">
                  Pilih Peralatan Yang Diperiksa <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.toolId}
                  onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
                  required
                >
                  {scopedTools.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name} (Site: {t.siteName || "Depot"} • SN: {t.serialNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inspector Information */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.825rem"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Inspektur QA:</span>
                  <div style={{ fontWeight: 700 }}>{currentUser?.name || "Bambang Santoso"}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Peran / Sertifikasi:</span>
                  <div style={{ fontWeight: 600 }}>{currentUser?.role || "QA Inspector"}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Tanggal Pemeriksaan:</span>
                  <div style={{ fontWeight: 700, color: "var(--atz-cyan)" }}>{new Date().toISOString().substring(0, 10)}</div>
                </div>
              </div>

              {/* Multi-point technical checklist */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} color="var(--atz-cyan)" />
                  Poin Pemeriksaan Standar ANDRITZ (Safety & Functional Criteria):
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {checklistCriteria.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--bg-surface-elevated)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px"
                      }}
                    >
                      <div style={{ flex: "1 1 350px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{item.title}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {item.desc}
                        </div>
                      </div>

                      {/* Radio Pills: Pass, Fail, N/A */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        {["Pass", "Fail", "N/A"].map((option) => {
                          const isChecked = formData.checklist[item.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleChecklistChange(item.id, option)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "0.775rem",
                                fontWeight: 700,
                                border: "1px solid",
                                cursor: "pointer",
                                transition: "all var(--transition-fast)",
                                backgroundColor: isChecked
                                  ? option === "Pass"
                                    ? "var(--color-success)"
                                    : option === "Fail"
                                    ? "var(--color-danger)"
                                    : "var(--border-medium)"
                                  : "transparent",
                                color: isChecked ? "#ffffff" : "var(--text-secondary)",
                                borderColor: isChecked ? "transparent" : "var(--border-medium)"
                              }}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration Check & Final Verdict */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Keputusan Akhir Kelaikan (Final Verdict) <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.verdict}
                    onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                  >
                    <option value="Pass">PASSED (Layak Operasional / Fit for Service)</option>
                    <option value="Pass with Observation">PASSED WITH OBSERVATION (Layak dengan Catatan)</option>
                    <option value="Fail">FAILED (Karantina / Tidak Layak Pakai)</option>
                    <option value="Quarantine">RECALIBRATION NEEDED (Kirim ke Lab Kalibrasi)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Jatuh Tempo Pemeriksaan Berikutnya</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.nextInspectionDue}
                    onChange={(e) => setFormData({ ...formData, nextInspectionDue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Temuan Teknis & Rekomendasi QA</label>
                <textarea
                  className="form-control"
                  placeholder="Catatan inspeksi visual, tekanan uji coba yang diterapkan, kondisi pelumasan..."
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTabLocal("dashboard")}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <CheckCircle2 size={18} /> Simpan Laporan & Terbitkan Sertifikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View: Official Certificate Preview */}
      {activeTab === "certificate" && selectedInspectionForCert && (
        <div style={{ maxWidth: "750px", margin: "0 auto" }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Award size={20} color="var(--atz-cyan)" />
                Sertifikat Kelaikan & Inspeksi ANDRITZ ISC
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTabLocal("dashboard")}>
                  Kembali ke Dashboard
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={15} /> Cetak Sertifikat
                </button>
              </div>
            </div>

            {/* Printable Certificate Document */}
            <div className="printable-area">
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  padding: "36px",
                  borderRadius: "8px",
                  border: "2px solid #00A3E0",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  fontFamily: "Arial, sans-serif"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #00A3E0", paddingBottom: "16px", marginBottom: "20px" }}>
                  <div>
                    <img src="/andritz-logo-blue.png" alt="ANDRITZ" style={{ height: "32px", objectFit: "contain", display: "block", marginBottom: "4px" }} />
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", letterSpacing: "0.5px" }}>
                      INDONESIA SERVICE CENTER • QA/QC DIVISION
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748B" }}>
                    <div><strong>ISO 9001:2015 CERTIFIED</strong></div>
                    <div>Dokumen No: <strong style={{ color: "#0F172A", fontFamily: "monospace" }}>{selectedInspectionForCert.certificateNo}</strong></div>
                  </div>
                </div>

                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#0B2545" }}>
                    Certificate of Fleet Tool Inspection
                  </h2>
                  <div style={{ fontSize: "0.85rem", color: "#64748B" }}>
                    Surat Keterangan Kelaikan & Pemeriksaan Teknis Peralatan Kerja
                  </div>
                </div>

                {/* Tool Meta Info */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    padding: "16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    fontSize: "0.85rem",
                    marginBottom: "20px"
                  }}
                >
                  <div>
                    <span style={{ color: "#64748B" }}>Tool Identification:</span>
                    <div style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#00A3E0" }}>{selectedInspectionForCert.toolCode}</div>
                    <div style={{ fontWeight: 600 }}>{selectedInspectionForCert.toolName}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Hasil Pemeriksaan (Verdict):</span>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: selectedInspectionForCert.verdict.includes("Pass") ? "#059669" : "#DC2626"
                      }}
                    >
                      {selectedInspectionForCert.verdict.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      Valid Hingga: <strong>{selectedInspectionForCert.nextInspectionDue}</strong>
                    </div>
                  </div>
                </div>

                {/* Findings */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>Catatan & Hasil Uji Fungsi:</div>
                  <div style={{ fontSize: "0.85rem", backgroundColor: "#F1F5F9", padding: "12px", borderRadius: "6px", color: "#334155" }}>
                    {selectedInspectionForCert.findings}
                  </div>
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px", paddingTop: "20px", borderTop: "1px solid #CBD5E1", fontSize: "0.8rem" }}>
                  <div>
                    <div style={{ color: "#64748B", marginBottom: "40px" }}>Diperiksa Oleh:</div>
                    <div style={{ fontWeight: "bold", borderBottom: "1px solid #000", display: "inline-block", paddingBottom: "2px" }}>
                      {selectedInspectionForCert.inspectorName}
                    </div>
                    <div style={{ color: "#64748B" }}>QA/QC Certified Inspector</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#64748B", marginBottom: "40px" }}>Disetujui Oleh:</div>
                    <div style={{ fontWeight: "bold", borderBottom: "1px solid #000", display: "inline-block", paddingBottom: "2px" }}>
                      Hendro Wibowo
                    </div>
                    <div style={{ color: "#64748B" }}>Fleet & Asset Manager ANDRITZ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
