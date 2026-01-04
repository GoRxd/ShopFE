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
        path: 'account',
        loadComponent: () => import('./features/account/layout/account-layout.component').then(m => m.AccountLayoutComponent),
        children: [
          {
            path: 'orders',
            loadComponent: () => import('./features/account/orders/orders-history.component').then(m => m.OrdersHistoryComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('./features/account/settings/account-settings.component').then(m => m.AccountSettingsComponent)
          },
          {
            path: 'shopping-lists',
            loadComponent: () => import('./features/shopping-lists/shopping-lists-page.component').then(m => m.ShoppingListsPageComponent)
          },
          {
            path: 'shopping-lists/:id',
            loadComponent: () => import('./features/shopping-lists/details/shopping-list-details.component').then(m => m.ShoppingListDetailsComponent)
          },
          {
            path: 'reviews',
            loadComponent: () => import('./features/account/reviews/user-reviews.component').then(m => m.UserReviewsComponent)
          },
          {
            path: '',
            loadComponent: () => import('./features/account/dashboard/account-overview.component').then(m => m.AccountOverviewComponent)
          }
        ]
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
