// services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private notificationId = 0;

  showSuccess(message: string, title: string = 'Éxito', duration: number = 3000) {
    this.addNotification({
      id: ++this.notificationId,
      type: 'success',
      title,
      message,
      duration,
    });
  }

  showError(message: string, title: string = 'Error', duration: number = 5000) {
    this.addNotification({
      id: ++this.notificationId,
      type: 'error',
      title,
      message,
      duration,
    });
  }

  showWarning(message: string, title: string = 'Advertencia', duration: number = 4000) {
    this.addNotification({
      id: ++this.notificationId,
      type: 'warning',
      title,
      message,
      duration,
    });
  }

  showInfo(message: string, title: string = 'Información', duration: number = 3000) {
    this.addNotification({
      id: ++this.notificationId,
      type: 'info',
      title,
      message,
      duration,
    });
  }

  showWithAction(message: string, actionLabel: string, actionCallback: () => void) {
    this.addNotification({
      id: ++this.notificationId,
      type: 'info',
      title: 'Acción requerida',
      message,
      action: {
        label: actionLabel,
        callback: actionCallback,
      },
    });
  }

  private addNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remover si tiene duración
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: number) {
    const currentNotifications = this.notificationsSubject.value;
    const filtered = currentNotifications.filter((n) => n.id !== id);
    this.notificationsSubject.next(filtered);
  }

  clearAll() {
    this.notificationsSubject.next([]);
  }
}
