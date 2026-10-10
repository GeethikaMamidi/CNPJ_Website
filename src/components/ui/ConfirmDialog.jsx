import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  variant = 'danger' 
}) {
  const btnClasses = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30',
    info: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30',
  };

  const iconClasses = {
    danger: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    info: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  const IconComponent = variant === 'danger' ? AlertTriangle : (variant === 'warning' ? AlertCircle : Info);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-2xl border flex-shrink-0 ${iconClasses[variant] || iconClasses.info}`}>
          <IconComponent size={22} />
        </div>
        <div className="pt-0.5">
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-95 ${btnClasses[variant] || btnClasses.info}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
