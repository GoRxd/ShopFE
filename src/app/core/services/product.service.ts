import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { Product, ProductListItem, ProductSearchQuery, SearchSuggestions } from '../models/product.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {
  getProducts(query: ProductSearchQuery = {}): Observable<ProductListItem[]> {
    let params = new HttpParams();
    
    if (query.q) {
      params = params.set('q', query.q);
    }
    
    if (query.categoryIds && query.categoryIds.length > 0) {
      query.categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }

    if (query.minPrice !== undefined && query.minPrice !== null) {
      params = params.set('minPrice', query.minPrice.toString());
    }

    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (query.sortDirection) {
      params = params.set('sortDirection', query.sortDirection);
    }

    // Handle attributes starting with attr_
    Object.keys(query).forEach(key => {
      if (key.startsWith('attr_') && query[key]) {
        params = params.set(key, query[key]);
      }
    });

    return this.http.get<ProductListItem[]>(`${this.apiUrl}/products/search`, { params });
  }

  getProductDetails(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getSearchSuggestions(query: string): Observable<SearchSuggestions> {
    return this.http.get<SearchSuggestions>(`${this.apiUrl}/search/suggestions`, {
      params: new HttpParams().set('q', query)
    });
  }

  createProduct(data: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/products/images/upload`, formData);
  }
}
