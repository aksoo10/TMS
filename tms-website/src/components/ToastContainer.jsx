import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} color="var(--color-success)" />;
      case "warning":
        return <AlertTriangle size={18} color="var(--color-warning)" />;
      case "error":
        return <XCircle size={18} color="var(--color-danger)" />;
      default:
        return <Info size={18} color="var(--atz-cyan)" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ marginTop: "2px" }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{toast.title}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>{toast.message}</div>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px"
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
