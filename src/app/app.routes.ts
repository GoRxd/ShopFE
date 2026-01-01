import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductListComponent) 
      },
      {
        path: 'products/:slug',
        loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductListComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./features/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart-page.component').then(m => m.CartPageComponent)
      },
      {
        path: 'shopping-lists',
        loadComponent: () => import('./features/shopping-lists/shopping-lists-page.component').then(m => m.ShoppingListsPageComponent)
      },
      {
        path: 'shopping-lists/:id',
        loadComponent: () => import('./features/shopping-lists/details/shopping-list-details.component').then(m => m.ShoppingListDetailsComponent)
      }
    ]
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) 
  },
];
