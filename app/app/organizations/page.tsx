"use client";
import { useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  status: string;
}

export default function Organizations() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [loading, setLoading] = useState(true);
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([]);

  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch daftar organisasi
  useEffect(() => {
    const fetchOrganizationsList = async () => {
      try {
        const res = await fetch(`${backendUrl}/organizations/list`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const resJson = await res.json();
        if (res.ok) {
          setOrganizationsList(resJson.data || []);
        } else {
          alert(resJson?.message || "Fetch organizations list gagal.");
        }
      } catch (err) {
        console.error("Fetch organizations list error:", err);
        alert("Terjadi kesalahan pada server atau jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationsList();
  }, []);

  // Pengajuan organisasi
  const handleProposeOrganization = async (e: React.FormEvent) => {
    if (!newOrgName.trim()) {
      alert("Nama organisasi tidak boleh kosong.");
      return;
    }

    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/organizations/propose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newOrgName }),
      });

      const resJson = await res.json();
      if (res.ok) {
        alert("Mengajukan organisasi berhasil.");
        setOrganizationsList((prev) => [...prev, resJson.data]);

        setNewOrgName("");
        setShowModal(false);
      } else {
        alert(resJson?.message || "Mengajukan organisasi gagal, silahkan coba lagi.");
      }
    } catch (err) {
      console.error("Propose organization error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Pilih Organisasi</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Ajukan Organisasi
        </button>
      </div>

      {loading && <p>Memuat daftar organisasi...</p>}

      {!loading && organizationsList.length === 0 && (
        <p className="text-muted">Tidak ada organisasi</p>
      )}

      <ul className="list-group">
        {organizationsList.map((org) => (
          <li key={org.id} className="list-group-item">
            <button
              className="btn btn-link text-decoration-none"
              onClick={() => window.location.href = `organizations/${org.id}`}
            >
              {org.name}
            </button>
            <h6>Status: {org.status}</h6>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleProposeOrganization}>
                <div className="modal-header">
                  <h5 className="modal-title">Ajukan Organisasi Baru</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="orgName" className="form-label">
                      Nama Organisasi
                    </label>
                    <input
                      type="text"
                      id="orgName"
                      className="form-control"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Mengajukan..." : "Ajukan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop untuk modal */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
