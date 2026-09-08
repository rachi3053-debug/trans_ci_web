import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDate', standalone: true })
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined, empty = '—'): string {
    if (value == null || value === '') {
      return empty;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return empty;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
