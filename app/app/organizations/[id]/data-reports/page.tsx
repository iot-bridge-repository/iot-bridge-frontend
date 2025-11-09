"use client";
import { useEffect, useState } from "react";
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
} from "recharts";

interface Device {
  id: string;
  name: string;
  pin: string[] | null;
}

interface DeviceReport {
  pin: string;
  value: number;
  time: string;
}

export default function OrganizationsIdDataReports() {
  const { id } = useParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Record<string, DeviceReport[]>>({});

  const fetchPinList = async (deviceId: string) => {
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/pin-list`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, pin: resJson.data } : d))
        );
      } else {
        alert(resJson?.message || "Fetch pins list gagal.");
      }
    } catch (err) {
      console.error("Fetch pins list error:", err);
    }
  };

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
        resJson.data.forEach((device: Device) => {
          fetchPinList(device.id);
        });
      } else {
        alert(resJson?.message || "Fetch devices gagal.");
      }
    } catch (err) {
      console.error("Fetch devices error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (deviceId: string, pin: string) => {
    try {
      const res = await fetch(
        `${backendUrl}/organizations/${id}/devices/${deviceId}/report?pin=${pin}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        const key = `${deviceId}-${pin}`;
        setReports((prev) => ({
          ...prev,
          [key]: data.data || [],
        }));
      } else {
        alert(data?.message || "Gagal mengambil report.");
      }
    } catch (err) {
      console.error("Fetch report error:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {devices.map((device) => (
        <div
          key={device.id}
          className="mb-8 border p-4 rounded bg-white shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Device: {device.name}</h2>

          {device.pin && device.pin.length > 0 ? (
            device.pin.map((p) => {
              const key = `${device.id}-${p}`;
              const reportData = reports[key];

              return (
                <div key={p} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Pin: {p}</span>
                    <button
                      onClick={() => fetchReport(device.id, p)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Load Report
                    </button>
                  </div>

                  {reportData && reportData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData}>
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
                          stroke="#8884d8"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Klik tombol "Load Report" untuk melihat report.
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">Device belum mengirimkan data.</p>
          )}
        </div>
      ))}
    </div>
  );
}
