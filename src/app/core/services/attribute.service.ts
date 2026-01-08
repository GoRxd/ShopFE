import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AttributeOption {
  id: number;
  value: string;
}

export interface Attribute {
  id: number;
  name: string;
  options: AttributeOption[];
}

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attributes`;

  getAttributes(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(this.apiUrl);
  }

  createAttribute(name: string): Observable<number> {
    return this.http.post<number>(this.apiUrl, { name });
  }

  addOption(attributeId: number, value: string): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/${attributeId}/options`, { attributeId, value });
  }

  deleteOption(optionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/options/${optionId}`);
  }

  mergeDuplicates(attributeName: string = 'Producent'): Observable<any> {
    return this.http.post(`${this.apiUrl}/merge-duplicates`, { attributeName });
  }
}
