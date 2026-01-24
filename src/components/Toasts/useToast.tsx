import { JSX, useCallback, useState } from 'react';


type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    description?: string;
}


interface UseToastReturn {
    toast: (message: string, description?: string, duration?: number) => void;
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
    toasts: Toast[];
    removeToast: (id: number) => void;
}
const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', description?: string, duration: number = 3000): void => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, description }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    }, [])

    const removeToast = useCallback((id: number): void => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, [])



    return {
        toast: (message: string, description?: string, duration?: number) => addToast(message, 'info', description, duration = 1000000),
        success: (message: string, description?: string, duration?: number) => addToast(message, 'success', description, duration),
        error: (message: string, description?: string, duration?: number) => addToast(message, 'error', description, duration),
        warning: (message: string, description?: string, duration?: number) => addToast(message, 'warning', description, duration),
        toasts,
        removeToast
    };
};

export { useToast };