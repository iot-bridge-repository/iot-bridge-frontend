"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Device {
  id: string;
  name: string;
  auth_code: string;
}

interface Report {
  pin: string;
  value: string;
  time: string;
}

export default function OrganizationsIdDevice() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/search?name=`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setDevices(resJson.data || []);
      } else {
        alert(resJson?.message || "Fetch devices gagal.");
      }
    } catch (err) {
      console.error("Fetch devices error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create device
  const [newDeviceName, setNewDeviceName] = useState("");
  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/devices/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newDeviceName }),
      });

      const resJson = await res.json();
      if (res.ok) {
        alert("Membuat device berhasil");

        (
          document.getElementById(
            "createDeviceModalCloseBtn"
          ) as HTMLButtonElement
        )?.click();
        setDevices((prev) => [
          ...prev,
          {
            id: resJson.data.id,
            name: resJson.data.name,
            auth_code: resJson.data.auth_code,
          },
        ]);
      } else {
        alert(resJson?.message || "Membuat device gagal.");
      }
    } catch (err) {
      console.error("Create device error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setNewDeviceName("");
    }
  };

  // 🔹 Edit device
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editName, setEditName] = useState("");
  const handleEditDevice = async (e: React.FormEvent) => {
    if (!editDevice) return;

    e.preventDefault();

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${editDevice.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: editName }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        alert("Edit device berhasil");
        (
          document.getElementById(
            "editDeviceModalCloseBtn"
          ) as HTMLButtonElement
        )?.click();
        setDevices((prev) =>
          prev.map((d) =>
            d.id === editDevice.id ? { ...d, name: editName } : d
          )
        );
      } else {
        alert(resJson?.message || "Edit device gagal.");
      }
    } catch (err) {
      console.error("Edit device error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  // 🔹 Delete device
  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm("Anda yakin ingin menghapus device ini?")) return;

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.ok) {
        alert("Menghapus device berhasil");
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } else {
        const resJson = await res.json();
        alert(resJson?.message || "Menghapus device gagal.");
      }
    } catch (err) {
      console.error("Delete device error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="container mt-4">
      {/* BUTTON CREATE DEVICE */}
      <div className="d-flex justify-content-center mb-3">
        <button
          type="button"
          className="btn px-4 fw-semibold"
          style={{ backgroundColor: "#1E3E62", color: "#FFFFFF" }}
          data-bs-toggle="modal"
          data-bs-target="#createDeviceModal"
        >
          + Tambah Perangkat
        </button>
      </div>

      {/* MODAL CREATE DEVICE */}
      <div
        className="modal fade"
        id="createDeviceModal"
        tabIndex={-1}
        aria-labelledby="createDeviceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleCreateDevice}>
              <div className="modal-header">
                <h5 className="modal-title" id="createDeviceModalLabel">
                  Tambah Perangkat
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  id="createDeviceModalCloseBtn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="deviceName" className="form-label">
                    Nama Device
                  </label>
                  <input
                    type="text"
                    id="deviceName"
                    className="form-control"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Memuat data...</div>}

      {/* LIST DEVICE */}
      {!loading && (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "35%" }}>Nama Perangkat</th>
                  <th style={{ width: "35%" }}>Auth Code</th>
                  <th style={{ width: "25%" }}>Aksi</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {devices.length > 0 ? (
                  devices.map((device, index) => (
                    <tr key={device.id}>
                      <td>{index + 1}</td>
                      <td>{device.name}</td>
                      <td>
                        <span className="truncate">{device.auth_code} </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(device.auth_code);
                          }}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-sm text-gray-700"
                          title="Salin auth code"
                        >
                          📋
                        </button>
                      </td>
                      <td className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          data-bs-toggle="modal"
                          data-bs-target="#editDeviceModal"
                          onClick={() => {
                            setEditDevice(device);
                            setEditName(device.name);
                          }}
                        >
                          <i className="bi bi-pencil-square me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <i className="bi bi-trash me-1"></i>Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      Perangkat belum tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MODAL EDIT DEVICE */}
          <div
            className="modal fade"
            id="editDeviceModal"
            tabIndex={-1}
            aria-labelledby="editDeviceModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleEditDevice}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Device</h5>
                    <button
                      type="button"
                      className="btn-close"
                      id="editDeviceModalCloseBtn"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-success">
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
