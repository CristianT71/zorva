import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Colombian pesos, e.g. 45000 → "$ 45.000".
 * No decimals — COP amounts are whole pesos in this domain.
 */
@Pipe({ name: 'currencyCop', standalone: true })
export class CurrencyCopPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '$ 0';
    return this.formatter.format(value);
  }
}
