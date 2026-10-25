import React from "react";
import { Printer, X, QrCode, Tag, ShieldCheck, Download } from "lucide-react";
import BarcodeRenderer from "./BarcodeRenderer";

export default function BarcodeModal({ tool, onClose }) {
  if (!tool) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Tag size={20} color="var(--atz-cyan)" />
            Label Barcode & Identitas Alat
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Label aset standar ANDRITZ ISC untuk penempelan pada fisik peralatan, rugged case, atau storage bin.
          </div>

          {/* Printable Sticker Preview */}
          <div className="printable-area">
            <div className="barcode-sticker">
              <div className="barcode-sticker-header">
                <div style={{ textAlign: "left" }}>
                  <img src="/andritz-logo-blue.png" alt="ANDRITZ" style={{ height: "26px", objectFit: "contain", display: "block", marginBottom: "3px" }} />
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#333", letterSpacing: "0.5px" }}>
                    INDONESIA SERVICE CENTER
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.72rem", color: "#444" }}>
                  <div><strong>ISO 9001</strong> VERIFIED</div>
                  <div style={{ color: "#00A3E0", fontWeight: "bold" }}>TMS FLEET ASSET</div>
                </div>
              </div>

              {/* Tool Primary Details */}
              <div style={{ textAlign: "left", margin: "10px 0" }}>
                <div style={{ fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>Tool Identification</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#111" }}>{tool.code}</div>
                <div style={{ fontSize: "0.85rem", color: "#333", fontWeight: 500, margin: "2px 0 6px" }}>{tool.name}</div>
              </div>

              {/* Specs Grid */}
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
                  fontSize: "0.75rem",
                  color: "#222"
                }}
              >
                <div>
                  <span style={{ color: "#777" }}>Material No:</span>
                  <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>{tool.materialNo || "MAT-PENDING"}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Serial No:</span>
                  <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>{tool.serialNo || "-"}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Base Site:</span>
                  <div style={{ fontWeight: 600 }}>{tool.siteName ? tool.siteName.split(" ")[0] : "ISC Depot"}</div>
                </div>
                <div>
                  <span style={{ color: "#777" }}>Calib Due:</span>
                  <div style={{ fontWeight: "bold", color: "#d97706" }}>{tool.nextCalibrationDate || "2027-01-01"}</div>
                </div>
              </div>

              {/* Visual Barcode Graphic (Vector SVG - Always visible in print) */}
              <div style={{ margin: "14px 0 8px" }}>
                <BarcodeRenderer value={tool.barcode || "899014280191"} height={52} />
                <div style={{ fontFamily: "monospace", fontSize: "0.85rem", letterSpacing: "3px", fontWeight: "bold", color: "#111" }}>
                  {tool.barcode || "899014280191"}
                </div>
              </div>

              {/* QR Code and Verification Seal */}
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
                  <QrCode size={26} color="#00A3E0" />
                  <div style={{ textAlign: "left" }}>
                    <div>Scan for digital inspection</div>
                    <div><strong>tms.andritz.internal/verify</strong></div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#059669", fontWeight: "bold" }}>
                  <ShieldCheck size={16} /> CALIBRATION CERTIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Cetak Label Sticker
          </button>
        </div>
      </div>
    </div>
  );
}
