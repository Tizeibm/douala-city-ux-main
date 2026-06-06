import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

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
    .notifications-container { position: relative; display: flex; align-items: center; }
    .notif-badge { 
      background: rgba(0, 0, 0, 0.05); border: none; color: #333; padding: 10px; 
      border-radius: 50%; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      position: relative; display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px;
    }
    .notif-badge:hover { background: rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
    .notif-badge i { font-size: 1.2rem; }
    
    /* Adapt for dark/colored headers if needed */
    :host-context(.admin-header) .notif-badge { color: white; background: rgba(255,255,255,0.1); }
    :host-context(.admin-header) .notif-badge:hover { background: rgba(255,255,255,0.2); }

    .badge-count {
      position: absolute; top: -2px; right: -2px; background: #ff4757; color: white;
      font-size: 10px; min-width: 18px; height: 18px; display: flex; align-items: center; 
      justify-content: center; border-radius: 10px; border: 2px solid #fff;
      font-weight: bold; box-shadow: 0 2px 5px rgba(255, 71, 87, 0.3);
    }
    
    .notif-dropdown {
      position: absolute; top: calc(100% + 15px); right: 0; width: 340px; 
      background: white; border-radius: 20px; 
      box-shadow: 0 15px 50px rgba(0,0,0,0.15);
      padding: 0; z-index: 1001; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      animation: dropdownFade 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-header { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa;
    }
    .notif-header h3 { margin: 0; font-size: 1.1rem; color: #1a1a2e; font-weight: 700; }
    .btn-clear { background: none; border: none; color: #ff4757; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-clear:hover { opacity: 0.8; }
    
    .notif-list { max-height: 420px; overflow-y: auto; padding: 10px; }
    .notif-item {
      display: flex; gap: 14px; padding: 15px; border-radius: 12px; background: #fff;
      margin-bottom: 8px; font-size: 0.95rem; color: #444; 
      transition: all 0.2s; border: 1px solid #f5f5f5;
    }
    .notif-item:hover { background: #f8fbff; transform: scale(1.02); border-color: #e0eaff; }
    .notif-icon { 
      width: 36px; height: 36px; border-radius: 10px; background: #eef2ff;
      display: flex; align-items: center; justify-content: center; color: #4f46e5;
      flex-shrink: 0;
    }
    .notif-content { line-height: 1.4; flex: 1; }
    
    .empty-notif { text-align: center; padding: 50px 20px; color: #a0aec0; }
    .empty-notif i { font-size: 2.5rem; margin-bottom: 15px; display: block; opacity: 0.5; }
    .empty-notif p { margin: 0; font-weight: 500; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
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
