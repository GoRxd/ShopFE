import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductList } from './products/product-list/product-list';
import { CategoryManager } from './categories/category-manager/category-manager';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList },
  { path: 'categories', component: CategoryManager }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
