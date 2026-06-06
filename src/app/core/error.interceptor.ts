import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, mergeMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { NotificationService } from './services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        mergeMap((error, index) => {
          // Retry max 3 times, only for server errors (5xx) and network errors
          if (index < 3 && (error.status >= 500 || error.status === 0)) {
            const delayMs = Math.pow(2, index) * 1000; // Exponential backoff: 1s, 2s, 4s
            return timer(delayMs);
          }
          return throwError(() => error);
        })
      )
    ),
    catchError((error: HttpErrorResponse) => {
      return handleError(error, notificationService);
    })
  );
};

function handleError(error: HttpErrorResponse, notificationService: NotificationService) {
  let errorMessage = 'Une erreur s\'est produite';

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = `Erreur: ${error.error.message}`;
  } else {
    // Server-side error
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Requête invalide';
        break;
      case 401:
        errorMessage = 'Session expirée. Veuillez vous reconnecter';
        // Trigger logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('utilisateur');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }
        break;
      case 403:
        errorMessage = 'Accès refusé';
        break;
      case 404:
        errorMessage = 'Ressource non trouvée';
        break;
      case 409:
        errorMessage = error.error?.message || 'Conflit de données';
        break;
      case 500:
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
        break;
      case 503:
        errorMessage = 'Service indisponible. Veuillez réessayer plus tard';
        break;
      case 0:
        errorMessage = 'Erreur réseau. Vérifiez votre connexion';
        break;
      default:
        errorMessage = `Erreur ${error.status}: ${error.statusText}`;
    }
  }

  // Show notification to user
  notificationService.showError(errorMessage);

  // Log error for debugging
  console.error('[ErrorInterceptor]', error);

  return throwError(() => error);
}
