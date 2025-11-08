"use client";

import LogoIcon from "./LogoIcon";

interface LoginFormProps {
  readonly identity: string;
  readonly password: string;
  readonly isLoading: boolean;
  readonly onIdentityChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onSwitch: (form: "register" | "forgot_password") => void;
}

export default function LoginForm({
  identity,
  password,
  isLoading,
  onIdentityChange,
  onPasswordChange,
  onSubmit,
  onSwitch,
}: LoginFormProps) {
  return (
    <>
      <div className="text-center mb-4">
        <LogoIcon />
      </div>

      <form className="mt-3" onSubmit={onSubmit}>
        {/* Identity Input */}
        <div className="mb-3">
          <label htmlFor="identity" className="form-label">
            Email, Username, atau Nomor Telepon
          </label>
          <div className="input-group">
            <input
              id="identity"
              name="identity"
              type="text"
              required
              className="form-control bg-light"
              placeholder="Masukkan email, username, atau nomor telepon pengguna"
              value={identity}
              onChange={(e) => onIdentityChange(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ backgroundColor: "#28527A", color: "white" }}
            >
              <i className="bi bi-person-bounding-box"></i>
            </span>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Kata sandi
          </label>
          <div className="input-group">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-control bg-light"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ backgroundColor: "#28527A", color: "white" }}
            >
              <i className="bi bi-key"></i>
            </span>
          </div>
        </div>

        {/* Lupa Password Page Link */}
        <div className="text-end mb-3">
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none"
            onClick={() => onSwitch("forgot_password")}
          >
            Lupa kata sandi?
          </button>
        </div>

        {/* Tombol Submit */}
        <div className="d-grid">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </form>

      {/* Register Page Link */}
      <div className="mt-4 text-center">
        <p className="text-muted mb-0">
          Belum punya akun?{" "}
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0"
            onClick={() => onSwitch("register")}
          >
            Daftar
          </button>
        </p>
      </div>
    </>
  );
}
