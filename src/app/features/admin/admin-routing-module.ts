import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductList } from './products/product-list/product-list';
import { ProductForm } from './products/product-form/product-form';
import { CategoryManager } from './categories/category-manager/category-manager';
import { AttributeManager } from './attributes/attribute-manager/attribute-manager';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList },
  { path: 'products/new', component: ProductForm },
  { path: 'products/:id', component: ProductForm },
  { path: 'categories', component: CategoryManager },
  { path: 'attributes', component: AttributeManager }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
