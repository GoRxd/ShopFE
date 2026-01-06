import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { UserProfile, UpdateProfileDto } from '../models/user.model';
import { Address, CreateAddressDto } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/me/profile`);
  }

  updateProfile(dto: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/me/profile`, dto);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/users/me/addresses`);
  }

  addAddress(dto: CreateAddressDto): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/users/me/addresses`, dto);
  }

  updateAddress(id: number, dto: CreateAddressDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/me/addresses/${id}`, dto);
  }

  removeAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/me/addresses/${id}`);
  }

  setDefaultAddress(id: number, type: 'Shipping' | 'Billing'): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/me/addresses/${id}/default?type=${type}`, {});
  }
}
