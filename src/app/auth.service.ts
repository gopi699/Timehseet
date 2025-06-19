// auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn(): boolean {
        // Implement your authentication check logic here
        // console.log("sessionStorage.getItem('userId')", sessionStorage.getItem('userId'));
        if (sessionStorage.getItem('userId')) {
            return true
        }
        return false
    }

    login(token: string): void {
        sessionStorage.setItem('userId', token);
    }
    logout(): void {
        sessionStorage.removeItem('userId');
        sessionStorage.clear();
    }
    getToken(): string | null {
        return sessionStorage.getItem('accesstoken'); // Get token // Example storage, modify as needed
      }
    getUserId(): string | null {
        return sessionStorage.getItem('userId'); // Get token // Example storage, modify as needed
      }
    getRoleId(): string | null {
        return sessionStorage.getItem('roleId'); // Get token // Example storage, modify as needed
      }
}
