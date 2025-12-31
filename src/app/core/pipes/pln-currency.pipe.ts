import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'plnCurrency',
  standalone: true
})
export class PlnCurrencyPipe implements PipeTransform {

  transform(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return '';
    }
    
    // Format number with spaces as thousand separators and comma as decimal separator (Polish locale)
    // However, basic formatNumber might use global locale. 
    // We can force manual formatting or use angular's CurrencyPipe internals if we wanted, 
    // but simple string manipulation is often enough for specific requirements like "1 234,56 zł"
    
    // Using simple approach first:
    // 1. Format number to 2 decimal places
    const formatted = value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    });

    return `${formatted} zł`;
  }
}
