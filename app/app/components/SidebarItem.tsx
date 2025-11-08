import Link from "next/link";

interface SidebarItemProps {
  readonly href: string;
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly active?: boolean;
}

export default function SidebarItem({
  href,
  label,
  icon,
  active,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`d-flex align-items-center gap-2 px-3 py-2 mb-2 rounded text-decoration-none fw-medium`}
      style={{
        color: active ? "#1E3E62" : "#FF6500",
        backgroundColor: active ? "#ffffff" : "transparent",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#6082B6"; // dark
          (e.currentTarget as HTMLElement).style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "transparent";
          (e.currentTarget as HTMLElement).style.color = "#FF6500";
        }
      }}
    >
      {icon && <span className="fs-5">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
