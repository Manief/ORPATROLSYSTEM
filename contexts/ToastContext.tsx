
import React, { createContext, useState, useCallback, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<ToastMessage & { onDismiss: (id: number) => void }> = ({ id, message, type, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center justify-between';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={() => onDismiss(id)} className="ml-4 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
        &times;
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    setToasts((prevToasts) => [...prevToasts, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
