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

  getCategoryIdBySlug(slug: string, categories: CategoryTree[]): number | null {
    for (const category of categories) {
      if (category.slug === slug) {
        return category.id;
      }
      if (category.subCategories && category.subCategories.length > 0) {
        const subId = this.getCategoryIdBySlug(slug, category.subCategories);
        if (subId) return subId;
      }
    }
    return null;
  }
}
