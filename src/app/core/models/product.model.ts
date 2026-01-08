export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
  attributeId: number;
  optionId: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId?: number;
  stockQuantity: number;
  attributes: ProductAttribute[];
  imageUrl?: string;
}

export interface ProductSearchQuery {
  q?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: string;
  [key: string]: any; // For attr_ parameters
}

export interface SearchSuggestions {
  categories: CategorySuggestion[];
  products: ProductSuggestion[];
}

export interface CategorySuggestion {
  id: number;
  name: string;
  slug: string;
}

export interface ProductSuggestion {
  id: number;
  name: string;
}
