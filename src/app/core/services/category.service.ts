import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseService } from './base.service';

export interface AttributeFilter {
  name: string;
  options: string[];
}

export interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  subCategories: CategoryTree[];
  applicableAttributes: AttributeFilter[];
  assignedAttributeIds: number[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  parentCategoryId?: number | null;
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
  slug: string;
  attributeIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService {
  
  getCategoriesTree(): Observable<CategoryTree[]> {
    return this.http.get<CategoryTree[]>(`${this.apiUrl}/categories/tree`);
  }

  createCategory(dto: CreateCategoryDto): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/categories`, dto);
  }

  updateCategory(id: number, dto: UpdateCategoryDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, dto);
  }

  deleteCategory(id: number, force: boolean = false): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}?force=${force}`);
  }

  // Helper to find category ID
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
