"use client";
import { useEffect, useState } from "react";
import { useModalAlert } from "@/src/context/ModalAlertContext";

interface Organization {
  id: string;
  name: string;
  location: string;
  creator_username: string;
  status: string;
}

interface OrganizationDetail {
  name: string;
  location: string;
  creator_username: string;
  status: string;
  members: { username: string; role: string; status: string }[];
}

interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
}

interface UserDetail {
  username: string;
  email: string;
  phone_number: string;
  organizationMember: {
    organization_name: string;
    status: string;
  }[];
}

export default function AdminSystem() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const { showAlert } = useModalAlert();

  const [organizationsList, setOrganizationsList] = useState<Organization[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${backendUrl}/organizations/search?keyword=`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setOrganizationsList(resJson.data || []);
      } else {
        showAlert(
          "Fetch organizations gagal",
          resJson?.message || "Fetch organizations gagal."
        );
      }
    } catch (err) {
      console.error("Fetch organizations error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verifikasi organisasi
  const handleOrganizationVerification = async (
    orgId: string,
    newStatus: string
  ) => {
    const url =
      newStatus === "Verified"
        ? `${backendUrl}/organizations/verify`
        : `${backendUrl}/organizations/unverify`;

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization_id: orgId }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setOrganizationsList((prev) =>
          prev.map((org) =>
            org.id === orgId ? { ...org, status: newStatus } : org
          )
        );
      } else {
        showAlert(
          "Verifikasi organisasi gagal",
          resJson?.message || "Verifikasi organisasi gagal."
        );
      }
    } catch (err) {
      console.error("Verifikasi organisasi error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Detail organisasi
  const [organizationDetail, setOrganizationDetail] =
    useState<OrganizationDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fetchOrganizationDetail = async (orgId: string) => {
    try {
      const res = await fetch(`${backendUrl}/organizations/${orgId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setOrganizationDetail(resJson.data);
        setShowModal(true);
      } else {
        showAlert(
          "Fetch detail organisasi gagal",
          resJson?.message || "Fetch detail organisasi gagal."
        );
      }
    } catch (err) {
      console.error("Fetch organization detail error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Fetch users
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/users/search?identity=`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const resJson = await res.json();
      if (res.ok) {
        setUsersList(resJson.data || []);
      } else {
        showAlert(
          "Fetch users gagal",
          resJson?.message || "Fetch users gagal."
        );
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // 🔹 Detail user
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const handleUserDetail = async (userId: string) => {
    try {
      const res = await fetch(`${backendUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        setUserDetail(resJson.data);
        setShowUserDetailModal(true);
      } else {
        showAlert(
          "Fetch user detail gagal",
          resJson?.message || "Fetch user detail gagal."
        );
      }
    } catch (err) {
      console.error("Fetch user detail error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Daftar Organisasi</h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : organizationsList.length === 0 ? (
        <p className="text-muted">Tidak ada organisasi.</p>
      ) : (
        <>
          {/* ORGANIZATIONS TABLE */}
          <div className="table-responsive mb-5">
            <table className="table table-bordered table-striped table-hover align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th>Nama</th>
                  <th>Pembuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {organizationsList.map((org) => (
                  <tr key={org.id}>
                    <td>{org.name}</td>
                    <td>{org.creator_username}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          org.status === "Pending"
                            ? "bg-warning text-dark"
                            : org.status === "Verified"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="d-flex justify-content-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() =>
                          handleOrganizationVerification(org.id, "Verified")
                        }
                      >
                        Verifikasi
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleOrganizationVerification(org.id, "Unverified")
                        }
                      >
                        Tolak
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => fetchOrganizationDetail(org.id)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL ORGANIZATION DETAIL */}
          {showModal && organizationDetail && (
            <div
              className="modal fade show d-block"
              style={{ background: "rgba(0,0,0,0.5)" }}
              tabIndex={-1}
              aria-modal="true"
              role="dialog"
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded shadow-sm">
                  <div className="modal-header">
                    <h5 className="modal-title">{organizationDetail.name}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <strong>Nama:</strong> {organizationDetail.name}
                    </p>
                    <p>
                      <strong>Lokasi:</strong> {organizationDetail.location}
                    </p>
                    <p>
                      <strong>Pembuat:</strong>{" "}
                      {organizationDetail.creator_username}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${
                          organizationDetail.status === "Pending"
                            ? "bg-warning text-dark"
                            : organizationDetail.status === "Verified"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {organizationDetail.status}
                      </span>
                    </p>

                    <h6>Anggota:</h6>
                    <ul className="list-group list-group-flush">
                      {organizationDetail.members.map((m, idx) => (
                        <li key={idx} className="list-group-item py-1 px-2">
                          {m.username} - {m.role} ({m.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* USERS TABLE */}
      <h2 className="mb-4 mt-5">Daftar Pengguna</h2>

      {loadingUsers ? (
        <p>Memuat data...</p>
      ) : usersList.length === 0 ? (
        <p className="text-muted">Tidak ada user.</p>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-striped table-hover align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nomor Telepon</th>
                  <th>Role</th>
                  <th>Organisasi</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUserDetail(user.id)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL DETAIL USER */}
          {showUserDetailModal && userDetail && (
            <div
              className="modal fade show d-block"
              style={{ background: "rgba(0,0,0,0.5)" }}
              tabIndex={-1}
              aria-modal="true"
              role="dialog"
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded shadow-sm">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {userDetail.username} - Detail User
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowUserDetailModal(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <strong>Username:</strong> {userDetail.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {userDetail.email}
                    </p>
                    <p>
                      <strong>No. Telepon:</strong> {userDetail.phone_number}
                    </p>

                    <h6>Organisasi:</h6>
                    <ul className="list-group list-group-flush">
                      {userDetail.organizationMember.map((org, idx) => (
                        <li
                          key={idx + 1}
                          className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
                        >
                          <span>{org.organization_name}</span>
                          <span
                            className={`badge ${
                              org.status === "Accepted"
                                ? "bg-success"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {org.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUserDetailModal(false)}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
