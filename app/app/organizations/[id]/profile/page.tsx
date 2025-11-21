"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useModalAlert } from "@/src/contexts/ModalAlertContext";
import { useAuth } from "@/src/contexts/AuthContext";

interface OrganizationProfile {
  id: string;
  organization_picture: string | null;
  name: string;
  description?: string | null;
  status: string;
  location: string;
}

export default function OrganizationsIdProfile() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken = useAuth().authToken;
  const { setAuthToken } = useAuth();

  const { showAlert } = useModalAlert();

  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // state untuk edit form
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setProfile(resJson.data);
        setName(resJson.data.name);
        setDescription(resJson.data.description || "");
        setLocation(resJson.data.location);
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Fetch Profile Gagal",
          resJson?.message || "Fetch profile gagal."
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

  const fetchMemberList = async () => {
    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/member-list`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setMemberList(resJson.data);
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Fetch Member List Gagal",
          resJson?.message || "Fetch member list gagal."
        );
      }
    } catch (err) {
      console.error("Fetch member list error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("location", location);
    if (pictureFile) {
      formData.append("organization_picture", pictureFile);
    }

    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const resJson = await res.json();
      if (res.ok) {
        showAlert("Horay :)", "Update profile berhasil.");
        setProfile((prev: typeof profile) => ({
          ...prev,
          ...resJson.data,
        }));
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Update Profile Gagal",
          resJson?.message || "Update profile gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Update profil error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setEditMode(false);
    }
  };

  // leave organization
  const handleLeave = async () => {
    if (!confirm("Apakah kamu yakin ingin keluar dari organisasi ini?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/organizations/${id}/leave`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        showAlert("Keluar organisasi", "Anda berhasil keluar organisasi.");
        window.location.href = "/app/organizations";
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Keluar organisasi gaga",
          resJson?.message || "Keluar organisasi gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Leave organisasi error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  // add local member
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleAddLocalMember = async () => {
    if (!username || !password) {
      showAlert("Input Tidak Lengkap", "Username dan password harus diisi.");
      return;
    }

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/local-member`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        fetchMemberList();
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Menambahkan Member Lokal Gagal",
          resJson?.message ||
            "Menambahkan member lokal gagal, silahkan coba lagi."
        );
      }
    } catch (err: any) {
      console.error("Add local member error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setUsername("");
      setPassword("");
    }
  };

  // search member
  const [searchMember, setSearchMember] = useState("");
  const [searchMemberResults, setSearchMemberResults] = useState<any[]>([]);
  const handleSearchMember = async () => {
    if (!searchMember) return;
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/search-members?identity=${encodeURIComponent(
          searchMember
        )}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setSearchMemberResults(resJson.data || []);
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      }
    } catch (err) {
      console.error("Search members error:", err);
    }
  };

  // member invitation
  const [submittingMemberInvitation, setSubmittingMemberInvitation] =
    useState(false);
  const handleMemberInvitation = async (userId: string) => {
    setSubmittingMemberInvitation(true);
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/member-invitation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        showAlert("Horay :)", "Anda berhasil mengundang anggota!");
        fetchMemberList();
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Mengundang Anggota Gagal",
          resJson?.message || "Mengundang anggota gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Member invitation error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setSubmittingMemberInvitation(false);
    }
  };

  // change member role
  const [submittingChangeMemberRole, setSubmittingChangeMemberRole] = useState<
    string | null
  >(null);
  const handleChangeMemberRole = async (userId: string, newRole: string) => {
    setSubmittingChangeMemberRole(userId);

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/member-roles`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, new_role: newRole }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        // update role di state
        setMemberList((prev) =>
          prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
        );
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Mengganti Role Anggota Gagal",
          resJson?.message ||
            "Mengganti role anggota gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Change member role error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setSubmittingChangeMemberRole(null);
    }
  };

  // 🔹 Keluarkan Member
  const [submittingRemoveMember, setSubmittingRemoveMember] = useState<
    string | null
  >(null);
  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Yakin ingin mengeluarkan member dari organisasi?")) return;

    setSubmittingRemoveMember(userId);
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/member/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setMemberList((prev) => prev.filter((m) => m.user_id !== userId));
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } else {
        showAlert(
          "Mengeluarkan Member Gagal",
          resJson?.message || "Mengeluarkan member gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Remove member error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setSubmittingRemoveMember(null);
    }
  };

  useEffect(() => {
    if (authToken && id) {
      fetchProfile();
      fetchMemberList();
    }
  }, [authToken, id]);

  if (loading) return <p>Sedang memuat profil...</p>;
  if (!profile) return <p>Profil organisasi tidak ditemukan.</p>;

  return (
    <div className="card my-3">
      {/* PROFILE */}
      <div className="card-body">
        <img
          src={
            profile.organization_picture ||
            "/images/default-profile-picture.jpeg"
          }
          alt="Profile"
          className="rounded-circle mb-3 mx-auto d-block"
          style={{ width: "120px", height: "120px", objectFit: "cover" }}
        />
        {!editMode ? (
          <>
            <h3>{profile.name}</h3>
            <p>
              <strong>Status:</strong> {profile.status}
            </p>
            {profile.description && (
              <p>
                <strong>Deskripsi:</strong> {profile.description}
              </p>
            )}
            <p>
              <strong>Lokasi:</strong> {profile.location}
            </p>
            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => setEditMode(true)}
            >
              Edit Profil
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-2">
              <label>
                Nama
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </div>
            <div className="mb-2">
              <label>
                Deskripsi
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>
            <div className="mb-2">
              <label>
                Lokasi
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
            </div>
            <div className="mb-2">
              <label>
                Gambar Profil
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    setPictureFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>
            </div>
            <button type="submit" className="btn btn-success me-2">
              Simpan
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditMode(false)}
            >
              Batal
            </button>
          </form>
        )}

        <button
          className="btn btn-danger mt-2"
          onClick={handleLeave}
          disabled={loading}
        >
          Keluar Organisasi
        </button>
      </div>

      <div className="card-footer">
        {/* ADD MEMBER BUTTON */}
        <button
          type="button"
          className="btn btn-primary m-3"
          data-bs-toggle="modal"
          data-bs-target="#addMemberModal"
        >
          + Tambah Anggota
        </button>

        {/* ADD MEMBER MODAL */}
        <div
          className="modal fade"
          id="addMemberModal"
          tabIndex={-1}
          aria-labelledby="addMemberModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addMemberModalLabel">
                  Tambah Anggota
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari user (nama/email)"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleSearchMember}
                  >
                    Cari
                  </button>
                </div>

                {searchMemberResults.length > 0 && (
                  <ul className="list-group">
                    {searchMemberResults.map((user) => (
                      <li
                        key={user.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h5>{user.username}</h5>
                          <p>{user.email}</p>
                        </div>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMemberInvitation(user.id)}
                          disabled={submittingMemberInvitation}
                        >
                          {submittingMemberInvitation
                            ? "Mengundang..."
                            : "Undang"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ADD LOCAL MEMBER BUTTON */}
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addLocalMemberModal"
        >
          + Tambah Local Member
        </button>

        {/* ADD LOCAL MEMBER MODAL */}
        <div
          className="modal fade"
          id="addLocalMemberModal"
          tabIndex={-1}
          aria-labelledby="addLocalMemberModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addLocalMemberModalLabel">
                  Tambah Local Member
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddLocalMember}
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MEMBER LIST */}
        <ul className="list-group">
          <h4>Anggota Organisasi List</h4>
          {memberList.map((member) => (
            <li key={member.user_id} className="list-group-item">
              <h5>{member.username}</h5>
              <p>
                <strong>Role:</strong> {member.role}
              </p>
              <p>
                <strong>Status:</strong> {member.status}
              </p>

              <div className="d-flex gap-2">
                {/* CHANGE MEMBER ROLE */}
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    disabled={submittingChangeMemberRole === member.user_id}
                  >
                    {submittingChangeMemberRole === member.user_id
                      ? "Memproses..."
                      : "Ganti Role"}
                  </button>
                  <ul className="dropdown-menu">
                    {["Admin", "Operator", "Viewer"].map((role) => (
                      <li key={role}>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            handleChangeMemberRole(member.user_id, role)
                          }
                        >
                          {role}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* REMOVE MEMBER */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveMember(member.user_id)}
                  disabled={submittingRemoveMember === member.user_id}
                >
                  Keluarkan
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
