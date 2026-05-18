import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationSubject.asObservable();

  private eventSource: EventSource | null = null;

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
}
