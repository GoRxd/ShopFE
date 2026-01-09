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
    const formatted = value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    });

    return `${formatted} zł`;
  }
}
