import { inject, PLATFORM_ID } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    let token: string | null = null;
    if (isPlatformBrowser(platformId)) {
        token = localStorage.getItem('token');
    }

    const isApiRequest = req.url.includes('/api/') || req.url.includes('localhost:8080');
    let clonedReq = req;

    if (token && isApiRequest) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        timeout(2000),
        catchError(err => {
            return throwError(() => err);
        })
    );
};
