import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationSubject.asObservable();

  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private eventSource: EventSource | null = null;
  private toastIdCounter = 0;
  private readonly DEFAULT_TOAST_DURATION = 4000; // 4 seconds

  constructor(
    private http: HttpClient, 
    private zone: NgZone
  ) {}

  subscribeToNotifications(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') return;

    try {
      this.eventSource = new EventSource(`${environment.apiUrl}/notifications/subscribe?token=${token}`);

      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          const newNotifs = this.notificationSubject.value;
          this.notificationSubject.next([event.data, ...newNotifs]);
        });
      };

      this.eventSource.onerror = (error) => {
        console.error('Erreur SSE :', error);
        this.eventSource?.close();
      };
    } catch (e) {
      console.error('Impossible de créer l\'EventSource', e);
    }
  }

  getPastNotifications(): void {
    this.http.get<any[]>(`${environment.apiUrl}/notifications/mesNotif`).subscribe({
      next: (notifs) => {
        const messages = notifs.map(n => n.contenu || n.message || n.notification);
        this.notificationSubject.next(messages);
      },
      error: (err: any) => console.error('Error fetching notifications', err)
    });
  }

  clearNotifications(): void {
    this.notificationSubject.next([]);
  }

  // Toast notification methods (for error handling and user feedback)
  showSuccess(message: string, duration: number = this.DEFAULT_TOAST_DURATION): void {
    this.addToast({
      id: this.generateToastId(),
      type: 'success',
      message,
      duration
    });
  }

  showError(message: string, duration: number = this.DEFAULT_TOAST_DURATION): void {
    this.addToast({
      id: this.generateToastId(),
      type: 'error',
      message,
      duration
    });
  }

  showWarning(message: string, duration: number = this.DEFAULT_TOAST_DURATION): void {
    this.addToast({
      id: this.generateToastId(),
      type: 'warning',
      message,
      duration
    });
  }

  showInfo(message: string, duration: number = this.DEFAULT_TOAST_DURATION): void {
    this.addToast({
      id: this.generateToastId(),
      type: 'info',
      message,
      duration
    });
  }

  private addToast(toast: Toast): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    // Auto-remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  removeToast(id: string): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }

  clearToasts(): void {
    this.toastsSubject.next([]);
  }

  private generateToastId(): string {
    return `toast-${++this.toastIdCounter}-${Date.now()}`;
  }
}
