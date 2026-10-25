import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { INITIAL_USERS } from "../data/initialData";
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle2,
  HardHat,
  Cpu,
  Layers,
  Wrench,
  Globe2
} from "lucide-react";

export default function LoginView() {
  const { login, setActiveTab } = useApp();
  const [selectedUser, setSelectedUser] = useState(INITIAL_USERS[0]);
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(selectedUser);
    setActiveTab("dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
        backgroundImage: `
          linear-gradient(135deg, rgba(6, 17, 33, 0.74) 0%, rgba(3, 10, 20, 0.80) 50%, rgba(4, 12, 24, 0.86) 100%),
          url("/login-bg.png")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Ambient Lighting & Depth Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 80% 20%, rgba(0, 163, 224, 0.2) 0%, transparent 60%)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(2, 6, 12, 0.65) 0%, transparent 40%)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          backgroundColor: "rgba(11, 22, 38, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 163, 224, 0.2)",
          overflow: "hidden",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Left Side: ANDRITZ Industrial Branding & Identity */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(7, 21, 38, 0.92) 0%, rgba(13, 34, 59, 0.94) 100%)",
            padding: "48px 40px",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            position: "relative"
          }}
        >
          {/* Top Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
              <img
                src="/andritz-logo-blue.png"
                alt="ANDRITZ"
                style={{
                  height: "42px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block"
                }}
              />
              <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "14px" }}>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "0.5px" }}>
                  ISC FLEET MANAGEMENT
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--atz-cyan)", textTransform: "uppercase" }}>
                  Tool Management System (TMS)
                </div>
              </div>
            </div>

            <h1
              style={{
                fontSize: "1.95rem",
                fontWeight: "800",
                lineHeight: "1.25",
                marginBottom: "16px",
                color: "#FFFFFF"
              }}
            >
              Presisi & Manajemen Aset Standar Industri Global
            </h1>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.925rem", lineHeight: "1.6" }}>
              Platform terpadu untuk pelacakan inventaris perkakas kritis, pergerakan tools lintas site, sertifikasi inspeksi berkala, serta kalibrasi peralatan industri ANDRITZ Indonesia.
            </p>

            {/* Value Pillars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={18} color="var(--atz-cyan)" />
                <span>Pelacakan Barcode & QR Real-Time Multi-Site</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={18} color="var(--atz-cyan)" />
                <span>Check-Out / Check-In dengan Integrasi Surat Jalan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={18} color="var(--atz-cyan)" />
                <span>Form Digital Inspeksi & Sertifikasi Kelayakan QA/QC</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={18} color="var(--atz-cyan)" />
                <span>Audit Trail Lengkap Sesuai Standar ISO 9001 / 45001</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div
            style={{
              paddingTop: "32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.5)"
            }}
          >
            <span>ANDRITZ Group • Austria / Indonesia</span>
            <span>ISC Secure Node v4.2</span>
          </div>
        </div>

        {/* Right Side: Login Form with Role Selection */}
        <div style={{ padding: "44px 38px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: "var(--atz-cyan-glow)",
                color: "var(--atz-cyan)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "8px"
              }}
            >
              <Shield size={13} />
              Portal Autentikasi Pengguna
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Masuk ke Sistem TMS</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
              Silakan pilih profil demo untuk mencoba hak akses spesifik peran:
            </p>
          </div>

          {/* Quick Role Switcher */}
          <div style={{ marginBottom: "20px" }}>
            {/* 1. Super Admin Featured Card */}
            {(() => {
              const superUser = INITIAL_USERS.find((u) => u.roleSlug === "super-admin") || INITIAL_USERS[0];
              const isSelected = selectedUser.id === superUser.id;
              return (
                <div
                  key={superUser.id}
                  onClick={() => setSelectedUser(superUser)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${isSelected ? "var(--atz-cyan)" : "rgba(0, 163, 224, 0.3)"}`,
                    backgroundColor: isSelected ? "rgba(0, 163, 224, 0.15)" : "rgba(0, 163, 224, 0.05)",
                    cursor: "pointer",
                    marginBottom: "12px",
                    transition: "all var(--transition-fast)",
                    boxShadow: isSelected ? "0 0 16px rgba(0, 163, 224, 0.25)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: "#00A3E0",
                          color: "#FFFFFF",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase"
                        }}
                      >
                        <Globe2 size={11} /> Super Admin
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: isSelected ? "var(--atz-cyan)" : "#FFFFFF" }}>
                        {superUser.name}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} color="var(--atz-cyan)" />}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {superUser.title} • <strong style={{ color: "var(--atz-cyan)" }}>Akses Seluruh 6 Site (Global)</strong>
                  </div>
                </div>
              );
            })()}

            {/* 2. Site Admins Header */}
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Lock size={12} color="var(--color-warning)" />
              Admin Site Khusus (Hanya Melihat & Mengelola Site Masing-Masing):
            </div>

            {/* 3. Grid of 6 Site Admins */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {INITIAL_USERS.filter((u) => u.roleSlug !== "super-admin").map((usr) => {
                const isSelected = selectedUser.id === usr.id;
                return (
                  <div
                    key={usr.id}
                    onClick={() => setSelectedUser(usr)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${isSelected ? "var(--atz-cyan)" : "var(--border-subtle)"}`,
                      backgroundColor: isSelected ? "var(--bg-surface-active)" : "var(--bg-surface-elevated)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: isSelected ? "var(--atz-cyan)" : "var(--text-primary)" }}>
                        {usr.role}
                      </span>
                      {isSelected && <CheckCircle2 size={13} color="var(--atz-cyan)" />}
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {usr.name}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px", display: "flex", alignItems: "center", gap: "3px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: usr.badgeColor || "#10B981" }} />
                      {usr.site}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formal Form */}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>
                Alamat Email / ID Karyawan <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: "36px", height: "38px", fontSize: "0.85rem" }}
                  value={selectedUser.email}
                  readOnly
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>
                Kata Sandi <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: "36px", height: "38px", fontSize: "0.85rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "var(--atz-cyan)" }}
                />
                Ingat sesi saya di terminal ini
              </label>
              <a href="#reset" onClick={(e) => e.preventDefault()} style={{ fontSize: "0.78rem", color: "var(--atz-cyan)", textDecoration: "none" }}>
                Bantuan Akses?
              </a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "42px", fontWeight: 700 }}>
              <span>Masuk Sebagai {selectedUser.role}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Active Role Scope Information */}
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: selectedUser.site === "ALL" ? "rgba(0, 163, 224, 0.1)" : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${selectedUser.site === "ALL" ? "rgba(0, 163, 224, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
              fontSize: "0.76rem",
              color: "var(--text-secondary)"
            }}
          >
            {selectedUser.site === "ALL" ? (
              <div>
                <strong style={{ color: "var(--atz-cyan)" }}>🌐 Hak Akses Super Admin:</strong> Memiliki izin melihat dan mengelola inventaris di <strong>seluruh 6 site</strong> ANDRITZ (OKI I, OKI II, TELL, ISC, IKPP, IKPD).
              </div>
            ) : (
              <div>
                <strong style={{ color: "var(--color-warning)" }}>🔒 Hak Akses Admin Site:</strong> Khusus mengelola inventaris & transaksi di <strong>{selectedUser.site}</strong>. Sesuai kebijakan keamanan, hanya Super Admin yang dapat melihat seluruh site.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
