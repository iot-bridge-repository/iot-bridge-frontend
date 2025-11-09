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
}

interface WsMessage {
  deviceId: string;
  pin: string;
  value: number;
  time: string;
}

interface DeviceReport {
  pin: string;
  value: number;
  time: string;
}

export default function OrganizationsId() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [widgetsBoxes, setWidgetsBoxes] = useState<WidgetBox[]>([]);
  const [loading, setLoading] = useState(true);

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
        alert(resJson?.message || "Fetch devices list gagal.");
      }
    } catch (err) {
      console.error("Fetch devices list error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  // 🔹 Fetch widgets boxes list
  const fetchWidgetsBoxesList = async (deviceId: string) => {
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
        const insertDeviceToWidgetBoxes = resJson.data.map((w: WidgetBox) => ({
          ...w,
          device_id: deviceId,
          device_name: devices.find((d) => d.id === deviceId)?.name,
        }));
        setWidgetsBoxes((prevWidgetsBoxes) => [
          ...prevWidgetsBoxes,
          ...insertDeviceToWidgetBoxes,
        ]);
      } else {
        alert(resJson?.message || "Fetch widgets boxes list gagal.");
      }
    } catch (err) {
      console.error("Fetch widgets boxes list error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create widget
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
      alert("Pilih device terlebih dahulu");
      return;
    }

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${newWidget.deviceId}/widget-boxes/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newWidget.name,
            pin: newWidget.pin,
            min_value: newWidget.min_value,
            max_value: newWidget.max_value,
            default_value: newWidget.default_value,
            unit: newWidget.unit,
          }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        alert("Membuat widget box berhasil.");
        setWidgetsBoxes([]);
        devices.forEach((device) => {
          fetchWidgetsBoxesList(device.id);
        });
      } else {
        alert(resJson?.message || "Membuat widget box gagal.");
      }
    } catch (err) {
      console.error("Create widget box error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
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

  // 🔹 Delete widget
  const handleDeleteWidgetBox = async (deviceId: string, widgetId: string) => {
    if (confirm("Yakin ingin menghapus widget ini?")) {
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
        if (res.ok) {
          setWidgetsBoxes((prev) => prev.filter((w) => w.id !== widgetId));
        } else {
          const resJson = await res.json();
          alert(resJson.message || "Menghapus widget box gagal.");
        }
      } catch (err) {
        console.error("Delete widget box error:", err);
        alert("Terjadi kesalahan pada server/jaringan.");
      }
    }
  };

  // 🔹 Update widget
  const [editWidget, setEditWidget] = useState<WidgetBox | null>(null);
  const handleUpdateWidgetBox = async () => {
    if (!editWidget) return;

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${editWidget.device_id}/widget-boxes/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editWidget.id,
            name: editWidget.name,
            pin: editWidget.pin,
            min_value: editWidget.min_value?.toString(),
            max_value: editWidget.max_value?.toString(),
            default_value: editWidget.default_value?.toString(),
            unit: editWidget.unit,
          }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        alert("Update widget box berhasil.");
        setWidgetsBoxes((prev) =>
          prev.map((w) => (w.id === editWidget.id ? { ...editWidget } : w))
        );
        setEditWidget(null);
      } else {
        alert(resJson?.message || "Update widget box gagal.");
      }
    } catch (err) {
      console.error("Update widget box error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
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
      } else {
        alert(resJson?.message || "Fetch report gagal.");
      }
    } catch (err) {
      console.error("Fetch report error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
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

  const handleOpenReport = async (widget: WidgetBox) => {
    setReportWidget(widget);
    await handleFetchReport(widget.device_id, widget.pin);
  };

  useEffect(() => {
    fetchDevicesList();
  }, []);

  useEffect(() => {
    devices.forEach((device) => {
      fetchWidgetsBoxesList(device.id);
    });
  }, [devices]);

  // 🔹 WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const insertRealTimeValueToWidgetsBoxes = (data: WsMessage) => {
    setWidgetsBoxes((prev) =>
      prev.map((w) =>
        w.device_id === data.deviceId && w.pin === data.pin
          ? { ...w, realTimeValue: data.value }
          : w
      )
    );
  };

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      widgetsBoxes.forEach((widget) => {
        const subscribeMsg = {
          type: "subscribe",
          topic: `device-id/${widget.device_id}/pin/${widget.pin}`,
        };
        ws.send(JSON.stringify(subscribeMsg));
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

    return () => ws.close();
  }, []);

  // Jika widgets baru muncul, bisa subscribe tanpa menutup WS
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      widgetsBoxes.forEach((widget) => {
        const subscribeMsg = {
          type: "subscribe",
          topic: `device-id/${widget.device_id}/pin/${widget.pin}`,
        };
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify(subscribeMsg));
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
                        <p className="fs-3 fw-bold text-dark mt-3 mb-1">
                          {value}
                          {w.unit ?? ""}
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
                          htmlFor="widgetBoxUnitEdit"
                          className="form-label"
                        >
                          Nilai Minimal
                        </label>
                        <input
                          id="widgetBoxUnitEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.min_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              min_value: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxUnitEdit"
                          className="form-label"
                        >
                          Nilai Maksimal
                        </label>
                        <input
                          id="widgetBoxUnitEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.max_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              max_value: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="widgetBoxUnitEdit"
                          className="form-label"
                        >
                          Nilai Default (jika tidak ada data real-time)
                        </label>
                        <input
                          id="widgetBoxUnitEdit"
                          type="number"
                          className="form-control"
                          value={editWidget.default_value ?? ""}
                          onChange={(e) =>
                            setEditWidget({
                              ...editWidget,
                              default_value: Number(e.target.value),
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
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#007bff"
                              dot={false}
                            />
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
