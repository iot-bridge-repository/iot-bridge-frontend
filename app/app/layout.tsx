"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="text-xl font-bold">IoT Bridge</div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Link className="nav-link" href="/app">
            Dokumentasi
          </Link>
          <Link className="nav-link" href="/app/organizations">
            Organisasi
          </Link>
          <Link className="nav-link" href="/app/notifications">
            Notifikasi
          </Link>
          <Link className="nav-link" href="/app/profile">
            Profil
          </Link>
          <Link className="nav-link" href="/app/admin-system">
            Admin System
          </Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
