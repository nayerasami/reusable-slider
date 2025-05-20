import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPrev]',
  standalone: true
})
export class PrevDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  prevFunc() {
    const elm = this.el.nativeElement.parentElement.parentElement.children[0];
    const items = elm.getElementsByClassName('slider-item');
    for (let i = 0; i < 4; i++) {
      elm.prepend(items[items.length - 1]);
    }
  }
}
