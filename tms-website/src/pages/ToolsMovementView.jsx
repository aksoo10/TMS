import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  X,
  FileText,
  Calendar,
  User,
  MapPin,
  Wrench,
  Download,
  Edit,
  Trash2,
  Lock,
  Globe2
} from "lucide-react";

export default function ToolsMovementView() {
  const {
    tools,
    sites,
    movements,
    checkOutTool,
    checkInTool,
    transferTool,
    updateMovement,
    deleteMovement,
    currentUser,
    isSuperAdmin,
    isItemInUserScope
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState("all-movements"); // 'all-movements', 'checkout-form', 'transfer-form'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL', 'Active', 'Returned'

  // Modals for Actions
  const [checkInMovement, setCheckInMovement] = useState(null);
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [editingMovement, setEditingMovement] = useState(null);
  const [deletingMovement, setDeletingMovement] = useState(null);

  // Check-Out Form State
  const [checkoutData, setCheckoutData] = useState({
    toolId: "",
    borrowerName: currentUser ? currentUser.name : "Reza Pratama",
    borrowerId: currentUser ? currentUser.id : "EMP-4491",
    destinationSiteId: sites[1]?.id || "SITE-IKPD",
    workOrder: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
    expectedReturnDate: "2026-11-20",
    notes: "Pekerjaan pemeliharaan preventif overhaul unit turbine/plant"
  });

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    toolId: "",
    toSiteId: sites[2]?.id || "SITE-OKI-1",
    waybillNumber: `SJ-ISC-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: "Relokasi armada tools untuk support project overhaul site"
  });

  // Tools available for checkout (scoped to user's site for Site Admins)
  const availableTools = tools.filter(
    (t) => t.status === "Available" && (isSuperAdmin || isItemInUserScope(t.siteId, t.siteName))
  );

  // Filtered movements (scoped to user's site for Site Admins)
  const filteredMovements = movements.filter((m) => {
    if (!isSuperAdmin) {
      const matchFrom = isItemInUserScope(null, m.fromSite);
      const matchTo = isItemInUserScope(null, m.toSite);
      if (!matchFrom && !matchTo) return false;
    }

    const q = searchTerm.toLowerCase();
    const matchesSearch =
      m.toolCode.toLowerCase().includes(q) ||
      m.toolName.toLowerCase().includes(q) ||
      m.borrowerName.toLowerCase().includes(q) ||
      m.workOrder.toLowerCase().includes(q) ||
      m.toSite.toLowerCase().includes(q) ||
      (m.fromSite && m.fromSite.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutData.toolId || !checkoutData.borrowerName) return;

    checkOutTool({
      toolId: checkoutData.toolId,
      borrowerName: checkoutData.borrowerName,
      borrowerId: checkoutData.borrowerId,
      destinationSiteId: checkoutData.destinationSiteId,
      workOrder: checkoutData.workOrder,
      expectedReturnDate: checkoutData.expectedReturnDate,
      notes: checkoutData.notes
    });

    setActiveSubTab("all-movements");
    setCheckoutData({
      toolId: "",
      borrowerName: currentUser ? currentUser.name : "Reza Pratama",
      borrowerId: currentUser ? currentUser.id : "EMP-4491",
      destinationSiteId: sites[1]?.id || "SITE-IKPD",
      workOrder: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      expectedReturnDate: "2026-11-20",
      notes: ""
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferData.toolId || !transferData.toSiteId) return;

    transferTool({
      toolId: transferData.toolId,
      toSiteId: transferData.toSiteId,
      waybillNumber: transferData.waybillNumber,
      notes: transferData.notes
    });

    setActiveSubTab("all-movements");
    setTransferData({
      toolId: "",
      toSiteId: sites[2]?.id || "SITE-OKI-1",
      waybillNumber: `SJ-ISC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: ""
    });
  };

  const handleConfirmCheckIn = (e) => {
    e.preventDefault();
    if (!checkInMovement) return;
    checkInTool(checkInMovement.id, returnCondition, returnNotes);
    setCheckInMovement(null);
    setReturnNotes("");
    setReturnCondition("Good");
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
            <span>Logistik & Mobilisasi Fleet</span>
            <span>•</span>
            <span>Module 6</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Tools Movement (Peminjaman & Perpindahan)</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Catat peminjaman peralatan ke site (check-out), konfirmasi pengembalian (check-in), dan transfer armada antar-hub ANDRITZ.
          </p>
        </div>

        {/* Action Tabs Switcher */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className={`btn ${activeSubTab === "all-movements" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("all-movements")}
          >
            <ArrowLeftRight size={16} />
            <span>Riwayat & Peminjaman Aktif</span>
          </button>
          <button
            className={`btn ${activeSubTab === "checkout-form" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("checkout-form")}
          >
            <ArrowUpRight size={16} />
            <span>Form Check-Out Baru</span>
          </button>
          <button
            className={`btn ${activeSubTab === "transfer-form" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("transfer-form")}
          >
            <Truck size={16} />
            <span>Transfer Antar Site</span>
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
              <strong style={{ color: "var(--color-warning)" }}>Scope Logistik Admin Site ({currentUser?.site}):</strong> Anda hanya melihat catatan peminjaman dan tools yang bersumber atau ditujukan ke <strong>{currentUser?.site}</strong>. Hanya <strong>Super Admin</strong> yang memiliki hak akses melihat seluruh logistik 6 site.
            </span>
          </div>
          <span className="status-pill status-checked-out" style={{ fontSize: "0.72rem" }}>
            {filteredMovements.length} Pergerakan di Site Ini
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
              <strong style={{ color: "var(--atz-cyan)" }}>Monitoring Global Super Admin:</strong> Memantau pergerakan tools lintas seluruh 6 site ANDRITZ (OKI I, OKI II, TELL, ISC, IKPP, IKPD).
            </span>
          </div>
          <span className="status-pill status-available" style={{ fontSize: "0.72rem" }}>
            {movements.length} Total Pergerakan Global
          </span>
        </div>
      )}

      {/* SubTab 1: All Movements Table & Active Borrowings */}
      {activeSubTab === "all-movements" && (
        <div>
          {/* Controls Bar */}
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
                  placeholder="Cari nomor WO, peminjam, kode tool, atau site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "200px" }}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Active">Sedang Dipinjam (Aktif)</option>
                  <option value="Returned">Telah Dikembalikan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Movements Data Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Movement</th>
                    <th>Tipe</th>
                    <th>Alat / Tool Info</th>
                    <th>Peminjam (PIC)</th>
                    <th>Work Order / No SJ</th>
                    <th>Rute Perpindahan</th>
                    <th>Tanggal Pinjam</th>
                    <th>Target Kembali</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        Tidak ada catatan pergerakan tools yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mov) => (
                      <tr key={mov.id}>
                        {/* Movement ID */}
                        <td>
                          <span className="font-mono" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--atz-cyan)" }}>
                            {mov.id}
                          </span>
                        </td>

                        {/* Movement Type */}
                        <td>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color:
                                mov.type === "Check-Out"
                                  ? "var(--color-warning)"
                                  : mov.type === "Check-In"
                                  ? "var(--color-success)"
                                  : "var(--atz-cyan)"
                            }}
                          >
                            {mov.type === "Check-Out" && <ArrowUpRight size={14} />}
                            {mov.type === "Check-In" && <ArrowDownLeft size={14} />}
                            {mov.type === "Transfer" && <Truck size={14} />}
                            {mov.type}
                          </span>
                        </td>

                        {/* Tool Info */}
                        <td>
                          <div className="font-mono" style={{ fontWeight: 700 }}>{mov.toolCode}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {mov.toolName}
                          </div>
                        </td>

                        {/* Borrower */}
                        <td>
                          <div style={{ fontWeight: 600 }}>{mov.borrowerName}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{mov.borrowerId}</div>
                        </td>

                        {/* Work Order */}
                        <td>
                          <span className="font-mono" style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {mov.workOrder}
                          </span>
                        </td>

                        {/* Route */}
                        <td>
                          <div style={{ fontSize: "0.78rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Dari: </span>
                            <strong>{mov.fromSite}</strong>
                          </div>
                          <div style={{ fontSize: "0.78rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Ke: </span>
                            <strong style={{ color: "var(--atz-cyan)" }}>{mov.toSite}</strong>
                          </div>
                        </td>

                        {/* Checkout Date */}
                        <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {mov.checkoutDate}
                        </td>

                        {/* Return Date */}
                        <td style={{ fontSize: "0.78rem" }}>
                          {mov.actualReturnDate ? (
                            <span style={{ color: "var(--color-success)" }}>Kembali: {mov.actualReturnDate.substring(0, 10)}</span>
                          ) : (
                            <span style={{ color: "var(--color-warning)", fontWeight: 600 }}>{mov.expectedReturnDate}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`status-pill ${mov.status === "Active" ? "status-checked-out" : "status-available"}`}>
                            {mov.status === "Active" ? "Dipinjam" : "Returned"}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                            {mov.status === "Active" ? (
                              <button
                                className="btn btn-outline-cyan btn-sm"
                                onClick={() => setCheckInMovement(mov)}
                                title="Konfirmasi Pengembalian Alat (Check-In)"
                                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                              >
                                <ArrowDownLeft size={13} /> Kembalikan
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 6px" }}>
                                <CheckCircle2 size={13} /> Selesai
                              </span>
                            )}

                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ width: "30px", height: "30px", padding: 0 }}
                              onClick={() => setEditingMovement({ ...mov })}
                              title="Edit Transaksi Movement"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ width: "30px", height: "30px", padding: 0, color: "var(--color-danger)" }}
                              onClick={() => setDeletingMovement(mov)}
                              title="Hapus Transaksi Movement"
                            >
                              <Trash2 size={14} />
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
        </div>
      )}

      {/* SubTab 2: Check-Out Form (Peminjaman ke Site / Proyek) */}
      {activeSubTab === "checkout-form" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ArrowUpRight size={20} color="var(--atz-cyan)" />
                Formulir Peminjaman Peralatan (Tool Check-Out)
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab("all-movements")}>
                Batal
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              {/* Select Tool from Available Fleet */}
              <div className="form-group">
                <label className="form-label">
                  Pilih Peralatan Yang Akan Dipinjam <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={checkoutData.toolId}
                  onChange={(e) => setCheckoutData({ ...checkoutData, toolId: e.target.value })}
                  required
                >
                  <option value="">-- Pilih dari {availableTools.length} tools yang siap/tersedia --</option>
                  {availableTools.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name} (Lokasi: {t.siteName} - {t.binLocation})
                    </option>
                  ))}
                </select>
                {availableTools.length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: "4px" }}>
                    Saat ini tidak ada tools berstatus Available. Silakan lakukan check-in pengembalian terlebih dahulu.
                  </div>
                )}
              </div>

              {/* Borrower Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Nama Peminjam / Engineer Lead <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama lengkap peminjam"
                    value={checkoutData.borrowerName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, borrowerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ID Karyawan (Badge No)</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="EMP-XXXX"
                    value={checkoutData.borrowerId}
                    onChange={(e) => setCheckoutData({ ...checkoutData, borrowerId: e.target.value })}
                  />
                </div>
              </div>

              {/* Site & Work Order */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Tujuan Site / Proyek Lapangan <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={checkoutData.destinationSiteId}
                    onChange={(e) => setCheckoutData({ ...checkoutData, destinationSiteId: e.target.value })}
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nomor Work Order (WO) / Proyek <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="Contoh: WO-2026-HYD-044"
                    value={checkoutData.workOrder}
                    onChange={(e) => setCheckoutData({ ...checkoutData, workOrder: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Return Date & Notes */}
              <div className="form-group">
                <label className="form-label">Perkiraan Tanggal Pengembalian (Expected Return)</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkoutData.expectedReturnDate}
                  onChange={(e) => setCheckoutData({ ...checkoutData, expectedReturnDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Lingkup Kerja & Kondisi Saat Keluar</label>
                <textarea
                  className="form-control"
                  placeholder="Catatan inspeksi visual awal sebelum dipinjamkan..."
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveSubTab("all-movements")}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={availableTools.length === 0}>
                  <CheckCircle2 size={16} /> Konfirmasi Check-Out Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubTab 3: Inter-Site Transfer Form */}
      {activeSubTab === "transfer-form" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Truck size={20} color="var(--atz-cyan)" />
                Formulir Relokasi Fleet Antar Site (Inter-Site Transfer)
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab("all-movements")}>
                Batal
              </button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Pilih Peralatan Yang Direlokasi <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={transferData.toolId}
                  onChange={(e) => setTransferData({ ...transferData, toolId: e.target.value })}
                  required
                >
                  <option value="">-- Pilih peralatan --</option>
                  {tools.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name} (Site Saat Ini: {t.siteName})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">
                    Site Tujuan Pemindahan <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={transferData.toSiteId}
                    onChange={(e) => setTransferData({ ...transferData, toSiteId: e.target.value })}
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Surat Jalan / Waybill (SJ)</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    value={transferData.waybillNumber}
                    onChange={(e) => setTransferData({ ...transferData, waybillNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alasan Relokasi / Catatan Ekspedisi</label>
                <textarea
                  className="form-control"
                  placeholder="Instruksi handling, nomor tracking ekspedisi, PIC penerima di site tujuan..."
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveSubTab("all-movements")}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Truck size={16} /> Jalankan Transfer Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-In / Return Tool Modal */}
      {checkInMovement && (
        <div className="modal-overlay" onClick={() => setCheckInMovement(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <ArrowDownLeft size={20} color="var(--color-success)" />
                Konfirmasi Pengembalian Alat (Check-In)
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setCheckInMovement(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn}>
              <div className="modal-body">
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "16px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Peralatan yang Dikembalikan:</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--atz-cyan)" }}>
                    {checkInMovement.toolCode} - {checkInMovement.toolName}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Peminjam: <strong>{checkInMovement.borrowerName}</strong> | WO: <strong>{checkInMovement.workOrder}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Kondisi Fisik & Fungsi Saat Dikembalikan <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    <option value="Good">Bagus (Good - Siap Operasional Kembali)</option>
                    <option value="Acceptable">Wajar (Minor Wear - Masih Layak Pakai)</option>
                    <option value="Damaged">Rusak / Bocor (Damaged - Masuk Maintenance)</option>
                    <option value="Needs Inspection">Perlu Rekalibrasi / Inspeksi Ulang</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Hasil Verifikasi Pengembalian</label>
                  <textarea
                    className="form-control"
                    placeholder="Contoh: Alat bersih, coupling sudah dilumasi, accessories lengkap..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCheckInMovement(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle2 size={16} /> Verifikasi & Terima Alat (Check-In)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movement Modal */}
      {editingMovement && (
        <div className="modal-overlay" onClick={() => setEditingMovement(null)}>
          <div className="modal-dialog" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit size={20} color="var(--atz-cyan)" />
                <span>Edit Transaksi Movement: <strong className="font-mono" style={{ color: "var(--atz-cyan)" }}>{editingMovement.id}</strong></span>
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingMovement(null)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMovement(editingMovement.id, editingMovement);
                setEditingMovement(null);
              }}
            >
              <div className="modal-body">
                {/* Tool Info Banner */}
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "16px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Peralatan</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      <span className="font-mono" style={{ color: "var(--atz-cyan)", marginRight: "6px" }}>{editingMovement.toolCode}</span>
                      {editingMovement.toolName}
                    </div>
                  </div>
                  <span
                    className="status-pill"
                    style={{
                      backgroundColor: editingMovement.type === "Check-Out" ? "rgba(245, 158, 11, 0.15)" : "rgba(0, 163, 224, 0.15)",
                      color: editingMovement.type === "Check-Out" ? "var(--color-warning)" : "var(--atz-cyan)"
                    }}
                  >
                    {editingMovement.type}
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Peminjam (PIC) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingMovement.borrowerName || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, borrowerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIK / ID Karyawan</label>
                    <input
                      type="text"
                      className="form-control font-mono"
                      value={editingMovement.borrowerId || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, borrowerId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Work Order / Nomor SJ <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-mono"
                      value={editingMovement.workOrder || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, workOrder: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Transaksi</label>
                    <select
                      className="form-select"
                      value={editingMovement.status || "Active"}
                      onChange={(e) => setEditingMovement({ ...editingMovement, status: e.target.value })}
                    >
                      <option value="Active">Dipinjam (Active)</option>
                      <option value="Returned">Returned (Telah Dikembalikan)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Site Asal (Dari)</label>
                    <select
                      className="form-select"
                      value={editingMovement.fromSite || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, fromSite: e.target.value })}
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Site Tujuan (Ke)</label>
                    <select
                      className="form-select"
                      value={editingMovement.toSite || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, toSite: e.target.value })}
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Pinjam</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingMovement.checkoutDate || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, checkoutDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Tanggal Kembali</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingMovement.expectedReturnDate || ""}
                      onChange={(e) => setEditingMovement({ ...editingMovement, expectedReturnDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Operasional / Keterangan</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editingMovement.notes || ""}
                    onChange={(e) => setEditingMovement({ ...editingMovement, notes: e.target.value })}
                    placeholder="Keterangan perbaikan, instruksi project..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingMovement(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Movement Confirmation Modal */}
      {deletingMovement && (
        <div className="modal-overlay" onClick={() => setDeletingMovement(null)}>
          <div className="modal-dialog" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                <Trash2 size={20} />
                <span>Hapus Catatan Movement</span>
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setDeletingMovement(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: "14px", fontSize: "0.9rem" }}>
                Apakah Anda yakin ingin menghapus data pergerakan <strong>{deletingMovement.id}</strong>?
              </p>

              <div
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  padding: "14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Tool: </span>
                  <strong style={{ color: "var(--atz-cyan)" }}>{deletingMovement.toolCode}</strong> - {deletingMovement.toolName}
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Peminjam / PIC: </span>
                  <strong>{deletingMovement.borrowerName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Work Order / SJ: </span>
                  <span className="font-mono">{deletingMovement.workOrder}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Status: </span>
                  <span className={`status-pill ${deletingMovement.status === "Active" ? "status-checked-out" : "status-available"}`} style={{ display: "inline-block" }}>
                    {deletingMovement.status === "Active" ? "Dipinjam (Active)" : "Returned"}
                  </span>
                </div>
              </div>

              {deletingMovement.status === "Active" && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "10px 12px",
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--color-warning)",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px"
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Pemberitahuan:</strong> Karena transaksi ini masih berstatus <em>Dipinjam</em>, menghapus catatan ini akan otomatis mengembalikan status peralatan menjadi <strong>Available (Tersedia)</strong>.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingMovement(null)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteMovement(deletingMovement.id);
                  setDeletingMovement(null);
                }}
                style={{ backgroundColor: "var(--color-danger)", color: "#fff", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Trash2 size={16} /> Ya, Hapus Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
