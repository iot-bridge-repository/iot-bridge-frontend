interface HeaderProps {
  readonly onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-link text-dark d-lg-none p-0"
          onClick={onMenuClick}
          aria-label="Toggle Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-list"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="d-flex align-items-center">
          <span
            className="fw-bold"
            style={{ color: "#1E3E62", fontSize: "1.25rem" }}
          >
            IoT Bridge
          </span>
        </div>
      </div>
    </header>
  );
}
