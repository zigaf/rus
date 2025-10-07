import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // Auto-close duration in ms, 0 = no auto-close
  showCloseButton?: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  text: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private confirmDialogSubject = new BehaviorSubject<ConfirmDialog | null>(null);
  
  public alerts$ = this.alertsSubject.asObservable();
  public confirmDialog$ = this.confirmDialogSubject.asObservable();

  constructor() {}

  // Success alert
  success(title: string, message: string, duration: number = 5000): string {
    return this.addAlert({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Error alert
  error(title: string, message: string, duration: number = 0): string {
    return this.addAlert({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Warning alert
  warning(title: string, message: string, duration: number = 5000): string {
    return this.addAlert({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Info alert
  info(title: string, message: string, duration: number = 5000): string {
    return this.addAlert({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      showCloseButton: true
    });
  }

  // Add custom alert
  addAlert(alert: Alert): string {
    const alerts = [...this.alertsSubject.value, alert];
    this.alertsSubject.next(alerts);

    // Auto-close if duration is set
    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        this.removeAlert(alert.id);
      }, alert.duration);
    }

    return alert.id;
  }

  // Remove alert
  removeAlert(id: string): void {
    const alerts = this.alertsSubject.value.filter(alert => alert.id !== id);
    this.alertsSubject.next(alerts);
  }

  // Clear all alerts
  clearAll(): void {
    this.alertsSubject.next([]);
  }

  // Show confirmation dialog
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'warning' | 'danger' | 'info';
      onCancel?: () => void;
    }
  ): void {
    const dialog: ConfirmDialog = {
      id: this.generateId(),
      title,
      message,
      confirmText: options?.confirmText || 'Підтвердити',
      cancelText: options?.cancelText || 'Скасувати',
      type: options?.type || 'warning',
      onConfirm,
      onCancel: options?.onCancel
    };

    this.confirmDialogSubject.next(dialog);
  }

  // Close confirmation dialog
  closeConfirmDialog(): void {
    this.confirmDialogSubject.next(null);
  }

  // Execute confirmation
  executeConfirm(): void {
    const dialog = this.confirmDialogSubject.value;
    if (dialog) {
      dialog.onConfirm();
      this.closeConfirmDialog();
    }
  }

  // Execute cancel
  executeCancel(): void {
    const dialog = this.confirmDialogSubject.value;
    if (dialog && dialog.onCancel) {
      dialog.onCancel();
    }
    this.closeConfirmDialog();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}