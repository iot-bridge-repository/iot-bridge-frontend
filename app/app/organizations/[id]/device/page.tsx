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
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/devices/search?name=`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

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
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        alert("Membuat device berhasil");

        (document.getElementById("createDeviceModalCloseBtn") as HTMLButtonElement)?.click();
        setDevices((prev) => [...prev, {
          id: resJson.data.id,
          name: resJson.data.name,
          auth_code: resJson.data.auth_code
        }]);
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
      const res = await fetch( `${backendUrl}/organizations/${id}/devices/${editDevice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      const resJson = await res.json();
      if (res.ok) {
        alert("Edit device berhasil");
        (document.getElementById("editDeviceModalCloseBtn") as HTMLButtonElement)?.click();
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
      const res = await fetch(`${backendUrl}/organizations/${id}/devices/${deviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

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
      <h1 className="mb-3">HALAMAN DEVICE</h1>

      {/* BUTTON CREATE DEVICE */}
      <button
        className="btn btn-primary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#createDeviceModal"
      >
        + Tambah Device
      </button>

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
                  Tambah Device
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
                  <label htmlFor="deviceName" className="form-label">Nama Device</label>
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
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Nama Device</th>
                <th>Auth Code</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {devices.length > 0 ? (
                devices.map((device, index) => (
                  <tr key={device.id}>
                    <td>{index + 1}</td>
                    <td>{device.name}</td>
                    <td>{device.auth_code}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2 mt-1"
                        data-bs-toggle="modal"
                        data-bs-target="#editDeviceModal"
                        onClick={() => {
                          setEditDevice(device);
                          setEditName(device.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2 mt-1"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">
                    Device belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                    <button className="btn btn-secondary" data-bs-dismiss="modal">
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
