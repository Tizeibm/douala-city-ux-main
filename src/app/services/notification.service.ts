import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationSubject.asObservable();

  private eventSource: EventSource | null = null;

  constructor(private http: HttpClient, private zone: NgZone) {}

  subscribeToNotifications(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // SSE typically doesn't support headers natively in standard EventSource, 
    // but the backend expects a token. We might need to pass it via query param if possible,
    // or use a library that supports headers. However, looking at NotificationController, 
    // it uses @RequestHeader("Authorization"). 
    // Workaround: Native EventSource doesn't support headers. 
    // We'll try to use a polyfill or just implement a simple polling as fallback if SSE fails.
    
    try {
      this.eventSource = new EventSource(`${environment.apiUrl}/notifications/subcribe?token=${token}`);

      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          const newNotifs = this.notificationSubject.value;
          this.notificationSubject.next([event.data, ...newNotifs]);
        });
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        this.eventSource?.close();
      };
    } catch (e) {
      console.error('Failed to create EventSource', e);
    }
  }

  getPastNotifications(): void {
    this.http.get<any[]>(`${environment.apiUrl}/notifications/mesNotif`).subscribe({
      next: (notifs) => {
        const messages = notifs.map(n => n.contenu || n.message || n.notification);
        this.notificationSubject.next(messages);
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  clearNotifications(): void {
    this.notificationSubject.next([]);
  }
}
