import React from 'react';
import ConfirmDialog from './ui/ConfirmDialog';
import { useConfirmStore } from '../store/confirmStore';

export default function ConfirmDialogProvider() {
  const { 
    isOpen, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    variant, 
    onConfirm, 
    loading,
    hide 
  } = useConfirmStore();

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={hide}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      loading={loading}
    />
  );
}


