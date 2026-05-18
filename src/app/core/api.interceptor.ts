import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, timeout, catchError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    const isApiRequest = req.url.includes('/api/') || req.url.includes('localhost:8080');
    const isAuthRequest = req.url.includes('/auth/');
    const isPublicRequest = req.url.includes('/public/');

    let clonedReq = req;

    if (token && isApiRequest && !isAuthRequest && !isPublicRequest) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Timeout adapté : 60s pour les uploads de fichiers, 30s pour les autres requêtes
    const isUpload = clonedReq.body instanceof FormData;
    const requestTimeout = isUpload ? 60000 : 30000;

    return next(clonedReq).pipe(
        timeout(requestTimeout),
        catchError(err => {
            if (err.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('utilisateur');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
            return throwError(() => err);
        })
    );
};
