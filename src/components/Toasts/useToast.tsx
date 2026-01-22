import React, { JSX, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    description?: string;
}

interface ToastConfig {
    icon: LucideIcon;
    bg: string;
}

interface UseToastReturn {
    ToastContainer: () => JSX.Element;
    toast: (message: string, description?: string, duration?: number) => void;
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
}

const className = "glass-card"
const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info', description?: string, duration: number = 3000): void => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, description }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    };

    const removeToast = (id: number): void => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = (): JSX.Element => (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => {
                const config: Record<ToastType, ToastConfig> = {
                    success: { icon: CheckCircle, bg: 'bg-green-400' },
                    error: { icon: AlertCircle, bg: 'bg-red-500' },
                    warning: { icon: AlertTriangle, bg: 'bg-yellow-500' },
                    info: { icon: Info, bg: 'bg-blue-500' }
                };

                const { icon: Icon, bg } = config[toast.type];

                return (
                    <div dir='rtl' key={toast.id} className={`${toast.type == 'info' ? className : bg} animate-toast-in space-y-2 px-4 py-3 rounded-lg shadow-lg gap-3 min-w-[300px]`}>
                        <div className="flex justify-between items-center">
                            <Icon size={20} />
                            <button onClick={() => removeToast(toast.id)} className="hover:opacity-70 border rounded-full p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <span className="flex-1 text-md font-medium">{toast.message}</span>
                            {toast.description && <span className="text-md">{toast.description}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return {
        ToastContainer,
        toast: (message: string, description?: string, duration?: number) => addToast(message, 'info', description, duration = 1000000),
        success: (message: string, description?: string, duration?: number) => addToast(message, 'success', description, duration),
        error: (message: string, description?: string, duration?: number) => addToast(message, 'error', description, duration),
        warning: (message: string, description?: string, duration?: number) => addToast(message, 'warning', description, duration)
    };
};

export default useToast;