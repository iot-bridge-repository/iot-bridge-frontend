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
    { href: `/app/organizations/${id}/device`, label: "Devices" },
    { href: `/app/organizations/${id}/notification-events`, label: "Notification Events" },
    { href: `/app/organizations/${id}/profile`, label: "Profile" },
    { href: `/app/organizations/${id}/data-reports`, label: "Data Reports" },
    { href: `/app/organizations`, label: "← Kembali ke list" },
  ];

  return (
    <div className="p-4">
      <nav className="flex flex-col md:flex-row gap-2 md:gap-4 border-b pb-2 mb-4">
        {links.map((link) =>
          link.label === "Dashboard" ? (
            <button
              key={`${link.href}-${link.label}`}
              onClick={() => {
                window.location.href = link.href;
              }}
              className={`${
                pathname === link.href
                  ? "font-bold text-blue-600"
                  : "text-gray-600"
              } nav-link hover:text-blue-500`}
            >
              {link.label}
            </button>
          ) : (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`${
                pathname === link.href
                  ? "font-bold text-blue-600"
                  : "text-gray-600"
              } nav-link hover:text-blue-500`}
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <div>{children}</div>
    </div>
  );
}
