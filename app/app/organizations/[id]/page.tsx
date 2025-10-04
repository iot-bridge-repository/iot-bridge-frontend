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
  PolarAngleAxis 
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
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [widgetsBoxes, setWidgetsBoxes] = useState<WidgetBox[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch devices
  const fetchDevicesList = async () => {
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
      const res = await fetch(`${backendUrl}/organizations/${id}/devices/${deviceId}/widget-boxes/list`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const resJson = await res.json();
      if (res.ok) {
        const insertDeviceToWidgetBoxes = resJson.data.map((w: WidgetBox) => ({ ...w, device_id: deviceId, device_name: devices.find((d) => d.id === deviceId)?.name }));
        setWidgetsBoxes((prevWidgetsBoxes) => [...prevWidgetsBoxes, ...insertDeviceToWidgetBoxes]);
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
            unit: newWidget.unit
          }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        alert("Membuat widget box berhasil.");
        setWidgetsBoxes([]);
        fetchWidgetsBoxesList(newWidget.deviceId);
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
      })
    }
  };

  // 🔹 Delete widget
  const handleDeleteWidgetBox = async (deviceId: string, widgetId: string) => {
    if (confirm("Yakin ingin menghapus widget ini?")) {
      try {
        const res = await fetch(`${backendUrl}/organizations/${id}/devices/${deviceId}/widget-boxes/${widgetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
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
  const [reports, setReports] = useState<Record<string, DeviceReport[]>>({}); 
  const handleFetchReport = async (deviceId: string, pin: string) => {
    try {
      const res = await fetch(`${backendUrl}/organizations/${id}/devices/${deviceId}/report?pin=${pin}`, {
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
    }
  };

  const [reportWidget, setReportWidget] = useState<WidgetBox | null>(null);
  const handleOpenReport = async (widget: WidgetBox) => {
    setReportWidget(widget);
    await handleFetchReport(widget.device_id, widget.pin);
  };

  useEffect(() => {
    fetchDevicesList();
  }, []);

  useEffect(() => {
    devices.forEach((device) => { fetchWidgetsBoxesList(device.id) })
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Widget Boxes</h1>
        {/* BUTTON CREATE WIDGET */}
        <button
          className="btn btn-primary"
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
                <label htmlFor="widgetBoxDeviceId" className="form-label">Device</label>
                <select
                  id="widgetBoxDeviceId"
                  className="form-select"
                  value={newWidget.deviceId}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, deviceId: e.target.value })
                  }
                >
                  <option value="">-- Pilih Device --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="widgetBoxName" className="form-label">Name</label>
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
                <label htmlFor="widgetBoxPin" className="form-label">Pin</label>
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
                <label htmlFor="widgetBoxMinValue" className="form-label">Min Value</label>
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
                <label htmlFor="widgetBoxMaxValue" className="form-label">Max Value</label>
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
                <label htmlFor="widgetBoxDefaultValue" className="form-label">Default Value</label>
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
                <label htmlFor="widgetBoxUnit" className="form-label">Unit</label>
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
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateWidget}
                data-bs-dismiss="modal"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET BOX LIST */}
      {widgetsBoxes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {widgetsBoxes.map((w) => {
              const min = w.min_value ?? 0;
              const max = w.max_value ?? 100;
              const value = w.realTimeValue ?? w.default_value ?? 0;

              const percent = Math.min(Math.max(value, min), max);
              const data = [{ name: w.name, value: percent, fill: "#4F46E5" }];

              return (
                <div 
                  key={w.id}
                  className="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition-shadow duration-300 relative"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs font-medium bg-white-500 text-dark rounded-lg border border-black hover:bg-gray-600 transition"
                      data-bs-toggle="modal"
                      data-bs-target="#editWidgetModal"
                      onClick={() => setEditWidget(w)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 text-xs font-medium bg-white-500 text-dark rounded-lg border border-primary hover:bg-sky-600 transition"
                      data-bs-toggle="modal"
                      data-bs-target="#reportWidgetModal"
                      onClick={() => handleOpenReport(w)}
                    >
                      Data Report
                    </button>

                    <button 
                      className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      onClick={() => handleDeleteWidgetBox(w.device_id,w.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mt-5 mb-4 tracking-wide">
                    {w.name}
                  </h3>

                  <RadialBarChart
                    width={220}
                    height={220}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={16}
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
                    <RadialBar background dataKey="value" cornerRadius={15} />
                  </RadialBarChart>

                  <div className="flex justify-between w-full px-6 mt-[-20px] text-gray-500 text-sm font-medium">
                    <span>{min}</span>
                    <span>{max}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-700 mt-3">
                    {value}
                    {w.unit ?? ""}
                  </p>

                  <div className="mt-2 text-center text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-semibold">Device:</span> {w.device_name}
                    </p>
                    <p>
                      <span className="font-semibold">Pin:</span> {w.pin}
                    </p>
                  </div>
                </div>
              );
            })}
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
                        <label htmlFor="widgetBoxDeviceNameEdit" className="form-label">Name</label>
                        <input
                          id="widgetBoxDeviceNameEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.name}
                          onChange={(e) =>
                            setEditWidget({ ...editWidget, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="widgetBoxPinEdit" className="form-label">Pin</label>
                        <input
                          id="widgetBoxPinEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.pin}
                          onChange={(e) =>
                            setEditWidget({ ...editWidget, pin: e.target.value })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="widgetBoxUnitEdit" className="form-label">Min Value</label>
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
                        <label htmlFor="widgetBoxUnitEdit" className="form-label">Max Value</label>
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
                        <label htmlFor="widgetBoxUnitEdit" className="form-label">Default Value</label>
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
                        <label htmlFor="widgetBoxUnitEdit" className="form-label">Unit</label>
                        <input
                          id="widgetBoxUnitEdit"
                          type="text"
                          className="form-control"
                          value={editWidget.unit ?? ""}
                          onChange={(e) =>
                            setEditWidget({ ...editWidget, unit: e.target.value })
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
                    Data Report - {reportWidget?.name}
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
                  {reportWidget && (() => {
                    const key = `${reportWidget.device_id}-${reportWidget.pin}`;
                    const report = reports[key] || [];

                    return report.length > 0 ? (
                      <>
                        {/* LINE CHART */}
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={report}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="time"
                              tickFormatter={(timeStr) =>
                                new Date(timeStr).toLocaleTimeString()
                              }
                            />
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
                      </>
                    ) : (
                      <div className="alert alert-info">Tidak ada data report.</div>
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
