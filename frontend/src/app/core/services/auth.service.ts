import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models';

const TOKEN_KEY = 'zorva_token';
const USER_KEY = 'zorva_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Reactive view of the current user, hydrated from localStorage on load. */
  readonly currentUser = signal<User | null>(this.readUser());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Valid = token exists and (if decodable) is not past its exp claim. */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const exp = this.tokenExpiry(token);
    if (exp === null) return true; // not a standard JWT — trust presence
    return Date.now() < exp * 1000;
  }

  private tokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
