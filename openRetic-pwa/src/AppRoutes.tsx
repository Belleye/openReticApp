import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SettingsPage from "@/pages/SettingsPage";
import ScheduleViewer from "@/pages/ScheduleViewer";
import NavBar from "@/components/NavBar";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <NavBar />
    <main>{children}</main>
  </div>
);

const AppRoutes = () => (
  <Router>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/schedule" element={<ScheduleViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  </Router>
);

export default AppRoutes;
