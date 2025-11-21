"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useModalAlert } from "@/src/contexts/ModalAlertContext";
import { useAuth } from "@/src/contexts/AuthContext";

interface Device {
  id: string;
  name: string;
}

type ComparisonType = "=" | ">" | "<" | ">=" | "<=" | "!=";

interface NotificationEvents {
  id: string;
  pin: string;
  subject: string;
  message: string;
  comparison_type: ComparisonType;
  threshold_value: number;
  is_active: boolean;
  device_id: string;
  device_name: string;
}

export default function OrganizationsIdNotificationEvents() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken = useAuth().authToken;

  const { showAlert } = useModalAlert();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationEventsList, setNotificationEventsList] = useState<
    NotificationEvents[]
  >([]);

  // 🔹 Fetch devices
  const fetchDevicesList = async () => {
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
        showAlert(
          "Fetch devices list gagal",
          resJson?.message || "Fetch devices list gagal."
        );
      }
    } catch (err) {
      console.error("Fetch devices list error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Fetch notification events
  const fetchNotificationEventsList = async (deviceId: string) => {
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/notification-events/list`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        const withDevice = resJson.data.map((nE: NotificationEvents) => ({
          ...nE,
          device_id: deviceId,
          device_name: devices.find((d) => d.id === deviceId)?.name || "",
        }));
        setNotificationEventsList((prev) => [...prev, ...withDevice]);
      } else {
        showAlert(
          "Fetch notifications events list gagal",
          resJson?.message || "Fetch notifications events list gagal."
        );
      }
    } catch (err) {
      console.error("Fetch notifications events list error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create notification events
  const [newNotificationEvents, setNewNotificationEvents] = useState<
    Partial<NotificationEvents>
  >({});
  const handleCreateNotificationEvents = async () => {
    if (!newNotificationEvents.device_id) {
      return showAlert(
        "Mohon maaf :)",
        "Anda harus memilih device terlebih dahulu."
      );
    }
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${newNotificationEvents.device_id}/notification-events/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin: newNotificationEvents.pin,
            subject: newNotificationEvents.subject,
            message: newNotificationEvents.message,
            comparison_type: newNotificationEvents.comparison_type,
            threshold_value: newNotificationEvents.threshold_value?.toString(),
            is_active: newNotificationEvents.is_active,
          }),
        }
      );
      const resJson = await res.json();
      if (res.ok) {
        setNotificationEventsList((prev) => [
          ...prev,
          {
            ...resJson.data,
            device_name:
              devices.find((d) => d.id === newNotificationEvents.device_id)
                ?.name || "",
          },
        ]);
        setNewNotificationEvents({});
        (window as any).bootstrap.Modal.getInstance(
          document.getElementById("createNotificationModal")!
        )?.hide();
      } else {
        showAlert(
          "Membuat notification event gagal",
          resJson?.message ||
            "Membuat notification event gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Create notification event error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Update notifcation events
  const [editNotificationEvents, setEditNotificationEvents] =
    useState<NotificationEvents | null>(null);
  const handleUpdateNotificationEvents = async () => {
    if (!editNotificationEvents) return;

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${editNotificationEvents.device_id}/notification-events/${editNotificationEvents.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin: editNotificationEvents.pin,
            subject: editNotificationEvents.subject,
            message: editNotificationEvents.message,
            comparison_type: editNotificationEvents.comparison_type,
            threshold_value: editNotificationEvents.threshold_value,
            is_active: editNotificationEvents.is_active,
          }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setNotificationEventsList((prev) =>
          prev.map((n) =>
            n.id === editNotificationEvents.id
              ? { ...editNotificationEvents }
              : n
          )
        );
        setEditNotificationEvents(null);
        (window as any).bootstrap.Modal.getInstance(
          document.getElementById("editNotificationModal")!
        )?.hide();
      } else {
        showAlert(
          "Update notification event gagal",
          resJson?.message ||
            "Update notification event gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Update notification event error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Delete notification events
  const handleDeleteNotificationEvents = async (event: NotificationEvents) => {
    if (!confirm(`Hapus event: ${event.subject}?`)) return;

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${event.device_id}/notification-events/${event.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setNotificationEventsList((prev) =>
          prev.filter((n) => n.id !== event.id)
        );
      } else {
        showAlert(
          "Hapus notification event gagal",
          resJson?.message ||
            "Hapus notification event gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Delete notification event error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  useEffect(() => {
    fetchDevicesList();
  }, []);

  useEffect(() => {
    devices.forEach((device) => {
      fetchNotificationEventsList(device.id);
    });
  }, [devices]);

  if (loading) return <div>Loading data...</div>;

  return (
    <div>
      <div className="d-flex justify-content-center mb-3">
        <button
          type="button"
          className="btn px-4 fw-semibold"
          style={{ backgroundColor: "#1E3E62", color: "#FFFFFF" }}
          data-bs-toggle="modal"
          data-bs-target="#createNotificationModal"
        >
          + Tambah Notification Event
        </button>
      </div>

      {/* NOTIFICATION EVENTS TABLE */}
      {notificationEventsList.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-2xl">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Device</th>
                <th>Pin</th>
                <th>Subject</th>
                <th>Condition</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notificationEventsList.map((nE) => (
                <tr key={nE.id}>
                  <td>{nE.device_name}</td>
                  <td>{nE.pin}</td>
                  <td>{nE.subject}</td>
                  <td>
                    {nE.comparison_type} {nE.threshold_value}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        nE.is_active ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {nE.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-warning me-2 mt-3"
                      data-bs-toggle="modal"
                      data-bs-target="#editNotificationModal"
                      onClick={() => setEditNotificationEvents(nE)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger mt-3"
                      onClick={() => handleDeleteNotificationEvents(nE)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Tidak ada notification events</p>
      )}

      {/* CREATE NOTIFICATION MODAL */}
      <div
        className="modal fade"
        id="createNotificationModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tambah Notification Event</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <select
                  className="form-select mb-2"
                  value={newNotificationEvents.device_id || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      device_id: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Device</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <input
                  className="form-control mb-2"
                  placeholder="Pin"
                  value={newNotificationEvents.pin || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      pin: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Subject"
                  value={newNotificationEvents.subject || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      subject: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Message"
                  value={newNotificationEvents.message || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      message: e.target.value,
                    })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Threshold"
                  type="number"
                  value={newNotificationEvents.threshold_value || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      threshold_value: Number(e.target.value),
                    })
                  }
                />

                <select
                  className="form-select mb-2"
                  value={newNotificationEvents.comparison_type || ""}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      comparison_type: e.target
                        .value as NotificationEvents["comparison_type"],
                    })
                  }
                >
                  <option value="">Pilih Comparison Type</option>
                  <option value=">">Greater Than</option>
                  <option value="<">Less Than</option>
                  <option value="=">Equal To</option>
                  <option value=">=">Greater Than or Equal To</option>
                  <option value="<=">Less Than or Equal To</option>
                  <option value="!=">Not Equal To</option>
                </select>

                <select
                  className="form-select"
                  value={newNotificationEvents.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setNewNotificationEvents({
                      ...newNotificationEvents,
                      is_active: e.target.value === "true",
                    })
                  }
                >
                  <option value="">Pilih Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Batal
              </button>
              <button
                className="btn btn-success"
                onClick={handleCreateNotificationEvents}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT NOTIFICATION MODAL */}
      <div
        className="modal fade"
        id="editNotificationModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Notification Event</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {editNotificationEvents && (
                <form>
                  <input
                    className="form-control mb-2"
                    placeholder="Pin"
                    value={editNotificationEvents.pin}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        pin: e.target.value,
                      })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Subject"
                    value={editNotificationEvents.subject}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        subject: e.target.value,
                      })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Message"
                    value={editNotificationEvents.message}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        message: e.target.value,
                      })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Threshold"
                    value={editNotificationEvents.threshold_value}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        threshold_value: Number(e.target.value),
                      })
                    }
                  />

                  <select
                    className="form-select mb-2"
                    value={editNotificationEvents.comparison_type}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        comparison_type: e.target
                          .value as NotificationEvents["comparison_type"],
                      })
                    }
                  >
                    <option value="">Pilih Comparison Type</option>
                    <option value=">">Greater Than</option>
                    <option value="<">Less Than</option>
                    <option value="=">Equal To</option>
                    <option value=">=">Greater Than or Equal To</option>
                    <option value="<=">Less Than or Equal To</option>
                    <option value="!=">Not Equal To</option>
                  </select>

                  <select
                    className="form-select"
                    value={editNotificationEvents.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setEditNotificationEvents({
                        ...editNotificationEvents,
                        is_active: e.target.value === "true",
                      })
                    }
                  >
                    <option value="">Pilih Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Batal
              </button>
              <button
                className="btn btn-warning"
                onClick={handleUpdateNotificationEvents}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
