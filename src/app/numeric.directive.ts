import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumeric]'
})
export class NumericDirective {

  constructor() { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const isNumeric = /^[0-9]$/i.test(key);
    const isSpecialKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(key);

    if (!isNumeric && !isSpecialKey) {
      event.preventDefault();
    }
  }

}
