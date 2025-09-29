"use client";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  subject: string;
  message: string;
  type: string;
  created_at: string;
}

export default function Notifications() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${backendUrl}/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const resJson = await res.json();
      if (res.ok) {
        setNotifications(resJson.data || []);
      } else {
        alert(resJson?.message || "Fetch notifikasi gagal.");
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Respon undangan anggota
  const handleMemberInvitationResponse = async (
    orgId: string,
    isAccepted: boolean,
    notifId: string
  ) => {
    setSubmitting(notifId);

    try {
      const res = await fetch(
        `${backendUrl}/organizations/${orgId}/member-invitation-response`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_accepted: isAccepted }),
        }
      );

      const resJson = await res.json();
      if (res.ok) {
        fetchNotifications();
      } else {
        alert(resJson?.message || "Respon undangan anggota gagal.");
      }
    } catch (err) {
      console.error("Respon undangan anggota error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    } finally {
      setSubmitting(null);
    }
  };

  // 🔹 Hapus semua notifikasi
  const handleDeleteAll = async () => {
    if (!confirm("Yakin ingin menghapus semua notifikasi?")) return;

    try {
      const res = await fetch(`${backendUrl}/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const resJson = await res.json();
      if (res.ok) {
        fetchNotifications();
      } else {
        alert(resJson?.message || "Hapus semua notifikasi gagal.");
      }
    } catch (err) {
      console.error("Hapus semua notifikasi error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  // 🔹 Hapus notifikasi tertentu
  const handleDeleteOne = async (notifId: string) => {
    if (!authToken) return;

    try {
      const res = await fetch(`${backendUrl}/notifications/${notifId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const resJson = await res.json();
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notifId)
        );
      } else {
        alert(resJson?.message || "Hapus notifikasi gagal.");
      }
    } catch (err) {
      console.error("Hapus notifikasi error:", err);
      alert("Terjadi kesalahan pada server atau jaringan.");
    }
  };

  useEffect(() => {
    if (authToken) fetchNotifications();
  }, [authToken]);

  return (
    <div className="container my-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Notifikasi</h3>
        {notifications.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleDeleteAll}>
            Hapus Semua
          </button>
        )}
      </div>

      {loading && <p>Memuat notifikasi...</p>}

      {notifications.length === 0 && (
        <p className="text-muted">Belum ada notifikasi.</p>
      )}
      <ul className="list-group">
        {notifications.map((notif) => {
          const isInvitation = notif.type.includes(
            "organization_member_invitation"
          );
          const orgId = isInvitation ? notif.type.split(", id: ")[1] : null;

          return (
            <li key={notif.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">{notif.subject}</h6>
                  <p className="mb-1">{notif.message}</p>
                  <small className="text-muted">
                    {new Date(notif.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </small>

                  {isInvitation && orgId && (
                    <div className="mt-2 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                          await handleMemberInvitationResponse(orgId, true, notif.id);
                          await handleDeleteOne(notif.id);
                        }}
                        disabled={submitting === notif.id}
                      >
                        {submitting === notif.id ? "Memproses..." : "Terima"}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={async () => {
                          await handleMemberInvitationResponse(orgId, false, notif.id);
                          await handleDeleteOne(notif.id);
                        }}
                        disabled={submitting === notif.id}
                      >
                        {submitting === notif.id ? "Memproses..." : "Tolak"}
                      </button>
                    </div>
                  )}

                </div>
                <button
                  className="btn btn-outline-danger btn-sm ms-3"
                  onClick={() => handleDeleteOne(notif.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
