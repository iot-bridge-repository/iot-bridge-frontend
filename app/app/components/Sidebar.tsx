import SidebarItem from "./SidebarItem";
import { useAuth } from "@/src/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface SidebarProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { userRole } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/app",
      label: "Dokumentasi",
      icon: <i className="bi bi-file-earmark-text"></i>,
    },
    {
      href: "/app/organizations",
      label: "Organisasi",
      icon: <i className="bi bi-people"></i>,
    },
    {
      href: "/app/notifications",
      label: "Notifikasi",
      icon: <i className="bi bi-bell"></i>,
    },
    {
      href: "/app/profile",
      label: "Profil",
      icon: <i className="bi bi-person"></i>,
    },
    {
      href: "/app/admin-system",
      label: "Admin Sistem",
      icon: <i className="bi bi-person-gear"></i>,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.href === "/app/admin-system") {
      return userRole === "Admin System";
    }
    return true;
  });

  return (
    <>
      {/* Overlay untuk mobile, lebih transparan */}
      <button
        type="button"
        className={`fixed inset-0 z-40 transition-opacity lg:hidden ${
          open ? "block" : "hidden"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        aria-label="Close sidebar overlay"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#1E3E62] text-white flex flex-col z-50 transform transition-transform lg:translate-x-0 overflow-y-auto h-screen ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <img src="/images/sidebar-logo.png" alt="Logo" className="img-fluid" />

        {/* Menu */}
        <nav className="flex-1 p-4">
          {filteredMenuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          © 2025 Teknik Informatika Universitas Lampung
        </div>
      </aside>
    </>
  );
}
