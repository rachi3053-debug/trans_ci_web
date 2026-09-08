import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'secondsToTime' })
export class SecondsToTimePipe implements PipeTransform {
  transform(value: number): string {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return `${mins} minute(s)`;
  }
}
