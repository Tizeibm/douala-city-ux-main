import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './services/notification.service';
import { environment } from '../../environments/environment';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let notificationService: NotificationService;
  const testUrl = `${environment.apiUrl}/test`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationService,
        {
          provide: 'HTTP_INTERCEPTORS',
          useValue: errorInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle 400 Bad Request', () => {
    spyOn(notificationService, 'showError');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
        expect(notificationService.showError).toHaveBeenCalledWith('Requête invalide');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 401 Unauthorized', () => {
    spyOn(notificationService, 'showError');
    spyOn(window, 'location', 'get').and.returnValue({
      href: ''
    } as any);

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(notificationService.showError).toHaveBeenCalledWith('Session expirée. Veuillez vous reconnecter');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 403 Forbidden', () => {
    spyOn(notificationService, 'showError');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
        expect(notificationService.showError).toHaveBeenCalledWith('Accès refusé');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

  it('should handle 404 Not Found', () => {
    spyOn(notificationService, 'showError');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(notificationService.showError).toHaveBeenCalledWith('Ressource non trouvée');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 Server Error', () => {
    spyOn(notificationService, 'showError');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(notificationService.showError).toHaveBeenCalledWith('Erreur serveur. Veuillez réessayer plus tard');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network errors', () => {
    spyOn(notificationService, 'showError');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
        expect(notificationService.showError).toHaveBeenCalledWith('Erreur réseau. Vérifiez votre connexion');
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.error(new ErrorEvent('Network error'));
  });

  it('should clear localStorage on 401', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('utilisateur', 'test-user');
    localStorage.setItem('role', 'ADMIN');

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: () => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('utilisateur')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
