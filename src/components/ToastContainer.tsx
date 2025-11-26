import React from 'react';
import Toast, { Toast as ToastType } from './ui/Toast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

