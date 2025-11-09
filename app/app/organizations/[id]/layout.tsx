"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OrganizationsIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();

  const links = [
    { href: `/app/organizations/${id}`, label: "Dashboard" },
    { href: `/app/organizations/${id}/device`, label: "Perangkat" },
    {
      href: `/app/organizations/${id}/notification-events`,
      label: "Notification Events",
    },
    { href: `/app/organizations/${id}/profile`, label: "Profile" },
    { href: `/app/organizations/${id}/data-reports`, label: "Data Reports" },
    { href: `/app/organizations`, label: "← Kembali ke list" },
  ];

  return (
    <div className="container-fluid px-3">
      {/* Navigation Bar */}
      <nav
        className="nav flex-wrap justify-content-center gap-2 border-bottom pb-3 mb-4 rounded-pill shadow-sm"
        style={{
          backgroundColor: "#1E3E62",
          padding: "10px 15px",
        }}
      >
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link fw-semibold px-3 py-2 text-center rounded-pill text-decoration-none ${
                isActive ? "active-link" : "inactive-link"
              }`}
              style={{
                color: isActive ? "#1E3E62" : "#FFFFFF",
                backgroundColor: isActive ? "#FFFFFF" : "transparent",
                border: isActive
                  ? "2px solid #FF6500"
                  : "2px solid transparent",
                transition: "all 0.25s ease-in-out",
                minWidth: "120px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#FF6500";
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  (e.currentTarget as HTMLElement).style.border =
                    "2px solid #FF6500";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  (e.currentTarget as HTMLElement).style.border =
                    "2px solid transparent";
                }
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <div
        className="p-4 rounded shadow-sm"
        style={{
          backgroundColor: "#f8f9fa",
        }}
      >
        {children}
      </div>

      <style>{`
        /* Responsif dan gaya tambahan */
        @media (max-width: 768px) {
          nav.nav {
            border-radius: 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
            padding: 15px !important;
          }
          nav.nav a {
            width: 100%;
          }
        }

        nav.nav a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
