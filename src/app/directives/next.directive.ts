import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNext]',
  standalone: true
})
export class NextDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  nextFunc() {
    const elm = this.el.nativeElement.parentElement.parentElement.children[0];
    const items = elm.getElementsByClassName('slider-item');
    for (let i = 0; i < 4; i++) {
      elm.append(items[0]);
    }
  }
}
