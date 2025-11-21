"use client";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useAuth } from "@/src/contexts/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authToken, loadingGetAuthToken } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loadingGetAuthToken && !authToken) {
      window.location.href = "/";
    }
  }, [loadingGetAuthToken, authToken]);

  if (loadingGetAuthToken) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-2">{children}</div>
      </div>
    </div>
  );
}
