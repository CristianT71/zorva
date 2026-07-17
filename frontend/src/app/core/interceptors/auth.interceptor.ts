import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Attaches the Bearer token to every request except the login call,
 * and centralises HTTP error handling (401 → logout, 400 → field message,
 * 500 → generic toast).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isLogin = req.url.includes('/auth/login');
  const token = auth.getToken();

  const authReq =
    token && !isLogin
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isLogin) {
        auth.logout();
        router.navigate(['/login']);
      } else if (err.status === 400) {
        const msg = err.error?.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Solicitud inválida');
      } else if (err.status >= 500) {
        toast.error('Error del servidor');
      } else if (err.status === 0 && !isLogin) {
        toast.error('No se pudo conectar con el servidor');
      }
      return throwError(() => err);
    }),
  );
};
