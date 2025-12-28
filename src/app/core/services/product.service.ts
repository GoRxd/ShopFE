import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {
  getProducts(query: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/search?q=${query}`);
  }

  getProductDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }
}
