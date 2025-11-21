"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import ModalAlert from "@/src/components/ModalAlert";

interface ModalAlertContextType {
  showAlert: (title: string, message: string) => void;
  closeAlert: () => void;
}

const ModalAlertContext = createContext<ModalAlertContextType | undefined>(
  undefined
);

interface ModalAlertProviderProps {
  children: ReactNode;
}

export function ModalAlertProvider({ children }: ModalAlertProviderProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const showAlert = (newTitle: string, newMessage: string) => {
    setTitle(newTitle);
    setMessage(newMessage);
    setOpen(true);
  };

  const closeAlert = () => {
    setOpen(false);
  };

  const contextValue: ModalAlertContextType = {
    showAlert,
    closeAlert,
  };

  return (
    <ModalAlertContext.Provider value={contextValue}>
      {children}

      <ModalAlert
        open={open}
        onClose={closeAlert}
        title={title}
        message={message}
      />
    </ModalAlertContext.Provider>
  );
}

export function useModalAlert(): ModalAlertContextType {
  const context = useContext(ModalAlertContext);

  if (!context) {
    throw new Error("useModalAlert must be used within an ModalAlertProvider");
  }

  return context;
}
