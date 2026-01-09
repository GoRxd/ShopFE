import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly translations: Record<string, string> = {
    'insufficient stock': 'Niewystarczająca ilość produktu w magazynie',
    'product not found': 'Produkt nie został znaleziony',
    'not found': 'Nie znaleziono zasobu',
    'already reviewed': 'Już dodałeś opinię dla tego produktu',
    'invalid email or password': 'Nieprawidłowy e-mail lub hasło',
    'user with this email address already exists': 'Użytkownik o takim adresie e-mail już istnieje',
    'user not logged in': 'Musisz być zalogowany, aby wykonać tę operację',
    'cannot place order. cart is empty or not found.': 'Nie można złożyć zamówienia. Koszyk jest pusty.',
    'cannot delete an option that is assigned to products.': 'Nie można usunąć opcji, która jest przypisana do produktów.',
    'unauthorized': 'Brak uprawnień',
    'insufficient stock for product': 'Niewystarczająca ilość produktu w magazynie',
    'error adding to cart': 'Błąd podczas dodawania do koszyka',
    'error updating cart': 'Błąd podczas aktualizacji koszyka',
    'error submitting review': 'Wystąpił błąd podczas dodawania opinii',
    'an unexpected error occurred': 'Wystąpił nieoczekiwany błąd'
  };

  translate(key: string | null | undefined): string {
    if (!key) return '';
    
    const normalizedKey = key.toLowerCase();
    
    // Exact match
    if (this.translations[normalizedKey]) {
      return this.translations[normalizedKey];
    }

    // Partial match (prefix or phrase)
    for (const [english, polish] of Object.entries(this.translations)) {
      if (normalizedKey.includes(english)) {
        return polish;
      }
    }

    return key; // Fallback to original message
  }
}
