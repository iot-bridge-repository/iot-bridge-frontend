"use client";
import { useEffect, useState } from "react";
import { useModalAlert } from "@/src/contexts/ModalAlertContext";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Profile() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken = useAuth().authToken;

  const { showAlert } = useModalAlert();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // state untuk form edit profile
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // state untuk form email
  const [email, setEmail] = useState("");

  // state untuk form password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Get profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) return; // pastikan ada token
      try {
        const res = await fetch(`${backendUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const resJson = await res.json();
        if (res.ok) {
          setProfile(resJson.data.user);
          setUsername(resJson.data.user.username);
          setPhoneNumber(resJson.data.user.phone_number);
          setEmail(resJson.data.user.email);
        } else {
          showAlert(
            "Fetch profil gagal",
            resJson?.message || "Fetch profil gagal."
          );
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        showAlert(
          "Mohon maaf :(",
          "Terjadi kesalahan pada server atau jaringan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("phone_number", phoneNumber);
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const res = await fetch(`${backendUrl}/auth/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const resJson = await res.json();
      if (res.ok) {
        setProfile((prev: typeof profile) => ({
          ...prev,
          ...resJson.data.user,
        }));
        showAlert("Horay :)", "Update profile berhasil.");
      } else {
        showAlert(
          "Update profile gagal",
          resJson?.message || "Update profile gagal, coba lagi."
        );
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // Update email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendUrl}/auth/email`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_email: email }),
      });

      const resJson = await res.json();
      if (res.ok) {
        showAlert(
          "Horay :)",
          "Update email berhasil, silahkan cek email untuk verifikasi."
        );
      } else {
        showAlert(
          "Update email gagal",
          resJson?.message || "Update email gagal, coba lagi."
        );
      }
    } catch (err) {
      console.error("Update email error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setEmail("");
    }
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${backendUrl}/auth/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        showAlert("Horay :)", "Update password berhasil.");
      } else {
        showAlert(
          "Update password gagal",
          resJson?.message || "Update password gagal, coba lagi."
        );
      }
    } catch (err) {
      console.error("Update password error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // Logout
  const { setAuthToken } = useAuth();
  const handleLogOut = () => {
    try {
      sessionStorage.removeItem("authToken");
      setAuthToken(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow">
        <div className="card-body text-center">
          <img
            src={
              profile?.profile_picture || "/images/default-profile-picture.jpeg"
            }
            alt="Profile"
            className="rounded-circle mb-3 mx-auto d-block"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
          <h3 className="card-title">{profile?.username}</h3>
          <p className="text-muted">{profile?.role}</p>

          <div className="text-start mt-4">
            <p>
              <strong>Email:</strong> {profile?.email}
            </p>
            <p>
              <strong>Phone:</strong> {profile?.phone_number}
            </p>
          </div>

          {/* Tombol Modal */}
          <button
            className="btn btn-primary w-100 mt-3"
            data-bs-toggle="modal"
            data-bs-target="#editProfileModal"
          >
            Edit Profile
          </button>
          <button
            className="btn btn-primary w-100 mt-2"
            data-bs-toggle="modal"
            data-bs-target="#editEmailModal"
          >
            Edit Email
          </button>
          <button
            className="btn btn-primary w-100 mt-2"
            data-bs-toggle="modal"
            data-bs-target="#editPasswordModal"
          >
            Edit Password
          </button>
          <button className="btn btn-danger w-100 mt-2" onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      </div>

      {/* Modal Edit Profile */}
      <div
        className="modal fade"
        id="editProfileModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="profilePicture" className="form-label">
                    Profile Picture
                  </label>
                  <input
                    id="profilePicture"
                    type="file"
                    className="form-control"
                    onChange={(e) =>
                      setProfilePicture(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Edit Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Email */}
      <div className="modal fade" id="editEmailModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleUpdateEmail}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Email</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="newEmail" className="form-label">
                    New Email
                  </label>
                  <input
                    id="newEmail"
                    type="email"
                    className="form-control"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Edit Password */}
      <div className="modal fade" id="editPasswordModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleUpdatePassword}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label">
                    Old Password
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    className="form-control"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
