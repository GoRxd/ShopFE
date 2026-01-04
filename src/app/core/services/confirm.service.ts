import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private resolveCallback: ((value: boolean) => void) | null = null;
  
  isOpen = signal(false);
  options = signal<ConfirmOptions>({ message: '' });

  /**
   * Opens a confirmation modal and returns a promise that resolves to true (confirm) or false (cancel).
   */
  ask(message: string, options: Partial<ConfirmOptions> = {}): Promise<boolean> {
    this.options.set({
      title: 'Potwierdzenie',
      confirmText: 'Tak, kontynuuj',
      cancelText: 'Anuluj',
      type: 'danger',
      ...options,
      message
    });
    
    this.isOpen.set(true);
    
    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm() {
    this.isOpen.set(false);
    this.resolveCallback?.(true);
    this.resolveCallback = null;
  }

  cancel() {
    this.isOpen.set(false);
    this.resolveCallback?.(false);
    this.resolveCallback = null;
  }
}
