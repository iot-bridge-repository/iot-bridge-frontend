"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useModalAlert } from "@/src/contexts/ModalAlertContext";
import { useAuth } from "@/src/contexts/AuthContext";

interface Device {
  id: string;
  name: string;
}

interface WidgetBox {
  id: string;
  name: string;
  pin: string;
  unit: string | null;
  min_value: number | null;
  max_value: number | null;
  default_value: number | null;
  created_at: string;
  device_id: string;
  device_name: string;
  realTimeValue: number | null;
  realTimeTime: string | null;
}

interface WsMessage {
  deviceId: string;
  pin: string;
  value: number;
  time: string;
}

export default function OrganizationsId() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const auth = useAuth();
  const authToken = auth?.authToken;
  const setAuthToken = auth?.setAuthToken;

  const { showAlert } = useModalAlert();

  const [devices, setDevices] = useState<Device[]>([]);
  const [widgetsBoxes, setWidgetsBoxes] = useState<WidgetBox[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for websocket & subscribed topics
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedTopicsRef = useRef<Set<string>>(new Set());
  const widgetsBoxesRef = useRef<WidgetBox[]>([]);

  // Keep widgetsBoxesRef in sync
  useEffect(() => {
    widgetsBoxesRef.current = widgetsBoxes;
  }, [widgetsBoxes]);

  // 🔹 Fetch widgets boxes for a single device -> return mapped array
  const fetchWidgetsBoxesListForDevice = async (
    deviceId: string,
    deviceName?: string
  ) => {
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/widget-boxes/list`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        const insertDeviceToWidgetBoxes = (resJson.data || []).map(
          (w: any) => ({
            ...w,
            device_id: deviceId,
            device_name: deviceName ?? w.device_name ?? null,
            realTimeValue: w.realTimeValue ?? null,
            realTimeTime: w.realTimeTime ?? null,
          })
        ) as WidgetBox[];
        return insertDeviceToWidgetBoxes;
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
        return [];
      } else {
        showAlert(
          "Fetch widgets boxes list gagal",
          resJson?.message ||
            "Fetch widgets boxes list gagal, silahkan coba lagi."
        );
        return [];
      }
    } catch (err) {
      console.error("Fetch widgets boxes list error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
      return [];
    }
  };

  // 🔹 Fetch devices and all widgets (use Promise.all) -> set loading false after all ready
  const fetchDevicesList = async () => {
    setLoading(true);
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
        const deviceList: Device[] = resJson.data || [];
        setDevices(deviceList);

        // Fetch widgets for all devices in parallel
        const widgetsArrays = await Promise.all(
          deviceList.map((device) =>
            fetchWidgetsBoxesListForDevice(device.id, device.name)
          )
        );
        // flatten and set once
        const flattened = widgetsArrays.flat();
        setWidgetsBoxes(flattened);
        subscribedTopicsRef.current = new Set(); // reset subscriptions on fresh load
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
      } else {
        showAlert(
          "Fetch devices list gagal",
          resJson?.message || "Fetch devices list gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Fetch devices list error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create widget (minimal fix: ensure numeric fields sent as numbers)
  const [newWidget, setNewWidget] = useState({
    deviceId: "",
    name: "",
    pin: "",
    min_value: "",
    max_value: "",
    default_value: "",
    unit: "",
  });

  const handleCreateWidget = async () => {
    if (!newWidget.deviceId) {
      showAlert("Hey kamu :(", "Pilih device terlebih dahulu.");
      return;
    }

    try {
      const bodyPayload = {
        name: newWidget.name,
        pin: newWidget.pin,
        min_value:
          newWidget.min_value === "" ? null : Number(newWidget.min_value),
        max_value:
          newWidget.max_value === "" ? null : Number(newWidget.max_value),
        default_value:
          newWidget.default_value === ""
            ? null
            : Number(newWidget.default_value),
        unit: newWidget.unit || null,
      };

      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${newWidget.deviceId}/widget-boxes/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        showAlert("Horay :)", "Membuat widget box berhasil.");
        // Re-fetch devices & widgets to get fresh data
        await fetchDevicesList();
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
      } else {
        showAlert(
          "Membuat widget box gagal",
          resJson?.message || "Membuat widget box gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Create widget box error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setNewWidget({
        deviceId: "",
        name: "",
        pin: "",
        min_value: "",
        max_value: "",
        default_value: "",
        unit: "",
      });
    }
  };

  // 🔹 Delete widget (fix double res.json)
  const handleDeleteWidgetBox = async (deviceId: string, widgetId: string) => {
    if (!confirm("Yakin ingin menghapus widget ini?")) return;

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/widget-boxes/${widgetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setWidgetsBoxes((prev) => prev.filter((w) => w.id !== widgetId));
        // Also remove subscription if any
        const topic = `device-id/${deviceId}/pin/${
          widgetsBoxesRef.current.find((w) => w.id === widgetId)?.pin ?? ""
        }`;
        subscribedTopicsRef.current.delete(topic);
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
      } else {
        showAlert(
          "Menghapus widget box gagal",
          resJson?.message || "Menghapus widget box gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Delete widget box error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Update widget (ensure numeric fields sent as numbers)
  const [editWidget, setEditWidget] = useState<WidgetBox | null>(null);
  const handleUpdateWidgetBox = async () => {
    if (!editWidget) return;

    try {
      const bodyPayload = {
        id: editWidget.id,
        name: editWidget.name,
        pin: editWidget.pin,
        min_value:
          editWidget.min_value === null ? null : Number(editWidget.min_value),
        max_value:
          editWidget.max_value === null ? null : Number(editWidget.max_value),
        default_value:
          editWidget.default_value === null
            ? null
            : Number(editWidget.default_value),
        unit: editWidget.unit ?? null,
      };

      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${editWidget.device_id}/widget-boxes/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        showAlert("Horay :)", "Update widget box berhasil.");
        setWidgetsBoxes((prev) =>
          prev.map((w) => (w.id === editWidget.id ? { ...editWidget } : w))
        );
        setEditWidget(null);
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
      } else {
        showAlert(
          "Update widget box gagal",
          resJson?.message || "Update widget box gagal, silahkan coba lagi."
        );
      }
    } catch (err) {
      console.error("Update widget box error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    }
  };

  // 🔹 Fetch report
  const [reports, setReports] = useState<Record<string, any[]>>({});
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [fetchingReportLoading, setFetchingReportLoading] = useState(false);

  const formatDateToLocalInput = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const handleFetchReport = async (
    deviceId: string,
    pin: string,
    start?: string,
    end?: string
  ) => {
    try {
      setFetchingReportLoading(true);
      const url = new URL(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/report`
      );
      url.searchParams.append("pin", pin);
      if (start) url.searchParams.append("start", start);
      if (end) url.searchParams.append("end", end);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const resJson = await res.json();
      if (res.ok) {
        const key = `${deviceId}-${pin}`;
        setReports((prev) => ({
          ...prev,
          [key]: resJson.data || [],
        }));
      } else if (
        resJson?.message === "Token expired" ||
        resJson?.message === "Invalid token"
      ) {
        sessionStorage.removeItem("authToken");
        setAuthToken?.(null);
      } else {
        showAlert(
          "Fetch report gagal",
          resJson?.message || "Fetch report gagal."
        );
      }
    } catch (err) {
      console.error("Fetch report error:", err);
      showAlert(
        "Mohon maaf :(",
        "Terjadi kesalahan pada server atau jaringan."
      );
    } finally {
      setFetchingReportLoading(false);
    }
  };

  // Default: ambil data 1 jam terakhir saat modal dibuka
  const [reportWidget, setReportWidget] = useState<WidgetBox | null>(null);
  useEffect(() => {
    if (reportWidget) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const startISO = oneHourAgo.toISOString();
      const endISO = now.toISOString();

      setStartTime(formatDateToLocalInput(oneHourAgo));
      setEndTime(formatDateToLocalInput(now));

      // fetch report once here (useEffect triggers only when reportWidget changes)
      handleFetchReport(
        reportWidget.device_id,
        reportWidget.pin,
        startISO,
        endISO
      );
    }

    return () => {
      setStartTime("");
      setEndTime("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportWidget]);

  const handleApplyTimeFilter = () => {
    if (!reportWidget) return;
    handleFetchReport(
      reportWidget.device_id,
      reportWidget.pin,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString()
    );
  };

  const handleOpenReport = (widget: WidgetBox) => {
    // Only set reportWidget; useEffect will fetch (prevents double fetch)
    setReportWidget(widget);
  };

  // Initial load
  useEffect(() => {
    fetchDevicesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------
  // WebSocket: connect, subscribe, and handle incoming messages
  // -----------------------
  const insertRealTimeValueToWidgetsBoxes = (data: WsMessage) => {
    setWidgetsBoxes((prev) =>
      prev.map((w) =>
        w.device_id === data.deviceId && w.pin === data.pin
          ? { ...w, realTimeValue: data.value, realTimeTime: data.time }
          : w
      )
    );
  };

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Subscribe to all current widgets
      widgetsBoxesRef.current.forEach((widget) => {
        const topic = `device-id/${widget.device_id}/pin/${widget.pin}`;
        if (!subscribedTopicsRef.current.has(topic)) {
          try {
            ws.send(JSON.stringify({ type: "subscribe", topic }));
            subscribedTopicsRef.current.add(topic);
          } catch (e) {
            console.error("WebSocket subscribe error:", e);
          }
        }
      });
    };

    ws.onmessage = (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);
        insertRealTimeValueToWidgetsBoxes(data);
      } catch (err) {
        console.error("WebSocket received message error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      try {
        ws.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
      subscribedTopicsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  // When widgetsBoxes changes, subscribe to new topics if WS is open
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      widgetsBoxes.forEach((widget) => {
        const topic = `device-id/${widget.device_id}/pin/${widget.pin}`;
        if (!subscribedTopicsRef.current.has(topic) && wsRef.current) {
          try {
            wsRef.current.send(JSON.stringify({ type: "subscribe", topic }));
            subscribedTopicsRef.current.add(topic);
          } catch (e) {
            console.error("WebSocket subscribe error:", e);
          }
        }
      });
    }
  }, [widgetsBoxes]);

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      {/* BUTTON CREATE WIDGET */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <button
          className="btn"
          style={{ backgroundColor: "#1E3E62", color: "#FFFFFF" }}
          data-bs-toggle="modal"
          data-bs-target="#createWidgetModal"
        >
          + Tambah Widget Box
        </button>
      </div>

      {/* MODAL CREATE WIDGET */}
      <div
        className="modal fade"
        id="createWidgetModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tambah Widget Box</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="widgetBoxDeviceId" className="form-label">
                  Perangkat
                </label>
                <select
                  id="widgetBoxDeviceId"
                  className="form-select"
                  value={newWidget.deviceId}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, deviceId: e.target.value })
                  }
                >
                  <option value="">-- Pilih Perangkat --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxName" className="form-label">
                  Nama
                </label>
                <input
                  id="widgetBoxName"
                  type="text"
                  className="form-control"
                  value={newWidget.name}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxPin" className="form-label">
                  Pin
                </label>
                <input
                  id="widgetBoxPin"
                  type="text"
                  className="form-control"
                  value={newWidget.pin}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, pin: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxMinValue" className="form-label">
                  Nilai Minimal
                </label>
                <input
                  id="widgetBoxMinValue"
                  type="number"
                  className="form-control"
                  value={newWidget.min_value}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, min_value: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxMaxValue" className="form-label">
                  Nilai Maksimal
                </label>
                <input
                  id="widgetBoxMaxValue"
                  type="number"
                  className="form-control"
                  value={newWidget.max_value}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, max_value: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxDefaultValue" className="form-label">
                  Nilai Default (jika tidak ada data real-time)
                </label>
                <input
                  id="widgetBoxDefaultValue"
                  type="number"
                  className="form-control"
                  value={newWidget.default_value}
                  onChange={(e) =>
                    setNewWidget({
                      ...newWidget,
                      default_value: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxUnit" className="form-label">
                  Unit
                </label>
                <input
                  id="widgetBoxUnit"
                  type="text"
                  className="form-control"
                  value={newWidget.unit}
                  onChange={(e) =>
                    setNewWidget({
                      ...newWidget,
                      unit: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateWidget}
                data-bs-dismiss="modal"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET BOX LIST */}
      {widgetsBoxes.length > 0 ? (
        <>
          <div className="container py-4">
            <div className="row g-4">
              {widgetsBoxes.map((w) => {
                const min = w.min_value ?? 0;
                const max = w.max_value ?? 100;
                const value = w.realTimeValue ?? w.default_value ?? 0;
                const time = w.realTimeTime;

                const percent = Math.min(Math.max(value, min), max);
                const data = [
                  { name: w.name, value: percent, fill: "#4F46E5" },
                ];

                return (
                  <div key={w.id} className="col-12 col-md-6 col-lg-4 d-flex">
                    <div className="card shadow-lg border-0 rounded-4 text-center position-relative overflow-hidden flex-fill">
                      {/* Action Buttons (Top Right) */}
                      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                        <button
                          className="btn btn-outline-dark btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#editWidgetModal"
                          onClick={() => setEditWidget(w)}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>

                        <button
                          className="btn btn-outline-primary btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#reportWidgetModal"
                          onClick={() => handleOpenReport(w)}
                        >
                          <i className="bi bi-graph-up me-1"></i> Report
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDeleteWidgetBox(w.device_id, w.id)
                          }
                        >
                          <i className="bi bi-trash me-1"></i> Delete
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="card-body py-5 px-3">
                        <h5 className="card-title fw-bold text-dark mt-3 mb-3">
                          {w.name}
                        </h5>

                        <div className="d-flex flex-column align-items-center mb-0">
                          {/* Chart */}
                          <RadialBarChart
                            width={200}
                            height={200}
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="100%"
                            barSize={14}
                            data={data}
                            startAngle={180}
                            endAngle={0}
                          >
                            <PolarAngleAxis
                              type="number"
                              domain={[min, max]}
                              angleAxisId={0}
                              tick={false}
                            />
                            <RadialBar
                              background
                              dataKey="value"
                              cornerRadius={15}
                            />
                          </RadialBarChart>

                          {/* Min-Max Label */}
                          <div className="d-flex justify-content-around text-secondary small fw-semibold px-4 mt-2 w-100">
                            <span>{min}</span>
                            <span>{max}</span>
                          </div>
                        </div>

                        {/* Value */}
                        <p className="fs-3 fw-bold text-dark mt-3">
                          {value}
                          {w.unit ?? ""}
                        </p>
                        <p className="fw-semibold text-muted small">
                          {time
                            ? `(${new Date(time).toLocaleString()})`
                            : "(Tidak ada data yang datang)"}
                        </p>

                        {/* Device Info */}
                        <div className="text-muted small">
                          <p className="mb-1">
                            <span className="fw-semibold">Perangkat:</span>{" "}
                            {w.device_name}
                          </p>
                          <p className="mb-0">
                            <span className="fw-semibold">Pin:</span> {w.pin}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODAL EDIT WIDGET */}
          <div
            className="modal fade"
            id="editWidgetModal"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Widget Box</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setEditWidget(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  {editWidget && (
                    <>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxDeviceNameEdit"
                          className="form-label"
                        >
                          Nama
                        </label>
                        <input
                          id="widgetBoxDeviceNameEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.name}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxPinEdit"
                          className="form-label"
                        >
                          Pin
                        </label>
                        <input
                          id="widgetBoxPinEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.pin}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              pin: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxMinEdit"
                          className="form-label"
                        >
                          Nilai Minimal
                        </label>
                        <input
                          id="widgetBoxMinEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.min_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              min_value:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxMaxEdit"
                          className="form-label"
                        >
                          Nilai Maksimal
                        </label>
                        <input
                          id="widgetBoxMaxEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.max_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              max_value:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxDefaultEdit"
                          className="form-label"
                        >
                          Nilai Default (jika tidak ada data real-time)
                        </label>
                        <input
                          id="widgetBoxDefaultEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.default_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              default_value:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxUnitEdit"
                          className="form-label"
                        >
                          Unit
                        </label>
                        <input
                          id="widgetBoxUnitEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.unit ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              unit: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => setEditWidget(null)}
                  >
                    Batal
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateWidgetBox}
                    data-bs-dismiss="modal"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL REPORT */}
          <div
            className="modal fade"
            id="reportWidgetModal"
            tabIndex={-1}
            aria-labelledby="reportWidgetModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="reportWidgetModalLabel">
                    {reportWidget?.name} ({reportWidget?.device_name})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setReportWidget(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  {/* Filter Waktu */}
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-12 col-md-4">
                      <label
                        htmlFor="startTimeDataReport"
                        className="form-label"
                      >
                        Mulai:
                      </label>
                      <input
                        id="startTimeDataReport"
                        type="datetime-local"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label htmlFor="endTimeDataReport" className="form-label">
                        Selesai:
                      </label>
                      <input
                        id="endTimeDataReport"
                        type="datetime-local"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4 d-grid">
                      <button
                        className="btn btn-primary"
                        onClick={handleApplyTimeFilter}
                        disabled={fetchingReportLoading}
                      >
                        {fetchingReportLoading ? (
                          <output className="spinner-border spinner-border-sm me-2"></output>
                        ) : (
                          "Terapkan"
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Chart */}
                  {reportWidget &&
                    (() => {
                      const key = `${reportWidget.device_id}-${reportWidget.pin}`;
                      const report = reports[key] || [];

                      return report.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={report}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis />
                            <Tooltip
                              labelFormatter={(label) =>
                                new Date(label).toLocaleString()
                              }
                            />
                            <Legend />
                            <Line type="monotone" dataKey="value" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="alert alert-info mt-3">
                          Tidak ada data report untuk rentang waktu ini.
                        </div>
                      );
                    })()}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => setReportWidget(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Tidak ada widget box</p>
      )}
    </div>
  );
}
