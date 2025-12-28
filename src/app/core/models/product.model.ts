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
  [key: string]: any; // For attr_ parameters
}
