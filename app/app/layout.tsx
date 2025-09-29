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
      <nav className="bg-white shadow-md p-4 flex justify-between">
        <div className="text-xl font-bold">IoT Bridge</div>
        <div className="flex gap-4">
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
