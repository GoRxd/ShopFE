export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  imageUrl?: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
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
