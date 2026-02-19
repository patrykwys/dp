import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDate',
  standalone: true,
})
export class ShortDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    return new Date(value).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
