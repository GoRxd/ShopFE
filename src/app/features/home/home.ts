import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-custom py-12">
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
        <h1 class="text-4xl font-black mb-4">Witaj w SHOP<span class="text-primary">X</span></h1>
        <p class="text-slate-500 max-w-lg mx-auto">Trwają prace nad listą produktów. Już niedługo znajdziesz tu najlepszy sprzęt w sieci.</p>
      </div>
    </div>
  `
})
export class HomeComponent {}
