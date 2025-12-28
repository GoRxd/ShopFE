import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private platformId = inject(PLATFORM_ID);
  private _currentUser = signal<any>(null);
  currentUser = computed(() => this._currentUser());
  isLoggedIn = computed(() => !!this._currentUser());

  constructor(http: HttpClient) {
    super(http);
    if (isPlatformBrowser(this.platformId) && this.hasToken()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  login(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, dto).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
        }
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  register(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, dto).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
        }
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  fetchCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`).pipe(
      tap(user => this._currentUser.set(user)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this._currentUser.set(null);
  }
}
