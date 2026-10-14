import { useEffect, useState } from 'react';

export type Toast = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
};

let toasts: Toast[] = [];
let listeners: Array<(t: Toast[]) => void> = [];
let counter = 0;

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(type: Toast['type'], message: string) {
  const id = ++counter;
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToasts() {
  const [items, setItems] = useState<Toast[]>(toasts);
  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);
  return items;
}
