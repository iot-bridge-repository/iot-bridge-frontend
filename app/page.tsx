"use client";

import { jwtDecode } from "jwt-decode";

import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import { useModalAlert } from "@/src/contexts/ModalAlertContext";
import { useAuth } from "@/src/contexts/AuthContext";

interface TokenPayload {
  role: string;
}

export default function RootPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [form, setForm] = useState<"login" | "register" | "forgot_password">(
    "login"
  );
  const { setAuthToken, setUserRole, authToken, loadingGetAuthToken } =
    useAuth();

  const { showAlert } = useModalAlert();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const switchForm = (newForm: "login" | "register" | "forgot_password") => {
    setForm(newForm);
    setIdentity("");
    setPassword("");
    setEmail("");
    setUsername("");
    setPhoneNumber("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const resJson = await res.json();
      if (res.ok) {
        sessionStorage.setItem("authToken", resJson.data.token);
        setAuthToken(resJson.data.token);

        const decoded = jwtDecode<TokenPayload>(resJson.data.token);
        sessionStorage.setItem("userRole", decoded.role);
        setUserRole(decoded.role);

        window.location.href = "/app";
      } else {
        showAlert("Login gagal", resJson.message || "Login gagal, coba lagi.");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resJson = await res.json();
      if (res.ok) {
        showAlert(
          "Reset password berhasil",
          "Silahkan cek email kamu dan lakukan pengaturan ulang kata sandi!"
        );
      } else {
        showAlert(
          "Reset password gagal",
          resJson?.message || "Reset password gagal, coba lagi."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

        showAlert(
          "Registrasi berhasil",
          "Silahkan cek email kamu dan lakukan verifikasi email!"
        );
      } else {
        showAlert(
          "Registrasi gagal",
          resJson?.message || "Registrasi gagal, coba lagi."
        );
      }
    } catch (err) {
      console.error("Register error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingGetAuthToken && authToken) {
      window.location.href = "/app";
    }
  }, [loadingGetAuthToken, authToken]);

  if (loadingGetAuthToken) return null;

  return (
    <>
      <div className="container-fluid p-0">
        <div className="row g-0 vh-100">
          {/* Gambar kiri */}
          <div
            className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#1E3E62" }}
          >
            <img
              src="/images/root-page.png"
              alt="root-page"
              className="w-75 h-75"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Form */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
            <div className="w-100" style={{ maxWidth: "450px" }}>
              {form === "login" && (
                <LoginForm
                  identity={identity}
                  password={password}
                  isLoading={isLoading}
                  onIdentityChange={setIdentity}
                  onPasswordChange={setPassword}
                  onSubmit={handleLogin}
                  onSwitch={switchForm}
                />
              )}
              {form === "register" && (
                <RegisterForm
                  username={username}
                  email={email}
                  phoneNumber={phoneNumber}
                  password={password}
                  isLoading={isLoading}
                  onUsernameChange={setUsername}
                  onEmailChange={setEmail}
                  onPhoneNumberChange={setPhoneNumber}
                  onPasswordChange={setPassword}
                  onSubmit={handleRegister}
                  onSwitch={switchForm}
                />
              )}
              {form === "forgot_password" && (
                <ForgotPasswordForm
                  email={email}
                  isLoading={isLoading}
                  onEmailChange={setEmail}
                  onSubmit={handleForgotPassword}
                  onSwitch={switchForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
