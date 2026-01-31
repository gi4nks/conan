'use client';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "error" // error | info
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'error' | 'info' | 'success';
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-base-300 animate-in zoom-in-95 duration-200 z-[10000]" onClick={(e) => e.stopPropagation()}>
        <div className="card-body">
          <h2 className={`card-title ${type === 'error' ? 'text-error' : type === 'success' ? 'text-success' : 'text-primary'}`}>
            {title}
          </h2>
          <p className="text-base-content/70">{message}</p>
          <div className="card-actions justify-end mt-4">
            <button onClick={onCancel} className="btn btn-ghost btn-sm">
              {cancelText}
            </button>
            <button 
                onClick={onConfirm} 
                className={`btn btn-sm ${type === 'error' ? 'btn-error' : type === 'success' ? 'btn-success text-white' : 'btn-primary'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
