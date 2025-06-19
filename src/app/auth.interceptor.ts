import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Observable, catchError, map, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inject AuthService
  const router = inject(Router); // Inject Router for navigation

  const authToken = authService.getToken();
  const userId: any = authService.getUserId();
  const roleId: any = authService.getRoleId();

  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        userId: userId.toString(),  // Ensure userId is a string
        roleId: roleId.toString()   // Ensure roleId is a string
      }
    });
  }

  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        // console.log('HTTP Response:', event);
      }
      return event;
    }),
    catchError(error => {
      switch (error.status) {
        case 400:
          console.log('Bad Request:', error);
          break;
        case 401:
          console.log('Unauthorized:', error);
          router.navigate(['/login']); // Correct way to use router
          break;
        case 403:
          console.log('Forbidden:', error);
          break;
        case 404:
          console.log('Not Found:', error.error);
          break;
        case 500:
          console.log('Server Error');
          break;
        default:
          console.log('Unknown Error:', error);
          break;
      }
      return throwError(() => error);
    })
  );
};
