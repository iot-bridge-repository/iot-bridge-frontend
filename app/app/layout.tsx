"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) window.location.href = "/";
  }, []);

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
