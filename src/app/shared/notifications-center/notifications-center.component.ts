import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="notifications-container" [class.has-notifications]="((notifications$ | async)?.length || 0) > 0">
      <button class="notif-badge" (click)="toggleDropdown()">
        <i class="fas fa-bell"></i>
        <span class="badge-count" *ngIf="((notifications$ | async)?.length || 0) > 0">{{ (notifications$ | async)?.length }}</span>
      </button>

      <div class="notif-dropdown" *ngIf="showDropdown">
        <div class="notif-header">
          <h3>Notifications</h3>
          <button class="btn-clear" (click)="clearAll()">Tout effacer</button>
        </div>
        
        <div class="notif-list" *ngIf="((notifications$ | async)?.length || 0) > 0; else emptyState">
          <div class="notif-item animate-slide-in" *ngFor="let notif of (notifications$ | async) || []">
            <div class="notif-icon"><i class="fas fa-info-circle"></i></div>
            <div class="notif-content">{{ notif }}</div>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="empty-notif">
            <i class="fas fa-bell-slash"></i>
            <p>Aucune nouvelle notification</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container { position: relative; }
    .notif-badge { 
      background: rgba(255,255,255,0.1); border: none; color: white; padding: 10px; 
      border-radius: 50%; cursor: pointer; transition: all 0.3s; position: relative;
    }
    .notif-badge:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
    .badge-count {
      position: absolute; top: 0; right: 0; background: #ff4757; color: white;
      font-size: 10px; padding: 2px 5px; border-radius: 10px; border: 2px solid #1a1a2e;
    }
    .notif-dropdown {
      position: absolute; top: 120%; right: 0; width: 320px; background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      padding: 15px; z-index: 1000; border: 1px solid rgba(255,255,255,0.2);
    }
    .notif-header { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;
    }
    .notif-header h3 { margin: 0; font-size: 16px; color: #333; }
    .btn-clear { background: none; border: none; color: #ff4757; font-size: 12px; cursor: pointer; }
    .notif-list { max-height: 400px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px; border-radius: 10px; background: #f8f9fa;
      margin-bottom: 8px; font-size: 14px; color: #444; border-left: 4px solid #3498db;
    }
    .notif-icon { color: #3498db; }
    .empty-notif { text-align: center; padding: 30px; color: #999; }
    .empty-notif i { font-size: 24px; margin-bottom: 10px; display: block; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } }
  `]
})
export class NotificationsCenterComponent implements OnInit {
  notifications$: Observable<string[]>;
  showDropdown = false;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit() {
    this.notificationService.getPastNotifications();
    this.notificationService.subscribeToNotifications();
  }

  toggleDropdown() { this.showDropdown = !this.showDropdown; }
  clearAll() { this.notificationService.clearNotifications(); }
}
