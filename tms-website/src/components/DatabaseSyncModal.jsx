import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
  Server,
  X,
  FileCode,
  ShieldCheck
} from "lucide-react";

export default function DatabaseSyncModal({ isOpen, onClose }) {
  const {
    tools,
    sites,
    movements,
    inspections,
    historical,
    dbStatus,
    refreshFromDatabase,
    exportAllDataAsJSON,
    importAllDataFromJSON,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState("sync"); // 'sync' | 'export_code' | 'cloud_guide'
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importError, setImportError] = useState("");

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshFromDatabase();
    setIsRefreshing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const res = importAllDataFromJSON(text);
        if (res.success) {
          setImportError("");
          showToast("Impor Berhasil", `${res.toolsCount} perkakas berhasil dipulihkan ke sistem!`, "success");
        } else {
          setImportError(res.message || "Format data tidak valid");
        }
      } catch (err) {
        setImportError("Gagal membaca file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const generateToolsCode = () => {
    return `// Update untuk tms-website/src/data/initialData.js (Bagian INITIAL_TOOLS)\nexport const INITIAL_TOOLS = ${JSON.stringify(tools, null, 2)};`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateToolsCode());
    setCopiedCode(true);
    showToast("Disalin ke Clipboard", "Kode INITIAL_TOOLS berhasil disalin!", "success");
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const isConnected = dbStatus?.online;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "var(--text-primary)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface-elevated)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(0, 163, 224, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isConnected ? "var(--color-success)" : "var(--atz-cyan)"
              }}
            >
              {isConnected ? <Database size={22} /> : <Cloud size={22} />}
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                Sinkronisasi Database Localhost & Vercel
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Kelola aliran data antara MySQL Laragon (Localhost) dan Hosting Cloud (Vercel)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div
          style={{
            padding: "14px 24px",
            backgroundColor: isConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isConnected ? "#10B981" : "#F59E0B",
                boxShadow: isConnected ? "0 0 8px #10B981" : "0 0 8px #F59E0B"
              }}
            />
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                {isConnected ? "🟢 Terhubung ke MySQL Database (Localhost)" : "🟡 Mode Cloud Standalone (Vercel / LocalStorage)"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {dbStatus?.message || "Data aktif di browser dan memori lokal"} • Total: <strong>{tools.length} Tools</strong> terdaftar
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.78rem", gap: "6px" }}
          >
            <RefreshCw size={14} className={isRefreshing ? "spin-animation" : ""} />
            {isRefreshing ? "Mengecek..." : "Cek Koneksi"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 24px",
            gap: "8px",
            backgroundColor: "var(--bg-surface)"
          }}
        >
          <button
            onClick={() => setActiveTab("sync")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "sync" ? "2px solid var(--atz-cyan)" : "2px solid transparent",
              color: activeTab === "sync" ? "var(--atz-cyan)" : "var(--text-muted)",
              fontWeight: activeTab === "sync" ? 700 : 500,
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Download size={15} />
            Solusi 1: Export & Import Data (Instan)
          </button>
          <button
            onClick={() => setActiveTab("export_code")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "export_code" ? "2px solid var(--atz-cyan)" : "2px solid transparent",
              color: activeTab === "export_code" ? "var(--atz-cyan)" : "var(--text-muted)",
              fontWeight: activeTab === "export_code" ? 700 : 500,
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FileCode size={15} />
            Solusi 2: Update ke Kode (Permanen)
          </button>
          <button
            onClick={() => setActiveTab("cloud_guide")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              borderBottom: activeTab === "cloud_guide" ? "2px solid var(--atz-cyan)" : "2px solid transparent",
              color: activeTab === "cloud_guide" ? "var(--atz-cyan)" : "var(--text-muted)",
              fontWeight: activeTab === "cloud_guide" ? 700 : 500,
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Server size={15} />
            Solusi 3: Database Online
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Explanation Alert */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(0, 163, 224, 0.08)",
              border: "1px solid rgba(0, 163, 224, 0.25)",
              display: "flex",
              gap: "12px"
            }}
          >
            <Info size={18} color="var(--atz-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.82rem", lineHeight: "1.5" }}>
              <strong>Mengapa data di Vercel berbeda dengan Localhost?</strong>
              <br />
              Server Vercel berada di cloud internet publik, sedangkan database MySQL Anda berada di komputer lokal Anda (<code>127.0.0.1:3306</code>). Server Vercel di internet tidak bisa mengakses localhost komputer Anda tanpa database cloud publik atau sinkronisasi data.
            </div>
          </div>

          {/* TAB 1: Instant Sync (Export & Import) */}
          {activeTab === "sync" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                Pindahkan Data Lengkap dari Localhost ke Vercel (Hanya 1 Klik):
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px"
                }}
              >
                {/* Step A: Export */}
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    backgroundColor: "var(--bg-surface-elevated)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "var(--atz-cyan)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        1
                      </span>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Langkah 1: di Localhost</div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                      Buka website di localhost laptop Anda, lalu klik tombol download di bawah untuk menyimpan seluruh data ({tools.length} Tools, {movements.length} Pergerakan, {inspections.length} Inspeksi) ke file backup.
                    </div>
                  </div>

                  <button
                    onClick={exportAllDataAsJSON}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", gap: "8px", fontSize: "0.82rem" }}
                  >
                    <Download size={16} />
                    Download File Backup (.json)
                  </button>
                </div>

                {/* Step B: Import */}
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-medium)",
                    backgroundColor: "var(--bg-surface-elevated)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#10B981",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        2
                      </span>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Langkah 2: di Vercel</div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                      Buka website Anda di Vercel, buka menu ini, lalu pilih file backup yang sudah Anda download tadi. Seketika semua data baru Anda akan langsung muncul di Vercel!
                    </div>
                  </div>

                  <label
                    className="btn btn-secondary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      borderColor: "var(--color-success)",
                      color: "var(--color-success)"
                    }}
                  >
                    <Upload size={16} />
                    Upload File Backup ke Vercel
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {importError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "var(--color-danger)",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <AlertTriangle size={15} />
                  {importError}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Permanent Code Sync */}
          {activeTab === "export_code" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                Jika Anda ingin agar data yang sudah di-input <strong>selalu otomatis muncul bagi semua orang</strong> di Vercel tanpa perlu upload file manual:
              </div>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-medium)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    1. Salin Kode Data ({tools.length} Tools saat ini):
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="btn btn-primary"
                    style={{ padding: "5px 12px", fontSize: "0.78rem", gap: "6px" }}
                  >
                    {copiedCode ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copiedCode ? "Tersalin!" : "Salin Kode ke Clipboard"}
                  </button>
                </div>

                <textarea
                  readOnly
                  value={generateToolsCode()}
                  style={{
                    width: "100%",
                    height: "170px",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    padding: "10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-surface-active)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    resize: "none"
                  }}
                />

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "12px", lineHeight: "1.5" }}>
                  <strong>2. Cara Penerapan:</strong>
                  <br />
                  Tempelkan (paste) kode di atas ke file <code>tms-website/src/data/initialData.js</code> (menggantikan array <code>INITIAL_TOOLS</code> lama). Kemudian lakukan <code>git commit</code> dan <code>git push</code>. Vercel akan otomatis melakukan build dan semua data baru langsung tampil untuk semua pengunjung!
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Online Cloud Database Guide */}
          {activeTab === "cloud_guide" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                Jika Anda membutuhkan <strong>database MySQL online 24/7</strong> yang bisa diakses secara langsung dan live oleh Vercel:
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-medium)"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--atz-cyan)", marginBottom: "4px" }}>
                    Opsi A: Database Cloud Gratis (TiDB Serverless / Supabase / Aiven)
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    Daftar akun gratis di <strong>TiDB Cloud</strong> atau <strong>Aiven MySQL</strong>, import file <code>database/tms_isc.sql</code>, dan hosting file folder <code>api/</code> di server hosting (atau VPS / Railway).
                  </div>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-medium)"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#10B981", marginBottom: "4px" }}>
                    Opsi B: Hubungkan ke Vercel via Environment Variable
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    Di dashboard proyek Vercel Anda, buka <strong>Settings &gt; Environment Variables</strong>, lalu tambahkan:
                    <br />
                    <code>VITE_API_BASE_URL = https://url-backend-online-anda/api</code>
                  </div>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-medium)"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#F59E0B", marginBottom: "4px" }}>
                    Opsi C: Gunakan Tunneling Ngrok / Cloudflare Tunnel
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    Jika ingin Vercel terhubung langsung ke Laragon di laptop Anda untuk presentasi / testing, jalankan:
                    <br />
                    <code>ngrok http 80</code> lalu masukkan URL publik ngrok tersebut ke Vercel.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-surface-elevated)"
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color="#10B981" />
            ANDRITZ TMS Enterprise Data Resilience
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: "8px 20px" }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
