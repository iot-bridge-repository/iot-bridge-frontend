"use client";

import LogoIcon from "./LogoIcon";

interface RegisterFormProps {
  readonly username: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly password: string;
  readonly isLoading: boolean;
  readonly onUsernameChange: (v: string) => void;
  readonly onEmailChange: (v: string) => void;
  readonly onPhoneNumberChange: (v: string) => void;
  readonly onPasswordChange: (v: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onSwitch: (form: "login") => void;
}

export default function RegisterForm({
  username,
  email,
  phoneNumber,
  password,
  isLoading,
  onUsernameChange,
  onEmailChange,
  onPhoneNumberChange,
  onPasswordChange,
  onSubmit,
  onSwitch,
}: RegisterFormProps) {
  return (
    <>
      <div className="text-center mb-3">
        <LogoIcon />
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <div className="input-group">
            <input
              id="username"
              type="text"
              required
              className="form-control bg-light"
              placeholder="Masukkan username anda"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ backgroundColor: "#28527A", color: "white" }}
            >
              <i className="bi bi-person"></i>
            </span>
          </div>
        </div>

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

        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number
          </label>
          <div className="input-group">
            <input
              id="phoneNumber"
              type="text"
              required
              className="form-control bg-light"
              placeholder="Masukkan nomor telepon anda"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ backgroundColor: "#28527A", color: "white" }}
            >
              <i className="bi bi-telephone"></i>
            </span>
          </div>
        </div>

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

        <div className="d-grid mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? "Memproses..." : "Register"}
          </button>
        </div>
      </form>

      {/* Login Page Link */}
      <div className="mt-4 text-center">
        <p className="text-muted">
          Sudah punya akun?{" "}
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() => onSwitch("login")}
          >
            Login
          </button>
        </p>
      </div>
    </>
  );
}
