import { useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  isOpen,
  message,
  onClose,
  duration = 3000,
}: Props) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-md">
        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
        <p className="text-gray-800 text-sm flex-1 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100 flex-shrink-0"
          aria-label="关闭"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
