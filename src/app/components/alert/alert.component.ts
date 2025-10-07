import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert, ConfirmDialog } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;
  
  private alertsSubscription?: Subscription;
  private confirmDialogSubscription?: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    // Subscribe to alerts
    this.alertsSubscription = this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });

    // Subscribe to confirmation dialog
    this.confirmDialogSubscription = this.alertService.confirmDialog$.subscribe(dialog => {
      this.confirmDialog = dialog;
    });
  }

  ngOnDestroy() {
    this.alertsSubscription?.unsubscribe();
    this.confirmDialogSubscription?.unsubscribe();
  }

  closeAlert(id: string) {
    this.alertService.removeAlert(id);
  }

  closeConfirmDialog() {
    this.alertService.closeConfirmDialog();
  }

  executeConfirm() {
    this.alertService.executeConfirm();
  }

  executeCancel() {
    this.alertService.executeCancel();
  }

  getAlertClasses(type: string): string {
    const baseClasses = 'bg-white border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-500`;
      case 'error':
        return `${baseClasses} border-red-500`;
      case 'warning':
        return `${baseClasses} border-yellow-500`;
      case 'info':
        return `${baseClasses} border-blue-500`;
      default:
        return `${baseClasses} border-gray-500`;
    }
  }

  getActionClasses(style?: string): string {
    const baseClasses = 'px-3 py-1 text-xs font-medium rounded-md transition-colors';
    
    switch (style) {
      case 'primary':
        return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
      case 'secondary':
        return `${baseClasses} bg-gray-500 text-white hover:bg-gray-600`;
      case 'danger':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300`;
    }
  }

  getConfirmIconClasses(type?: string): string {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100';
      case 'danger':
        return 'bg-red-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-yellow-100';
    }
  }

  getConfirmButtonClasses(type?: string): string {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  }
}