import { X, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = "确定",
  cancelText = "取消",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 leading-relaxed text-sm">{content}</p>
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors flex items-center gap-2"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
