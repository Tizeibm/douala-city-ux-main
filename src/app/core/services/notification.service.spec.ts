import { TestBed } from '@angular/core/testing';
import { NotificationService, Toast } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Toast notifications', () => {
    it('should add a success toast', (done) => {
      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('success');
          expect(toasts[0].message).toBe('Test message');
          done();
        }
      });

      service.showSuccess('Test message');
    });

    it('should add an error toast', (done) => {
      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('error');
          done();
        }
      });

      service.showError('Error message');
    });

    it('should add a warning toast', (done) => {
      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('warning');
          done();
        }
      });

      service.showWarning('Warning message');
    });

    it('should add an info toast', (done) => {
      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('info');
          done();
        }
      });

      service.showInfo('Info message');
    });

    it('should auto-remove toast after duration', (done) => {
      jasmine.clock().install();
      
      service.showSuccess('Test', 1000);
      
      service.toasts$.subscribe(toasts => {
        if (toasts.length === 0) {
          jasmine.clock().uninstall();
          done();
        }
      });

      jasmine.clock().tick(1100);
    });

    it('should remove toast manually', (done) => {
      service.showSuccess('Test', 0);
      
      let toastId = '';
      service.toasts$.subscribe(toasts => {
        if (toasts.length > 0 && !toastId) {
          toastId = toasts[0].id;
          service.removeToast(toastId);
        } else if (toasts.length === 0 && toastId) {
          done();
        }
      });
    });

    it('should clear all toasts', (done) => {
      service.showSuccess('Test 1');
      service.showError('Test 2');
      service.showWarning('Test 3');

      setTimeout(() => {
        service.clearToasts();
        service.toasts$.subscribe(toasts => {
          expect(toasts.length).toBe(0);
          done();
        });
      }, 100);
    });
  });

  describe('SSE Notifications', () => {
    it('should initialize empty notifications', (done) => {
      service.notifications$.subscribe(notifs => {
        expect(Array.isArray(notifs)).toBe(true);
        done();
      });
    });

    it('should clear all notifications', (done) => {
      service.clearNotifications();
      service.notifications$.subscribe(notifs => {
        expect(notifs.length).toBe(0);
        done();
      });
    });
  });
});
