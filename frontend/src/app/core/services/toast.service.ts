import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'amber';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(msg: string): void {
    this.show(msg, 'success');
  }
  error(msg: string): void {
    this.show(msg, 'error');
  }
  info(msg: string): void {
    this.show(msg, 'info');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
