"use client";
import { useState, useEffect } from "react";

export default function RootPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [form, setForm] = useState<"login" | "register" | "forgot_password">(
    "login"
  );

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const switchFrom = (newMode: "login" | "register" | "forgot_password") => {
    setIdentity("");
    setPassword("");
    setEmail("");
    setForm(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const resJson = await res.json();
      if (res.ok) {
        localStorage.setItem("authToken", resJson.data.token);
        window.location.href = "/app";
      } else {
        alert(resJson?.message || "Login gagal, coba lagi.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resJson = await res.json();
      if (res.ok) {
        alert("Link reset password sudah dikirim ke email Anda.");
      } else {
        alert(resJson?.message || "Reset password gagal, coba lagi.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          phone_number: phoneNumber,
          password,
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setEmail("");
        setUsername("");
        setPhoneNumber("");
        setPassword("");
      } else {
        alert(resJson?.message || "Register gagal, coba lagi.");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      window.location.href = "/app";
    }
  }, []);

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      {form === "login" && (
        <>
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="identity" className="form-label">
                Email, Username, Phone Number
              </label>
              <input
                id="identity"
                className="form-control"
                placeholder="Masukkan email, username, atau nomor telepon"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Masukkan password anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>

          <div className="d-flex justify-content-between mt-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => switchFrom("register")}
            >
              Belum punya akun? Register
            </button>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => switchFrom("forgot_password")}
            >
              Forgot Password?
            </button>
          </div>
        </>
      )}

      {form === "forgot_password" && (
        <>
          <h2 className="text-center mb-4">Forgot Password</h2>
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label htmlFor="Email" className="form-label">
                Email
              </label>
              <input
                id="Email"
                type="email"
                className="form-control"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-warning w-100">
              Kirim Email Untuk Reset Password
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => switchFrom("login")}
            >
              Kembali ke Login
            </button>
          </div>
        </>
      )}

      {form === "register" && (
        <>
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Masukkan username anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                className="form-control"
                placeholder="Masukkan nomor telepon anda"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Masukkan password anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => switchFrom("login")}
            >
              Sudah punya akun? Login
            </button>
          </div>
        </>
      )}
    </div>
  );
}
