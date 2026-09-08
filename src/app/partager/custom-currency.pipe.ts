import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currencyCode: string = 'XOF', display: 'symbol' | 'code' | 'name' = 'symbol', digitsInfo: string = '1.2-2'): string {
    // Format the value using the built-in currency pipe
    const formattedValue = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

    // Remove the currency symbol from the formatted value
    const valueWithoutCurrency = formattedValue.replace(/[$]/g, '');

    // Add the currency symbol after the value
    // return `${valueWithoutCurrency} ${currencyCode}`;
    return `${valueWithoutCurrency}`;
  }
}
