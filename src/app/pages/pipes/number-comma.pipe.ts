import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberComma',
  standalone: false
})
export class NumberCommaPipe implements PipeTransform {

   transform(value: number | string): string {
    if (value === null || value === undefined) return '';
    const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value;
    return isNaN(num) ? '' : num.toLocaleString('en-IN');
  }
}
