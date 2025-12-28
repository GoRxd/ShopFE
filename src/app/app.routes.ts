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
