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
}
