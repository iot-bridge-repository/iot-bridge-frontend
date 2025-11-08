"use client";

import LogoIcon from "./LogoIcon";

interface ForgotPasswordFormProps {
  readonly email: string;
  readonly isLoading: boolean;
  readonly onEmailChange: (v: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onSwitch: (form: "login") => void;
}

export default function ForgotPasswordForm({
  email,
  isLoading,
  onEmailChange,
  onSubmit,
  onSwitch,
}: ForgotPasswordFormProps) {
  return (
    <>
      <div className="text-center">
        <LogoIcon />
      </div>

      <form className="mt-4" onSubmit={onSubmit}>
        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <div className="input-group">
            <input
              id="email"
              type="email"
              required
              className="form-control bg-light"
              placeholder="Masukkan email anda"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ backgroundColor: "#28527A", color: "white" }}
            >
              <i className="bi bi-envelope"></i>
            </span>
          </div>
        </div>

        <div className="d-grid mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? "Memproses..." : "Kirim Email Untuk Reset Password"}
          </button>
        </div>
      </form>

      {/* Back to Login Link */}
      <div className="mt-4 text-center">
        <p className="text-muted">
          Ingat password Anda?{" "}
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() => onSwitch("login")}
          >
            Kembali ke Login
          </button>
        </p>
      </div>
    </>
  );
}
