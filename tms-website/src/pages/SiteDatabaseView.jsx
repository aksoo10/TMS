import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  MapPin,
  Building2,
  PlusCircle,
  Phone,
  User,
  Wrench,
  ExternalLink,
  Edit,
  Search,
  CheckCircle2,
  X,
  Layers,
  ArrowRight
} from "lucide-react";

export default function SiteDatabaseView() {
  const { sites, addSite, updateSite, tools, setActiveTab, setGlobalSearch, setSelectedSiteFilter } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);

  // Form state for adding new site
  const [newSiteData, setNewSiteData] = useState({
    name: "",
    code: "",
    region: "",
    type: "Customer Project Site",
    pic: "",
    contact: "",
    address: "",
    status: "Operational"
  });

  const filteredSites = sites.filter((site) => {
    const q = searchTerm.toLowerCase();
    return (
      site.name.toLowerCase().includes(q) ||
      site.code.toLowerCase().includes(q) ||
      site.region.toLowerCase().includes(q) ||
      site.pic.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSiteData.name || !newSiteData.pic) return;
    addSite(newSiteData);
    setShowAddModal(false);
    setNewSiteData({
      name: "",
      code: "",
      region: "",
      type: "Customer Project Site",
      pic: "",
      contact: "",
      address: "",
      status: "Operational"
    });
  };

  // Helper to count tools per site from actual live tools state
  const getToolCountForSite = (siteId) => {
    const siteObj = sites.find((s) => s.id === siteId);
    return tools.filter((t) => t.siteId === siteId || (siteObj && t.siteName === siteObj.name) || (siteObj && t.siteName?.toLowerCase() === siteObj.name.toLowerCase())).length;
  };

  const getActiveCheckedOutForSite = (siteId) => {
    const siteObj = sites.find((s) => s.id === siteId);
    return tools.filter((t) => (t.siteId === siteId || (siteObj && t.siteName === siteObj.name) || (siteObj && t.siteName?.toLowerCase() === siteObj.name.toLowerCase())) && t.status === "Checked Out").length;
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
            <span>Lokasi Operasional Fleet</span>
            <span>•</span>
            <span>Module 4</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>Site Database & Locations</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Kelola data master site, depot kalibrasi ISC, workshop regional, dan lokasi proyek pelanggan tempat perkakas ditempatkan.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={16} />
          <span>Tambah Site Baru</span>
        </button>
      </div>

      {/* Search & Overview Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        {/* Search */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ position: "relative" }}>
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
              placeholder="Cari nama site, kode, wilayah, atau PIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Aggregate Stats */}
        <div
          className="card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Site Aktif</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--atz-cyan)" }}>{sites.length} Lokasi</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Perkakas Tersebar</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-success)" }}>{tools.length} Tools</div>
          </div>
        </div>
      </div>

      {/* Sites Grid Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "20px"
        }}
      >
        {filteredSites.map((site) => {
          const toolCount = getToolCountForSite(site.id);
          const checkedOut = getActiveCheckedOutForSite(site.id);

          return (
            <div key={site.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--atz-cyan)" }}>
                      {site.code}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "2px" }}>{site.name}</h3>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {site.type}
                    </div>
                  </div>

                  <span className="status-pill status-available">{site.status}</span>
                </div>

                {/* Details List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "14px 0", fontSize: "0.825rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                    <MapPin size={15} color="var(--atz-cyan)" />
                    <span>{site.address}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                    <User size={15} color="var(--atz-cyan)" />
                    <span>PIC: <strong>{site.pic}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                    <Phone size={15} color="var(--atz-cyan)" />
                    <span>{site.contact}</span>
                  </div>
                </div>

                {/* Asset Metrics Pill */}
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: "16px"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Alat Berada di Site</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {toolCount} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>unit</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Sedang Dipinjam</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-warning)" }}>
                      {checkedOut} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>unit</span>
                    </div>
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
                <button
                  className="btn btn-outline-cyan btn-sm"
                  onClick={() => {
                    setSelectedSiteFilter(site.id);
                    setGlobalSearch("");
                    setActiveTab("tools-db");
                  }}
                  title="Lihat semua tools di site ini langsung di Tools Database"
                >
                  <Wrench size={14} /> Lihat Alat di Site Ini
                </button>

                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => setEditingSite(site)}
                  title="Edit Data Site"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Site Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Building2 size={20} color="var(--atz-cyan)" />
                Daftarkan Site / Lokasi Baru
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Nama Lokasi / Proyek Site <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Hydro Power Plant Musi Unit 1-3"
                    value={newSiteData.name}
                    onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Kode Site Singkat</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: HYD-MUSI"
                      value={newSiteData.code}
                      onChange={(e) => setNewSiteData({ ...newSiteData, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe Lokasi</label>
                    <select
                      className="form-select"
                      value={newSiteData.type}
                      onChange={(e) => setNewSiteData({ ...newSiteData, type: e.target.value })}
                    >
                      <option value="Customer Project Site">Customer Project Site</option>
                      <option value="ISC Regional Workshop">ISC Regional Workshop</option>
                      <option value="Hydro Power Plant">Hydro Power Plant</option>
                      <option value="Pulp & Paper Mill">Pulp & Paper Mill</option>
                      <option value="Mobile Service Container">Mobile Service Container</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">
                      PIC / Site Lead <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nama Supervisor"
                      value={newSiteData.pic}
                      onChange={(e) => setNewSiteData({ ...newSiteData, pic: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Telepon Kontak</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+62 812-XXXX-XXXX"
                      value={newSiteData.contact}
                      onChange={(e) => setNewSiteData({ ...newSiteData, contact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Wilayah / Region</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Bengkulu, Sumatra"
                    value={newSiteData.region}
                    onChange={(e) => setNewSiteData({ ...newSiteData, region: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-control"
                    placeholder="Alamat fisik warehouse / container site..."
                    value={newSiteData.address}
                    onChange={(e) => setNewSiteData({ ...newSiteData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Site Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Site Modal */}
      {editingSite && (
        <div className="modal-overlay" onClick={() => setEditingSite(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit size={20} color="var(--atz-cyan)" />
                Edit Informasi Site: {editingSite.name}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingSite(null)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSite(editingSite.id, editingSite);
                setEditingSite(null);
              }}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Site</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingSite.name}
                    onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIC Supervisor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingSite.pic}
                    onChange={(e) => setEditingSite({ ...editingSite, pic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kontak</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingSite.contact}
                    onChange={(e) => setEditingSite({ ...editingSite, contact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <textarea
                    className="form-control"
                    value={editingSite.address}
                    onChange={(e) => setEditingSite({ ...editingSite, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSite(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Perbarui Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
