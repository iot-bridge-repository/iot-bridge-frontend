import { useState } from "react";

interface ModalAlertProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly message: string;
}

export default function ModalAlert({
  open,
  title,
  message,
  onClose,
}: ModalAlertProps) {
  if (!open) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              onClick={onClose}
              className="rounded-3"
              style={{
                backgroundColor: "#FF6500",
                color: "#FFFFFF",
                fill: "#FFFFFF",
                width: "32px",
                height: "32px",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="modal-body text-center">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
