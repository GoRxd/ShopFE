import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  subCategories: CategoryTree[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService {
  getCategoriesTree(): Observable<CategoryTree[]> {
    return this.http.get<CategoryTree[]>(`${this.apiUrl}/categories/tree`);
  }
}
