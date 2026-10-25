import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/ToastContainer";

import LoginView from "./pages/LoginView";
import DashboardView from "./pages/DashboardView";
import ToolsDatabaseView from "./pages/ToolsDatabaseView";
import SiteDatabaseView from "./pages/SiteDatabaseView";
import ToolsRegisterView from "./pages/ToolsRegisterView";
import ToolsMovementView from "./pages/ToolsMovementView";
import InspectionView from "./pages/InspectionView";
import HistoricalView from "./pages/HistoricalView";
import AnalyticsView from "./pages/AnalyticsView";

function MainLayout() {
  const { isAuthenticated, activeTab } = useApp();

  // If user is not authenticated or explicitly requested login portal
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Render appropriate view based on activeTab
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "tools-db":
        return <ToolsDatabaseView />;
      case "sites-db":
        return <SiteDatabaseView />;
      case "tools-register":
        return <ToolsRegisterView />;
      case "tools-movement":
        return <ToolsMovementView />;
      case "inspection":
        return <InspectionView />;
      case "historical":
        return <HistoricalView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary)" }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area: Sidebar + Active View */}
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", position: "relative" }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
